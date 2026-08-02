"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/Icon";
import { ACTION_META, CHARACTER_META } from "@/components/Koup/characters";
import type { Character } from "@/components/Koup/types";

const QUICK_REFERENCE: Record<Character, string> = {
  duke: "+3 coins, Blocks Foreign Aid",
  assassin: "Pay 3, Eliminate Influence",
  captain: "Steal 2 coins, Blocks Steal",
  ambassador: "Exchange cards, Blocks Steal",
  contessa: "Blocks Assassination",
};

// Income and Foreign Aid aren't tied to a character, so they're listed
// separately from CHARACTER_META below with their own icon/bg styling.
const BASIC_ACTIONS: { action: "income" | "foreign_aid"; description: string; bg: string }[] = [
  { action: "income", description: "+1 coin", bg: "bg-amber-400/15" },
  { action: "foreign_aid", description: "+2 coins, blocked by Duke", bg: "bg-sky-400/15" },
];

export function QuickReferencePanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full cursor-pointer items-center justify-between text-sm font-semibold text-panel-foreground"
      >
        Quick Reference
        <ChevronDownIcon
          className={`h-4 w-4 text-panel-muted transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>

      {!collapsed && (
        <ul className="mt-4 flex flex-col gap-3">
          {BASIC_ACTIONS.map(({ action, description, bg }) => {
            const meta = ACTION_META[action];
            const Icon = meta.icon;
            return (
              <li key={action} className="flex items-start gap-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-panel-foreground">{meta.label}</span>
                  <span className="text-panel-muted">{description}</span>
                </span>
              </li>
            );
          })}

          {(Object.keys(CHARACTER_META) as Character[]).map((c) => {
            const meta = CHARACTER_META[c];
            const Icon = meta.icon;
            return (
              <li key={c} className="flex items-start gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-panel-foreground">{meta.label}</span>
                  <span className="text-panel-muted">{QUICK_REFERENCE[c]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
