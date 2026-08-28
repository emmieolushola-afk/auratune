-- ============================================================================
-- PulseWave — Supabase schema
-- ----------------------------------------------------------------------------
-- Used to swap the local file-backed store for a hosted Postgres backend.
-- App still runs in "demo mode" out of the box with no Supabase project;
-- apply this schema when you want to switch to Supabase.
--
-- Run:  supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles mirror auth.users (one row per signup).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table public.artists (
  id text primary key,
  name text not null,
  genre text not null,
  monthly_listeners bigint not null default 0
);

create table public.albums (
  id text primary key,
  title text not null,
  artist_id text not null references public.artists (id) on delete cascade,
  artist text not null,
  year integer not null,
  artwork text not null
);

create table public.songs (
  id text primary key,
  title text not null,
  artist_id text not null references public.artists (id) on delete cascade,
  album_id text not null references public.albums (id) on delete cascade,
  genre text not null,
  duration integer not null,
  plays bigint not null default 0,
  released_at date not null,
  preview_url text not null,
  artwork text not null
);

create index songs_title_idx on public.songs (title);
create index songs_artist_id_idx on public.songs (artist_id);
create index songs_album_id_idx on public.songs (album_id);

-- ---------------------------------------------------------------------------
-- User data
-- ---------------------------------------------------------------------------
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  color text not null default '#00cfff',
  created_at timestamptz not null default now()
);

create table public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, song_id)
);

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create table public.identification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  confidence integer not null check (confidence between 0 and 100),
  identified_at timestamptz not null default now()
);

create table public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  played_at timestamptz not null default now()
);

create table public.downloads (
  user_id uuid not null references public.profiles (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  downloaded_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create table public.recent_search (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  term text not null,
  searched_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up through Supabase Auth.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'New User'), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security: each user can only touch their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.likes enable row level security;
alter table public.identification_history enable row level security;
alter table public.listening_history enable row level security;
alter table public.downloads enable row level security;
alter table public.recent_search enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles are updateable by owner"
  on public.profiles for update using (auth.uid() = id);

create policy "users manage their own playlists"
  on public.playlists for all using (auth.uid() = user_id);
create policy "users manage their own playlist tracks"
  on public.playlist_tracks for all using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  );
create policy "users manage their own likes"
  on public.likes for all using (auth.uid() = user_id);
create policy "users manage their own identification history"
  on public.identification_history for all using (auth.uid() = user_id);
create policy "users manage their own listening history"
  on public.listening_history for all using (auth.uid() = user_id);
create policy "users manage their own downloads"
  on public.downloads for all using (auth.uid() = user_id);
create policy "users manage their own recent searches"
  on public.recent_search for all using (auth.uid() = user_id);

-- Catalog tables are read-only for everyone (seeded by app).
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.songs enable row level security;

create policy "catalog is public read-only"
  on public.songs for select using (true);
create policy "albums are public read-only"
  on public.albums for select using (true);
create policy "artists are public read-only"
  on public.artists for select using (true);