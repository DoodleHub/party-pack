import Link from "next/link";
import { CrownIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import type { Player } from "@/components/Koup/types";

interface GameInfoSidebarProps {
  players: Player[];
  hostId: string | null;
  turnPlayerId: string | null;
  currentUserId: string | null;
  onlineUserIds: Set<string>;
  maxPlayers: number;
}

export function GameInfoSidebar({
  players,
  hostId,
  turnPlayerId,
  currentUserId,
  onlineUserIds,
  maxPlayers,
}: GameInfoSidebarProps) {
  return (
    <div className="flex w-full flex-col gap-4 lg:w-64 lg:shrink-0">
      <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white/70">Players</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {players.map((player) => {
            const online = onlineUserIds.has(player.userId);
            const isMe = player.userId === currentUserId;
            const isTurn = player.id === turnPlayerId;
            return (
              <li key={player.id} className="flex items-center gap-2.5 text-sm">
                <span className="relative shrink-0">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                      isTurn ? "ring-2 ring-primary" : ""
                    } ${player.eliminated ? "opacity-40 grayscale" : ""}`}
                    style={{ backgroundColor: avatarColor(player.name) }}
                  >
                    {initials(player.name)}
                  </span>
                  <span
                    title={online ? "Online" : "Offline"}
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/50 ${
                      online ? "bg-emerald-400" : "bg-zinc-400"
                    }`}
                  />
                </span>
                <span
                  className={`flex-1 truncate ${player.eliminated ? "text-white/40 line-through" : "text-white"}`}
                >
                  {player.name}
                </span>
                {player.userId === hostId && <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                {isMe && (
                  <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    You
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <Link
          href="/games/koup"
          className="mt-4 flex w-full items-center justify-center rounded-full border border-white/15 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          View Lobby
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white/70">Game Info</h3>
        <dl className="mt-3 flex flex-col gap-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/50">Players</dt>
            <dd className="font-medium">
              {players.length} / {maxPlayers}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/50">Goal</dt>
            <dd className="text-right font-medium">Be last with 1 influence</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/50">Influence</dt>
            <dd className="font-medium">2 per player</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/50">Turn Rule</dt>
            <dd className="text-right font-medium">10+ coins must Coup</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
