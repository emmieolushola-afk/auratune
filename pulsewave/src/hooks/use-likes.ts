"use client";

import { useCallback, useEffect, useState } from "react";

interface LikesResponse {
  songs: { id: string }[];
}

export function useLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/likes")
      .then((res) => (res.ok ? (res.json() as Promise<LikesResponse>) : null))
      .then((data) => {
        if (!active) return;
        setLikedIds(new Set((data?.songs ?? []).map((s) => s.id)));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isLiked = useCallback(
    (songId: string) => likedIds.has(songId),
    [likedIds]
  );

  const toggleLike = useCallback(async (songId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (!res.ok) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (next.has(songId)) {
            next.delete(songId);
          } else {
            next.add(songId);
          }
          return next;
        });
      }
    } catch {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(songId)) {
          next.delete(songId);
        } else {
          next.add(songId);
        }
        return next;
      });
    }
  }, []);

  return {
    likes: likedIds,
    isLiked,
    toggleLike,
    loading,
  };
}
