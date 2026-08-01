"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface DayPanelProps {
  phase: "day" | "voting";
  roundNumber: number;
  isHost: boolean;
  onStartVoting: () => Promise<{ error?: string }>;
}

export function DayPanel({ phase, roundNumber, isHost, onStartVoting }: DayPanelProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setStarting(true);
    setError(null);
    const result = await onStartVoting();
    setStarting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <h2 className="text-lg font-bold">Day {roundNumber}</h2>
      <p className="text-sm text-panel-muted">
        {phase === "day"
          ? "Discuss, debate, and look for contradictions. When you're ready, move to voting."
          : "Voting is underway — cast your ballot in the Voting panel."}
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {phase === "day" &&
        (isHost ? (
          <Button variant="primary" className="mt-4 w-full" onClick={handleStart} loading={starting}>
            Start Voting
          </Button>
        ) : (
          <p className="mt-4 text-center text-xs text-panel-muted">
            Waiting for the host to start voting…
          </p>
        ))}
    </div>
  );
}
