interface SkeletonProps {
  className?: string;
}

// Bare shimmer block. Callers own sizing/shape via className, and should
// override the background tint (default `bg-ink/10`, a theme-flipping
// token — see the color-family doc comment in app/globals.css) to match
// whichever surface family it's sitting on.
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-ink/10 ${className}`} />;
}
