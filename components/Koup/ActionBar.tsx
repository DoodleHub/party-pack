"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, CloseIcon, SpinnerIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ACTION_META, ACTION_ORDER, type ActionMeta } from "@/components/Koup/characters";
import type { ActionType, Player, RoomState } from "@/components/Koup/types";

// Cards that need a target (Steal/Assassinate/Coup) only have room for one status line, so
// they show block status only; other cards show both block and challenge status — matches
// the reference design exactly.
function footerLines(action: ActionType, meta: ActionMeta): string[] {
  if (action === "coup") return ["Cannot be blocked"];
  const blockLine = meta.blockedBy ? `Blocked by ${meta.blockedBy}` : "Cannot block";
  if (meta.needsTarget) return [blockLine];
  const challengeLine = meta.challengeable ? "Can be challenged" : "Cannot challenge";
  return [blockLine, challengeLine];
}

interface ActionBarProps {
  state: RoomState;
  myPlayer: Player | null;
  onDeclareAction: (action: ActionType, targetPlayerId?: string) => Promise<void>;
  // TV Mode on mobile: denser grid, smaller icons, and the description/rule
  // text hidden — the full cards don't fit the screen without the side
  // columns. Unused above the sm breakpoint, where the regular cards fit fine.
  compact?: boolean;
}

export function ActionBar({ state, myPlayer, onDeclareAction, compact = false }: ActionBarProps) {
  const [pendingTargetAction, setPendingTargetAction] = useState<ActionType | null>(null);
  // Tracks which specific button (action or target) triggered the in-flight
  // RPC, so only that one shows a spinner instead of the whole bar going busy.
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local target picker whenever the server-driven phase moves on
    setPendingTargetAction(null);
    setBusyKey(null);
  }, [state.phase, state.turnNumber]);

  const isMyTurn = !!myPlayer && state.turnPlayerId === myPlayer.id;
  const interactive = isMyTurn && state.phase === "awaiting_action" && !myPlayer!.eliminated;
  const mustCoup = !!myPlayer && myPlayer.coins >= 10;
  const busy = busyKey !== null;

  async function run(key: string, fn: () => Promise<void>) {
    setBusyKey(key);
    try {
      await fn();
    } finally {
      setBusyKey(null);
    }
  }

  if (pendingTargetAction && myPlayer) {
    const targets = state.players.filter((p) => !p.eliminated && p.id !== myPlayer.id);
    return (
      <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-panel-foreground shadow-sm">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-panel-foreground">
              Choose a target for {ACTION_META[pendingTargetAction].label}
            </p>
            <button
              type="button"
              onClick={() => setPendingTargetAction(null)}
              className="cursor-pointer text-panel-muted hover:text-panel-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {targets.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={busy}
                onClick={() =>
                  run(t.id, async () => {
                    await onDeclareAction(pendingTargetAction, t.id);
                    setPendingTargetAction(null);
                  })
                }
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-panel-foreground/10 bg-panel-hover px-4 py-3 text-panel-foreground transition-colors hover:border-primary hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor(t.name) }}
                >
                  {busyKey === t.id ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : initials(t.name)}
                </span>
                <span className="text-sm font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-sm font-semibold text-ink">Choose an action</p>
      <div
        className={`grid w-full gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 ${
          compact ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {ACTION_ORDER.map((action) => {
          const meta = ACTION_META[action];
          const Icon = meta.icon;
          const affordable = !!myPlayer && myPlayer.coins >= meta.cost;
          const ruleLocked = mustCoup ? action !== "coup" : !affordable;
          const clickable = interactive && !ruleLocked;
          const isCoup = action === "coup";
          const isBusy = busyKey === action;

          return (
            <button
              key={action}
              type="button"
              disabled={busy || !clickable}
              onClick={() =>
                clickable &&
                run(action, async () => {
                  if (meta.needsTarget) {
                    setPendingTargetAction(action);
                  } else {
                    await onDeclareAction(action);
                  }
                })
              }
              className={`relative flex min-w-0 flex-col rounded-2xl border text-left transition-colors ${
                compact ? "gap-1 p-2 sm:gap-2 sm:p-4" : "gap-2 p-4"
              } ${isCoup ? "border-primary bg-primary-tint" : "border-panel-foreground/10 bg-panel"} ${
                clickable ? "cursor-pointer hover:border-primary hover:bg-primary-tint" : "cursor-default"
              } ${!interactive || ruleLocked ? "opacity-50" : ""}`}
            >
              {isBusy && (
                <SpinnerIcon className={`absolute top-3 right-3 h-4 w-4 animate-spin ${meta.color}`} />
              )}
              <Icon className={`${compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"} ${meta.color}`} />
              <span
                className={`wrap-break-word font-semibold ${isCoup ? "text-primary" : "text-panel-foreground"}`}
              >
                {meta.label}
              </span>
              <span
                className={`${compact ? "hidden sm:flex" : "flex"} flex-col gap-0.5 wrap-break-word text-xs ${
                  isCoup ? "text-primary/80" : "text-panel-muted"
                }`}
              >
                {meta.description.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
              <span
                className={`${compact ? "hidden sm:flex" : "flex"} flex-col gap-0.5 wrap-break-word text-[11px] ${
                  isCoup ? "font-semibold text-rose-600" : "text-panel-muted"
                }`}
              >
                {footerLines(action, meta).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
          mustCoup ? "bg-amber-100 font-medium text-amber-700" : "bg-surface-alt text-muted"
        }`}
      >
        <AlertTriangleIcon className="h-4 w-4 shrink-0" />
        10+ coins? You must perform a Coup.
      </div>
    </div>
  );
}
