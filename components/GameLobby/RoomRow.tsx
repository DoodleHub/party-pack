import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { CrownIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import type { LobbyRoom } from "@/components/GameLobby/types";

const STATUS_CONFIG: Record<
  LobbyRoom["status"],
  { label: string; dot: string; locked?: boolean }
> = {
  waiting: { label: "Waiting", dot: "bg-emerald-500" },
  "starting-soon": { label: "Starting Soon", dot: "bg-amber-500" },
  "in-progress": { label: "In Progress", dot: "bg-blue-500", locked: true },
  full: { label: "Full", dot: "bg-ink/40" },
};

interface RoomRowProps {
  gameSlug: string;
  room: LobbyRoom;
  isYourRoom?: boolean;
}

export function RoomRow({ gameSlug, room, isYourRoom = false }: RoomRowProps) {
  const status = STATUS_CONFIG[room.status];
  const roomHref = `/games/${gameSlug}/room/${room.code}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-card-foreground/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">{room.name}</h3>
          <p className="flex items-center gap-1.5 text-sm text-card-muted">
            Host: {room.host}
            {isYourRoom && <CrownIcon className="h-3.5 w-3.5 text-primary" />}
          </p>
        </div>
        <AvatarStack names={room.playerNames} />
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        <div className="flex items-center gap-1.5 text-sm text-card-muted">
          <UsersIcon className="h-4 w-4 text-primary" />
          {room.playerNames.length} / {room.maxPlayers} Players
        </div>
        <div className="flex items-center gap-1.5 text-sm text-card-muted">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
          {status.locked && <LockIcon className="h-3.5 w-3.5" />}
        </div>

        {room.isPlayer ? (
          <Link href={roomHref}>
            <Button variant="primary" className="min-w-32">
              Rejoin Game
            </Button>
          </Link>
        ) : room.status === "full" ? (
          <Button variant="ghost" disabled className="min-w-32">
            Room Full
          </Button>
        ) : room.status === "in-progress" ? (
          <Link href={roomHref}>
            <Button variant="outline" className="min-w-32">
              Spectate
            </Button>
          </Link>
        ) : (
          <Link href={roomHref}>
            <Button variant="primary" className="min-w-32">
              Join Room
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
