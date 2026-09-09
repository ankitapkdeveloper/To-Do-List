# FocusList — To Do List UI

A polished vanilla HTML/CSS/JavaScript recreation of the supplied mobile to-do list design.

## Included

- `index.html` — GitHub Pages-ready app entry point.
- `public/test.html` — standalone file for quick testing.
- `src/app.html` — editable source copy.
- `supabase-schema.sql` — optional Supabase database/auth starting point.
- `README.md` — setup notes.

## Run locally

Open `public/test.html` directly in a browser, or serve the folder with any static server.

For GitHub Pages, upload the files and use `index.html` as the site entry.

## Login

The standalone demo includes Login + Create account screens. Demo credentials are stored in browser `localStorage` only. This is useful for testing UI flows, but it is **not production authentication**.

For production, use Supabase Auth/Firebase/Auth0/etc. Never store plain-text passwords in your own database.

## UI

The interface is intentionally matched to the supplied reference: dark navy cards, rounded task rows, category pills, bottom navigation, floating add button, mountain/lake background, and the Add Task screen.

## Supabase

The provided SQL is a starter schema. Use Supabase Auth for users and protect rows with Row Level Security.


## Mobile Fix (v2)
- Removed the fake phone status bar (time, signal, battery) so Android does not show duplicate UI.
- Uses `100dvh` on mobile to avoid vertical cropping.
- Added a Full Screen button (⛶).
- All buttons use touch-friendly handlers.
- Added Restore demo tasks in the menu.
