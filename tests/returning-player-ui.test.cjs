const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const script = fs.readFileSync(path.join(__dirname, '..', 'phone', 'script-new.js'), 'utf8');

test('returning players do not see the name-entry form', () => {
    const restoreStart = script.indexOf('restoreReturningPlayer()');
    const showAssignment = script.indexOf('this.showTeamAssignment({', restoreStart);
    const hideForm = script.indexOf('this.hideNameEntryForReturningPlayer()', restoreStart);

    assert.ok(hideForm > restoreStart, 'returning-player restoration must hide the entry form');
    assert.ok(hideForm < showAssignment, 'entry form must hide before the saved team is shown');
    assert.match(script, /hideNameEntryForReturningPlayer\(\)[\s\S]*inputGroup\.style\.display = 'none'/);
});
