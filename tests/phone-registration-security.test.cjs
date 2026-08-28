const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('public phone configuration contains no administrator credentials', () => {
    const config = read('phone/config.js');

    assert.doesNotMatch(config, /ADMIN_EMAIL|ADMIN_PASSWORD/);
    assert.match(config, /PB_URL/);
});

test('phone registration uses the server helper instead of browser administrator login', () => {
    const script = read('phone/script-new.js');

    assert.doesNotMatch(script, /authWithPassword/);
    assert.match(script, /api\/register\.php/);
    assert.match(script, /fetch\(/);
});

test('server registration helper is present', () => {
    const helper = read('phone/api/register.php');

    assert.match(helper, /api\/collections\/_superusers\/auth-with-password/);
    assert.match(helper, /playerData/);
});
