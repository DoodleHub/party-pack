"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ClockIcon, LockIcon } from "@/components/ui/Icon";
import { DayPanel } from "@/components/Yakuza/DayPanel";
import { GameChatPanel } from "@/components/Yakuza/GameChatPanel";
import { GameOverScreen } from "@/components/Yakuza/GameOverScreen";
import { GameRulesModal } from "@/components/Yakuza/GameRulesModal";
import { NightPanel } from "@/components/Yakuza/NightPanel";
import { PasswordGate } from "@/components/Yakuza/PasswordGate";
import { PhaseBanner } from "@/components/Yakuza/PhaseBanner";
import { PlayersPanel } from "@/components/Yakuza/PlayersPanel";
import { RoleRevealModal } from "@/components/Yakuza/RoleRevealModal";
import { YakuzaRoomSkeleton } from "@/components/Yakuza/RoomSkeleton";
import { VotingPanel } from "@/components/Yakuza/VotingPanel";
import { WaitingRoom } from "@/components/Yakuza/WaitingRoom";
import {
  announceDisconnect,
  announceLeftGame,
  announceReconnect,
  claimHost,
  expirePhase,
  fetchRoomState,
  getCurrentUser,
  joinRoom,
  leaveRoom,
  removePlayer,
  resolveNight,
  resolveVote,
  startGame,
  startVoting,
  submitNightAction,
  submitVote,
  subscribeToPresence,
  subscribeToRoom,
  transferHost,
  verifyRoomPassword,
} from "@/components/Yakuza/data";
import type { RoomState } from "@/components/Yakuza/types";

const DISCONNECT_GRACE_MS = 8000;

function RoomIdBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy room code"
      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
    >
      {copied ? "Copied!" : `ID: ${code}`}
    </button>
  );
}

function GameTime({ startedAt }: { startedAt: string | null }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsedMs(Math.max(0, Date.now() - start));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;

  return (
    <span className="flex items-center gap-1.5">
      <ClockIcon className="h-3.5 w-3.5" />
      Game Time: {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

interface YakuzaGameProps {
  roomCode: string;
}

export function YakuzaGame({ roomCode }: YakuzaGameProps) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleRevealSeenFor, setRoleRevealSeenFor] = useState<string | null>(null);

  const stateRef = useRef<RoomState | null>(null);
  const onlineIdsRef = useRef<Set<string>>(new Set());
  const roomIdRef = useRef<string | null>(null);
  const isPlayerRef = useRef(false);
  const isHostRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const statusRef = useRef<RoomState["status"] | undefined>(undefined);
  const myPlayerIdRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await fetchRoomState(roomCode);
    setState(next);
    setLoading(false);
  }, [roomCode]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refresh();
    getCurrentUser().then((user) => {
      if (!user) return;
      setUserId(user.id);
    });
  }, [refresh]);

  useEffect(() => {
    if (!state?.roomId) return;
    return subscribeToRoom(state.roomId, refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.roomId]);

  // Detects players closing their tab/browser (not just navigating away via "Leave Room").
  useEffect(() => {
    if (!state?.roomId || !userId) return;
    let firstSync = true;
    return subscribeToPresence(
      state.roomId,
      userId,
      (ids) => {
        onlineIdsRef.current = ids;
        setOnlineUserIds(ids);

        if (firstSync) {
          firstSync = false;
          const current = stateRef.current;
          const isSeated = !!current?.players.some((p) => p.userId === userId);
          const othersOnline = [...ids].some((id) => id !== userId);
          if (current?.status === "active" && isSeated && !othersOnline) {
            claimHost(current.roomId).then(refresh);
          }
        }
      },
      (leftUserId) => {
        // While waiting, there's no game state to protect and rejoining is
        // instant (auto-join), so kick immediately instead of waiting out
        // the reconnect grace period.
        const waitingState = stateRef.current;
        if (waitingState?.status === "waiting") {
          const player = waitingState.players.find((p) => p.userId === leftUserId);
          if (player) removePlayer(waitingState.roomId, player.id).then(refresh);
          return;
        }

        setTimeout(() => {
          if (onlineIdsRef.current.has(leftUserId)) return;
          const current = stateRef.current;
          if (!current || current.status !== "active") return;
          const remainingOnlineIds = [...onlineIdsRef.current]
            .filter((id) => id !== leftUserId)
            .sort();
          if (remainingOnlineIds[0] === userId) {
            const player = current.players.find((p) => p.userId === leftUserId);
            if (player) announceDisconnect(current.roomId, player.id);
          }
          if (current.hostId === leftUserId) {
            transferHost(current.roomId, leftUserId).then(refresh);
          }
        }, DISCONNECT_GRACE_MS);
      },
      (joinedUserId) => {
        if (joinedUserId !== userId) return;
        const current = stateRef.current;
        if (!current || current.status !== "active") return;
        const player = current.players.find((p) => p.userId === userId);
        if (player) announceReconnect(current.roomId, player.id);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.roomId, userId]);

  const myPlayer = state ? (state.players.find((p) => p.userId === userId) ?? null) : null;
  const isPlayer = !!myPlayer;
  const isHost = !!(state && userId && state.hostId === userId);

  useEffect(() => {
    roomIdRef.current = state?.roomId ?? null;
    isPlayerRef.current = isPlayer;
    isHostRef.current = isHost;
    userIdRef.current = userId;
    statusRef.current = state?.status;
    myPlayerIdRef.current = myPlayer?.id ?? null;
  });

  // Proactively handle this client's own departure (e.g. clicking "Leave Room"
  // or navigating away), since presence "leave" detection above only fires for
  // clients still watching the room.
  useEffect(() => {
    return () => {
      if (!roomIdRef.current) return;
      if (statusRef.current === "waiting" && isPlayerRef.current) {
        leaveRoom(roomIdRef.current);
      } else if (statusRef.current === "active" && isPlayerRef.current && myPlayerIdRef.current) {
        announceLeftGame(roomIdRef.current, myPlayerIdRef.current);
        if (isHostRef.current && userIdRef.current) {
          transferHost(roomIdRef.current, userIdRef.current);
        }
      }
    };
  }, []);

  // The night/day/vote cycle is timer-driven — whichever client happens to be
  // looking triggers the expiry once the deadline passes.
  useEffect(() => {
    if (!state || state.status !== "active" || !state.phaseDeadline) return;
    const msLeft = new Date(state.phaseDeadline).getTime() - Date.now();
    const timeout = setTimeout(
      () => {
        expirePhase(state.roomId).then(refresh);
      },
      Math.max(0, msLeft) + 300,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.phaseDeadline, state?.status, state?.roomId]);

  const needsPassword = !!state && state.visibility === "private" && state.hasPassword && !isHost;
  const locked = needsPassword && !unlocked;
  const spectatorBlocked = !!(
    state &&
    state.status !== "waiting" &&
    !isPlayer &&
    !state.allowSpectators
  );

  // Auto-seat a visiting user at the table once the room is loaded and
  // unlocked, instead of requiring an explicit "Join Table" click.
  const autoJoinPendingRef = useRef(false);

  useEffect(() => {
    if (!state || !userId) return;
    if (state.status !== "waiting" || isPlayer) return;
    if (locked || spectatorBlocked) return;
    if (state.players.length >= state.maxPlayers) return;
    if (autoJoinPendingRef.current) return;
    autoJoinPendingRef.current = true;
    joinRoom(state.roomId).then(() => {
      autoJoinPendingRef.current = false;
      refresh();
    });
  }, [state, userId, isPlayer, locked, spectatorBlocked, refresh]);

  async function handleVerifyPassword(password: string) {
    const ok = await verifyRoomPassword(roomCode, password);
    if (ok) setUnlocked(true);
    return ok;
  }

  async function handleJoinRoom() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await joinRoom(state.roomId);
    await refresh();
    return result;
  }

  async function handleStartGame() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await startGame(state.roomId);
    await refresh();
    return result;
  }

  async function handleSubmitNightAction(targetPlayerId: string) {
    if (!state) return { error: "Room not loaded yet." };
    setActionError(null);
    const result = await submitNightAction(state.roomId, targetPlayerId);
    await refresh();
    if (result.error) setActionError(result.error);
    return result;
  }

  async function handleResolveNight() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await resolveNight(state.roomId);
    await refresh();
    return result;
  }

  async function handleStartVoting() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await startVoting(state.roomId);
    await refresh();
    return result;
  }

  async function handleSubmitVote(targetPlayerId: string) {
    if (!state) return { error: "Room not loaded yet." };
    const result = await submitVote(state.roomId, targetPlayerId);
    await refresh();
    return result;
  }

  async function handleResolveVote() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await resolveVote(state.roomId);
    await refresh();
    return result;
  }

  const hostName = state?.players.find((p) => p.userId === state.hostId)?.name ?? null;
  const mafiaTeammateNames =
    state && myPlayer?.role === "mafia"
      ? state.players.filter((p) => p.role === "mafia" && p.id !== myPlayer.id).map((p) => p.name)
      : [];

  const showRoleReveal =
    !!state &&
    state.status === "active" &&
    !!myPlayer?.role &&
    roleRevealSeenFor !== state.roomId;

  return (
    <div className="flex flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <Link
            href="/games/yakuza"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-panel-foreground/10 bg-panel px-5 py-3 text-sm font-medium text-panel-foreground shadow-sm transition-colors hover:bg-panel-hover"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            Leave Room
          </Link>

          {state?.name && (
            <div className="flex items-center gap-2">
              {state.visibility === "private" && <LockIcon className="h-4 w-4 text-panel-muted" />}
              <h1 className="max-w-52 truncate text-lg font-bold text-ink">{state.name}</h1>
              <RoomIdBadge code={state.code} />
            </div>
          )}

          {state?.status === "active" && (
            <div className="flex items-center gap-3 rounded-full border border-panel-foreground/10 bg-panel px-4 py-2 text-sm text-panel-foreground shadow-sm">
              <span className="font-semibold">{state.players.length} / {state.maxPlayers} Players</span>
              <span className="h-1 w-1 rounded-full bg-panel-foreground/20" />
              <GameTime startedAt={state.startedAt} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <GameRulesModal />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-start px-6 pb-16 sm:px-10">
          {loading ? (
            <YakuzaRoomSkeleton />
          ) : !state ? (
            <p className="mx-auto text-panel-muted">Couldn&apos;t find that room.</p>
          ) : locked ? (
            <PasswordGate roomName={state.name} onSubmit={handleVerifyPassword} />
          ) : spectatorBlocked ? (
            <p className="mx-auto text-panel-muted">This room doesn&apos;t allow spectators.</p>
          ) : state.status === "waiting" ? (
            <WaitingRoom
              room={state}
              currentUserId={userId ?? ""}
              onlineUserIds={onlineUserIds}
              onJoinRoom={handleJoinRoom}
              onStartGame={handleStartGame}
            />
          ) : state.status === "ended" ? (
            <GameOverScreen state={state} senderId={userId ?? "spectator"} />
          ) : (
            <div className="grid w-full min-w-0 items-start gap-6 xl:grid-cols-[18rem_1fr_18rem]">
              <PlayersPanel
                roomCode={state.code}
                players={state.players}
                hostId={state.hostId}
                currentUserId={userId}
                onlineUserIds={onlineUserIds}
                maxPlayers={state.maxPlayers}
              />

              <div className="flex min-w-0 flex-col items-center gap-6">
                <PhaseBanner
                  phase={state.phase ?? "night"}
                  roundNumber={state.roundNumber}
                  phaseDeadline={state.phaseDeadline}
                  hostName={hostName}
                />

                {actionError && (
                  <p className="w-full rounded-xl bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700">
                    {actionError}
                  </p>
                )}

                {state.phase === "night" && (
                  <NightPanel
                    nightStep={state.nightStep}
                    roundNumber={state.roundNumber}
                    players={state.players}
                    myPlayer={myPlayer}
                    isHost={isHost}
                    onSubmitNightAction={handleSubmitNightAction}
                    onResolveNight={handleResolveNight}
                  />
                )}

                {(state.phase === "day" || state.phase === "voting") && (
                  <DayPanel
                    phase={state.phase}
                    roundNumber={state.roundNumber}
                    isHost={isHost}
                    onStartVoting={handleStartVoting}
                  />
                )}
              </div>

              <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
                <GameChatPanel
                  roomId={state.roomId}
                  players={state.players}
                  senderId={userId ?? "spectator"}
                  enableChat={state.enableChat}
                  myInvestigations={state.myInvestigations}
                  canChat={!!myPlayer?.alive}
                />
                <VotingPanel
                  phase={state.phase ?? "night"}
                  roundNumber={state.roundNumber}
                  players={state.players}
                  myPlayer={myPlayer}
                  myVote={state.myVote}
                  isHost={isHost}
                  onSubmitVote={handleSubmitVote}
                  onResolveVote={handleResolveVote}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showRoleReveal && myPlayer?.role && (
        <RoleRevealModal
          role={myPlayer.role}
          teammateNames={mafiaTeammateNames}
          onClose={() => setRoleRevealSeenFor(state!.roomId)}
        />
      )}
    </div>
  );
}
