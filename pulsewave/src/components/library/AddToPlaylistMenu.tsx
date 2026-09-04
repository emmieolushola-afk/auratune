"use client";

import { useState } from "react";
import { ListMusic, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlaylists } from "@/hooks/use-playlists";

interface AddToPlaylistMenuProps {
  songId: string;
}

export default function AddToPlaylistMenu({ songId }: AddToPlaylistMenuProps) {
  const { playlists, loading, addToPlaylist, createPlaylist } = usePlaylists();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addable = playlists.filter((p) => !p.isSpecial);

  const handleAdd = async (playlistId: string) => {
    setBusyId(playlistId);
    try {
      await addToPlaylist(songId, playlistId);
      setAddedId(playlistId);
      setTimeout(() => setAddedId(null), 1200);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    if (name.trim().length < 2) return;
    await createPlaylist(name.trim());
    setName("");
    setCreating(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-text-muted hover:text-neon-cyan"
          aria-label="Add to playlist"
          onClick={(e) => e.stopPropagation()}
        >
          <ListMusic className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Add to playlist</DropdownMenuLabel>
        {loading && addable.length === 0 ? (
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </div>
        ) : addable.length === 0 && !creating ? (
          <p className="px-3 py-2 text-xs text-text-muted">No custom playlists</p>
        ) : (
          addable.map((pl) => (
            <DropdownMenuItem
              key={pl.id}
              disabled={busyId === pl.id}
              onSelect={(e) => {
                e.preventDefault();
                handleAdd(pl.id);
              }}
              className={addedId === pl.id ? "text-neon-cyan" : ""}
            >
              {addedId === pl.id ? (
                <Check className="h-4 w-4" />
              ) : busyId === pl.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ListMusic className="h-4 w-4" />
              )}
              {pl.name}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        {creating ? (
          <div className="px-2 py-1.5 flex items-center gap-1.5">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="New playlist name"
              className="h-8 text-xs"
            />
            <Button
              variant="neon"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleCreate}
              disabled={name.trim().length < 2}
            >
              Add
            </Button>
          </div>
        ) : (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setCreating(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New playlist
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
