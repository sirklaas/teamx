const test = require('node:test');
const assert = require('node:assert/strict');
const session = require('../phone/returning-player-session.js');

function createStorage() {
    const values = new Map();
    return {
        getItem(key) {
            return values.get(key) ?? null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
        removeItem(key) {
            values.delete(key);
        }
    };
}

test('returns a saved player only for the active show', () => {
    const storage = createStorage();
    const player = {
        showId: 'show-1',
        playerName: 'Klaas',
        playerNumber: 7,
        teamNumber: 3
    };

    session.save(storage, player);

    assert.deepEqual(session.loadForShow(storage, 'show-1'), player);
});

test('removes a player saved for another show', () => {
    const storage = createStorage();
    session.save(storage, {
        showId: 'old-show',
        playerName: 'Klaas',
        playerNumber: 7,
        teamNumber: 3
    });

    assert.equal(session.loadForShow(storage, 'new-show'), null);
    assert.equal(storage.getItem('teamx.returning-player.v1'), null);
});

test('removes an incomplete saved player', () => {
    const storage = createStorage();
    storage.setItem('teamx.returning-player.v1', JSON.stringify({
        showId: 'show-1',
        playerName: 'Klaas'
    }));

    assert.equal(session.loadForShow(storage, 'show-1'), null);
    assert.equal(storage.getItem('teamx.returning-player.v1'), null);
});
