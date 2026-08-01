"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatIcon, CrownIcon, GlobeIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import { ChatPanel } from "@/components/SurveyShowdown/ChatPanel";
import { useMatchHeight } from "@/components/SurveyShowdown/useMatchHeight";
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
  // Tracks which specific button triggered the in-flight RPC, so only that
  // one shows a spinner instead of every button on the screen going busy.
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamsRef, teamsHeight] = useMatchHeight<HTMLDivElement>();

  const pending = pendingAction !== null;
  const totalPlayers = room.teams.reduce((sum, t) => sum + t.players.length, 0);
  const isFull = totalPlayers >= room.maxPlayers;
  const myTeamSlot = room.teams.find((t) => t.players.some((p) => p.userId === currentUserId))
    ?.slot;
  const isHost = room.hostId === currentUserId;
  const eachTeamHasPlayer = room.teams.every((t) => t.players.length > 0);

  async function handleJoin(slot: 1 | 2) {
    setPendingAction(`join-${slot}`);
    setError(null);
    const result = await onJoinTeam(slot);
    setPendingAction(null);
    if (result.error) setError(result.error);
  }

  async function handleLeave() {
    setPendingAction("leave");
    setError(null);
    await onLeaveTeam();
    setPendingAction(null);
  }

  async function handleStart() {
    setPendingAction("start");
    setError(null);
    const result = await onStartGame();
    setPendingAction(null);
    if (result.error) setError(result.error);
  }

  const startControls = isHost ? (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="primary"
        size="lg"
        onClick={handleStart}
        loading={pendingAction === "start"}
        disabled={pending || !eachTeamHasPlayer}
      >
        Start Game
      </Button>
      {!eachTeamHasPlayer && (
        <p className="text-xs text-white/50">Each team needs at least one player to start.</p>
      )}
    </div>
  ) : (
    <p className="text-center text-xs text-white/50">
      Waiting for the host to start the game…
    </p>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/50 p-6 text-center text-white backdrop-blur-md">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{room.name || "Untitled Room"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary" className="gap-1.5">
            <UsersIcon className="h-3.5 w-3.5" />
            {totalPlayers} / {room.maxPlayers} players
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-white/20 text-white/80">
            {room.visibility === "private" ? (
              <LockIcon className="h-3.5 w-3.5" />
            ) : (
              <GlobeIcon className="h-3.5 w-3.5" />
            )}
            {room.visibility === "private" ? "Private" : "Public"}
          </Badge>
          {room.enableChat && (
            <Badge variant="outline" className="gap-1.5 border-white/20 text-white/80">
              <ChatIcon className="h-3.5 w-3.5" />
              Chat on
            </Badge>
          )}
        </div>
        <p className="text-sm text-white/60">
          The host can start the game once both teams have someone.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div ref={teamsRef} className="flex min-w-0 flex-1 flex-col justify-between gap-6">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
            {room.teams.map((team) => {
              const style = TEAM_STYLES[team.slot];
              const onThisTeam = myTeamSlot === team.slot;

              return (
                <div
                  key={team.id}
                  className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md"
                >
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <ul className="mt-4 flex min-h-16 flex-col gap-2">
                    {team.players.length === 0 ? (
                      <li className="text-sm text-white/40">No players yet</li>
                    ) : (
                      team.players.map((p) => {
                        const online = !!p.userId && onlineUserIds.has(p.userId);
                        return (
                          <li key={p.id} className="flex items-center gap-2 text-sm">
                            <span className="relative shrink-0">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                                {p.name.slice(0, 2).toUpperCase()}
                              </span>
                              <span
                                title={online ? "Online" : "Offline"}
                                className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/50 ${
                                  online ? "bg-emerald-400" : "bg-zinc-400"
                                }`}
                              />
                            </span>
                            {p.name}
                            {p.userId === room.hostId && (
                              <CrownIcon className="h-3.5 w-3.5 text-amber-400" />
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {onThisTeam ? (
                    <Button
                      variant="ghost"
                      className="mt-4 w-full border-white/20 text-white hover:bg-white/10"
                      onClick={handleLeave}
                      loading={pendingAction === "leave"}
                      disabled={pending}
                    >
                      Leave Team
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="mt-4 w-full"
                      onClick={() => handleJoin(team.slot)}
                      loading={pendingAction === `join-${team.slot}`}
                      disabled={pending || (isFull && myTeamSlot === undefined)}
                    >
                      Join {style.label}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex lg:justify-center">{startControls}</div>
        </div>

        {room.enableChat && (
          <div
            className="h-80 w-full shrink-0 overflow-hidden lg:w-70 lg:max-w-70 lg:min-h-104"
            style={teamsHeight != null ? { height: teamsHeight } : undefined}
          >
            <ChatPanel roomId={room.roomId} senderId={currentUserId} />
          </div>
        )}
      </div>

      {error && (
        <p className="mx-auto rounded-xl bg-red-500/20 px-4 py-2 text-center text-sm font-medium text-red-200">
          {error}
        </p>
      )}

      <div className="mx-auto lg:hidden">{startControls}</div>
    </div>
  );
}
