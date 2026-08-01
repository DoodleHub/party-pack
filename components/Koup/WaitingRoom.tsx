"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatIcon, CrownIcon, GlobeIcon, LockIcon, UsersIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ChatPanel } from "@/components/Koup/ChatPanel";
import type { RoomState } from "@/components/Koup/types";

interface WaitingRoomProps {
  room: RoomState;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onJoinRoom: () => Promise<{ error?: string }>;
  onStartGame: () => Promise<{ error?: string }>;
}

export function WaitingRoom({
  room,
  currentUserId,
  onlineUserIds,
  onJoinRoom,
  onStartGame,
}: WaitingRoomProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSeated = room.players.some((p) => p.userId === currentUserId);
  const isHost = room.hostId === currentUserId;
  const isFull = room.players.length >= room.maxPlayers;
  const canStart = room.players.length >= 2;

  async function handleJoin() {
    setPending(true);
    setError(null);
    const result = await onJoinRoom();
    setPending(false);
    if (result.error) setError(result.error);
  }

  async function handleStart() {
    setPending(true);
    setError(null);
    const result = await onStartGame();
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-center text-panel-foreground shadow-sm">
        <h1 className="text-2xl font-extrabold text-panel-foreground sm:text-3xl">{room.name || "Untitled Room"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary" className="gap-1.5">
            <UsersIcon className="h-3.5 w-3.5" />
            {room.players.length} / {room.maxPlayers} players
          </Badge>
          <Badge variant="panel" className="gap-1.5">
            {room.visibility === "private" ? (
              <LockIcon className="h-3.5 w-3.5" />
            ) : (
              <GlobeIcon className="h-3.5 w-3.5" />
            )}
            {room.visibility === "private" ? "Private" : "Public"}
          </Badge>
          {room.enableChat && (
            <Badge variant="panel" className="gap-1.5">
              <ChatIcon className="h-3.5 w-3.5" />
              Chat on
            </Badge>
          )}
        </div>
        <p className="text-sm text-panel-muted">
          Every player gets 2 Influence and 2 coins. The host can start once at least 2 players
          are seated.
        </p>
      </div>

      <div className={`flex flex-col gap-6 ${room.enableChat ? "sm:flex-row sm:items-start" : ""}`}>
        <div
          className={`rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm ${
            room.enableChat ? "w-full sm:w-80 sm:shrink-0" : "w-full"
          }`}
        >
          <h2 className="text-sm font-semibold text-panel-muted">Table</h2>
          <ul className="mt-4 flex min-h-16 flex-col gap-3">
            {room.players.length === 0 ? (
              <li className="text-sm text-panel-muted">No players yet</li>
            ) : (
              room.players.map((p) => {
                const online = onlineUserIds.has(p.userId);
                return (
                  <li key={p.id} className="flex items-center gap-2.5 text-sm">
                    <span className="relative shrink-0">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: avatarColor(p.name) }}
                      >
                        {initials(p.name)}
                      </span>
                      <span
                        title={online ? "Online" : "Offline"}
                        className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-panel ${
                          online ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                      />
                    </span>
                    <span className="text-panel-foreground">{p.name}</span>
                    {p.userId === room.hostId && <CrownIcon className="h-3.5 w-3.5 text-amber-500" />}
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

          {!isSeated && (
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={handleJoin}
              disabled={pending || isFull}
            >
              {isFull ? "Table Full" : "Join Table"}
            </Button>
          )}
        </div>

        {room.enableChat && (
          <div className="flex h-80 w-full flex-1 flex-col rounded-2xl border border-panel-foreground/10 bg-panel p-4 text-panel-foreground shadow-sm">
            <h2 className="mb-3 border-b border-panel-foreground/10 pb-3 text-sm font-semibold text-panel-muted">
              Chat
            </h2>
            <div className="min-h-0 flex-1">
              <ChatPanel roomId={room.roomId} senderId={currentUserId} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mx-auto rounded-xl bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mx-auto">
        {isHost ? (
          <div className="flex flex-col items-center gap-2">
            <Button variant="primary" size="lg" onClick={handleStart} disabled={pending || !canStart}>
              Start Game
            </Button>
            {!canStart && <p className="text-xs text-panel-muted">You need at least 2 players to start.</p>}
          </div>
        ) : (
          <p className="text-center text-xs text-panel-muted">Waiting for the host to start the game…</p>
        )}
      </div>
    </div>
  );
}
