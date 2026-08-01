"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon, UserIcon, UsersIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ROLE_META } from "@/components/Yakuza/roles";
import type { Player } from "@/components/Yakuza/types";

interface PlayersPanelProps {
  roomCode: string;
  players: Player[];
  hostId: string | null;
  currentUserId: string | null;
  onlineUserIds: Set<string>;
  maxPlayers: number;
}

export function PlayersPanel({
  roomCode,
  players,
  hostId,
  currentUserId,
  onlineUserIds,
  maxPlayers,
}: PlayersPanelProps) {
  const [showRoles, setShowRoles] = useState(true);
  const [copied, setCopied] = useState(false);
  const emptySeats = Math.max(0, maxPlayers - players.length);

  async function handleInvite() {
    const url = `${window.location.origin}/games/yakuza/room/${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
      <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-panel-foreground">Players ({players.length})</h3>
          <button
            type="button"
            onClick={() => setShowRoles((v) => !v)}
            title={showRoles ? "Hide roles" : "Show roles"}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-panel-muted hover:bg-panel-hover hover:text-panel-foreground"
          >
            {showRoles ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
            View Roles
          </button>
        </div>

        <ul className="mt-3 flex flex-col">
          {players.map((player, i) => {
            const online = onlineUserIds.has(player.userId);
            const isMe = player.userId === currentUserId;
            const eliminated = player.alive === false;
            const meta = player.role ? ROLE_META[player.role] : null;
            const RoleIcon = meta?.icon;

            return (
              <li
                key={player.id}
                className={`flex items-center gap-2.5 border-b border-panel-foreground/5 py-3 last:border-b-0 ${
                  eliminated ? "opacity-60" : ""
                }`}
              >
                <span className="w-4 shrink-0 text-xs font-semibold text-panel-muted">{i + 1}</span>
                <span className="relative shrink-0">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${eliminated ? "grayscale" : ""}`}
                    style={{ backgroundColor: avatarColor(player.name) }}
                  >
                    {initials(player.name)}
                  </span>
                  <span
                    title={online ? "Online" : "Offline"}
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-panel ${
                      online ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-panel-foreground">
                      {player.name}
                    </span>
                    {player.userId === hostId && (
                      <span className="shrink-0 rounded-full bg-primary-tint px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Host
                      </span>
                    )}
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-panel-hover px-1.5 py-0.5 text-[10px] font-semibold text-panel-muted">
                        You
                      </span>
                    )}
                  </span>
                  <span className={`block text-xs ${eliminated ? "text-red-500" : "text-emerald-600"}`}>
                    {eliminated ? "Eliminated" : "Alive"}
                  </span>
                </span>
                {showRoles && meta && RoleIcon && (
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full ${meta.bg} px-2 py-1 text-[11px] font-semibold ${meta.color}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {meta.label}
                  </span>
                )}
              </li>
            );
          })}

          {Array.from({ length: emptySeats }).map((_, i) => (
            <li
              key={`empty-${i}`}
              className="flex items-center gap-2.5 border-b border-panel-foreground/5 py-3 last:border-b-0"
            >
              <span className="w-4 shrink-0 text-xs font-semibold text-panel-muted">
                {players.length + i + 1}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-hover text-panel-muted">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-panel-muted">Waiting for player…</span>
            </li>
          ))}
        </ul>

        <Button variant="panel" className="mt-4 w-full gap-1.5" onClick={handleInvite}>
          <UsersIcon className="h-4 w-4" />
          {copied ? "Link Copied!" : "Invite Players"}
        </Button>
      </div>
    </div>
  );
}
