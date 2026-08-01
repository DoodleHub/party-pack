"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/Icon";
import { CHARACTER_META } from "@/components/Koup/characters";
import type { Character } from "@/components/Koup/types";

const QUICK_REFERENCE: Record<Character, string> = {
  duke: "+3 coins, Blocks Foreign Aid",
  assassin: "Pay 3, Eliminate Influence",
  captain: "Steal 2 coins, Blocks Steal",
  ambassador: "Exchange cards, Blocks Steal",
  contessa: "Blocks Assassination",
};

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
