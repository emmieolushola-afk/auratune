# PulseWave

A full-stack music streaming + song-identification demo built with **Next.js 16** (App Router, Turbopack) and **React 19**. It runs entirely locally with zero external accounts: audio previews come from public SoundHelix MP3s and all user data persists to a local file store.

## Features

- **Browse & search** — home feed (quick play, playlists, trending, new releases), debounced search across songs/albums/artists, and clickable album/artist detail pages.
- **Real audio playback** — working play/pause/seek/volume/repeat/shuffle, queue management via a shared `PlayerProvider`, and a now-playing modal.
- **Song recognition** — record from your microphone: the client computes a 16-band spectral fingerprint (windowed FFT) and matches it against deterministic per-song fingerprints.
- **Real auth** — email/password signup & login with scrypt password hashing and HMAC-signed cookie sessions (`pw_session`, 30-day TTL). Protected routes are guarded by a proxy (`src/proxy.ts`). When Supabase is configured, signup/login use Supabase Auth instead.
- **Personal library** — playlists (including add-to-playlist from any song), downloads, likes, recent searches, identification history, and real play history.
- **Profile & pricing** — a profile page with account stats and a static pricing page.
- **Tests** — vitest unit suite covering fingerprints, catalog, sessions, the store, and the data-access layer.

## Getting started

Requires Node 20+ and pnpm (or npm).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts:

```bash
pnpm build      # production build (runs typecheck)
pnpm start      # serve the production build
pnpm lint       # eslint
pnpm test       # vitest unit tests
pnpm exec tsc --noEmit   # typecheck only
```

No environment variables are required — the app starts in **demo mode**. To set a long-lived `AUTH_SECRET` (recommended for anything beyond local), copy `.env.example` to `.env.local`.

## Architecture

### Demo mode (default)

| Category | Where |
| --- | --- |
| Catalog seed (48 songs, 18 albums, 16 artists) | `src/lib/catalog.ts` |
| File-backed store (`.data/db.json`, atomic writes) | `src/lib/store.ts` |
| Data-access layer (file vs Supabase) | `src/lib/repo.ts` |
| Password hashing + signed sessions | `src/lib/session.ts` |
| Route handlers | `src/app/api/**` |
| Route protection (unauthenticated → `/login?next=…`) | `src/proxy.ts` |
| Audio playback provider | `src/lib/player-context.tsx` |
| Fingerprinting (shared math) | `src/lib/fingerprints.ts` |
| Mic capture + FFT (browser) | `src/lib/audio/fingerprint.ts` |

Data model mirrors: users, identification history, likes, playlists, downloads, recent searches.

### API surface

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/catalog` (home sections, plus `?section=search|albums`)
- `GET /api/search?q=…`
- `GET /api/songs/[id]`
- `GET /api/albums/[id]`, `GET /api/artists/[id]`
- `POST /api/identify` (accepts a 16-element `signature`, returns best match + confidence)
- `GET|POST|DELETE /api/history` (`POST` records a play; `?type=plays` returns play history)
- `GET|POST /api/likes`
- `GET|POST /api/library`, `POST /api/library/playlists/[id]`

All API routes run on the Node.js runtime.

### Song recognition notes

- The client records ~5s of audio, decodes it, and computes a normalized 16-band energy vector (`computeFeatureVector`).
- Local playback can't "hear" itself, so identify a song from another device/speaker. Matching is deterministic per catalog song (`songFingerprint`) and uses cosine similarity; confidence is mapped into the 60–98 range.
- It is intentionally naive — real-world accuracy will vary. See `src/lib/audio/fingerprint.ts`.

## Switching to Supabase

The app runs in **demo mode** (file store) with zero env vars. Setting the Supabase
vars below activates **hosted mode** via a unified data-access layer
(`src/lib/repo.ts`):

| Env var | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side service-role client for all data operations |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client used for Supabase Auth sign-out |

To use hosted mode:

1. Create a Supabase project and apply `supabase/schema.sql` (tables, RLS, and the
   `handle_new_user` trigger are included).
2. Set the env vars above in `.env.local`.
3. On first data write, the deterministic demo catalog is upserted into
   Supabase (`src/lib/supabase/seed-catalog.ts`) so user tables can reference it.

In hosted mode, signup/login are handled by **Supabase Auth**
(`admin.createUser` / `signInWithPassword`), while the app still issues its
HMAC-signed cookie session so route protection and the client auth hook keep
working unchanged.

Until env vars are set, nothing needs to change to run the app in demo mode.

## Project layout

```
src/
  app/api/            API route handlers
  app/(main)/         home / search / listen / library / profile / pricing / album / artist pages
  components/         layout, auth forms, listen widgets, library, ui primitives
  hooks/              use-api-data, use-auth, use-likes, use-playlists
  lib/                catalog, store, repo, session, fingerprints, player-context, supabase
  proxy.ts            route protection (Next 16 proxy convention)
tests/                vitest unit tests
supabase/schema.sql   Postgres schema for the hosted migration
```