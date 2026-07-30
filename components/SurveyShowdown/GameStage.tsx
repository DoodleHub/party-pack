"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/Icon";
import type { Answer } from "@/components/SurveyShowdown/types";
import type { SubmitAnswerResult } from "@/components/SurveyShowdown/data";

const TEAM_COLORS = {
  1: "text-pink-400",
  2: "text-blue-400",
} as const;

interface GameStageProps {
  prompt: string | null;
  answers: Answer[];
  activeTeamSlot: 1 | 2;
  activePlayerName: string | null;
  isMyTurn: boolean;
  turnEndsAt: string | null;
  onSubmitAnswer: (text: string) => Promise<SubmitAnswerResult | { error: string }>;
  stuck: boolean;
  allRevealed: boolean;
  isHost: boolean;
  onRevealAll: () => Promise<{ error?: string } | void>;
  onNextRound: () => Promise<void>;
}

function AnswerRow({ rank, answer }: { rank: number; answer: Answer | undefined }) {
  const revealed = answer?.revealed ?? false;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2.5 text-left sm:gap-4 sm:px-5 sm:py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white sm:h-9 sm:w-9 sm:text-base">
        {rank}
      </span>
      <span className="min-w-0 flex-1 text-base leading-tight font-semibold text-white sm:text-xl">
        {revealed ? answer!.text : ""}
      </span>
      <span className="shrink-0 text-lg font-bold text-white sm:text-2xl">
        {revealed ? answer!.points : 0}
      </span>
    </div>
  );
}

interface AnswerFeedback {
  correct: boolean;
  points?: number;
}

function AnswerFeedbackToast({
  feedback,
  toastKey,
}: {
  feedback: AnswerFeedback;
  toastKey: number;
}) {
  const correct = feedback.correct;

  return (
    <div
      key={toastKey}
      className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] left-1/2 z-20 w-max opacity-0 animate-[answer-toast_2.1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
    >
      <div
        className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-md ${
          correct
            ? "border-emerald-400/50 bg-emerald-950/80 shadow-emerald-500/20"
            : "border-rose-400/50 bg-rose-950/80 shadow-rose-500/20"
        }`}
      >
        <span
          className={`absolute inset-0 -z-10 rounded-2xl animate-[answer-toast-ring_1.1s_ease-out] ${
            correct ? "bg-emerald-400/30" : "bg-rose-400/30"
          }`}
        />
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            correct ? "bg-emerald-400 text-emerald-950" : "bg-rose-400 text-rose-950"
          }`}
        >
          {correct ? <CheckIcon className="h-5 w-5" /> : <CloseIcon className="h-5 w-5" />}
        </span>
        <div className="text-left leading-tight">
          <p
            className={`text-base font-extrabold whitespace-nowrap ${
              correct ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {correct ? `Correct! +${feedback.points ?? 0} pts` : "Not quite!"}
          </p>
          {!correct && (
            <p className="text-xs whitespace-nowrap text-white/60">Turn passes to the other team</p>
          )}
        </div>
      </div>
    </div>
  );
}

function useCountdown(turnEndsAt: string | null) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!turnEndsAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset countdown when there's no active turn
      setRemainingMs(0);
      return;
    }
    const deadline = new Date(turnEndsAt).getTime();
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [turnEndsAt]);

  return remainingMs;
}

export function GameStage({
  prompt,
  answers,
  activeTeamSlot,
  activePlayerName,
  isMyTurn,
  turnEndsAt,
  onSubmitAnswer,
  stuck,
  allRevealed,
  isHost,
  onRevealAll,
  onNextRound,
}: GameStageProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [resolving, setResolving] = useState(false);

  const remainingMs = useCountdown(turnEndsAt);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const slots: (Answer | undefined)[] = Array.from({ length: 8 }, (_, i) =>
    answers.find((a) => a.rank === i + 1),
  );
  const leftColumn = slots.slice(0, 4);
  const rightColumn = slots.slice(4, 8);

  async function handleSubmit() {
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setDraft("");
    const result = await onSubmitAnswer(text);
    setSubmitting(false);

    if ("error" in result) return;
    setFeedback(result.correct ? { correct: true, points: result.points ?? 0 } : { correct: false });
    setFeedbackKey((k) => k + 1);
    setTimeout(() => setFeedback(null), 2100);
  }

  async function handleRevealAll() {
    setResolving(true);
    await onRevealAll();
    setResolving(false);
  }

  async function handleNextRound() {
    setResolving(true);
    await onNextRound();
    setResolving(false);
  }

  return (
    <div className="flex flex-col items-center">
      {stuck ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-400/40 bg-black/50 px-6 py-3 text-center text-white">
          <p className="text-lg font-bold text-red-400">Both teams are out of chances!</p>
          {isHost ? (
            <Button
              variant="primary"
              onClick={allRevealed ? handleNextRound : handleRevealAll}
              disabled={resolving}
            >
              {resolving
                ? "Working…"
                : allRevealed
                  ? "Next Round"
                  : "Reveal All Answers"}
            </Button>
          ) : (
            <p className="text-sm text-white/60">
              {allRevealed
                ? "Waiting for the host to move to the next round…"
                : "Waiting for the host to reveal the remaining answers…"}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-6 py-3 text-center text-white">
          <p className="text-sm">
            <span className={`font-bold ${TEAM_COLORS[activeTeamSlot]}`}>TEAM {activeTeamSlot}</span>
            {activePlayerName && <span className="text-white/70"> — {activePlayerName}&apos;s turn</span>}
          </p>
          <p
            className={`text-3xl font-extrabold tabular-nums ${
              remainingSeconds <= 5 ? "text-red-400" : "text-amber-400"
            }`}
          >
            {remainingSeconds}s
          </p>
        </div>
      )}

      <div className="relative mt-4 w-full rounded-2xl border-2 border-amber-400/60 bg-[#080f28]/90 p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-4xl">
          {prompt ?? "Loading question…"}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 2xl:grid-cols-2 2xl:gap-x-6">
          <div className="flex flex-col gap-4">
            {leftColumn.map((answer, i) => (
              <AnswerRow key={i} rank={i + 1} answer={answer} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {rightColumn.map((answer, i) => (
              <AnswerRow key={i} rank={i + 5} answer={answer} />
            ))}
          </div>
        </div>
      </div>

      {!stuck && (
        <div className="relative mt-6 flex w-full max-w-md flex-col items-center gap-3">
          {feedback && <AnswerFeedbackToast feedback={feedback} toastKey={feedbackKey} />}

          {isMyTurn ? (
            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Type your answer…"
                autoFocus
                disabled={submitting}
                className="h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
              <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting || !draft.trim()}>
                {submitting ? "Sending…" : "Submit"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-white/60">
              Waiting for {activePlayerName ?? "the other player"} to answer…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
