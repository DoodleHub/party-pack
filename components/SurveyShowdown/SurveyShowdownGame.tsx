"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import surveyShowdownStage from "@/public/games/survey-showdown-stage.png";
import {
  ArrowRightIcon,
  ClockIcon,
  CopyIcon,
  LockIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/Icon";
import { GameStage } from "@/components/SurveyShowdown/GameStage";
import { TeamSidebar } from "@/components/SurveyShowdown/TeamSidebar";
import { RoundSidebar } from "@/components/SurveyShowdown/RoundSidebar";
import { WaitingRoom } from "@/components/SurveyShowdown/WaitingRoom";
import { PasswordGate } from "@/components/SurveyShowdown/PasswordGate";
import { ChatPanel } from "@/components/SurveyShowdown/ChatPanel";
import {
  advanceRound,
  expireTurn,
  fetchRoomState,
  getCurrentUser,
  joinTeam,
  leaveTeam,
  removePlayer,
  revealAllAnswers,
  startGame,
  submitAnswer,
  subscribeToPresence,
  subscribeToRoom,
  verifyRoomPassword,
} from "@/components/SurveyShowdown/data";
import type { RoomState } from "@/components/SurveyShowdown/types";
import { games } from "@/lib/games";

const gameInfo = games.find((g) => g.slug === "survey-showdown")!;

// How long to wait after a presence "leave" before treating it as a real
// departure — absorbs quick page refreshes/reconnects without a false kick.
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
      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Room</span>
      <span className="text-sm font-bold tracking-widest">{code}</span>
      <CopyIcon className="h-4 w-4" />
      {copied && <span className="text-xs">Copied</span>}
    </button>
  );
}

function GameOverScreen({ state }: { state: RoomState }) {
  const ranked = [...state.teams].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const tied = ranked.length > 1 && ranked[0].score === ranked[1].score;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-white/10 bg-black/50 p-10 text-center text-white backdrop-blur-md">
      <TrophyIcon className="h-10 w-10 text-amber-400" />
      <div>
        <h1 className="text-3xl font-extrabold">Game Over</h1>
        <p className="mt-2 text-white/70">
          {tied ? "It's a tie!" : `${winner.name} wins!`}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {ranked.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <span className="font-semibold">{team.name}</span>
            <span className="text-xl font-extrabold text-amber-400">{team.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SurveyShowdownGameProps {
  roomCode: string;
}

export function SurveyShowdownGame({ roomCode }: SurveyShowdownGameProps) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const stateRef = useRef<RoomState | null>(null);
  const onlineIdsRef = useRef<Set<string>>(new Set());

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

  // Detects players closing their tab/browser (not just clicking "Leave Team").
  // While the room is still waiting to start, a departed player's seat is
  // freed up automatically after a short grace period.
  useEffect(() => {
    if (!state?.roomId || !userId) return;
    return subscribeToPresence(
      state.roomId,
      userId,
      (ids) => {
        onlineIdsRef.current = ids;
        setOnlineUserIds(ids);
      },
      (leftUserId) => {
        setTimeout(() => {
          if (onlineIdsRef.current.has(leftUserId)) return;
          const current = stateRef.current;
          if (!current || current.status !== "waiting") return;
          const player = current.teams
            .flatMap((t) => t.players)
            .find((p) => p.userId === leftUserId);
          if (!player) return;
          removePlayer(current.roomId, player.id).then(refresh);
        }, DISCONNECT_GRACE_MS);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.roomId, userId]);

  const allRevealed =
    !!state && state.currentAnswers.length > 0 && state.currentAnswers.every((a) => a.revealed);

  // Once both teams have struck out, the turn engine pauses (active_player_id
  // is cleared) and the round waits on the host to reveal + advance manually.
  const stuck = !!state && state.status === "active" && state.activePlayerId === null;

  // Auto-advance to the next round shortly after the last answer is revealed —
  // but not if the round is paused waiting on the host to resolve it manually.
  useEffect(() => {
    if (!state || state.status !== "active" || !allRevealed || stuck) return;
    const timeout = setTimeout(() => {
      advanceRound(state.roomId).then(refresh);
    }, 2500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRevealed, stuck, state?.roomId, state?.status, state?.roundNumber]);

  // Force a turn to expire exactly when its timer runs out, so the game
  // keeps moving even if the active player is idle or has disconnected.
  useEffect(() => {
    if (!state || state.status !== "active" || !state.turnEndsAt) return;
    const msLeft = new Date(state.turnEndsAt).getTime() - Date.now();
    const timeout = setTimeout(
      () => {
        expireTurn(state.roomId).then(refresh);
      },
      Math.max(0, msLeft) + 300,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.turnEndsAt, state?.status, state?.roomId]);

  const needsPassword = !!state && state.visibility === "private" && state.hasPassword;
  const locked = needsPassword && !unlocked;

  const myPlayerId = state
    ? (state.teams.flatMap((t) => t.players).find((p) => p.userId === userId)?.id ?? null)
    : null;
  const isPlayer = myPlayerId !== null;
  const isHost = !!(state && userId && state.hostId === userId);
  const isMyTurn = !!state && state.activePlayerId !== null && state.activePlayerId === myPlayerId;
  const activePlayerName = state
    ? (state.teams.flatMap((t) => t.players).find((p) => p.id === state.activePlayerId)?.name ??
      null)
    : null;

  const spectatorBlocked = !!(
    state &&
    state.status !== "waiting" &&
    !isPlayer &&
    !state.allowSpectators
  );

  async function handleVerifyPassword(password: string) {
    const ok = await verifyRoomPassword(roomCode, password);
    if (ok) setUnlocked(true);
    return ok;
  }

  async function handleSubmitAnswer(text: string) {
    if (!state) return { error: "Room not loaded yet." };
    const result = await submitAnswer(state.roomId, text);
    await refresh();
    return result;
  }

  async function handleJoinTeam(slot: 1 | 2) {
    if (!state) return { error: "Room not loaded yet." };
    const result = await joinTeam(state.roomId, slot);
    await refresh();
    return result;
  }

  async function handleLeaveTeam() {
    if (!state) return;
    await leaveTeam(state.roomId);
    await refresh();
  }

  async function handleStartGame() {
    if (!state) return { error: "Room not loaded yet." };
    const result = await startGame(state.roomId);
    await refresh();
    return result;
  }

  async function handleRevealAll() {
    if (!state) return;
    const result = await revealAllAnswers(state.roomId);
    await refresh();
    return result;
  }

  async function handleNextRound() {
    if (!state) return;
    await advanceRound(state.roomId);
    await refresh();
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#050b1f]">
      <Image
        src={surveyShowdownStage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 pb-6 pt-8 sm:px-10">
          <Link
            href="/games/survey-showdown"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-black/40 px-5 py-3 text-sm font-medium text-white backdrop-blur-md"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            Back to Lobby
          </Link>

          <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-black/40 px-5 py-3 backdrop-blur-md">
            {state?.name && (
              <div className="flex items-center gap-2">
                <p className="max-w-48 truncate text-sm font-semibold text-white">
                  {state.name}
                </p>
              </div>
            )}
            {state?.visibility === "private" && (
              <LockIcon className="h-4 w-4 text-white/60" />
            )}
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-white">{gameInfo.players}</p>
                <p className="text-xs text-white/60">Teams</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-white">15–20 min</p>
                <p className="text-xs text-white/60">Play time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-white">{gameInfo.type}</p>
                <p className="text-xs text-white/60">Game type</p>
              </div>
            </div>
            {state && <RoomCodeChip code={state.code} />}
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
              onJoinTeam={handleJoinTeam}
              onLeaveTeam={handleLeaveTeam}
              onStartGame={handleStartGame}
            />
          ) : state.status === "ended" ? (
            <GameOverScreen state={state} />
          ) : (
            <div
              className={`grid w-full items-start gap-6 ${
                state.enableChat
                  ? "lg:grid-cols-[280px_1fr_220px_260px]"
                  : "lg:grid-cols-[280px_1fr_220px]"
              }`}
            >
              <TeamSidebar
                teams={state.teams}
                activeTeamSlot={state.activeTeamSlot}
                activePlayerId={state.activePlayerId}
                onlineUserIds={onlineUserIds}
              />

              <GameStage
                prompt={state.currentPrompt}
                answers={state.currentAnswers}
                activeTeamSlot={state.activeTeamSlot}
                activePlayerName={activePlayerName}
                isMyTurn={isMyTurn}
                turnEndsAt={state.turnEndsAt}
                onSubmitAnswer={handleSubmitAnswer}
                stuck={stuck}
                allRevealed={allRevealed}
                isHost={isHost}
                onRevealAll={handleRevealAll}
                onNextRound={handleNextRound}
              />

              <RoundSidebar roundNumber={state.roundNumber} totalRounds={state.totalRounds} />

              {state.enableChat && (
                <div className="h-112 lg:h-full lg:min-h-112">
                  <ChatPanel roomId={state.roomId} senderId={userId ?? "spectator"} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
