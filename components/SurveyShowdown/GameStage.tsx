"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
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
}: GameStageProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

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
    setFeedback(
      result.correct
        ? { correct: true, text: `Correct! +${result.points ?? 0} pts` }
        : { correct: false, text: "Not quite — turn passes to the other team." },
    );
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <div className="flex flex-col items-center">
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

      <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3">
        {feedback && (
          <p className={`text-sm font-semibold ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.text}
          </p>
        )}

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
    </div>
  );
}
