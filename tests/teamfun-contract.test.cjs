const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('TeamFun has no administrator credential and looks up media by game code', () => {
    const script = read('teamfun/teamfun.js');

    assert.match(script, /gamecode/);
    assert.match(script, /collection\('showmedia'\)/);
    assert.doesNotMatch(script, /ADMIN_PASSWORD|authWithPassword|_superusers/);
});
