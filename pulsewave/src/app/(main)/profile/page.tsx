"use client";

import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { useApiData } from "@/hooks/use-api-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Download, ListMusic, Mic } from "lucide-react";

interface LikesResponse {
  songs: { id: string }[];
}
interface LibraryResponse {
  playlists: { id: string; isSpecial: boolean }[];
  downloads: unknown[];
}
interface HistoryResponse {
  history: unknown[];
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const likes = useApiData<LikesResponse>("/api/likes");
  const library = useApiData<LibraryResponse>("/api/library");
  const history = useApiData<HistoryResponse>("/api/history");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
      </div>
    );
  }

  const customPlaylists =
    library.data?.playlists.filter((p) => !p.isSpecial).length ?? 0;
  const likedCount = likes.data?.songs.length ?? 0;
  const downloadCount = library.data?.downloads.length ?? 0;
  const identifiedCount = history.data?.history.length ?? 0;

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6"
      >
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-3xl">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <Badge variant="neon" className="text-[10px] mb-2">Profile</Badge>
          <h1 className="font-poppins text-3xl font-bold text-text-primary">
            {user?.name ?? "Guest"}
          </h1>
          <p className="text-text-muted mt-1">{user?.email ?? "Signed in locally"}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Heart className="h-5 w-5" />} label="Liked songs" value={likedCount} />
        <StatCard icon={<ListMusic className="h-5 w-5" />} label="Playlists" value={customPlaylists} />
        <StatCard icon={<Download className="h-5 w-5" />} label="Downloads" value={downloadCount} />
        <StatCard icon={<Mic className="h-5 w-5" />} label="Identified" value={identifiedCount} />
      </div>
    </div>
  );
}
