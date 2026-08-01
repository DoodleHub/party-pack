import { Skeleton } from "@/components/ui/Skeleton";

// Shown in place of the room while the initial fetchRoomState() call is in
// flight — approximates the waiting-room layout (the most common thing a
// visitor lands on) so the shell doesn't jump around once real data arrives.
export function YakuzaRoomSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-panel-foreground/10 bg-panel p-6">
        <Skeleton className="h-7 w-56 max-w-full bg-panel-foreground/10" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full bg-panel-foreground/10" />
          <Skeleton className="h-6 w-20 rounded-full bg-panel-foreground/10" />
        </div>
        <Skeleton className="h-4 w-80 max-w-full bg-panel-foreground/10" />
      </div>

      <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5">
        <Skeleton className="h-3.5 w-16 bg-panel-foreground/10" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-panel-foreground/10" />
              <Skeleton className="h-4 w-32 bg-panel-foreground/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto">
        <Skeleton className="h-12 w-40 rounded-full bg-panel-foreground/10" />
      </div>
    </div>
  );
}
