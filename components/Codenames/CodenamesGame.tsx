"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, LockIcon } from "@/components/ui/Icon";
import { CluePanel } from "@/components/Codenames/CluePanel";
import { GameHistoryBar } from "@/components/Codenames/GameHistoryBar";
import { GameLogPanel } from "@/components/Codenames/GameLogPanel";
import { GameOverScreen } from "@/components/Codenames/GameOverScreen";
import { GameRulesModal } from "@/components/Codenames/GameRulesModal";
import { GameStatusPanel } from "@/components/Codenames/GameStatusPanel";
import { KeyCardPanel } from "@/components/Codenames/KeyCardPanel";
import { PasswordGate } from "@/components/Codenames/PasswordGate";
import { CodenamesRoomSkeleton } from "@/components/Codenames/RoomSkeleton";
import { TeamPanel } from "@/components/Codenames/TeamPanel";
import { useGameLog } from "@/components/Codenames/useGameLog";
import { ViewToggle, type ViewMode } from "@/components/Codenames/ViewToggle";
import { WaitingRoom } from "@/components/Codenames/WaitingRoom";
import { WordGrid } from "@/components/Codenames/WordGrid";
import {
  announceDisconnect,
  announceLeftGame,
  announceReconnect,
  becomeOperative,
  claimHost,
  claimSpymaster,
  expireTurn,
  fetchRoomState,
  getCurrentUser,
  giveClue,
  guessCard,
  joinTeam,
  leaveTeam,
  passTurn,
  removePlayer,
  startGame,
  subscribeToPresence,
  subscribeToRoom,
  transferHost,
  verifyRoomPassword,
} from "@/components/Codenames/data";
import type { RoomState, Team } from "@/components/Codenames/types";

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
      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:text-white"
    >
      {copied ? "Copied!" : `Room Code: ${code}`}
    </button>
  );
}

interface CodenamesGameProps {
  roomCode: string;
}

export function CodenamesGame({ roomCode }: CodenamesGameProps) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("operative");
  const [guessingCardId, setGuessingCardId] = useState<string | null>(null);

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
          const remainingOnlineIds = [...onlineIdsRef.current].filter((id) => id !== leftUserId).sort();
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
  const isSpymaster = myPlayer?.role === "spymaster";

  useEffect(() => {
    roomIdRef.current = state?.roomId ?? null;
    isPlayerRef.current = isPlayer;
    isHostRef.current = isHost;
    userIdRef.current = userId;
    statusRef.current = state?.status;
  });

  // Default a spymaster's own screen to Spymaster View when they first become one
  // (e.g. right when the game starts) — but leave a manual toggle to Operative
  // View alone afterward, since this effect only re-fires when the role flips.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- default to Spymaster View the moment this player becomes a spymaster; doesn't refire on later manual toggles since isSpymaster stays true
    if (isSpymaster) setViewMode("spymaster");
  }, [isSpymaster]);

  // Proactively handle this client's own departure (e.g. clicking "Leave Room"
  // or navigating away), since presence "leave" detection above only fires for
  // clients still watching the room.
  useEffect(() => {
    return () => {
      if (!roomIdRef.current) return;
      if (statusRef.current === "waiting" && isPlayerRef.current) {
        leaveTeam(roomIdRef.current);
      } else if (statusRef.current === "active" && isPlayerRef.current) {
        announceLeftGame(roomIdRef.current);
        if (isHostRef.current && userIdRef.current) {
          transferHost(roomIdRef.current, userIdRef.current);
        }
      }
    };
  }, []);

  // The turn state machine is timer-driven (clue-giving window, guessing
  // window) — whichever client happens to be looking triggers the expiry
  // once the deadline passes.
  useEffect(() => {
    if (!state || state.status !== "active" || !state.responseDeadline) return;
    const msLeft = new Date(state.responseDeadline).getTime() - Date.now();
    const timeout = setTimeout(
      () => {
        expireTurn(state.roomId).then(refresh);
      },
      Math.max(0, msLeft) + 300,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.responseDeadline, state?.status, state?.roomId]);

  const needsPassword = !!state && state.visibility === "private" && state.hasPassword && !isHost;
  const locked = needsPassword && !unlocked;
  const spectatorBlocked = !!(state && state.status !== "waiting" && !isPlayer && !state.allowSpectators);

  const events = useGameLog(state?.roomId ?? "");

  async function handleVerifyPassword(password: string) {
    const ok = await verifyRoomPassword(roomCode, password);
    if (ok) setUnlocked(true);
    return ok;
  }

  async function handleJoinTeam(team: Team) {
    if (!state) return { error: "Room not loaded yet." };
    const result = await joinTeam(state.roomId, team);
    await refresh();
    return result;
  }

  async function handleLeaveTeam() {
    if (!state) return;
    await leaveTeam(state.roomId);
    await refresh();
  }

  async function handleClaimSpymaster() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await claimSpymaster(state.roomId);
    await refresh();
    return result;
  }

  async function handleBecomeOperative() {
    if (!state) return;
    await becomeOperative(state.roomId);
    await refresh();
  }

  async function handleStartGame() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await startGame(state.roomId);
    await refresh();
    return result;
  }

  async function handleGiveClue(word: string, number: number, unlimited: boolean) {
    if (!state) return { error: "Room not loaded yet." };
    setActionError(null);
    const result = await giveClue(state.roomId, word, number, unlimited);
    await refresh();
    if (result.error) setActionError(result.error);
    return result;
  }

  async function handleGuess(cardId: string) {
    if (!state || guessingCardId) return;
    setActionError(null);
    setGuessingCardId(cardId);
    const result = await guessCard(state.roomId, cardId);
    await refresh();
    setGuessingCardId(null);
    if (result.error) setActionError(result.error);
  }

  async function handlePassTurn() {
    if (!state) return;
    await passTurn(state.roomId);
    await refresh();
  }

  const turnTeam = state?.turnTeam ?? null;
  const canGuess =
    !!state &&
    state.status === "active" &&
    state.turnPhase === "guessing" &&
    myPlayer?.team === turnTeam &&
    myPlayer?.role === "operative" &&
    (state.guessesMax === null || state.guessesUsed < state.guessesMax);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#080c18]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 15% 10%, rgba(220,38,38,0.12), transparent), radial-gradient(ellipse 60% 40% at 85% 10%, rgba(37,99,235,0.12), transparent)",
        }}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <Link
            href="/games/codenames"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/50 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            Exit Room
          </Link>

          {state?.name && (
            <div className="flex items-center gap-2">
              {state.visibility === "private" && <LockIcon className="h-4 w-4 text-white/50" />}
              <h1 className="max-w-52 truncate text-lg font-bold text-white">{state.name}</h1>
              <RoomIdBadge code={state.code} />
            </div>
          )}

          <GameRulesModal />
        </div>

        {state?.status === "active" && turnTeam && (
          <div className="mx-auto -mt-2 mb-4 flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-5 py-2.5 text-sm text-white backdrop-blur-md">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                turnTeam === "red" ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              {turnTeam === "red" ? "Red" : "Blue"} Team&apos;s turn
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-white/70">
              {state.turnPhase === "clue" ? "Spymaster gives a clue" : "Operatives are guessing"}
            </span>
          </div>
        )}

        <div className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col items-center gap-4 px-6 pb-16 sm:px-10">
          {loading ? (
            <CodenamesRoomSkeleton />
          ) : !state ? (
            <p className="mx-auto text-white/60">Couldn&apos;t find that room.</p>
          ) : locked ? (
            <PasswordGate roomName={state.name} onSubmit={handleVerifyPassword} />
          ) : spectatorBlocked ? (
            <p className="mx-auto text-white/60">This room doesn&apos;t allow spectators.</p>
          ) : state.status === "waiting" ? (
            <WaitingRoom
              room={state}
              currentUserId={userId ?? ""}
              onlineUserIds={onlineUserIds}
              onJoinTeam={handleJoinTeam}
              onLeaveTeam={handleLeaveTeam}
              onClaimSpymaster={handleClaimSpymaster}
              onBecomeOperative={handleBecomeOperative}
              onStartGame={handleStartGame}
            />
          ) : state.status === "ended" ? (
            <GameOverScreen state={state} senderId={userId ?? "spectator"} />
          ) : (
            <>
              <div className="grid w-full min-w-0 items-start gap-6 xl:grid-cols-[18rem_1fr_18rem]">
                <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
                  <ViewToggle isSpymaster={isSpymaster} viewMode={viewMode} onChange={setViewMode} />
                  {viewMode === "spymaster" && isSpymaster && <KeyCardPanel keyEntries={state.key} />}
                  <TeamPanel
                    team="red"
                    players={state.players.filter((p) => p.team === "red")}
                    remaining={state.redRemaining}
                  />
                  <TeamPanel
                    team="blue"
                    players={state.players.filter((p) => p.team === "blue")}
                    remaining={state.blueRemaining}
                  />
                </div>

                <div className="flex min-w-0 flex-col items-center gap-6">
                  <WordGrid
                    cards={state.cards}
                    keyEntries={state.key}
                    spymasterPreview={viewMode === "spymaster" && isSpymaster}
                    canGuess={canGuess}
                    guessingCardId={guessingCardId}
                    onGuess={handleGuess}
                  />

                  <CluePanel state={state} myPlayer={myPlayer} onGiveClue={handleGiveClue} onPassTurn={handlePassTurn} />

                  {actionError && (
                    <p className="w-full rounded-xl bg-red-500/20 px-4 py-2 text-center text-sm font-medium text-red-200">
                      {actionError}
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
                  <GameStatusPanel state={state} />
                  <GameLogPanel
                    roomId={state.roomId}
                    events={events}
                    players={state.players}
                    senderId={userId ?? "spectator"}
                    enableChat={state.enableChat}
                  />
                </div>
              </div>

              <GameHistoryBar events={events} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
