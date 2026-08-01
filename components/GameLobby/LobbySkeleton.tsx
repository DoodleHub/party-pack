import { Skeleton } from "@/components/ui/Skeleton";

function RoomRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-card-foreground/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40 bg-card-foreground/10" />
          <Skeleton className="h-3.5 w-24 bg-card-foreground/10" />
        </div>
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full bg-card-foreground/10 ring-2 ring-card" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        <Skeleton className="h-4 w-24 bg-card-foreground/10" />
        <Skeleton className="h-4 w-20 bg-card-foreground/10" />
        <Skeleton className="h-10 w-32 rounded-full bg-card-foreground/10" />
      </div>
    </div>
  );
}

// The "Active Rooms" section only — matches RoomBrowser's grid, with
// placeholder shapes standing in for the fetched room list. Used as the
// Suspense fallback around RoomBrowser (GameLobby.tsx) and reused below as
// part of the full-page skeleton.
export function RoomBrowserSkeleton() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-11 w-full rounded-xl bg-surface-alt sm:w-52" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-ink/10" />
          <Skeleton className="h-5 w-28 bg-ink/10" />
        </div>
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <RoomRowSkeleton key={i} />
          ))}
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-2xl bg-surface-alt" />
    </section>
  );
}

// Mirrors GameLobby's full page shell (hero + RoomBrowserSkeleton) with
// placeholder shapes instead of real content — used as the route-level
// loading.tsx fallback while the server fetches rooms.
export function LobbySkeleton() {
  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
        <Skeleton className="h-4 w-28 bg-ink/10" />

        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Skeleton className="aspect-16/10 w-full rounded-3xl bg-surface-alt" />
          <div className="flex flex-col gap-5">
            <Skeleton className="h-12 w-3/4 bg-ink/10" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full bg-ink/10" />
              <Skeleton className="h-6 w-20 rounded-full bg-ink/10" />
            </div>
            <Skeleton className="h-4 w-full max-w-md bg-ink/10" />
            <Skeleton className="h-4 w-2/3 max-w-md bg-ink/10" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-36 rounded-full bg-ink/10" />
              <Skeleton className="h-12 w-32 rounded-full bg-ink/10" />
            </div>
          </div>
        </section>

        <RoomBrowserSkeleton />
      </main>
    </div>
  );
}
