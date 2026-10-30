# gather.

A meetup app built with Next.js and MongoDB. Sign in with GitHub or Google, host a meetup with a photo and a real location, and see who's going. If the host moves the date, everyone who RSVP'd gets a notification.

**Live:** https://gather-omega-fawn.vercel.app/

![Home page](docs/screenshot.png)

## What you can do

- Browse upcoming meetups, soonest first, and filter by category (the filter is in the URL, so `/?category=tech` can be shared)
- Sign in with GitHub or Google
- Host a meetup: upload a photo, search for the address, pick a date and an optional capacity
- RSVP, see who else is going, and how many spots are left
- Edit, reschedule or delete meetups you host
- Get a notification in the bell when a meetup you're going to is rescheduled or cancelled
- See the location on a map, get directions, or add the meetup to Google Calendar

## Background

This started as the "React Meetups" project from a Next.js course I took while learning the framework. The course version had a list page, a details page and a form, and the pages loaded their data by calling the app's own API at `http://localhost:3000`.

When I finished the course I kept going with it. Partly because I wanted something I could actually deploy (the localhost calls meant it only ever worked on my machine), and partly to practice the things the course skipped. Everything in the list above apart from the basic list, details page and form came after the course, as did:

- A full redesign. Plain CSS Modules, no component library.
- Pages query MongoDB directly in `getServerSideProps` / `getStaticProps` instead of fetching their own API route, with one shared connection in `lib/mongodb.js`.
- Details pages use ISR with `fallback: 'blocking'`, so meetups created after a deploy get a page instead of a 404.
- Server-side validation and proper status codes on every API route. Previously a failed insert just left the request hanging.

## Stack

- Next.js 12 (pages router) and React 18
- MongoDB Atlas with the official Node driver
- NextAuth (GitHub and Google sign-in)
- Vercel Blob for image uploads
- Leaflet with CARTO map tiles, Photon and Nominatim (OpenStreetMap) for address search
- CSS Modules
- Hosted on Vercel

## How it's put together

**Pages**

| Route | What it does |
| --- | --- |
| `/` | Server-rendered on every request so new meetups show up straight away. Reads `?category=` for filtering. |
| `/[meetupId]` | Statically generated and cached (ISR). Rebuilt in the background every 60 seconds, or immediately when the meetup changes. |
| `/[meetupId]/edit` | Edit form. Only the host gets in; everyone else is redirected. |
| `/new-meetup` | The form for hosting. Signed-out visitors are sent to sign in first. |
| `/signin` | Custom sign-in page. |

**API**

| Route | What it does |
| --- | --- |
| `/api/new-meetup` | `GET` lists meetups, `POST` creates one (signed in only). |
| `/api/meetups/[id]` | `PATCH` edits, `DELETE` removes. Host only. Notifies attendees if the date changes or it's cancelled. |
| `/api/meetups/[id]/rsvp` | `POST` to join, `DELETE` to leave. |
| `/api/notifications` | `GET` your notifications, `PATCH` marks them read. |
| `/api/upload` | Hands out short-lived upload tokens for Vercel Blob. |

Every API route does its checks in the same order: signed in (401), does it exist (404), are you allowed (403), is the data valid (422). Database code lives in `lib/`, so pages and API routes share the same functions.

### A few things I had to think about

**Who owns a meetup.** People can sign in with GitHub or Google, and the email is the only thing both have in common, so a meetup's host is stored by email. The pages only ever get a hashed id (`lib/users.js`), so emails never end up in the page source. The edit and delete buttons check the id in the browser, and the API checks the email again before changing anything.

**The last spot.** If a meetup has one spot left and two people click "I'm going" at the same time, only one should get it. The capacity check and adding the person happen in a single MongoDB update (`addAttendee` in `lib/meetups.js`), so the database decides who wins. I tested it by firing two requests at once against a temporary collection.

**Cached pages that change.** Details pages are cached, so after an edit or RSVP the API calls `res.revalidate()` to rebuild that page right away instead of waiting for the 60 second window.

**Uploads.** The browser uploads photos straight to Vercel Blob. My API route only hands out a token, and only to signed-in users, limited to images under 5 MB. Photos never pass through my server, which also avoids Vercel's 4.5 MB request limit.

**Addresses and maps.** The address field suggests places as you type (Photon), and picking one saves exact coordinates. Older meetups get looked up once on the server with Nominatim and the result is saved, since their usage policy allows about one request per second. The map itself is Leaflet with warm-tinted tiles and a pin that shows the meetup's photo.

**Dates.** Meetup times are stored as the local time at the venue, e.g. `2026-11-14T18:30`, which is also exactly what a `datetime-local` input gives you. I format them by hand in `lib/dates.js` rather than with `toLocaleString`. The server runs in UTC and the visitor's browser usually doesn't, so `toLocaleString` can give two different results for the same meetup, and React flags that as a hydration mismatch.

## Running it locally

You'll need Node 22 and a MongoDB Atlas cluster. Next 12 doesn't build on Node 24+ (it bundles a library that uses `SlowBuffer`, which newer Node removed), so the version is pinned in `package.json`.

```bash
git clone https://github.com/FareenaAkram/gather.git
cd gather
npm install
cp .env.example .env.local
npm run dev
```

Then fill in `.env.local`:

| Variable | Where it comes from |
| --- | --- |
| `DB_PASSWORD` | Your Atlas database user's password |
| `NEXTAUTH_URL` | `http://localhost:3000` locally, your real domain in production |
| `NEXTAUTH_SECRET` | Any long random string |
| `GITHUB_ID`, `GITHUB_SECRET` | A GitHub OAuth app with the callback `http://localhost:3000/api/auth/callback/github` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | A Google OAuth client with the redirect URI `http://localhost:3000/api/auth/callback/google` |
| `BLOB_READ_WRITE_TOKEN` | A **public** Vercel Blob store |

GitHub only allows one callback URL per OAuth app, so production needs a second app. The connection string's username and cluster host are set in `lib/mongodb.js`; if you're using your own cluster, change those there too.

## Things I'd like to add

- Upgrade to Next.js 15 (and drop the Node 22 pin)
- Email notifications alongside the in-app ones
- A map view of all meetups on the home page
- Tests for the API routes
