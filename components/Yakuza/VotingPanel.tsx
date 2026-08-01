"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import type { Phase, Player } from "@/components/Yakuza/types";

interface VotingPanelProps {
  phase: Phase;
  roundNumber: number;
  players: Player[];
  myPlayer: Player | null;
  myVote: string | null;
  isHost: boolean;
  onSubmitVote: (targetPlayerId: string) => Promise<{ error?: string }>;
  onResolveVote: () => Promise<{ error?: string }>;
}

export function VotingPanel({
  phase,
  roundNumber,
  players,
  myPlayer,
  myVote,
  isHost,
  onSubmitVote,
  onResolveVote,
}: VotingPanelProps) {
  const [selected, setSelected] = useState<string | null>(myVote);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync local selection with the server's vote on refresh/new round
    setSelected(myVote);
  }, [myVote, roundNumber]);

  const canVote = phase === "voting" && !!myPlayer?.alive;
  const alivePlayers = players.filter((p) => p.alive);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmitVote(selected);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  async function handleResolve() {
    setResolving(true);
    setError(null);
    const result = await onResolveVote();
    setResolving(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Voting</h2>
        <Badge variant="primary">Day {roundNumber}</Badge>
      </div>
      <p className="text-sm text-panel-muted">Discuss and vote to eliminate one player.</p>
      <p className="mt-1 text-xs font-medium text-panel-muted">
        {myVote ? "Your vote is in." : "You haven't voted yet."}
      </p>

      <div className={`mt-4 grid grid-cols-2 gap-2 ${!canVote ? "opacity-50" : ""}`}>
        {alivePlayers.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!canVote}
            onClick={() => setSelected(p.id)}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              selected === p.id
                ? "border-primary bg-primary-tint text-primary"
                : "border-panel-foreground/10 bg-panel-hover text-panel-foreground hover:border-primary/40"
            }`}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: avatarColor(p.name) }}
            >
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span
              className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                selected === p.id ? "border-primary bg-primary" : "border-panel-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        className="mt-4 w-full"
        onClick={handleSubmit}
        loading={submitting}
        disabled={!canVote || !selected}
      >
        Submit Vote
      </Button>

      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-panel-muted">
        <LockIcon className="h-3 w-3" />
        Voting is anonymous
      </p>

      {isHost && phase === "voting" && (
        <Button variant="panel" className="mt-3 w-full" onClick={handleResolve} loading={resolving}>
          Resolve Vote
        </Button>
      )}
    </div>
  );
}
