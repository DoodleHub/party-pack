"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import surveyShowdownStage from "@/public/games/survey-showdown-stage.png";
import { ArrowRightIcon, ClockIcon, CopyIcon, TrophyIcon, UsersIcon } from "@/components/ui/Icon";
import { GameStage } from "@/components/SurveyShowdown/GameStage";
import { TeamSidebar } from "@/components/SurveyShowdown/TeamSidebar";
import { RoundSidebar } from "@/components/SurveyShowdown/RoundSidebar";
import {
  advanceRound,
  fetchRoomState,
  revealNextAnswer,
  revealSpecificAnswer,
  setActiveTeam,
  subscribeToRoom,
} from "@/components/SurveyShowdown/data";
import type { RoomState } from "@/components/SurveyShowdown/types";
import { games } from "@/lib/games";

const gameInfo = games.find((g) => g.slug === "survey-showdown")!;

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

interface SurveyShowdownGameProps {
  roomCode: string;
}

export function SurveyShowdownGame({ roomCode }: SurveyShowdownGameProps) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const refresh = useCallback(async () => {
    const next = await fetchRoomState(roomCode);
    setState(next);
    setLoading(false);
  }, [roomCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!state?.roomId) return;
    return subscribeToRoom(state.roomId, refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.roomId]);

  const allRevealed =
    !!state && state.currentAnswers.length > 0 && state.currentAnswers.every((a) => a.revealed);
  const canRevealNext = !allRevealed;
  const canAdvance = !!state && state.roundNumber < state.totalRounds;

  async function handleRevealNext() {
    if (!state) return;
    setRevealing(true);
    await revealNextAnswer(state.roomId);
    await refresh();
    setRevealing(false);
  }

  async function handleRevealAnswer(answerId: string) {
    if (!state) return;
    setRevealing(true);
    await revealSpecificAnswer(state.roomId, answerId);
    await refresh();
    setRevealing(false);
  }

  async function handleNextQuestion() {
    if (!state) return;
    setAdvancing(true);
    await advanceRound(state.roomId);
    await refresh();
    setAdvancing(false);
  }

  async function handleSetActiveTeam(slot: 1 | 2) {
    if (!state) return;
    await setActiveTeam(state.roomId, slot);
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
            href="/games"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-black/40 px-5 py-3 text-sm font-medium text-white backdrop-blur-md"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            Back to Games
          </Link>

          <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-black/40 px-5 py-3 backdrop-blur-md">
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
          ) : (
            <div className="grid w-full items-start gap-6 lg:grid-cols-[280px_1fr_220px]">
              <TeamSidebar
                teams={state.teams}
                activeTeamSlot={state.activeTeamSlot}
                onSetActiveTeam={handleSetActiveTeam}
              />

              <GameStage
                prompt={state.currentPrompt}
                answers={state.currentAnswers}
                onRevealNext={handleRevealNext}
                onRevealAnswer={handleRevealAnswer}
                onNextQuestion={handleNextQuestion}
                canRevealNext={canRevealNext}
                canAdvance={canAdvance}
                revealing={revealing}
                advancing={advancing}
              />

              <RoundSidebar roundNumber={state.roundNumber} totalRounds={state.totalRounds} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
