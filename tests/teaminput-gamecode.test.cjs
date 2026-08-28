const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('TeamInput creates an eight-character unambiguous game code', () => {
    const script = read('teaminput/js/script.js');

    assert.match(script, /function createGameCode\(\)/);
    assert.match(script, /ABCDEFGHJKMNPQRSTUVWXYZ23456789/);
    assert.match(script, /gamecode:\s*data\.gamecode\s*\|\|\s*createGameCode\(\)/);
});

test('TeamInput presents a read-only TeamFun URL instead of PhotoCircle', () => {
    const html = read('teaminput/index.html');
    const script = read('teaminput/js/script.js');

    assert.doesNotMatch(html, /PhotoCircle/);
    assert.match(html, /name="gamecode"/);
    assert.match(script, /TeamFun link/);
    assert.match(script, /getTeamFunUrl/);
});
