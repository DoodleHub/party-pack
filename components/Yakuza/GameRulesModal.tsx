"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BookIcon, CloseIcon } from "@/components/ui/Icon";
import { ROLE_META } from "@/components/Yakuza/roles";
import type { Role } from "@/components/Yakuza/types";

const ROLE_ORDER: Role[] = ["mafia", "detective", "doctor", "citizen"];

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
              <h2 className="text-lg font-bold">How to Play Yakuza</h2>
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
              A social deduction game: the Mafia secretly work to outnumber the Town, while the
              Town tries to identify and vote them out before that happens.
            </p>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">Roles</h3>
            <ul className="mt-2 flex flex-col gap-2.5 text-sm text-panel-foreground/85">
              {ROLE_ORDER.map((role) => {
                const meta = ROLE_META[role];
                const Icon = meta.icon;
                return (
                  <li key={role} className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
                    <span>
                      <span className="font-semibold">{meta.label}</span> — {meta.description}
                    </span>
                  </li>
                );
              })}
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">Night</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-panel-foreground/85">
              <li>Everyone stays silent. The Mafia, Doctor, and Detective act in order.</li>
              <li>The Mafia chooses one player to eliminate.</li>
              <li>The Doctor may save the Mafia&apos;s target — if they do, nobody dies.</li>
              <li>The Detective learns whether their target is Mafia or not.</li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">Day &amp; Voting</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-panel-foreground/85">
              <li>Discuss, accuse, and defend — then everyone votes for one player to eliminate.</li>
              <li>A tie means nobody is eliminated that day.</li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-panel-muted">Winning</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-panel-foreground/85">
              <li>Town wins once every Mafia member has been eliminated.</li>
              <li>Mafia wins once they equal or outnumber the remaining Town.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
