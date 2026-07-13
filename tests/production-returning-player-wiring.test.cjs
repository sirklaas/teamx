const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('production phone page loads the returning-player helper before its main script', () => {
    const html = read('phone/index.html');
    const helperIndex = html.indexOf('returning-player-session.js');
    const mainScriptIndex = html.indexOf('script-new.js');

    assert.ok(helperIndex >= 0, 'production page must load the returning-player helper');
    assert.ok(helperIndex < mainScriptIndex, 'helper must load before the main production script');
});

test('production script restores only matching players and uses TeamX media', () => {
    const script = read('phone/script-new.js');

    assert.match(script, /TeamXReturningPlayerSession\.loadForShow/);
    assert.match(script, /TeamXReturningPlayerSession\.save/);
    assert.match(script, /new URL\('media\.html', window\.location\.href\)/);
    assert.doesNotMatch(script, /photocircle/i);
});
