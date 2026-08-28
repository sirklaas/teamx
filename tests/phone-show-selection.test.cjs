const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('phone registration script supports URL parameters and treats priority as leading', () => {
    const script = read('phone/script-new.js');

    // URL parameter support
    assert.match(script, /urlShowId/);
    assert.match(script, /urlGameCode/);
    assert.match(script, /URLSearchParams/);

    // Priority is strictly leading (sort: 'priority,-created')
    assert.match(script, /filter: 'priority > 0',\s*sort: 'priority,-created'/);

    // Fallback to most recently updated show
    assert.match(script, /sort: '-updated'/);
});

test('teams display script treats priority as leading and updates QR code with showId', () => {
    const script = read('teams/script-new.js');

    assert.match(script, /filter: 'priority > 0',\s*sort: 'priority,-created'/);
    assert.match(script, /showId=\${encodeURIComponent\(this\.currentGameId\)}/);
});
