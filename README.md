# PulseWave

A full-stack music streaming + song-identification demo built with **Next.js 16** (App Router, Turbopack) and **React 19**. It runs entirely locally with zero external accounts: audio previews come from public SoundHelix MP3s and all user data persists to a local file store.

## Features

- **Browse & search** — home feed (quick play, playlists, trending, new releases), debounced search across songs/albums/artists.
- **Real audio playback** — working play/pause/seek/volume/repeat/shuffle, queue management via a shared `PlayerProvider`.
- **Song recognition** — record from your microphone: the client computes a 16-band spectral fingerprint (windowed FFT) and matches it against deterministic per-song fingerprints.
- **Real auth** — email/password signup & login with scrypt password hashing and HMAC-signed cookie sessions (`pw_session`, 30-day TTL). Protected routes are guarded by a proxy (`src/proxy.ts`).
- **Personal library** — playlists, downloads, likes, recent searches, and identification history.
- **Tests** — vitest unit suite covering fingerprints, catalog, sessions, and the store.

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

| Layer | Where |
| --- | --- |
| Catalog seed (48 songs, 18 albums, 16 artists) | `src/lib/catalog.ts` |
| File-backed store (`.data/db.json`, atomic writes) | `src/lib/store.ts` |
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
- `POST /api/identify` (accepts a 16-element `signature`, returns best match + confidence)
- `GET|DELETE /api/history`
- `GET|POST /api/likes`
- `GET|POST /api/library`, `POST|DELETE /api/library/playlists/[id]`

All API routes run on the Node.js runtime.

### Song recognition notes

- The client records ~5s of audio, decodes it, and computes a normalized 16-band energy vector (`computeFeatureVector`).
- Local playback can't "hear" itself, so identify a song from another device/speaker. Matching is deterministic per catalog song (`songFingerprint`) and uses cosine similarity; confidence is mapped into the 60–98 range.
- It is intentionally naive — real-world accuracy will vary. See `src/lib/audio/fingerprint.ts`.

## Switching to Supabase (optional)

The app can be migrated from the file store to hosted Postgres:

1. Set up a Supabase project and apply `supabase/schema.sql` (tables, RLS, and the `handle_new_user` trigger are included).
2. Install/use the included clients:
   - `src/lib/supabase/client.ts` — browser client (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - `src/lib/supabase/server.ts` — service-role client (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Replace the demo-mode store calls in `src/app/api/**` with Supabase queries; `getSupabaseServerClient()` returns `null` in demo mode so a dual-mode fallback is possible.

Until then, nothing needs to change to run the app.

## Project layout

```
src/
  app/api/            API route handlers
  app/(main)/         home / search / listen / library pages
  components/         layout, auth forms, listen widgets, ui primitives
  hooks/              use-api-data, use-auth
  lib/                catalog, store, session, fingerprints, player-context, supabase
  proxy.ts            route protection (Next 16 proxy convention)
tests/                vitest unit tests
supabase/schema.sql   Postgres schema for the hosted migration
```