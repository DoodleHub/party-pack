"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatIcon, CrownIcon, EyeIcon, GlobeIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ChatPanel } from "@/components/Codenames/ChatPanel";
import type { RoomState, Team } from "@/components/Codenames/types";

const TEAM_STYLES: Record<Team, { badge: string; label: string }> = {
  red: { badge: "bg-red-600", label: "RED TEAM" },
  blue: { badge: "bg-blue-600", label: "BLUE TEAM" },
};

interface WaitingRoomProps {
  room: RoomState;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onJoinTeam: (team: Team) => Promise<{ error?: string }>;
  onLeaveTeam: () => Promise<void>;
  onClaimSpymaster: () => Promise<{ error?: string }>;
  onBecomeOperative: () => Promise<void>;
  onStartGame: () => Promise<{ error?: string }>;
}

export function WaitingRoom({
  room,
  currentUserId,
  onlineUserIds,
  onJoinTeam,
  onLeaveTeam,
  onClaimSpymaster,
  onBecomeOperative,
  onStartGame,
}: WaitingRoomProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = pendingAction !== null;
  const totalPlayers = room.players.length;
  const isFull = totalPlayers >= room.maxPlayers;
  const myTeam = room.players.find((p) => p.userId === currentUserId)?.team ?? null;
  const isHost = room.hostId === currentUserId;
  const teams: Team[] = ["red", "blue"];
  const eachTeamHasPlayer = teams.every((t) => room.players.some((p) => p.team === t));

  async function handleJoin(team: Team) {
    setPendingAction(`join-${team}`);
    setError(null);
    const result = await onJoinTeam(team);
    setPendingAction(null);
    if (result.error) setError(result.error);
  }

  async function handleLeave() {
    setPendingAction("leave");
    setError(null);
    await onLeaveTeam();
    setPendingAction(null);
  }

  async function handleClaimSpymaster() {
    setPendingAction("spymaster");
    setError(null);
    const result = await onClaimSpymaster();
    setPendingAction(null);
    if (result.error) setError(result.error);
  }

  async function handleBecomeOperative() {
    setPendingAction("operative");
    setError(null);
    await onBecomeOperative();
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
    <p className="text-center text-xs text-white/50">Waiting for the host to start the game…</p>
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
          Each team needs one Spymaster to give clues and Operatives to guess. The host can start
          once both teams have someone.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {teams.map((team) => {
              const style = TEAM_STYLES[team];
              const onThisTeam = myTeam === team;
              const teamPlayers = room.players.filter((p) => p.team === team);
              const spymaster = teamPlayers.find((p) => p.role === "spymaster");

              return (
                <div key={team} className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${style.badge}`}>
                    {style.label}
                  </span>
                  <ul className="mt-4 flex min-h-16 flex-col gap-2">
                    {teamPlayers.length === 0 ? (
                      <li className="text-sm text-white/40">No players yet</li>
                    ) : (
                      teamPlayers.map((p) => {
                        const online = onlineUserIds.has(p.userId);
                        return (
                          <li key={p.id} className="flex items-center gap-2 text-sm">
                            <span className="relative shrink-0">
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: avatarColor(p.name) }}
                              >
                                {initials(p.name)}
                              </span>
                              <span
                                title={online ? "Online" : "Offline"}
                                className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/50 ${
                                  online ? "bg-emerald-400" : "bg-zinc-400"
                                }`}
                              />
                            </span>
                            {p.name}
                            {p.userId === room.hostId && <CrownIcon className="h-3.5 w-3.5 text-amber-400" />}
                            {p.role === "spymaster" && (
                              <Badge variant="outline" className="gap-1 border-white/20 text-white/70">
                                <EyeIcon className="h-3 w-3" />
                                Spymaster
                              </Badge>
                            )}
                            {p.userId === currentUserId && (
                              <span className="rounded-full bg-primary-tint px-2 py-0.5 text-[10px] font-semibold text-primary">
                                You
                              </span>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {onThisTeam ? (
                    <div className="mt-4 flex flex-col gap-2">
                      {spymaster?.userId === currentUserId ? (
                        <Button
                          variant="ghost"
                          className="w-full border-white/20 text-white hover:bg-white/10"
                          onClick={handleBecomeOperative}
                          loading={pendingAction === "operative"}
                          disabled={pending}
                        >
                          Step Down as Spymaster
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full border-white/20 text-white hover:bg-white/10"
                          onClick={handleClaimSpymaster}
                          loading={pendingAction === "spymaster"}
                          disabled={pending}
                        >
                          <EyeIcon className="h-4 w-4" />
                          {spymaster ? "Become Spymaster instead" : "Become Spymaster"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        onClick={handleLeave}
                        loading={pendingAction === "leave"}
                        disabled={pending}
                      >
                        Leave Team
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="mt-4 w-full"
                      onClick={() => handleJoin(team)}
                      loading={pendingAction === `join-${team}`}
                      disabled={pending || (isFull && myTeam === null)}
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
          <div className="h-80 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md lg:h-auto lg:w-70 lg:max-w-70">
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
