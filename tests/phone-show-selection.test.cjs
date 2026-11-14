const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function page(folder, search, collection) {
    const className = folder === 'phone' ? 'TeamXRegistration' : 'TeamXDisplay';
    const prototype = vm.runInNewContext(read(folder + '/script-new.js') + '\n' + className + '.prototype', {
        URLSearchParams, console, CONFIG: {}, window: { location: { search } },
        document: { addEventListener() {} }
    });
    return Object.assign(Object.create(prototype), {
        pb: { collection: () => collection, filter: (expr, args) => expr.replace('{:code}', JSON.stringify(args.code)) },
        elements: { showName: {}, statusText: { parentElement: { style: {} } }, inputGroup: { style: {} }, totalPlayersSpan: {}, teamsContainer: { replaceChildren() {} } },
        setTeamCountCSS() {}, setStatus() {}
    });
}

for (const folder of ['phone', 'teams']) {
    test(folder + ' resolves the current priority-one show on each visit', async () => {
        let active;
        const collection = {
            async getList(page, perPage, options) {
                assert.equal(page, 1);
                assert.equal(perPage, 1);
                assert.equal(options.filter, 'priority = 1');
                assert.equal(options.sort, '-created,id');
                return { items: active ? [active] : [] };
            }
        };
        for (const id of ['show-a', 'show-b', null]) {
            active = id && { id };
            const visitor = page(folder, '', collection);
            await visitor.loadGameData();
            if (id) assert.equal(visitor.currentGameId, id);
            else {
                assert.ok(!visitor.currentGameId);
                assert.equal(visitor.elements.showName.textContent, '');
            }
        }
    });

    test(folder + ' never falls back from a missing direct link', async () => {
        const visitor = page(folder, '?showId=missing', {
            async getOne() { throw Object.assign(new Error('Missing'), { status: 404 }); }
        });
        await visitor.loadGameData();
        assert.ok(!visitor.currentGameId);
        assert.equal(visitor.elements.showName.textContent, '');
    });

    test(folder + ' preserves direct show links', async () => {
        const visitor = page(folder, '?showId=booked', { getOne: async id => ({ id }) });
        await visitor.loadGameData();
        assert.equal(visitor.currentGameId, 'booked');
    });
}

test('phone preserves direct game-code links', async () => {
    const visitor = page('phone', '?gamecode=ABC', {
        async getList(page, limit, options) {
            assert.equal(options.filter, 'gamecode = "ABC"');
            return { items: [{ id: 'booked' }] };
        }
    });
    await visitor.loadGameData();
    assert.equal(visitor.currentGameId, 'booked');
});

test('the scoreboard always displays the bundled join QR', () => {
    assert.match(read('teams/index.html'), /<img src="join-qr\.png"[^>]+class="qr-code"/);
    assert.doesNotMatch(read('teams/script-new.js'), /qr-code|qrImage/);
});
