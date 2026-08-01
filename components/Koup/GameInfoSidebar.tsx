import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoinsIcon, CrownIcon, UserIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { PlayingCard } from "@/components/Koup/PlayingCard";
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
  const emptySeats = Math.max(0, maxPlayers - players.length);

  return (
    <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-panel-foreground">Players</h3>
          <Badge variant="panel">
            {players.length} / {maxPlayers}
          </Badge>
        </div>

        <ul className="mt-3 flex flex-col">
          {players.map((player) => {
            const online = onlineUserIds.has(player.userId);
            const isMe = player.userId === currentUserId;
            const isTurn = player.id === turnPlayerId;
            const slots = [
              ...player.revealedCards.map((c) => ({ character: c, revealed: true })),
              ...Array.from({ length: player.influenceRemaining }, () => ({
                character: null,
                revealed: false,
              })),
            ];

            return (
              <li
                key={player.id}
                className={`flex flex-col gap-2.5 border-b border-panel-foreground/5 py-3 last:border-b-0 ${
                  player.eliminated ? "opacity-50 grayscale" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative shrink-0">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: avatarColor(player.name) }}
                    >
                      {initials(player.name)}
                    </span>
                    <span
                      title={online ? "Online" : "Offline"}
                      className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ring-2 ring-panel ${
                        online ? "bg-emerald-500" : "bg-zinc-400"
                      }`}
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-panel-foreground">{player.name}</span>
                    {player.userId === hostId && (
                      <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-primary-tint px-2 py-0.5 text-[10px] font-semibold text-primary">
                        You
                      </span>
                    )}
                  </span>
                  {isTurn ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      Turn
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                      <CoinsIcon className="h-3.5 w-3.5" />
                      {player.coins}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 pl-12.5">
                  {slots.map((slot, i) => (
                    <PlayingCard key={i} character={slot.character} revealed={slot.revealed} size="sm" />
                  ))}
                </div>
              </li>
            );
          })}

          {Array.from({ length: emptySeats }).map((_, i) => (
            <li key={`empty-${i}`} className="flex items-center gap-2.5 border-b border-panel-foreground/5 py-3 last:border-b-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-hover text-panel-muted">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-panel-muted">Empty Seat</span>
              <span className="text-sm text-panel-muted">—</span>
            </li>
          ))}
        </ul>

        <Link href="/games/koup">
          <Button variant="panel" className="mt-2 w-full">
            View Lobby
          </Button>
        </Link>
      </div>
    </div>
  );
}
