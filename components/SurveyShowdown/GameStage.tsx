import { Button } from "@/components/ui/Button";
import type { Answer } from "@/components/SurveyShowdown/types";

interface GameStageProps {
  prompt: string | null;
  answers: Answer[];
  onRevealNext: () => void;
  onRevealAnswer: (answerId: string) => void;
  onNextQuestion: () => void;
  canRevealNext: boolean;
  canAdvance: boolean;
  revealing: boolean;
  advancing: boolean;
}

function AnswerRow({
  rank,
  answer,
  onReveal,
}: {
  rank: number;
  answer: Answer | undefined;
  onReveal: (answerId: string) => void;
}) {
  const revealed = answer?.revealed ?? false;
  const isInteractive = Boolean(answer) && !revealed;

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={isInteractive ? () => onReveal(answer!.id) : undefined}
      className={`flex items-center gap-3 rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2.5 text-left sm:gap-4 sm:px-5 sm:py-3.5 ${
        isInteractive ? "cursor-pointer transition-colors hover:bg-white/15" : "cursor-default"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white sm:h-9 sm:w-9 sm:text-base">
        {rank}
      </span>
      <span className="min-w-0 flex-1 text-base leading-tight font-semibold text-white sm:text-xl">
        {revealed ? answer!.text : ""}
      </span>
      <span className="shrink-0 text-lg font-bold text-white sm:text-2xl">
        {revealed ? answer!.points : 0}
      </span>
    </button>
  );
}

export function GameStage({
  prompt,
  answers,
  onRevealNext,
  onRevealAnswer,
  onNextQuestion,
  canRevealNext,
  canAdvance,
  revealing,
  advancing,
}: GameStageProps) {
  const slots: (Answer | undefined)[] = Array.from({ length: 8 }, (_, i) =>
    answers.find((a) => a.rank === i + 1),
  );
  const leftColumn = slots.slice(0, 4);
  const rightColumn = slots.slice(4, 8);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full rounded-2xl border-2 border-amber-400/60 bg-[#080f28]/90 p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8">
        <h2 className="text-center text-2xl font-bold text-white sm:text-4xl">
          {prompt ?? "Loading question…"}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
          <div className="flex flex-col gap-4">
            {leftColumn.map((answer, i) => (
              <AnswerRow key={i} rank={i + 1} answer={answer} onReveal={onRevealAnswer} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {rightColumn.map((answer, i) => (
              <AnswerRow key={i} rank={i + 5} answer={answer} onReveal={onRevealAnswer} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={onRevealNext}
          disabled={!canRevealNext || revealing}
        >
          {revealing ? "Revealing…" : "Reveal Answer"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onNextQuestion}
          disabled={!canAdvance || advancing}
        >
          {advancing ? "Loading…" : "Next Question"}
        </Button>
      </div>
    </div>
  );
}
