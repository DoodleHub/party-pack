"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
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
      <Button variant="panel" onClick={() => setOpen(true)}>
        <BookIcon className="h-4 w-4" />
        Rules
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-panel-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">How to Play Koup</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="cursor-pointer rounded-full p-1 text-panel-muted hover:bg-panel-hover hover:text-panel-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-panel-muted">
              Be the last player with at least one unrevealed Influence. Take one action per turn
              — bluff to claim powerful characters, or challenge others who might be lying.
            </p>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">General actions</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-panel-foreground/85">
              <li>Income — take 1 coin. Cannot be blocked or challenged.</li>
              <li>Foreign Aid — take 2 coins. Can be blocked by Duke.</li>
              <li>Coup — pay 7 coins, eliminate 1 Influence. Always succeeds; 10+ coins forces it.</li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">Characters</h3>
            <ul className="mt-2 flex flex-col gap-2.5 text-sm text-panel-foreground/85">
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
