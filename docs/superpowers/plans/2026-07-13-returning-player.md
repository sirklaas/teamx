# Returning Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a player scan the TeamX QR again during the same gameshow, see their saved name and team, and open the PocketBase media page in one tap.

**Architecture:** A small browser session helper stores a complete player identity in `localStorage`. The production `phone/script-new.js` loads it only when its show ID matches the active PocketBase show, then reuses the existing team-reveal UI. The photo button constructs a `media.html` URL instead of using a PhotoCircle URL.

**Tech Stack:** Vanilla JavaScript, browser `localStorage`, Node built-in test runner, PocketBase browser SDK.

## Global Constraints

- Change only the production `phone/` flow; leave `phone/index-test.html` unchanged.
- Store only show ID, player name, player number, and team number.
- Use `phone/media.html` for photos and videos; never link to PhotoCircle.
- Use Barlow Semi Condensed 400 for headings only; retain other existing weights.
- Do not touch the unrelated edit in `teams/script-new.js`.

---

### Task 1: Test and add the returning-player session helper

**Files:**

- Create: `tests/returning-player-session.test.cjs`
- Create: `phone/returning-player-session.js`

**Interfaces:**

- `save(storage, player)` accepts `{ showId, playerName, playerNumber, teamNumber }`.
- `loadForShow(storage, showId)` returns a complete saved player only when show IDs match; otherwise it removes storage and returns `null`.

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const session = require('../phone/returning-player-session.js');
const createStorage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; };

test('returns a saved player only for the active show', () => {
  const storage = createStorage();
  session.save(storage, { showId: 'show-1', playerName: 'Klaas', playerNumber: 7, teamNumber: 3 });
  assert.deepEqual(session.loadForShow(storage, 'show-1'), { showId: 'show-1', playerName: 'Klaas', playerNumber: 7, teamNumber: 3 });
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/returning-player-session.test.cjs`

Expected: FAIL because the helper does not yet exist.

- [ ] **Step 3: Implement the minimal helper**

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TeamXReturningPlayerSession = api;
}(typeof window === 'undefined' ? globalThis : window, function () {
  const key = 'teamx.returning-player.v1';
  const valid = p => p && typeof p.showId === 'string' && typeof p.playerName === 'string' && Number.isInteger(p.playerNumber) && Number.isInteger(p.teamNumber);
  return {
    save(storage, player) { if (valid(player)) storage.setItem(key, JSON.stringify(player)); },
    loadForShow(storage, showId) { try { const player = JSON.parse(storage.getItem(key)); if (valid(player) && player.showId === showId) return player; } catch (_) {} storage.removeItem(key); return null; }
  };
}));
```

- [ ] **Step 4: Add stale-show and incomplete-value tests, then verify GREEN**

```js
assert.equal(session.loadForShow(storage, 'another-show'), null);
assert.equal(storage.getItem('teamx.returning-player.v1'), null);
```

Run: `node --test tests/returning-player-session.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add phone/returning-player-session.js tests/returning-player-session.test.cjs && git commit -m "feat: remember player for active show"
```

### Task 2: Wire the helper into the production phone page

**Files:**

- Modify: `phone/index.html`
- Modify: `phone/script-new.js`
- Modify: `phone/style-new.css`

**Interfaces:**

- `phone/index.html` loads `returning-player-session.js` before `script-new.js`.
- `showTeamAssignment(player)` persists the player and configures the media button.
- After `loadGameData()` identifies the active show, a matching saved player calls `showTeamAssignment()` immediately.

- [ ] **Step 1: Extend the failing test with an invalid saved player**

```js
storage.setItem('teamx.returning-player.v1', JSON.stringify({ showId: 'show-1', playerName: 'Klaas' }));
assert.equal(session.loadForShow(storage, 'show-1'), null);
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/returning-player-session.test.cjs`

Expected: FAIL until the helper rejects incomplete saved values.

- [ ] **Step 3: Make the production changes**

```html
<script src="returning-player-session.js?v=1"></script>
<script src="script-new.js?v=2.5.2"></script>
```

```js
const returningPlayer = TeamXReturningPlayerSession.loadForShow(localStorage, this.currentGameId);
if (returningPlayer) this.showTeamAssignment({ naam: returningPlayer.playerName, playernr: returningPlayer.playerNumber, teamnr: returningPlayer.teamNumber });
```

```js
TeamXReturningPlayerSession.save(localStorage, { showId: this.currentGameId, playerName: player.naam, playerNumber: player.playernr, teamNumber: player.teamnr });
const mediaUrl = new URL('media.html', window.location.href);
mediaUrl.searchParams.set('showId', this.currentGameId);
mediaUrl.searchParams.set('playerName', player.naam);
mediaUrl.searchParams.set('team', player.teamnr);
this.elements.confirmButton.onclick = () => { window.location.href = mediaUrl.toString(); };
```

Set `font-weight: 400` on `h1`, `h2`, and the returning greeting heading only.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/returning-player-session.test.cjs`

Expected: PASS.

- [ ] **Step 5: Manually verify the full flow**

1. Join a show as a new player and confirm the button opens `media.html` with `showId`, `playerName`, and `team`.
2. Return to `/teamx/phone/` and confirm the saved player sees the welcome and team circle without name entry.
3. Activate another show and confirm normal name entry returns.

- [ ] **Step 6: Commit**

```bash
git add phone/index.html phone/script-new.js phone/style-new.css tests/returning-player-session.test.cjs && git commit -m "feat: return players to show media"
```
