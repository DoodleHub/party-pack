import { Skeleton } from "@/components/ui/Skeleton";

// Shown in place of the room while the initial fetchRoomState() call is in
// flight — approximates the waiting-room layout (the most common thing a
// visitor lands on) so the shell doesn't jump around once real data arrives.
export function SurveyShowdownRoomSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-md">
        <Skeleton className="h-7 w-56 max-w-full bg-white/10" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md"
          >
            <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-4 w-28 bg-white/10" />
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="mx-auto">
        <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
