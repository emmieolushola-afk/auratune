import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** A glowing, pulse-animated placeholder that traces the outline of content. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("pw-skeleton rounded-md", className)}
      {...props}
    />
  );
}

/** Grid of album-card shaped skeletons (used on Home / search grids). */
export function SkeletonCardGrid({ count = 6, columns = "md:grid-cols-3 lg:grid-cols-6" }: { count?: number; columns?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Vertical list of compact song-row shaped skeletons (trending / track lists). */
export function SkeletonRowList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
