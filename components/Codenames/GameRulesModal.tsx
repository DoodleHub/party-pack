"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BookIcon, CloseIcon, SkullIcon } from "@/components/ui/Icon";

export function GameRulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" className="border-white/20 text-white hover:bg-white/10" onClick={() => setOpen(true)}>
        <BookIcon className="h-4 w-4" />
        Rules
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">How to Play Codenames</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="cursor-pointer rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Two teams — Red and Blue — race to find all of their secret agents among 25 words on
              the board. Each team has one Spymaster who knows the key, and Operatives who guess.
            </p>

            <h3 className="mt-5 text-sm font-semibold text-white/50">Giving a clue</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/80">
              <li>The Spymaster gives one word and a number, e.g. &quot;Ocean — 3.&quot;</li>
              <li>The number means &quot;this many of our words relate to my clue.&quot;</li>
              <li>After giving the clue, the Spymaster must stay silent — no hints, no reactions.</li>
              <li>Instead of a number, a Spymaster may say &quot;Unlimited&quot; for open-ended guessing.</li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-white/50">Guessing</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/80">
              <li>Operatives may guess up to the clued number, plus one bonus guess.</li>
              <li>Guess your own agent — reveal it and keep guessing.</li>
              <li>Guess a neutral card or the other team&apos;s agent — it&apos;s revealed and your turn ends.</li>
              <li>Guess the Assassin — your team loses instantly.</li>
              <li>You can stop guessing early any time you&apos;re unsure.</li>
            </ul>

            <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/50">
              <SkullIcon className="h-4 w-4" />
              The Assassin
            </h3>
            <p className="mt-2 text-sm text-white/80">
              One card on the board is the Assassin. Whichever team reveals it loses immediately —
              be careful which words you guess.
            </p>

            <h3 className="mt-5 text-sm font-semibold text-white/50">Winning</h3>
            <p className="mt-2 text-sm text-white/80">
              The first team to reveal all of their own agents wins. Revealing the Assassin loses
              the game instantly for your team, regardless of the board state.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
