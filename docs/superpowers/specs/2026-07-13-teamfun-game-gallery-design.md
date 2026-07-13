# TeamFun game gallery design

## Goal

Replace the former PhotoCircle hand-off with a Pink Milk hosted, public gallery
for each quiz show.

## Game code and URL

- Creating a show in TeamInput automatically generates a unique eight-character
  game code using uppercase, unambiguous letters and digits.
- TeamInput displays the code and its read-only public URL:
  `https://www.pinkmilk.eu/teamfun/<GAMECODE>`.
- The code is stored in a dedicated `gamecode` field on the PocketBase `teamx`
  collection. The old PhotoCircle/URL value is not repurposed.

## Public TeamFun page

- `/teamfun/<GAMECODE>` resolves the show by its game code.
- The header shows the show date, `Quizmaster Klaas presenteerde`, and the show
  name.
- All PocketBase photos and videos for that show are displayed in a five-column
  desktop grid, responsive for narrower screens.
- Clicking or tapping a photo or video opens it in a full-screen lightbox with
  close and previous/next controls.
- The page is publicly readable and has no administrative login or write access.

## Selecting and downloading

- A Select button enables selection controls on every media tile.
- The action button changes to show the count, for example `Download 3 selected`.
- Only selected original files are downloaded. The browser may confirm or group
  multiple downloads according to the visitor's browser settings.

## Data and safety

- TeamFun reads only the show metadata needed for the heading and the show media
  belonging to that show.
- Uploading remains on the existing player media page.
- PocketBase collection rules will be configured for public, read-only gallery
  access without exposing administrator credentials in the TeamFun page.
