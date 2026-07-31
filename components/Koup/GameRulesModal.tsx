"use client";

import { useState } from "react";
import { BookIcon, CloseIcon } from "@/components/ui/Icon";
import { CHARACTER_META } from "@/components/Koup/characters";
import type { Character } from "@/components/Koup/types";

const CHARACTER_RULES: Record<Character, string> = {
  duke: "Tax: take 3 coins. Blocks Foreign Aid.",
  assassin: "Assassinate: pay 3 coins, target loses 1 Influence. Blocked by Contessa.",
  captain: "Steal: take 2 coins from another player. Blocks Steal.",
  ambassador: "Exchange: draw 2 cards, keep your count, return the rest. Blocks Steal.",
  contessa: "No action. Blocks Assassination.",
};

export function GameRulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
      >
        <BookIcon className="h-4 w-4" />
        Game Rules
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1130] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">How to Play Koup</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="cursor-pointer rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Be the last player with at least one unrevealed Influence. Take one action per turn
              — bluff to claim powerful characters, or challenge others who might be lying.
            </p>

            <h3 className="mt-5 text-sm font-semibold text-white/70">General actions</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/85">
              <li>Income — take 1 coin. Cannot be blocked or challenged.</li>
              <li>Foreign Aid — take 2 coins. Can be blocked by Duke.</li>
              <li>Coup — pay 7 coins, eliminate 1 Influence. Always succeeds; 10+ coins forces it.</li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-white/70">Characters</h3>
            <ul className="mt-2 flex flex-col gap-2.5 text-sm text-white/85">
              {(Object.keys(CHARACTER_META) as Character[]).map((c) => {
                const meta = CHARACTER_META[c];
                const Icon = meta.icon;
                return (
                  <li key={c} className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
                    <span>
                      <span className="font-semibold">{meta.label}</span> — {CHARACTER_RULES[c]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
