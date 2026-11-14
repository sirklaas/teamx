# Plan: Move TeamX Fully to QDE (Remove Hostslim Dependency)

## Current State & Problem

Right now, TeamX is split across two hosts:
- **QDE (`45.148.62.92` / `ams1.qde.com`)**: Hosts **PocketBase** (`https://pb.pinkmilk.eu`).
- **Hostslim (`103.214.6.202` / `sh-woe014.hostslim.nl`)**: Hosts `www.pinkmilk.eu` — all TeamX static files (`phone/`, `teams/`, `teaminput/`, `teamfun/`) and PHP endpoints (`phone/api/register.php`, `teamfun/api/delete.php`).

Because every player, TV screen, and admin browser loads its HTML/JS/PHP from `www.pinkmilk.eu`, **any Hostslim outage breaks the entire show**, even though PocketBase on QDE is still online.

---

## Step 1: Choose the Domain Strategy

Pick one of these two options before configuring QDE:

- **Option A — Dedicated `teamx.pinkmilk.eu` subdomain on QDE (Recommended if `www.pinkmilk.eu` still runs WordPress/main site on Hostslim)**
  - Point `teamx.pinkmilk.eu` (`A` record) to `45.148.62.92`.
  - Zero risk to the main `www.pinkmilk.eu` website.
  - Requires updating hardcoded `www.pinkmilk.eu` URLs in the codebase and regenerating `teams/join-qr.png` (plus any printed QR codes).

- **Option B — Move `www.pinkmilk.eu` itself to QDE (or put a reverse proxy in front of `www.pinkmilk.eu` on QDE)**
  - Existing `teams/join-qr.png` and any printed `www.pinkmilk.eu/teamx` QR codes continue to work without changes.
  - Only choose this if you are ready to move or proxy the rest of `www.pinkmilk.eu` off Hostslim as well.

*(The steps below work for either option; using relative URLs / `window.location.origin` in Step 3 makes the app domain-agnostic.)*

---

## Step 2: Configure Web Server & PHP on QDE (`45.148.62.92`)

On the QDE server (alongside the existing `pb.pinkmilk.eu` PocketBase service):

1. **Create a web root** (e.g., `/var/www/teamx`) containing:
   - `phone/`
   - `teams/`
   - `teaminput/`
   - `teamfun/`
   - *(Optional compatibility aliases if using `/teamx/...` paths: symlink or route `/teamx/phone/`, `/teamx/teams/`, `/teamx/teaminput/` to those same directories.)*
2. **Install & enable PHP-FPM** with `php-curl`, `php-mbstring`, and `php-json`:
   - Needed by `phone/api/register.php` (uses `curl`, `mb_strtolower`, and `flock()` on `sys_get_temp_dir()`).
   - Needed by `teamfun/api/delete.php` (uses `curl`).
3. **Replicate `.htaccess` rules** in the QDE web server config (Nginx/Caddy/Apache):
   - **`teamfun/` SPA routing** (from `teamfun/.htaccess`): rewrite `/teamfun/<GAMECODE>` (any non-file, non-directory path under `/teamfun/`) to `/teamfun/index.html`.
   - **No-cache headers for `phone/` and `teams/`** (from `phone/.htaccess` & `teams/.htaccess`):
     ```
     Cache-Control: max-age=0, no-cache, no-store, must-revalidate
     Pragma: no-cache
     Expires: 0
     ```
     for `*.html`, `*.js`, and `*.css` so live show updates take effect immediately.
   - **Security**: disable directory listing (`autoindex off` / `Options -Indexes`) and block direct access to `*.json` in `teaminput/` if needed.
4. **Enable HTTPS** (Let's Encrypt / Caddy auto-TLS) for `teamx.pinkmilk.eu` (or `www.pinkmilk.eu`).

---

## Step 3: Remove Hardcoded `www.pinkmilk.eu` References in Code

Update all files that currently point back to Hostslim (`www.pinkmilk.eu`) so they use the current origin (`window.location.origin` or relative paths):

1. **`phone/media.html` (line 20)** & **`phone/media-script.js` (line 26)**:
   - Currently hardcodes `https://www.pinkmilk.eu/teamx/phone/` for the "Terug naar de Quiz" button.
   - Change to relative `./` (or `${window.location.origin}/phone/`).
2. **`teaminput/js/script.js` (line 37)**:
   - Currently builds `https://www.pinkmilk.eu/teamfun/${encodeURIComponent(gameCode)}`.
   - Change to `${window.location.origin}/teamfun/${encodeURIComponent(gameCode)}` (or a `BASE_URL` in `teaminput/config.js`).
3. **`teaminput/js/script.js` (line 995)**:
   - Currently builds `https://www.pinkmilk.eu/phone/media.html?showId=${validShowId}`.
   - Change to `${window.location.origin}/phone/media.html?showId=${validShowId}`.
4. **Audio assets in `phone/config.js` (lines 19–20) & `phone/index.html` (lines 20–28)**:
   - `phone/config.js` still references `https://www.pinkmilk.eu/teamx/wp-content/uploads/2024/12/success.wav` and `stardust.wav`.
   - `phone/index.html` references local `success.mp3` and `stardust.mp3`, which are currently missing from `phone/` (only `whoosh.mp3` is in `phone/`).
   - Copy `success.mp3` / `stardust.mp3` (or `.wav`) into `phone/` and update `phone/config.js` to relative paths so no audio is fetched from `www.pinkmilk.eu`.
5. **QR Code (`teams/join-qr.png`)**:
   - If choosing **Option A (`teamx.pinkmilk.eu`)**, regenerate `teams/join-qr.png` to point to `https://teamx.pinkmilk.eu/phone/` (and update any printed/keynote QR codes).
6. **External dependencies check**:
   - Verify `https://ranking.pinkmilk.eu` and `https://bingo.pinkmilk.eu` (linked in `teaminput/js/script.js`) are not hosted on Hostslim if you use them during shows.
   - *(Optional hardening)* Self-host `pocketbase.umd.js` inside the repo instead of loading from `unpkg.com`, so a CDN hiccup can't break `phone/` or `teams/`.

---

## Step 4: DNS & Deployment Automation

1. **DNS**: Add/update the `A` record for `teamx.pinkmilk.eu` (or `www.pinkmilk.eu`) to `45.148.62.92`.
2. **Replace `deploy_ftp.py`**:
   - `deploy_ftp.py` currently uploads to Hostslim (`103.214.6.202`).
   - Add a QDE deploy script (e.g., `deploy_qde.sh` using `rsync` over SSH, or `git pull` on QDE) so deployments go directly to QDE instead of Hostslim.
   - Update `.agents/skills/teamx-management/SKILL.md` to document the new QDE deploy command.

---

## Step 5: Pre-Show Verification Checklist

Run these checks against the QDE URL before your next show:

- [ ] **Automated tests**: Run `tests/phone-show-selection.test.cjs`, `tests/teamfun-quizmaster-delete.test.cjs`, and `tests/registration-concurrency.py`.
- [ ] **Zero Hostslim requests**: Open `teams/`, `phone/`, `teaminput/`, and `teamfun/` in Safari Web Inspector (Network tab) and confirm **no requests** go to `www.pinkmilk.eu` (or `103.214.6.202`).
- [ ] **Player registration**: Scan `teams/join-qr.png` on a phone → submit a name → confirm `phone/api/register.php` returns `200` and the player appears live on `teams/`.
- [ ] **Photo App round-trip**: Click "Deel je foto's & video's" → upload a test photo → click "Terug naar de Quiz" → confirm it returns to QDE `phone/` with the returning-player session intact.
- [ ] **TeamFun gallery**: Open `/teamfun/<GAMECODE>` directly in the browser (confirm SPA rewrite works without 404) and test quizmaster delete (`teamfun/api/delete.php`).
- [ ] **Admin flow**: Open `teaminput/`, create/edit a test show, and verify generated `teamfun` and `media.html` links point to QDE.
