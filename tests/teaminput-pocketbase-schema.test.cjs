const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'teaminput/js/script.js'), 'utf8');

test('TeamInput reads bureau options from PocketBase fields', () => {
    assert.match(script, /teamxCollection\.fields\s*\|\|\s*teamxCollection\.schema/);
});

test('TeamInput reports PocketBase validation details when saving fails', () => {
    assert.match(script, /getPocketBaseErrorMessage/);
    assert.match(script, /error\?\.response\?\.data/);
});
