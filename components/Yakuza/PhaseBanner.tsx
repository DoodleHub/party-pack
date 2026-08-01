"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/Icon";
import type { Phase } from "@/components/Yakuza/types";

function useCountdown(deadline: string | null) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!deadline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when there's no active deadline
      setRemainingMs(0);
      return;
    }
    const target = new Date(deadline).getTime();
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [deadline]);

  return remainingMs;
}

function formatClock(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface PhaseBannerProps {
  phase: Phase;
  roundNumber: number;
  phaseDeadline: string | null;
  hostName: string | null;
}

export function PhaseBanner({ phase, roundNumber, phaseDeadline, hostName }: PhaseBannerProps) {
  const remainingMs = useCountdown(phaseDeadline);
  const isNight = phase === "night";
  const isDayOrVoting = phase === "day" || phase === "voting";

  return (
    <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-4 text-center text-panel-foreground shadow-sm">
      <p className="text-xs text-panel-muted">
        {hostName ? (
          <>
            <span className="font-semibold text-panel-foreground">{hostName}</span> is hosting
          </>
        ) : (
          "The host is in control"
        )}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div
          className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-opacity ${
            isNight ? "bg-indigo-500/15" : "opacity-45"
          }`}
        >
          <MoonIcon className={`h-6 w-6 shrink-0 ${isNight ? "text-indigo-400" : "text-panel-muted"}`} />
          <div>
            <p className="font-semibold text-panel-foreground">Night{isNight ? ` ${roundNumber}` : ""}</p>
            <p className="text-xs text-panel-muted">Everyone closes their eyes.</p>
          </div>
        </div>

        {phaseDeadline && (
          <div className="flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-primary/40 px-5 py-3">
            <span className="text-[10px] font-medium text-panel-muted">Phase ends in</span>
            <span className="text-xl font-extrabold tabular-nums text-panel-foreground">
              {formatClock(remainingMs)}
            </span>
          </div>
        )}

        <div
          className={`flex flex-1 items-center justify-end gap-3 rounded-xl px-4 py-3 text-right transition-opacity ${
            isDayOrVoting ? "bg-amber-500/15" : "opacity-45"
          }`}
        >
          <div>
            <p className="font-semibold text-panel-foreground">
              {phase === "voting" ? "Voting" : `Day${isDayOrVoting ? ` ${roundNumber}` : ""}`}
            </p>
            <p className="text-xs text-panel-muted">Discuss. Debate. Vote.</p>
          </div>
          <SunIcon className={`h-6 w-6 shrink-0 ${isDayOrVoting ? "text-amber-500" : "text-panel-muted"}`} />
        </div>
      </div>
    </div>
  );
}
