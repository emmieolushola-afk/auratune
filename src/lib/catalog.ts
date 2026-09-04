export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  genre: string;
  duration: number;
  plays: number;
  releasedAt: string;
  previewUrl: string;
  artwork: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  artwork: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  monthlyListeners: number;
}

const PREVIEWS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
];

const prev = (i: number) => PREVIEWS[i % PREVIEWS.length];

interface SongSeed {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  duration: number;
  plays: number;
  releasedAt: string;
  previewIndex: number;
}

const artists: Artist[] = [
  { id: "the-weeknd", name: "The Weeknd", genre: "R&B", monthlyListeners: 110_000_000 },
  { id: "dua-lipa", name: "Dua Lipa", genre: "Dance-pop", monthlyListeners: 85_000_000 },
  { id: "ed-sheeran", name: "Ed Sheeran", genre: "Pop", monthlyListeners: 90_000_000 },
  { id: "harry-styles", name: "Harry Styles", genre: "Pop Rock", monthlyListeners: 70_000_000 },
  { id: "billie-eilish", name: "Billie Eilish", genre: "Alt-pop", monthlyListeners: 95_000_000 },
  { id: "ariana-grande", name: "Ariana Grande", genre: "Pop", monthlyListeners: 88_000_000 },
  { id: "taylor-swift", name: "Taylor Swift", genre: "Pop", monthlyListeners: 105_000_000 },
  { id: "drake", name: "Drake", genre: "Hip-Hop", monthlyListeners: 87_000_000 },
  { id: "bad-bunny", name: "Bad Bunny", genre: "Latin", monthlyListeners: 82_000_000 },
  { id: "glass-animals", name: "Glass Animals", genre: "Indie", monthlyListeners: 40_000_000 },
  { id: "olivia-rodrigo", name: "Olivia Rodrigo", genre: "Pop", monthlyListeners: 78_000_000 },
  { id: "doja-cat", name: "Doja Cat", genre: "Pop Rap", monthlyListeners: 69_000_000 },
  { id: "justin-bieber", name: "Justin Bieber", genre: "Pop", monthlyListeners: 76_000_000 },
  { id: "post-malone", name: "Post Malone", genre: "Hip-Hop", monthlyListeners: 72_000_000 },
  { id: "sza", name: "SZA", genre: "R&B", monthlyListeners: 64_000_000 },
  { id: "kendrick-lamar", name: "Kendrick Lamar", genre: "Hip-Hop", monthlyListeners: 68_000_000 },
];

const albums: Album[] = [
  { id: "after-hours", title: "After Hours", artistId: "the-weeknd", artist: "The Weeknd", year: 2020, artwork: "from-purple-500/30 to-blue-500/30" },
  { id: "dawn-fm", title: "Dawn FM", artistId: "the-weeknd", artist: "The Weeknd", year: 2022, artwork: "from-violet-500/30 to-cyan-500/30" },
  { id: "future-nostalgia", title: "Future Nostalgia", artistId: "dua-lipa", artist: "Dua Lipa", year: 2020, artwork: "from-yellow-500/30 to-pink-500/30" },
  { id: "divide", title: "Divide", artistId: "ed-sheeran", artist: "Ed Sheeran", year: 2017, artwork: "from-green-500/30 to-teal-500/30" },
  { id: "harry-house", title: "Harry's House", artistId: "harry-styles", artist: "Harry Styles", year: 2022, artwork: "from-orange-500/30 to-rose-500/30" },
  { id: "fine-line", title: "Fine Line", artistId: "harry-styles", artist: "Harry Styles", year: 2019, artwork: "from-pink-500/30 to-purple-500/30" },
  { id: "happier-than-ever", title: "Happier Than Ever", artistId: "billie-eilish", artist: "Billie Eilish", year: 2021, artwork: "from-amber-500/30 to-red-500/30" },
  { id: "positions", title: "Positions", artistId: "ariana-grande", artist: "Ariana Grande", year: 2020, artwork: "from-rose-500/30 to-violet-500/30" },
  { id: "midnights", title: "Midnights", artistId: "taylor-swift", artist: "Taylor Swift", year: 2022, artwork: "from-indigo-500/30 to-blue-500/30" },
  { id: "clb", title: "Certified Lover Boy", artistId: "drake", artist: "Drake", year: 2021, artwork: "from-slate-500/30 to-blue-500/30" },
  { id: "un-verano-sin-ti", title: "Un Verano Sin Ti", artistId: "bad-bunny", artist: "Bad Bunny", year: 2022, artwork: "from-emerald-500/30 to-yellow-500/30" },
  { id: "dreamland", title: "Dreamland", artistId: "glass-animals", artist: "Glass Animals", year: 2020, artwork: "from-teal-500/30 to-purple-500/30" },
  { id: "sour", title: "SOUR", artistId: "olivia-rodrigo", artist: "Olivia Rodrigo", year: 2021, artwork: "from-purple-500/30 to-pink-500/30" },
  { id: "planet-her", title: "Planet Her", artistId: "doja-cat", artist: "Doja Cat", year: 2021, artwork: "from-lime-500/30 to-cyan-500/30" },
  { id: "justice", title: "Justice", artistId: "justin-bieber", artist: "Justin Bieber", year: 2021, artwork: "from-fuchsia-500/30 to-blue-500/30" },
  { id: "hollywoods-bleeding", title: "Hollywood's Bleeding", artistId: "post-malone", artist: "Post Malone", year: 2019, artwork: "from-red-500/30 to-slate-500/30" },
  { id: "sos", title: "SOS", artistId: "sza", artist: "SZA", year: 2022, artwork: "from-sky-500/30 to-indigo-500/30" },
  { id: "damn", title: "DAMN.", artistId: "kendrick-lamar", artist: "Kendrick Lamar", year: 2017, artwork: "from-rose-500/30 to-amber-500/30" },
];

const songSeeds: SongSeed[] = [
  { id: "blinding-lights", title: "Blinding Lights", artistId: "the-weeknd", albumId: "after-hours", duration: 200, plays: 2_100_000_000, releasedAt: "2019-11-29", previewIndex: 0 },
  { id: "save-your-tears", title: "Save Your Tears", artistId: "the-weeknd", albumId: "after-hours", duration: 215, plays: 1_700_000_000, releasedAt: "2020-03-20", previewIndex: 1 },
  { id: "starboy", title: "Starboy", artistId: "the-weeknd", albumId: "dawn-fm", duration: 230, plays: 2_000_000_000, releasedAt: "2016-09-22", previewIndex: 2 },
  { id: "the-hills", title: "The Hills", artistId: "the-weeknd", albumId: "dawn-fm", duration: 242, plays: 1_080_000_000, releasedAt: "2015-05-27", previewIndex: 3 },
  { id: "die-for-you", title: "Die For You", artistId: "the-weeknd", albumId: "dawn-fm", duration: 260, plays: 1_400_000_000, releasedAt: "2016-11-25", previewIndex: 4 },

  { id: "levitating", title: "Levitating", artistId: "dua-lipa", albumId: "future-nostalgia", duration: 203, plays: 2_300_000_000, releasedAt: "2020-10-01", previewIndex: 5 },
  { id: "dont-start-now", title: "Don't Start Now", artistId: "dua-lipa", albumId: "future-nostalgia", duration: 183, plays: 1_900_000_000, releasedAt: "2019-10-31", previewIndex: 6 },
  { id: "physical", title: "Physical", artistId: "dua-lipa", albumId: "future-nostalgia", duration: 193, plays: 700_000_000, releasedAt: "2020-01-30", previewIndex: 7 },

  { id: "shape-of-you", title: "Shape of You", artistId: "ed-sheeran", albumId: "divide", duration: 233, plays: 3_500_000_000, releasedAt: "2017-01-06", previewIndex: 8 },
  { id: "perfect", title: "Perfect", artistId: "ed-sheeran", albumId: "divide", duration: 263, plays: 2_800_000_000, releasedAt: "2017-03-03", previewIndex: 9 },
  { id: "castle-on-the-hill", title: "Castle on the Hill", artistId: "ed-sheeran", albumId: "divide", duration: 261, plays: 900_000_000, releasedAt: "2017-01-06", previewIndex: 10 },

  { id: "as-it-was", title: "As It Was", artistId: "harry-styles", albumId: "harry-house", duration: 167, plays: 2_500_000_000, releasedAt: "2022-04-01", previewIndex: 11 },
  { id: "watermelon-sugar", title: "Watermelon Sugar", artistId: "harry-styles", albumId: "fine-line", duration: 174, plays: 2_000_000_000, releasedAt: "2019-11-17", previewIndex: 12 },
  { id: "lights-up", title: "Lights Up", artistId: "harry-styles", albumId: "fine-line", duration: 172, plays: 700_000_000, releasedAt: "2019-10-11", previewIndex: 13 },

  { id: "happier-than-ever", title: "Happier Than Ever", artistId: "billie-eilish", albumId: "happier-than-ever", duration: 298, plays: 1_600_000_000, releasedAt: "2021-04-29", previewIndex: 14 },
  { id: "bad-guy", title: "bad guy", artistId: "billie-eilish", albumId: "happier-than-ever", duration: 194, plays: 1_900_000_000, releasedAt: "2019-03-29", previewIndex: 15 },
  { id: "therefore-i-am", title: "Therefore I Am", artistId: "billie-eilish", albumId: "happier-than-ever", duration: 174, plays: 900_000_000, releasedAt: "2020-11-12", previewIndex: 0 },

  { id: "positions", title: "positions", artistId: "ariana-grande", albumId: "positions", duration: 172, plays: 1_300_000_000, releasedAt: "2020-10-23", previewIndex: 1 },
  { id: "34-35", title: "34+35", artistId: "ariana-grande", albumId: "positions", duration: 173, plays: 800_000_000, releasedAt: "2020-10-30", previewIndex: 2 },

  { id: "anti-hero", title: "Anti-Hero", artistId: "taylor-swift", albumId: "midnights", duration: 200, plays: 1_800_000_000, releasedAt: "2022-10-21", previewIndex: 3 },
  { id: "cardigan", title: "cardigan", artistId: "taylor-swift", albumId: "midnights", duration: 239, plays: 1_000_000_000, releasedAt: "2020-07-24", previewIndex: 4 },

  { id: "god-plan", title: "God's Plan", artistId: "drake", albumId: "clb", duration: 198, plays: 1_900_000_000, releasedAt: "2018-01-19", previewIndex: 5 },
  { id: "in-my-feelings", title: "In My Feelings", artistId: "drake", albumId: "clb", duration: 217, plays: 1_500_000_000, releasedAt: "2018-07-10", previewIndex: 6 },

  { id: "tití-me-preguntó", title: "Tití Me Preguntó", artistId: "bad-bunny", albumId: "un-verano-sin-ti", duration: 242, plays: 1_200_000_000, releasedAt: "2022-05-06", previewIndex: 7 },
  { id: "dákiti", title: "DÁKITI", artistId: "bad-bunny", albumId: "un-verano-sin-ti", duration: 205, plays: 1_700_000_000, releasedAt: "2020-10-30", previewIndex: 8 },
  { id: "me-porto-bonito", title: "Me Porto Bonito", artistId: "bad-bunny", albumId: "un-verano-sin-ti", duration: 178, plays: 1_500_000_000, releasedAt: "2022-05-06", previewIndex: 9 },

  { id: "heat-waves", title: "Heat Waves", artistId: "glass-animals", albumId: "dreamland", duration: 236, plays: 3_200_000_000, releasedAt: "2020-06-29", previewIndex: 10 },
  { id: "space-ghost-coast-to-coast", title: "Space Ghost Coast to Coast", artistId: "glass-animals", albumId: "dreamland", duration: 213, plays: 400_000_000, releasedAt: "2020-08-07", previewIndex: 11 },

  { id: "good-4-u", title: "good 4 u", artistId: "olivia-rodrigo", albumId: "sour", duration: 178, plays: 2_400_000_000, releasedAt: "2021-05-14", previewIndex: 12 },
  { id: "drivers-license", title: "drivers license", artistId: "olivia-rodrigo", albumId: "sour", duration: 242, plays: 2_200_000_000, releasedAt: "2021-01-08", previewIndex: 13 },
  { id: "deja-vu", title: "deja vu", artistId: "olivia-rodrigo", albumId: "sour", duration: 215, plays: 1_000_000_000, releasedAt: "2021-04-01", previewIndex: 14 },

  { id: "kiss-me-more", title: "Kiss Me More", artistId: "doja-cat", albumId: "planet-her", duration: 208, plays: 1_700_000_000, releasedAt: "2021-04-09", previewIndex: 15 },
  { id: "need-to-know", title: "Need to Know", artistId: "doja-cat", albumId: "planet-her", duration: 210, plays: 1_100_000_000, releasedAt: "2021-06-11", previewIndex: 0 },
  { id: "woman", title: "Woman", artistId: "doja-cat", albumId: "planet-her", duration: 172, plays: 1_200_000_000, releasedAt: "2021-01-06", previewIndex: 1 },

  { id: "stay", title: "Stay", artistId: "justin-bieber", albumId: "justice", duration: 141, plays: 2_100_000_000, releasedAt: "2021-07-09", previewIndex: 2 },
  { id: "peaches", title: "Peaches", artistId: "justin-bieber", albumId: "justice", duration: 198, plays: 1_600_000_000, releasedAt: "2021-03-19", previewIndex: 3 },

  { id: "circles", title: "Circles", artistId: "post-malone", albumId: "hollywoods-bleeding", duration: 215, plays: 2_300_000_000, releasedAt: "2019-08-30", previewIndex: 4 },
  { id: "sunflower", title: "Sunflower", artistId: "post-malone", albumId: "hollywoods-bleeding", duration: 158, plays: 2_600_000_000, releasedAt: "2018-10-18", previewIndex: 5 },
  { id: "rockstar", title: "rockstar", artistId: "post-malone", albumId: "hollywoods-bleeding", duration: 218, plays: 2_200_000_000, releasedAt: "2017-09-15", previewIndex: 6 },

  { id: "kill-bill", title: "Kill Bill", artistId: "sza", albumId: "sos", duration: 153, plays: 1_400_000_000, releasedAt: "2022-12-09", previewIndex: 7 },
  { id: "shirt", title: "Shirt", artistId: "sza", albumId: "sos", duration: 181, plays: 500_000_000, releasedAt: "2022-10-27", previewIndex: 8 },

  { id: "humble", title: "HUMBLE.", artistId: "kendrick-lamar", albumId: "damn", duration: 177, plays: 1_800_000_000, releasedAt: "2017-03-30", previewIndex: 9 },
  { id: "loyalty", title: "LOYALTY.", artistId: "kendrick-lamar", albumId: "damn", duration: 227, plays: 500_000_000, releasedAt: "2017-06-20", previewIndex: 10 },
];

const albumById = new Map(albums.map((a) => [a.id, a]));
const artistById = new Map(artists.map((a) => [a.id, a]));

export const songs: Song[] = songSeeds.map((s) => {
  const album = albumById.get(s.albumId)!;
  const artist = artistById.get(s.artistId)!;
  return {
    id: s.id,
    title: s.title,
    artist: artist.name,
    artistId: artist.id,
    album: album.title,
    albumId: album.id,
    genre: artist.genre,
    duration: s.duration,
    plays: s.plays,
    releasedAt: s.releasedAt,
    previewUrl: prev(s.previewIndex),
    artwork: album.artwork,
  };
});

export { albums, artists };

export function getSongById(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

export function getAlbumById(id: string): Album | undefined {
  return albums.find((a) => a.id === id);
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

export function searchCatalog(query: string): {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
} {
  const q = query.trim().toLowerCase();
  if (!q) return { songs: [], albums: [], artists: [] };
  return {
    songs: songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    ),
    albums: albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    ),
    artists: artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
    ),
  };
}

export function trendingByPlays(limit = 10): Song[] {
  return [...songs].sort((a, b) => b.plays - a.plays).slice(0, limit);
}

export function newReleases(limit = 8): Song[] {
  return [...songs]
    .sort((a, b) => (a.releasedAt < b.releasedAt ? 1 : -1))
    .slice(0, limit);
}

export function songsByAlbum(albumId: string): Song[] {
  return songs.filter((s) => s.albumId === albumId);
}

export function songsByArtist(artistId: string): Song[] {
  return songs.filter((s) => s.artistId === artistId);
}