# Returning Player Design

## Goal

Let a player who has already joined the active gameshow scan the same TeamX QR code again and return to their photo and video page without entering their name again.

## Scope

- Production player page: the `phone/` folder, served at `https://www.pinkmilk.eu/teamx/phone/`.
- Test-only files, including `phone/index-test.html`, are not changed.
- TeamX's PocketBase-backed `phone/media.html` is the destination; PhotoCircle links are not used.
- One QR opens `https://www.pinkmilk.eu/teamx/phone/` for every show.
- The remembered identity belongs to a gameshow, not to a team.

## Player flow

1. A new player scans the QR and enters their name as today.
2. TeamX assigns the player to a team and shows the existing reveal screen.
3. The browser stores the active show ID, player name, player number, and team number on that phone.
4. On a later scan, TeamX loads the currently active show first.
5. If the saved show ID matches the active show ID, TeamX skips name entry and shows `Hi <name>, welkom terug` with the team circle.
6. The `Deel je foto's en video's` action opens `media.html` with the saved show ID, name, and team number.
7. If there is no saved identity, it is incomplete, or it belongs to a different show, TeamX removes it and displays the normal name-entry screen.

## Visual constraint

Use Barlow Semi Condensed at weight 400 for headings. Keep existing non-heading text styles unchanged and do not introduce 700-weight headings.

## Data and privacy

The browser stores only `{ showId, playerName, playerNumber, teamNumber }` in `localStorage`. No password, PocketBase administrator token, or private show data is stored. Clearing browser data simply returns the player to the normal name-entry flow.

## Error handling

- No active show: retain the current connection/no-active-show message.
- Stored identity for a different show: silently clear it; never show the prior show's name or team.
- A missing or invalid stored value: treat it as a new player.

## Testing

Add automated tests for the saved-player helper: saving a complete identity, returning it only for the matching show, and clearing stale or invalid data. Verify the normal registration flow continues to save the identity after a team assignment.

## Out of scope

- Home-screen installation or a native app.
- Recovery codes and cross-phone identity transfer.
- Changes to the large-screen team display.
- The existing unrelated edit in `teams/script-new.js`.
