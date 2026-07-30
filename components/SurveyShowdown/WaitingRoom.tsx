"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatIcon, CrownIcon, GlobeIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import { ChatPanel } from "@/components/SurveyShowdown/ChatPanel";
import type { RoomState } from "@/components/SurveyShowdown/types";

const TEAM_STYLES = {
  1: { badge: "bg-pink-600", label: "TEAM 1" },
  2: { badge: "bg-blue-600", label: "TEAM 2" },
} as const;

interface WaitingRoomProps {
  room: RoomState;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onJoinTeam: (slot: 1 | 2) => Promise<{ error?: string }>;
  onLeaveTeam: () => Promise<void>;
  onStartGame: () => Promise<{ error?: string }>;
}

export function WaitingRoom({
  room,
  currentUserId,
  onlineUserIds,
  onJoinTeam,
  onLeaveTeam,
  onStartGame,
}: WaitingRoomProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPlayers = room.teams.reduce((sum, t) => sum + t.players.length, 0);
  const isFull = totalPlayers >= room.maxPlayers;
  const myTeamSlot = room.teams.find((t) => t.players.some((p) => p.userId === currentUserId))
    ?.slot;
  const isHost = room.hostId === currentUserId;
  const eachTeamHasPlayer = room.teams.every((t) => t.players.length > 0);

  async function handleJoin(slot: 1 | 2) {
    setPending(true);
    setError(null);
    const result = await onJoinTeam(slot);
    setPending(false);
    if (result.error) setError(result.error);
  }

  async function handleLeave() {
    setPending(true);
    setError(null);
    await onLeaveTeam();
    setPending(false);
  }

  async function handleStart() {
    setPending(true);
    setError(null);
    const result = await onStartGame();
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 2xl:max-w-7xl 2xl:gap-8">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white backdrop-blur-md 2xl:gap-4 2xl:p-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl 2xl:text-4xl">{room.name || "Untitled Room"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 2xl:gap-3">
          <Badge variant="primary" className="gap-1.5 2xl:px-3 2xl:py-1.5 2xl:text-sm">
            <UsersIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
            {totalPlayers} / {room.maxPlayers} players
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-white/20 text-white/80 2xl:px-3 2xl:py-1.5 2xl:text-sm">
            {room.visibility === "private" ? (
              <LockIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
            ) : (
              <GlobeIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
            )}
            {room.visibility === "private" ? "Private" : "Public"}
          </Badge>
          {room.enableChat && (
            <Badge variant="outline" className="gap-1.5 border-white/20 text-white/80 2xl:px-3 2xl:py-1.5 2xl:text-sm">
              <ChatIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              Chat on
            </Badge>
          )}
        </div>
        <p className="text-sm text-white/60 2xl:text-base">
          The host can start the game once both teams have someone.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_280px] lg:items-start 2xl:grid-cols-[1fr_1fr_340px] 2xl:gap-8">
        {room.teams.map((team) => {
          const style = TEAM_STYLES[team.slot];
          const onThisTeam = myTeamSlot === team.slot;

          return (
            <div
              key={team.id}
              className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md 2xl:p-7"
            >
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white 2xl:px-4 2xl:py-1.5 2xl:text-sm ${style.badge}`}
              >
                {style.label}
              </span>
              <ul className="mt-4 flex min-h-16 flex-col gap-2 2xl:mt-5 2xl:gap-3">
                {team.players.length === 0 ? (
                  <li className="text-sm text-white/40 2xl:text-base">No players yet</li>
                ) : (
                  team.players.map((p) => {
                    const online = !!p.userId && onlineUserIds.has(p.userId);
                    return (
                      <li key={p.id} className="flex items-center gap-2 text-sm 2xl:gap-3 2xl:text-base">
                        <span className="relative shrink-0">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold 2xl:h-9 2xl:w-9 2xl:text-sm">
                            {p.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span
                            title={online ? "Online" : "Offline"}
                            className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/50 2xl:h-3 2xl:w-3 ${
                              online ? "bg-emerald-400" : "bg-zinc-400"
                            }`}
                          />
                        </span>
                        {p.name}
                        {p.userId === room.hostId && (
                          <CrownIcon className="h-3.5 w-3.5 text-amber-400 2xl:h-4 2xl:w-4" />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>

              {onThisTeam ? (
                <Button
                  variant="ghost"
                  className="mt-4 w-full border-white/20 text-white hover:bg-white/10 2xl:mt-5 2xl:h-12 2xl:text-base"
                  onClick={handleLeave}
                  disabled={pending}
                >
                  Leave Team
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="mt-4 w-full 2xl:mt-5 2xl:h-12 2xl:text-base"
                  onClick={() => handleJoin(team.slot)}
                  disabled={pending || (isFull && myTeamSlot === undefined)}
                >
                  Join {style.label}
                </Button>
              )}
            </div>
          );
        })}

        {room.enableChat && (
          <div className="h-80 lg:h-full lg:min-h-104">
            <ChatPanel roomId={room.roomId} senderId={currentUserId} />
          </div>
        )}
      </div>

      {error && (
        <p className="mx-auto rounded-xl bg-red-500/20 px-4 py-2 text-center text-sm font-medium text-red-200 2xl:px-5 2xl:py-3 2xl:text-base">
          {error}
        </p>
      )}

      {isHost ? (
        <div className="mx-auto flex flex-col items-center gap-2 2xl:gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            disabled={pending || !eachTeamHasPlayer}
            className="2xl:h-14 2xl:px-8 2xl:text-lg"
          >
            Start Game
          </Button>
          {!eachTeamHasPlayer && (
            <p className="text-xs text-white/50 2xl:text-sm">Each team needs at least one player to start.</p>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-white/50 2xl:text-sm">
          Waiting for the host to start the game…
        </p>
      )}
    </div>
  );
}
