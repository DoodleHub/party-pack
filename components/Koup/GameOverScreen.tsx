import { TrophyIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { CHARACTER_META } from "@/components/Koup/characters";
import { ChatPanel } from "@/components/Koup/ChatPanel";
import type { RoomState } from "@/components/Koup/types";

export function GameOverScreen({ state, senderId }: { state: RoomState; senderId: string }) {
  const winner = state.players.find((p) => p.id === state.winnerPlayerId);
  const ranked = [...state.players].sort(
    (a, b) => Number(a.eliminated) - Number(b.eliminated) || b.influenceRemaining - a.influenceRemaining,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 lg:flex-row">
      <div className="flex w-full flex-1 flex-col items-center gap-6 rounded-2xl border border-white/10 bg-black/50 p-10 text-center text-white backdrop-blur-md">
        <TrophyIcon className="h-10 w-10 text-amber-400" />
        <div>
          <h1 className="text-3xl font-extrabold">Game Over</h1>
          <p className="mt-2 text-white/70">{winner ? `${winner.name} wins!` : "The table has cleared."}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {ranked.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                player.id === state.winnerPlayerId
                  ? "border-amber-400/50 bg-amber-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: avatarColor(player.name) }}
                >
                  {initials(player.name)}
                </span>
                <span className="font-medium">{player.name}</span>
              </span>
              <span className="flex items-center gap-1.5">
                {player.revealedCards.map((c, i) => {
                  const meta = CHARACTER_META[c];
                  const Icon = meta.icon;
                  return <Icon key={i} className={`h-4 w-4 ${meta.color}`} />;
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {state.enableChat && (
        <div className="h-96 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4 lg:w-80">
          <ChatPanel roomId={state.roomId} senderId={senderId} />
        </div>
      )}
    </div>
  );
}
