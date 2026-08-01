import { TrophyIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ROLE_META } from "@/components/Yakuza/roles";
import { ChatPanel } from "@/components/Yakuza/ChatPanel";
import type { RoomState } from "@/components/Yakuza/types";

export function GameOverScreen({ state, senderId }: { state: RoomState; senderId: string }) {
  const ranked = [...state.players].sort(
    (a, b) => Number(a.alive === false) - Number(b.alive === false) || a.sortOrder - b.sortOrder,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 lg:flex-row">
      <div className="flex w-full flex-1 flex-col items-center gap-6 rounded-2xl border border-panel-foreground/10 bg-panel p-10 text-center text-panel-foreground shadow-sm">
        <TrophyIcon className="h-10 w-10 text-amber-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-panel-foreground">Game Over</h1>
          <p className="mt-2 text-panel-muted">
            {state.winner === "town"
              ? "The Town has eliminated all the Mafia. Town wins!"
              : state.winner === "mafia"
                ? "The Mafia now controls the vote. Mafia wins!"
                : "The game has ended."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {ranked.map((player) => {
            const meta = player.role ? ROLE_META[player.role] : null;
            const Icon = meta?.icon;
            const onWinningTeam = meta?.team === state.winner;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  onWinningTeam
                    ? "border-amber-400/60 bg-amber-50"
                    : "border-panel-foreground/10 bg-panel-hover"
                } ${player.alive === false ? "opacity-70" : ""}`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: avatarColor(player.name) }}
                  >
                    {initials(player.name)}
                  </span>
                  <span className="font-medium text-panel-foreground">{player.name}</span>
                  {player.alive === false && (
                    <span className="text-xs text-panel-muted">(eliminated)</span>
                  )}
                </span>
                {meta && Icon && (
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                    {meta.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {state.enableChat && (
        <div className="h-96 w-full shrink-0 overflow-hidden rounded-2xl border border-panel-foreground/10 bg-panel p-4 shadow-sm lg:w-80">
          <ChatPanel roomId={state.roomId} senderId={senderId} />
        </div>
      )}
    </div>
  );
}
