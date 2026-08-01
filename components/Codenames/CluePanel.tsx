"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EyeIcon, UsersIcon } from "@/components/ui/Icon";
import { Countdown } from "@/components/Codenames/Countdown";
import type { Player, RoomState } from "@/components/Codenames/types";

function Illustration({ team }: { team: "red" | "blue" }) {
  const gradient = team === "red" ? "from-red-900/60 via-black/40 to-black/60" : "from-blue-900/60 via-black/40 to-black/60";
  return (
    <div className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} ring-1 ring-white/10`}>
      <EyeIcon className="h-12 w-12 text-white/70" />
    </div>
  );
}

interface CluePanelProps {
  state: RoomState;
  myPlayer: Player | null;
  onGiveClue: (word: string, number: number, unlimited: boolean) => Promise<{ error?: string }>;
  onPassTurn: () => Promise<void>;
}

export function CluePanel({ state, myPlayer, onGiveClue, onPassTurn }: CluePanelProps) {
  const [word, setWord] = useState("");
  const [number, setNumber] = useState("1");
  const [unlimited, setUnlimited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passing, setPassing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local form state whenever the server-driven turn moves on
    setWord("");
    setNumber("1");
    setUnlimited(false);
    setError(null);
  }, [state.turnPhase, state.turnNumber, state.turnTeam]);

  const turnTeam = state.turnTeam;
  if (!turnTeam) return null;

  const isMySpymasterTurn = state.turnPhase === "clue" && myPlayer?.team === turnTeam && myPlayer?.role === "spymaster";
  const isMyGuessingTurn = state.turnPhase === "guessing" && myPlayer?.team === turnTeam && myPlayer?.role === "operative";
  const clueGiver = state.players.find((p) => p.team === turnTeam && p.role === "spymaster");

  async function handleSubmit() {
    const trimmed = word.trim();
    if (!trimmed) {
      setError("Enter a clue word.");
      return;
    }
    const parsedNumber = unlimited ? 0 : Number(number);
    if (!unlimited && (!Number.isInteger(parsedNumber) || parsedNumber < 0 || parsedNumber > 25)) {
      setError("Number must be between 0 and 25.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onGiveClue(trimmed, parsedNumber, unlimited);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  async function handlePass() {
    setPassing(true);
    await onPassTurn();
    setPassing(false);
  }

  if (isMySpymasterTurn) {
    return (
      <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-white/10 bg-black/50 p-6 text-white backdrop-blur-md sm:flex-row">
        <Illustration team={turnTeam} />
        <div className="flex w-full flex-1 flex-col gap-3">
          <div>
            <p className="text-lg font-bold">Give your clue</p>
            <p className="text-sm text-white/50">One word and a number.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter clue word…"
              disabled={submitting}
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
            />
            <span className="text-white/40">—</span>
            <input
              type="number"
              value={unlimited ? "" : number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={submitting || unlimited}
              placeholder="Number…"
              min={0}
              max={25}
              className="h-11 w-28 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none disabled:opacity-40"
            />
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Give Clue
            </Button>
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={unlimited}
              onChange={(e) => setUnlimited(e.target.checked)}
              disabled={submitting}
              className="h-3.5 w-3.5 accent-primary"
            />
            Unlimited (0–25, or check for Unlimited)
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <p className="text-xs text-white/40">
            Examples: Ocean — 3 &nbsp;|&nbsp; Planet — 2 &nbsp;|&nbsp; Royal — 4 &nbsp;|&nbsp; Universe — Unlimited
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-white/10 bg-black/50 p-6 text-white backdrop-blur-md sm:flex-row">
      <Illustration team={turnTeam} />
      <div className="flex w-full flex-1 flex-col items-start gap-2">
        {state.turnPhase === "clue" ? (
          <>
            <p className="text-sm text-white/50">Waiting for a clue</p>
            <p className="text-lg font-bold">{clueGiver?.name ?? "The Spymaster"} is thinking…</p>
          </>
        ) : (
          <>
            <p className="text-sm text-white/50">Current clue</p>
            <p className="text-2xl font-extrabold">
              {state.clueWord} <span className="text-white/40">—</span>{" "}
              {state.clueUnlimited ? "Unlimited" : state.clueNumber}
            </p>
            {isMyGuessingTurn && (
              <Button variant="ghost" className="mt-1 border-white/20 text-white hover:bg-white/10" onClick={handlePass} loading={passing}>
                <UsersIcon className="h-4 w-4" />
                Pass Turn
              </Button>
            )}
          </>
        )}
        <Countdown deadline={state.responseDeadline} />
      </div>
    </div>
  );
}
