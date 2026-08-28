#!/usr/bin/env python3
import os
import sys
import ftplib
import getpass

FTP_HOST = os.environ.get('FTP_HOST', '103.214.6.202')
FTP_PORT = int(os.environ.get('FTP_PORT', 21))
FTP_USER = os.environ.get('FTP_USER', 'dukowaeu')
REMOTE_BASE = os.environ.get('FTP_REMOTE_BASE', '/domains/pinkmilk.eu/public_html')

DIRECTORIES_TO_UPLOAD = ['phone', 'teams', 'teaminput', 'teamfun']

def upload_directory(ftp, local_dir, remote_dir):
    print(f"\n📂 Uploading directory: {local_dir} -> {remote_dir}")
    try:
        ftp.mkd(remote_dir)
    except Exception:
        pass  # Directory probably exists

    for root, dirs, files in os.walk(local_dir):
        rel_path = os.path.relpath(root, local_dir)
        if rel_path == '.':
            current_remote = remote_dir
        else:
            current_remote = f"{remote_dir}/{rel_path.replace(os.sep, '/')}"

        try:
            ftp.mkd(current_remote)
        except Exception:
            pass

        for file in files:
            if file.startswith('.') and file != '.htaccess':
                continue
            local_file = os.path.join(root, file)
            remote_file = f"{current_remote}/{file}"
            print(f"  ⬆️ Uploading {local_file} -> {remote_file}")
            with open(local_file, 'rb') as f:
                ftp.storbinary(f'STOR {remote_file}', f)

def main():
    password = os.environ.get('FTP_PASS') or os.environ.get('FTP_PASSWORD')
    if not password and len(sys.argv) > 1:
        password = sys.argv[1]
    if not password:
        password = getpass.getpass(f"Enter FTP password for {FTP_USER}@{FTP_HOST}: ")

    print(f"Connecting to FTP {FTP_HOST}:{FTP_PORT} as {FTP_USER}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=15)
    ftp.login(FTP_USER, password)
    print("✅ Connected and authenticated successfully!")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    for d in DIRECTORIES_TO_UPLOAD:
        local_path = os.path.join(base_dir, d)
        if os.path.exists(local_path):
            remote_path = f"{REMOTE_BASE}/{d}"
            upload_directory(ftp, local_path, remote_path)

    ftp.quit()
    print("\n🎉 Deployment completed successfully!")

if __name__ == '__main__':
    main()
