"""Run with python3 tests/registration-concurrency.py (requires PHP CLI with curl)."""
import json
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager, ExitStack
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


@contextmanager
def registration_fixture():
    """Run independent PHP workers with a shared synthetic PocketBase roster."""
    roster = []

    class Backend(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def reply(self, data):
            body = json.dumps(data).encode()
            self.send_response(200)
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self):
            self.reply({'token': 'fixture'})

        def do_GET(self):
            self.reply({'teamnumber': 4, 'playerData': list(roster)})

        def do_PATCH(self):
            players = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            time.sleep(0.025)  # Expose overlapping reads in an unlocked handler.
            roster[:] = players['playerData']
            self.reply({})

    with ExitStack() as stack:
        backend = stack.enter_context(ThreadingHTTPServer(('127.0.0.1', 0), Backend))
        threading.Thread(target=backend.serve_forever, daemon=True).start()
        stack.callback(backend.shutdown)
        tmp = Path(stack.enter_context(tempfile.TemporaryDirectory()))
        source = (ROOT / 'phone/api/register.php').read_text()
        source = source.replace('https://pb.pinkmilk.eu', f'http://127.0.0.1:{backend.server_port}')
        source = re.sub(r"const PB_ADMIN_(EMAIL|PASSWORD) = .*?;", r"const PB_ADMIN_\1 = 'fixture';", source)
        (tmp / 'register.php').write_text(source)
        urls = []
        for _ in range(4):
            with socket.socket() as sock:
                sock.bind(('127.0.0.1', 0))
                port = sock.getsockname()[1]
            address = f'127.0.0.1:{port}'
            process = subprocess.Popen([shutil.which('php'), '-d', f'sys_temp_dir={tmp}',
                                        '-S', address, '-t', str(tmp)], stdout=subprocess.DEVNULL,
                                       stderr=subprocess.DEVNULL)
            stack.callback(process.wait)
            stack.callback(process.terminate)
            for attempt in range(100):
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=.2):
                        break
                except OSError:
                    time.sleep(.02)
            urls.append(f'http://{address}/register.php')
        yield urls, roster


def register(url, name):
    request = Request(url, json.dumps({'showId': 'fixture', 'name': name}).encode(),
                      headers={'Content-Type': 'application/json'})
    with urlopen(request, timeout=10) as response:
        return json.load(response)


class SimultaneousRegistrations(unittest.TestCase):
    def test_balanced_unique_and_retryable(self):
        names = ['Player ' + str(i) for i in range(16)] + ['Player 0'] * 4
        with registration_fixture() as (urls, roster), ThreadPoolExecutor(max_workers=8) as pool:
            futures = [pool.submit(register, urls[i % len(urls)], name) for i, name in enumerate(names)]
            replies = [job.result() for job in futures]
            self.assertTrue(all(reply['success'] for reply in replies))
            self.assertEqual(sorted(p['playernr'] for p in roster), list(range(1, 17)))
            self.assertEqual([sum(p['teamnr'] == t for p in roster) for t in range(1, 5)], [4] * 4)
            self.assertEqual(sum(reply['existing'] for reply in replies), 4)
            by_name = {p['naam']: p for p in roster}
            for name, reply in zip(names, replies):
                self.assertEqual(reply['player'], by_name[name])


if __name__ == '__main__':
    unittest.main()
