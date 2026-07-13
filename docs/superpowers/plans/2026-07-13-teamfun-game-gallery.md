# TeamFun Game Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a unique code for every new show and publish a selectable, downloadable PocketBase media gallery at `/teamfun/<gamecode>`.

**Architecture:** TeamInput will create an eight-character `gamecode` and show a read-only TeamFun URL. A standalone TeamFun static page will parse the code from the URL, retrieve the one matching show and its `showmedia` records through public PocketBase read rules, then render responsive media tiles, a lightbox, and client-triggered selected-file downloads.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, PocketBase JavaScript SDK, Node.js built-in test runner, HostSlim FTP deployment.

## Global Constraints

- The production TeamInput page is `/teaminput/`; do not alter the test-only TeamX phone page.
- Generate exactly eight uppercase, unambiguous game-code characters.
- Store the code in a dedicated PocketBase `teamx.gamecode` text field.
- TeamFun is public and read-only: no administrator credentials may be present in its files.
- Desktop gallery uses five columns and must remain usable on phones.
- Clicking a tile opens a lightbox with close, previous, and next controls.
- Downloads apply only to user-selected original files.
- Preserve unrelated changes in `teams/script-new.js`.

---

### Task 1: Add and validate the PocketBase gallery contract

**Files:**
- Create: `tests/teamfun-contract.test.cjs`
- Modify: PocketBase collections `teamx` and `showmedia` through the PocketHost admin UI

**Interfaces:**
- Produces: `teamx.gamecode: string` with a unique index; public TeamFun can list `teamx` metadata and `showmedia` files read-only.
- Consumes: existing `teamx.id`, `teamx.show`, `teamx.datum`, and `showmedia.show_id`/`showmedia.file` fields.

- [ ] **Step 1: Write the failing file-contract test**

```js
test('TeamFun has no administrator credential and looks up media by game code', () => {
  const script = read('teamfun/teamfun.js');
  assert.match(script, /gamecode/);
  assert.match(script, /collection\('showmedia'\)/);
  assert.doesNotMatch(script, /ADMIN_PASSWORD|authWithPassword|_superusers/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/teamfun-contract.test.cjs`

Expected: FAIL because `teamfun/teamfun.js` does not exist yet.

- [ ] **Step 3: Configure the PocketBase schema and read rules**

In PocketHost’s `teamx` collection, add a required, unique text field named `gamecode` (maximum 8 characters). Backfill a different valid code for every existing show before enabling required/unique validation. Allow unauthenticated list/view only for `id`, `show`, `datum`, and `gamecode`; keep create/update/delete restricted to the TeamInput administrator. In `showmedia`, allow unauthenticated list/view only and retain the existing creation rule used by the phone uploader; do not grant update/delete.

- [ ] **Step 4: Verify the public API contract**

Run: `curl -fsS 'https://pinkmilk.pockethost.io/api/collections/teamx/records?filter=gamecode%20%3D%20%22INVALID00%22'`

Expected: a successful PocketBase list response with no records, not a 403 response.

- [ ] **Step 5: Commit the contract test**

```bash
git add tests/teamfun-contract.test.cjs
git commit -m "test: define TeamFun public data contract"
```

### Task 2: Generate and display TeamFun links in TeamInput

**Files:**
- Modify: `teaminput/index.html:89-93`
- Modify: `teaminput/js/script.js:250-515`
- Modify: `teaminput/css/style.css` (only if an existing form-field style cannot present the read-only URL cleanly)
- Test: `tests/teaminput-gamecode.test.cjs`

**Interfaces:**
- Produces: `createGameCode()` returning eight uppercase characters and `getTeamFunUrl(code)` returning `https://www.pinkmilk.eu/teamfun/<code>`.
- Consumes: PocketBase `teamx.gamecode` field configured in Task 1.

- [ ] **Step 1: Write failing generation and wiring tests**

```js
test('TeamInput creates an eight-character unambiguous game code', () => {
  const script = read('teaminput/js/script.js');
  assert.match(script, /function createGameCode\(\)/);
  assert.match(script, /ABCDEFGHJKMNPQRSTUVWXYZ23456789/);
  assert.match(script, /gamecode: createGameCode\(\)/);
});

test('TeamInput presents a read-only TeamFun URL instead of PhotoCircle', () => {
  const html = read('teaminput/index.html');
  const script = read('teaminput/js/script.js');
  assert.doesNotMatch(html, /PhotoCircle/);
  assert.match(script, /TeamFun link/);
  assert.match(script, /teamfun/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/teaminput-gamecode.test.cjs`

Expected: FAIL because the game-code helpers and TeamFun UI are absent.

- [ ] **Step 3: Implement minimal TeamInput support**

Add `createGameCode()` using `crypto.getRandomValues` and the alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. On new record creation, send `gamecode: createGameCode()` to PocketBase. Replace the editable PhotoCircle field in both new and existing forms with a read-only TeamFun link; existing records without a code show `Nog geen TeamFun-link`. Do not overwrite a stored game code during normal updates.

```js
function getTeamFunUrl(gameCode) {
  return `https://www.pinkmilk.eu/teamfun/${encodeURIComponent(gameCode)}`;
}
```

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/teaminput-gamecode.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit TeamInput support**

```bash
git add teaminput/index.html teaminput/js/script.js teaminput/css/style.css tests/teaminput-gamecode.test.cjs
git commit -m "feat: generate TeamFun game links in TeamInput"
```

### Task 3: Build the public TeamFun page and gallery behavior

**Files:**
- Create: `teamfun/index.html`
- Create: `teamfun/teamfun.css`
- Create: `teamfun/teamfun.js`
- Create: `tests/teamfun-gallery.test.cjs`

**Interfaces:**
- Consumes: URL path `/teamfun/<gamecode>`, public `teamx` records, and public `showmedia` records.
- Produces: `TeamFunGallery` with `loadShow()`, `loadMedia()`, `openLightbox(index)`, `closeLightbox()`, `moveLightbox(direction)`, `toggleSelection(id)`, and `downloadSelected()`.

- [ ] **Step 1: Write failing behavior tests**

```js
test('TeamFun renders a five-column gallery with lightbox and selection controls', () => {
  const html = read('teamfun/index.html');
  const css = read('teamfun/teamfun.css');
  const script = read('teamfun/teamfun.js');
  assert.match(html, /id="mediaGrid"/);
  assert.match(html, /id="lightbox"/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,/);
  assert.match(script, /openLightbox/);
  assert.match(script, /moveLightbox/);
  assert.match(script, /downloadSelected/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/teamfun-gallery.test.cjs`

Expected: FAIL because the TeamFun files do not exist.

- [ ] **Step 3: Create the TeamFun page structure**

Include PocketBase from the same CDN version used elsewhere, a header for date/show title, loading/empty/error states, a `#mediaGrid`, selection toolbar, and an accessible lightbox. Do not add authentication code or administrator values.

- [ ] **Step 4: Implement public lookup, rendering, lightbox, and selected downloads**

Parse the final non-empty path segment as the code. Fetch one `teamx` record using a safely escaped `gamecode` filter, then fetch `showmedia` where `show_id` equals that record’s id. Render image/video thumbnails, retain their record/file URLs in memory, and use `pb.files.getUrl(record, record.file)` for full-size and download URLs. Escape closes the lightbox; the left/right arrows and buttons move within the current media list. Selection mode exposes a checkbox overlay and the download button only creates downloads for selected entries.

- [ ] **Step 5: Run focused tests and syntax checks**

Run: `node --test tests/teamfun-contract.test.cjs tests/teamfun-gallery.test.cjs && node --check teamfun/teamfun.js`

Expected: PASS with no JavaScript syntax errors.

- [ ] **Step 6: Commit the gallery**

```bash
git add teamfun tests/teamfun-contract.test.cjs tests/teamfun-gallery.test.cjs
git commit -m "feat: add public TeamFun media gallery"
```

### Task 4: Verify the integrated production flow and deploy

**Files:**
- Modify: `tests/teamfun-contract.test.cjs` (only if deployment wiring needs a file assertion)
- Deploy: `/domains/pinkmilk.eu/public_html/teaminput/` and `/domains/pinkmilk.eu/public_html/teamfun/` using the existing FTP skill

**Interfaces:**
- Consumes: committed TeamInput and TeamFun files plus PocketBase schema/rules.
- Produces: live URLs for generated TeamFun gallery pages.

- [ ] **Step 1: Run the complete local test suite**

Run: `node --test tests/*.test.cjs && node --check teaminput/js/script.js && node --check teamfun/teamfun.js`

Expected: all tests pass and both scripts parse.

- [ ] **Step 2: Verify with a real non-production show record**

Create or use one safe test show, confirm TeamInput saves a game code, and open its TeamFun URL. Verify date/title, five-column desktop layout, responsive layout, image/video lightbox controls, selection count, and selected-file downloads.

- [ ] **Step 3: Deploy only the changed directories over FTP**

Upload the changed files in `teaminput/` and all files in `teamfun/` to their matching directories under `/domains/pinkmilk.eu/public_html/`. Do not upload `teams/script-new.js`.

- [ ] **Step 4: Verify live files and public route**

Run: `curl -fsS https://www.pinkmilk.eu/teamfun/INVALID00`

Expected: TeamFun’s not-found state loads successfully; no server error or PocketBase administrator information appears.

- [ ] **Step 5: Commit any final test-only adjustment**

```bash
git add tests
git commit -m "test: verify TeamFun deployment wiring"
```

## Self-review

- Spec coverage: Tasks 1–2 implement automatic unique game codes and the TeamInput link. Task 3 implements the public responsive five-column gallery, heading, lightbox, selection, and downloads. Task 4 verifies and deploys the complete flow.
- Placeholder scan: no TODO/TBD items or generic error-handling directions remain; each task names files, commands, and expected results.
- Type consistency: `gamecode` is used consistently as the PocketBase text field, URL path segment, and TeamFun lookup key; `TeamFunGallery` methods are defined in Task 3 and used only there.
