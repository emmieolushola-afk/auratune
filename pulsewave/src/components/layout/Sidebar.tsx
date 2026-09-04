"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Radio,
  Music2,
  ListMusic,
  X,
  Menu,
  CreditCard,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NeonLogo from "@/components/auth/NeonLogo";
import { useApiData, postJson } from "@/hooks/use-api-data";

const navItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Radio, label: "Listen", href: "/listen" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Upload, label: "My Uploads", href: "/profile" },
  { icon: CreditCard, label: "Pricing", href: "/pricing" },
];

interface Playlist {
  id: string;
  name: string;
  color: string;
  isSpecial: boolean;
  count: number;
}

interface LibraryData {
  playlists: Playlist[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const library = useApiData<LibraryData>("/api/library");

  const playlists = library.data?.playlists ?? [];

  const createPlaylist = async () => {
    if (newName.trim().length < 2) return;
    try {
      await postJson("/api/library", { action: "playlist", name: newName.trim() });
      setNewName("");
      setCreating(false);
      library.refresh("/api/library");
    } catch {
      /* ignore */
    }
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <NeonLogo size="sm" />}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 shrink-0 hidden lg:flex"
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ListMusic className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="h-8 w-8 shrink-0 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-neon-cyan/10 text-neon-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-interactive"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 h-px bg-surface-border" />

      {/* Playlists */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Playlists
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCreating((c) => !c)}
              aria-label="New playlist"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {creating && (
            <div className="px-3 pb-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                  placeholder="Playlist name"
                  autoFocus
                  className="h-8 bg-surface-interactive text-xs"
                />
              </div>
              <Button
                variant="neon"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={createPlaylist}
              >
                Add
              </Button>
            </div>
          )}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href="/library"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-interactive transition-colors"
            >
              <Music2 className="h-4 w-4 shrink-0 text-text-muted" />
              <span className="truncate flex-1">{pl.name}</span>
              <span className="text-[10px] text-text-muted shrink-0">{pl.count}</span>
            </Link>
          ))}
          {!library.loading && playlists.length === 0 && !creating && (
            <p className="px-3 py-2 text-xs text-text-muted">
              No playlists yet
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-full flex-col bg-surface-primary border-r border-surface-border transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => onToggle()}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl glass flex items-center justify-center cursor-pointer"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface-primary border-r border-surface-border flex flex-col lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
