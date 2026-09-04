"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  previewUrl?: string;
  artwork?: string;
}

type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const demoTrack: Track = {
  id: "blinding-lights",
  title: "Blinding Lights",
  artist: "The Weeknd",
  album: "After Hours",
  duration: 200,
  genre: "Synth-pop",
  previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  artwork: "from-purple-500/30 to-blue-500/30",
};

const demoQueue: Track[] = [
  demoTrack,
  {
    id: "levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    genre: "Dance-pop",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "shape-of-you",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "Divide",
    duration: 233,
    genre: "Pop",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "stay",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "Justice",
    duration: 141,
    genre: "Pop Rap",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "watermelon-sugar",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 174,
    genre: "Pop Rock",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  },
];

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track>(demoTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [volumeState, setVolumeState] = useState(75);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [queueState, setQueue] = useState<Track[]>(demoQueue);
  const [currentIndex, setCurrentIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const liveRef = useRef<{
    queue: Track[];
    currentIndex: number;
    isShuffled: boolean;
    repeatMode: RepeatMode;
    volume: number;
    currentTrack: Track;
    isPlaying: boolean;
  }>({
    queue: [],
    currentIndex: 0,
    isShuffled: false,
    repeatMode: "off",
    volume: 75,
    currentTrack: demoTrack,
    isPlaying: false,
  });

  useEffect(() => {
    liveRef.current = {
      queue: queueState,
      currentIndex,
      isShuffled,
      repeatMode,
      volume: volumeState,
      currentTrack,
      isPlaying,
    };
  });

  const getAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const loadAndPlay = useCallback(
    (track: Track) => {
      const audio = getAudio();
      setProgressValue(0);
      if (!audio) {
        setIsPlaying(true);
        return;
      }
      if (track.previewUrl) {
        audio.src = track.previewUrl;
      } else {
        audio.removeAttribute("src");
      }
      audio.volume = liveRef.current.volume / 100;
      const started = audio.play();
      if (started) {
        started.then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      } else {
        setIsPlaying(true);
      }
    },
    [getAudio]
  );

  const advance = useCallback(
    (dir: 1 | -1) => {
      const st = liveRef.current;
      const nextIdx =
        dir === 1
          ? st.isShuffled
            ? Math.floor(Math.random() * st.queue.length)
            : (st.currentIndex + 1) % st.queue.length
          : (st.currentIndex - 1 + st.queue.length) % st.queue.length;
      const nextTrack = st.queue[nextIdx] ?? st.currentTrack;
      setCurrentIndex(nextIdx);
      setCurrentTrack(nextTrack);
      loadAndPlay(nextTrack);
    },
    [loadAndPlay]
  );

  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgressValue(Math.min(100, (audio.currentTime / audio.duration) * 100));
      }
    };
    const onEnded = () => {
      const st = liveRef.current;
      if (st.repeatMode === "one") {
        audio.currentTime = 0;
        setProgressValue(0);
        const started = audio.play();
        if (started) started.catch(() => {});
        return;
      }
      if (st.repeatMode === "all") {
        advance(1);
        return;
      }
      setIsPlaying(false);
      setProgressValue(0);
    };
    const onError = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, [getAudio, advance]);

  const play = useCallback(
    (track?: Track) => {
      if (track) {
        const st = liveRef.current;
        const idx = st.queue.findIndex((t) => t.id === track.id);
        if (idx >= 0) {
          setCurrentIndex(idx);
        } else {
          setQueue((q) => [...q, track]);
          setCurrentIndex(st.queue.length);
        }
        setCurrentTrack(track);
        loadAndPlay(track);
      } else {
        const audio = getAudio();
        if (!audio) {
          setIsPlaying(true);
          return;
        }
        audio.volume = liveRef.current.volume / 100;
        const started = audio.play();
        if (started) {
          started.then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
        } else {
          setIsPlaying(true);
        }
      }
    },
    [getAudio, loadAndPlay]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    getAudio()?.pause();
  }, [getAudio]);

  const togglePlay = useCallback(() => {
    if (liveRef.current.isPlaying) {
      pause();
      return;
    }
    const audio = getAudio();
    if (audio && audio.src && audio.currentTime > 0) {
      const started = audio.play();
      if (started) started.catch(() => {});
      setIsPlaying(true);
    } else {
      play(liveRef.current.currentTrack ?? undefined);
    }
  }, [pause, play, getAudio]);

  const seekTo = useCallback(
    (p: number) => {
      const clamped = Math.max(0, Math.min(100, p));
      setProgressValue(clamped);
      const audio = getAudio();
      const duration = liveRef.current.currentTrack?.duration ?? 0;
      if (audio && audio.src && duration > 0) {
        try {
          audio.currentTime = (clamped / 100) * duration;
        } catch {
          /* media not ready */
        }
      }
    },
    [getAudio]
  );

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(100, v));
      setVolumeState(clamped);
      const audio = getAudio();
      if (audio) audio.volume = clamped / 100;
    },
    [getAudio]
  );

  const next = useCallback(() => {
    const st = liveRef.current;
    if (st.repeatMode === "one") {
      const audio = getAudio();
      if (audio) {
        audio.currentTime = 0;
        setProgressValue(0);
        const started = audio.play();
        if (started) started.catch(() => {});
      }
      setIsPlaying(true);
      return;
    }
    advance(1);
  }, [getAudio, advance]);

  const previous = useCallback(() => {
    const audio = getAudio();
    if (audio && audio.currentTime > 5) {
      audio.currentTime = 0;
      setProgressValue(0);
      setIsPlaying(true);
      const started = audio.play();
      if (started) started.catch(() => {});
      return;
    }
    advance(-1);
  }, [getAudio, advance]);

  const toggleShuffle = useCallback(() => setIsShuffled((s) => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => (q.some((t) => t.id === track.id) ? q : [...q, track]));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress: progressValue,
        volume: volumeState,
        isShuffled,
        repeatMode,
        queue: queueState,
        play,
        pause,
        togglePlay,
        setProgress: seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        next,
        previous,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}