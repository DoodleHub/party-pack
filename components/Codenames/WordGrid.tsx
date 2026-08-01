"use client";

import { WordCard } from "@/components/Codenames/WordCard";
import type { CardInfo, KeyEntry } from "@/components/Codenames/types";

interface WordGridProps {
  cards: CardInfo[];
  keyEntries: KeyEntry[];
  spymasterPreview: boolean;
  canGuess: boolean;
  guessingCardId: string | null;
  onGuess: (cardId: string) => void;
}

export function WordGrid({ cards, keyEntries, spymasterPreview, canGuess, guessingCardId, onGuess }: WordGridProps) {
  const keyByPosition = new Map(keyEntries.map((k) => [k.position, k.team]));
  const sorted = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div className="grid w-full grid-cols-5 gap-2 sm:gap-3">
      {sorted.map((card) => (
        <WordCard
          key={card.id}
          card={card}
          keyTeam={keyByPosition.get(card.position) ?? null}
          spymasterPreview={spymasterPreview}
          clickable={canGuess && !card.revealed}
          busy={guessingCardId === card.id}
          onClick={() => onGuess(card.id)}
        />
      ))}
    </div>
  );
}
