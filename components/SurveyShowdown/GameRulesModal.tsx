"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BookIcon, CloseIcon } from "@/components/ui/Icon";

export function GameRulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="How to play"
        className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <BookIcon className="h-4 w-4" />
        <span className="text-sm font-semibold">Rules</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1230] p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">How to Play Survey Showdown</h2>
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
                Two teams face off over a series of survey questions, each with up to 8 hidden
                answers ranked by popularity. Rack up the most points across all rounds to win.
              </p>

              <h3 className="mt-5 text-sm font-semibold text-white/60">Taking a turn</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/85">
                <li>One player from the active team is on the clock and types a guess.</li>
                <li>
                  A correct guess reveals that answer and adds its points to the team&apos;s score.
                </li>
                <li>A wrong guess gives that team a strike and passes the turn to the other team.</li>
                <li>Running out the clock counts as a strike too.</li>
              </ul>

              <h3 className="mt-5 text-sm font-semibold text-white/60">Strikes &amp; round end</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/85">
                <li>Each team can take up to 3 strikes per round.</li>
                <li>
                  Once both teams are out of chances, the host reveals any remaining answers and
                  moves on to the next round.
                </li>
              </ul>

              <h3 className="mt-5 text-sm font-semibold text-white/60">Winning</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/85">
                <li>After the final round, the team with the most total points wins.</li>
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
