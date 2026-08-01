"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, ClockIcon, UsersIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { NIGHT_STEP_LABEL, NIGHT_STEP_ORDER, ROLE_META } from "@/components/Yakuza/roles";
import type { NightStep, Player, Role } from "@/components/Yakuza/types";

function StepStatusBadge({ status }: { status: "completed" | "active" | "pending" }) {
  if (status === "completed") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-600">
        Completed <CheckIcon className="h-4 w-4" />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
        Active <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-panel-muted">
      Pending <ClockIcon className="h-4 w-4" />
    </span>
  );
}

interface NightPanelProps {
  nightStep: NightStep | null;
  roundNumber: number;
  players: Player[];
  myPlayer: Player | null;
  isHost: boolean;
  onSubmitNightAction: (targetPlayerId: string) => Promise<{ error?: string }>;
  onResolveNight: () => Promise<{ error?: string }>;
}

export function NightPanel({
  nightStep,
  roundNumber,
  players,
  myPlayer,
  isHost,
  onSubmitNightAction,
  onResolveNight,
}: NightPanelProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = nightStep ? NIGHT_STEP_ORDER.indexOf(nightStep) : -1;
  const alivePlayers = players.filter((p) => p.alive);

  async function handlePick(targetPlayerId: string) {
    setSubmittingId(targetPlayerId);
    setError(null);
    const result = await onSubmitNightAction(targetPlayerId);
    setSubmittingId(null);
    if (result.error) setError(result.error);
  }

  async function handleResolve() {
    setResolving(true);
    setError(null);
    const result = await onResolveNight();
    setResolving(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Night {roundNumber}</h2>
      </div>
      <p className="text-sm text-panel-muted">
        Follow the night sequence. No talking. No gestures. Stay silent.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {NIGHT_STEP_ORDER.map((step, index) => {
          const status: "completed" | "active" | "pending" =
            index < currentIndex ? "completed" : index === currentIndex ? "active" : "pending";
          const label = NIGHT_STEP_LABEL[step];
          const meta = step === "sleep" ? null : ROLE_META[step as Role];
          const Icon = meta?.icon ?? UsersIcon;
          const isMyActiveStep =
            status === "active" && step !== "sleep" && !!myPlayer?.alive && myPlayer.role === step;

          return (
            <div key={step} className="rounded-xl border border-panel-foreground/10 bg-panel-hover p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta?.bg ?? "bg-panel-foreground/10"} ${meta?.color ?? "text-panel-muted"}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    {meta && (
                      <p className={`text-xs font-bold tracking-wide uppercase ${meta.color}`}>
                        {meta.label}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-panel-foreground">{label.title}</p>
                    <p className="text-xs text-panel-muted">{label.instruction}</p>
                  </div>
                </div>
                <StepStatusBadge status={status} />
              </div>

              {isMyActiveStep && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-panel-foreground/10 pt-3">
                  {alivePlayers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePick(p.id)}
                      disabled={submittingId !== null}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-panel-foreground/10 bg-panel px-3 py-1.5 text-sm font-medium text-panel-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: avatarColor(p.name) }}
                      >
                        {initials(p.name)}
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <p className="mt-4 text-center text-xs text-panel-muted">
        The host will reveal the results in the morning.
      </p>

      {isHost && (
        <Button variant="primary" className="mt-3 w-full" onClick={handleResolve} loading={resolving}>
          End Night &amp; Start Morning
        </Button>
      )}
    </div>
  );
}
