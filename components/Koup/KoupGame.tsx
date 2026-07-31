"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CoinsIcon, CopyIcon, LinkIcon, LockIcon } from "@/components/ui/Icon";
import { ActionBar } from "@/components/Koup/ActionBar";
import { GameInfoSidebar } from "@/components/Koup/GameInfoSidebar";
import { GameOverScreen } from "@/components/Koup/GameOverScreen";
import { GameRulesModal } from "@/components/Koup/GameRulesModal";
import { GameTable } from "@/components/Koup/GameTable";
import { PasswordGate } from "@/components/Koup/PasswordGate";
import { RightPanel } from "@/components/Koup/RightPanel";
import { WaitingRoom } from "@/components/Koup/WaitingRoom";
import {
  announceDisconnect,
  announceLeftGame,
  announceReconnect,
  blockAction,
  challengeAction,
  challengeBlock,
  chooseInfluence,
  claimHost,
  declareAction,
  expireResponse,
  fetchRoomState,
  getCurrentUser,
  joinRoom,
  leaveRoom,
  removePlayer,
  resolveExchange,
  startGame,
  subscribeToPresence,
  subscribeToRoom,
  transferHost,
  verifyRoomPassword,
} from "@/components/Koup/data";
import type { ActionType, Character, RoomState } from "@/components/Koup/types";

const DISCONNECT_GRACE_MS = 8000;

function RoomCodeChip({ code }: { code: string }) {
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
      className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Room</span>
      <span className="text-sm font-bold tracking-widest">{code}</span>
      <CopyIcon className="h-4 w-4" />
      {copied && <span className="text-xs">Copied</span>}
    </button>
  );
}

function CopyRoomLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/games/koup/room/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy room link"
      className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
    >
      <LinkIcon className="h-4 w-4" />
      <span className="text-sm font-semibold">{copied ? "Copied!" : "Copy Link"}</span>
    </button>
  );
}

interface KoupGameProps {
  roomCode: string;
}

export function KoupGame({ roomCode }: KoupGameProps) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const stateRef = useRef<RoomState | null>(null);
  const onlineIdsRef = useRef<Set<string>>(new Set());
  const roomIdRef = useRef<string | null>(null);
  const isPlayerRef = useRef(false);
  const isHostRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const statusRef = useRef<RoomState["status"] | undefined>(undefined);

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
        // the reconnect grace period — otherwise the seat lingers for
        // DISCONNECT_GRACE_MS after the presence dot already went offline.
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
  });

  // Proactively handle this client's own departure (e.g. clicking "Leave Room"
  // or navigating away), since presence "leave" detection above only fires for
  // clients still watching the room.
  useEffect(() => {
    return () => {
      if (!roomIdRef.current) return;
      if (statusRef.current === "waiting" && isPlayerRef.current) {
        leaveRoom(roomIdRef.current);
      } else if (statusRef.current === "active" && isPlayerRef.current) {
        announceLeftGame(roomIdRef.current);
        if (isHostRef.current && userIdRef.current) {
          transferHost(roomIdRef.current, userIdRef.current);
        }
      }
    };
  }, []);

  // The game's state machine is timer-driven (challenge/block windows, turn
  // timers, etc.) — whichever client happens to be looking triggers the
  // expiry once the deadline passes.
  useEffect(() => {
    if (!state || state.status !== "active" || !state.responseDeadline) return;
    const msLeft = new Date(state.responseDeadline).getTime() - Date.now();
    const timeout = setTimeout(
      () => {
        expireResponse(state.roomId).then(refresh);
      },
      Math.max(0, msLeft) + 300,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.responseDeadline, state?.status, state?.roomId]);

  const needsPassword = !!state && state.visibility === "private" && state.hasPassword;
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

  async function handleDeclareAction(action: ActionType, targetPlayerId?: string) {
    if (!state) return;
    setActionError(null);
    const result = await declareAction(state.roomId, action, targetPlayerId);
    await refresh();
    if (result.error) setActionError(result.error);
  }

  async function handleChallengeAction() {
    if (!state) return;
    await challengeAction(state.roomId);
    await refresh();
  }

  async function handleBlockAction(character: Character) {
    if (!state) return;
    await blockAction(state.roomId, character);
    await refresh();
  }

  async function handleChallengeBlock() {
    if (!state) return;
    await challengeBlock(state.roomId);
    await refresh();
  }

  async function handleChooseInfluence(cardId: string) {
    if (!state) return;
    await chooseInfluence(state.roomId, cardId);
    await refresh();
  }

  async function handleResolveExchange(cardIds: string[]) {
    if (!state) return;
    await resolveExchange(state.roomId, cardIds);
    await refresh();
  }

  const turnPlayerName = state?.players.find((p) => p.id === state.turnPlayerId)?.name ?? null;

  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #4a3466 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, #2c1c47 0%, transparent 60%), #0d0818",
      }}
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 pb-6 pt-8 sm:px-10">
          <Link
            href="/games/koup"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-black/40 px-5 py-3 text-sm font-medium text-white backdrop-blur-md"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            Leave Room
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {state?.status === "active" && (
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md">
                <CoinsIcon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Court Deck</p>
                  <p className="text-xs text-white/60">{state.deckCount}</p>
                </div>
              </div>
            )}
            {state?.status === "active" && (
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-semibold">Round {state.turnNumber}</p>
                  <p className="text-xs text-white/60">Turn: {turnPlayerName ?? "…"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {state?.name && (
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md">
                {state.visibility === "private" && <LockIcon className="h-3.5 w-3.5 text-white/60" />}
                <span className="max-w-40 truncate">{state.name}</span>
              </div>
            )}
            {state && <RoomCodeChip code={state.code} />}
            {state && <CopyRoomLinkButton code={state.code} />}
            <GameRulesModal />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-start px-6 pb-16 sm:px-10">
          {loading ? (
            <p className="mx-auto text-white/70">Loading game…</p>
          ) : !state ? (
            <p className="mx-auto text-white/70">Couldn&apos;t find that room.</p>
          ) : locked ? (
            <PasswordGate roomName={state.name} onSubmit={handleVerifyPassword} />
          ) : spectatorBlocked ? (
            <p className="mx-auto text-white/70">This room doesn&apos;t allow spectators.</p>
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
            <div className="grid w-full min-w-0 items-start gap-6 lg:grid-cols-[16rem_1fr_18rem]">
              <GameInfoSidebar
                players={state.players}
                hostId={state.hostId}
                turnPlayerId={state.turnPlayerId}
                currentUserId={userId}
                onlineUserIds={onlineUserIds}
                maxPlayers={state.maxPlayers}
              />

              <div className="flex min-w-0 flex-col items-center gap-6">
                <GameTable state={state} myPlayerId={myPlayer?.id ?? null} onlineUserIds={onlineUserIds} />
                {actionError && (
                  <p className="rounded-xl bg-red-500/20 px-4 py-2 text-center text-sm font-medium text-red-200">
                    {actionError}
                  </p>
                )}
                <ActionBar
                  state={state}
                  myPlayer={myPlayer}
                  onDeclareAction={handleDeclareAction}
                  onChallengeAction={handleChallengeAction}
                  onBlockAction={handleBlockAction}
                  onChallengeBlock={handleChallengeBlock}
                  onChooseInfluence={handleChooseInfluence}
                  onResolveExchange={handleResolveExchange}
                />
              </div>

              <RightPanel
                roomId={state.roomId}
                senderId={userId ?? "spectator"}
                enableChat={state.enableChat}
                hand={state.myHand}
                eliminated={myPlayer?.eliminated ?? false}
                isPlayer={isPlayer}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
