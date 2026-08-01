import { Countdown } from "@/components/Codenames/Countdown";
import type { RoomState } from "@/components/Codenames/types";

const TEAM_TEXT: Record<"red" | "blue", string> = {
  red: "text-red-400",
  blue: "text-blue-400",
};

const TEAM_DOT: Record<"red" | "blue", string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
};

export function GameStatusPanel({ state }: { state: RoomState }) {
  const turnTeam = state.turnTeam;
  if (!turnTeam) return null;

  const clueGiver = state.players.find((p) => p.team === turnTeam && p.role === "spymaster");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
      <h3 className="text-sm font-semibold text-white/70">Game Status</h3>

      <div className="mt-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${TEAM_DOT[turnTeam]}`} />
        <span className={`text-lg font-bold ${TEAM_TEXT[turnTeam]}`}>{turnTeam === "red" ? "Red" : "Blue"} Team&apos;s Turn</span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-white/50">Clue Giver</p>
        <p className="text-sm font-medium">{clueGiver?.name ?? "—"}</p>
      </div>

      {state.responseDeadline && (
        <div className="mt-4 flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 py-3">
          <Countdown deadline={state.responseDeadline} />
        </div>
      )}

      {state.turnPhase === "guessing" && (
        <div className="mt-4">
          <p className="text-xs text-white/50">Turn Progress</p>
          {state.guessesMax === null ? (
            <p className="mt-2 text-sm font-medium text-white/80">Unlimited guesses — {state.guessesUsed} made</p>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: state.guessesMax }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full border ${
                      i < state.guessesUsed
                        ? `${TEAM_DOT[turnTeam]} border-transparent`
                        : "border-white/30 bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-white/50">
                {state.guessesUsed} / {state.guessesMax} guesses used
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
