"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

export default function TopBar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="h-14 md:h-16 flex items-center gap-2 md:gap-4 px-4 md:px-6 border-b border-surface-border bg-surface-primary/80 backdrop-blur-md">
      {/* Spacer for mobile hamburger */}
      <div className="w-10 lg:hidden shrink-0" />

      {/* Navigation arrows - desktop only */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.forward()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <form className="flex-1 max-w-md" onSubmit={submitSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-9 md:h-10 rounded-full bg-surface-interactive/80 text-sm"
          />
        </div>
      </form>

      <div className="flex-1 hidden md:block" />

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-neon-cyan" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer outline-none" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{loading ? "…" : initial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.name ?? "Guest"}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user?.email ?? "Signed in locally"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/library")}>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}