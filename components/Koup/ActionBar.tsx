"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CloseIcon, CoinsIcon, ShieldIcon, SwordIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ACTION_META, ACTION_ORDER, CHARACTER_META } from "@/components/Koup/characters";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { ActionType, Character, Player, RoomState } from "@/components/Koup/types";

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
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [deadline]);

  return remainingMs;
}

function Countdown({ deadline }: { deadline: string | null }) {
  const remainingMs = useCountdown(deadline);
  if (!deadline) return null;
  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <p className={`text-2xl font-extrabold tabular-nums ${seconds <= 3 ? "text-red-400" : "text-amber-400"}`}>
      {seconds}s
    </p>
  );
}

function Waiting({ text, deadline }: { text: string; deadline: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-white">
      <p className="text-sm text-white/70">{text}</p>
      <Countdown deadline={deadline} />
    </div>
  );
}

interface ActionBarProps {
  state: RoomState;
  myPlayer: Player | null;
  onDeclareAction: (action: ActionType, targetPlayerId?: string) => Promise<void>;
  onChallengeAction: () => Promise<void>;
  onBlockAction: (character: Character) => Promise<void>;
  onChallengeBlock: () => Promise<void>;
  onChooseInfluence: (cardId: string) => Promise<void>;
  onResolveExchange: (cardIds: string[]) => Promise<void>;
}

export function ActionBar({
  state,
  myPlayer,
  onDeclareAction,
  onChallengeAction,
  onBlockAction,
  onChallengeBlock,
  onChooseInfluence,
  onResolveExchange,
}: ActionBarProps) {
  const [pendingTargetAction, setPendingTargetAction] = useState<ActionType | null>(null);
  const [busy, setBusy] = useState(false);
  const [keepIds, setKeepIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local target/keep picker whenever the server-driven phase moves on
    setPendingTargetAction(null);
    setKeepIds([]);
  }, [state.phase, state.turnNumber]);

  const isMyTurn = !!myPlayer && state.turnPlayerId === myPlayer.id;

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  if (!myPlayer) {
    return (
      <div className="mx-auto mt-6 max-w-md text-center text-sm text-white/50">
        You&apos;re spectating this game.
      </div>
    );
  }

  if (myPlayer.eliminated && state.status === "active") {
    return (
      <div className="mx-auto mt-6 max-w-md text-center text-sm text-white/50">
        You&apos;ve been eliminated. Keep watching to see who wins!
      </div>
    );
  }

  // --- Choosing an action (my turn) ---------------------------------------
  if (state.phase === "awaiting_action") {
    if (!isMyTurn) {
      const name = state.players.find((p) => p.id === state.turnPlayerId)?.name ?? "…";
      return <Waiting text={`Waiting for ${name}'s move…`} deadline={state.responseDeadline} />;
    }

    const mustCoup = myPlayer.coins >= 10;

    if (pendingTargetAction) {
      const targets = state.players.filter((p) => !p.eliminated && p.id !== myPlayer.id);
      return (
        <div className="mx-auto mt-6 flex w-full max-w-xl flex-col items-center gap-3">
          <Countdown deadline={state.responseDeadline} />
          <div className="flex items-center gap-2 text-white">
            <p className="text-sm font-medium">
              Choose a target for {ACTION_META[pendingTargetAction].label}
            </p>
            <button
              type="button"
              onClick={() => setPendingTargetAction(null)}
              className="cursor-pointer text-white/50 hover:text-white"
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
                  run(async () => {
                    await onDeclareAction(pendingTargetAction, t.id);
                    setPendingTargetAction(null);
                  })
                }
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor(t.name) }}
                >
                  {initials(t.name)}
                </span>
                <span className="text-sm font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto mt-6 flex w-full max-w-4xl flex-col items-center gap-3">
        <p className="text-sm text-white/70">Choose an action</p>
        <Countdown deadline={state.responseDeadline} />
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {ACTION_ORDER.map((action) => {
            const meta = ACTION_META[action];
            const Icon = meta.icon;
            const affordable = myPlayer.coins >= meta.cost;
            const locked = mustCoup ? action !== "coup" : !affordable;
            return (
              <button
                key={action}
                type="button"
                disabled={busy || locked}
                onClick={() =>
                  run(async () => {
                    if (meta.needsTarget) {
                      setPendingTargetAction(action);
                    } else {
                      await onDeclareAction(action);
                    }
                  })
                }
                className={`flex min-w-0 flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
                  action === "coup"
                    ? "border-primary/60 bg-primary/15 hover:bg-primary/25"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <Icon className={`h-6 w-6 ${meta.color}`} />
                <span className="wrap-break-word font-semibold text-white">{meta.label}</span>
                <span className="flex flex-col gap-0.5 wrap-break-word text-xs text-white/50">
                  {meta.description.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                {meta.blockedBy && (
                  <span className="wrap-break-word text-[11px] text-white/40">
                    Blocked by {meta.blockedBy}
                  </span>
                )}
                {action === "coup" && (
                  <span className="text-[11px] font-medium text-primary">Cannot be blocked</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-white/70">
          <CoinsIcon className="h-4 w-4 text-amber-300" />
          You have {myPlayer.coins} coins
        </p>
      </div>
    );
  }

  // --- Someone declared a challengeable / blockable action ----------------
  if (state.phase === "awaiting_response" && state.pendingAction) {
    const { pendingAction } = state;
    const meta = ACTION_META[pendingAction.type];
    const isActor = pendingAction.actorPlayerId === myPlayer.id;

    const canChallenge = meta.challengeable && !isActor;
    const blockOptions: Character[] =
      pendingAction.type === "foreign_aid" && !isActor
        ? ["duke"]
        : pendingAction.type === "assassinate" && pendingAction.targetPlayerId === myPlayer.id
          ? ["contessa"]
          : pendingAction.type === "steal" && pendingAction.targetPlayerId === myPlayer.id
            ? ["captain", "ambassador"]
            : [];

    if (!canChallenge && blockOptions.length === 0) {
      const actorName = state.players.find((p) => p.id === pendingAction.actorPlayerId)?.name ?? "…";
      return (
        <Waiting text={`Waiting to see if anyone responds to ${actorName}…`} deadline={state.responseDeadline} />
      );
    }

    return (
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-3">
        <Countdown deadline={state.responseDeadline} />
        <div className="flex flex-wrap justify-center gap-3">
          {canChallenge && (
            <Button variant="dark" disabled={busy} onClick={() => run(onChallengeAction)}>
              <SwordIcon className="h-4 w-4" />
              Challenge
            </Button>
          )}
          {blockOptions.map((character) => (
            <Button
              key={character}
              variant="ghost"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={busy}
              onClick={() => run(() => onBlockAction(character))}
            >
              <ShieldIcon className="h-4 w-4" />
              Block with {CHARACTER_META[character].label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // --- Someone blocked; anyone may challenge the block ---------------------
  if (state.phase === "awaiting_block_challenge" && state.pendingBlock) {
    const isBlocker = state.pendingBlock.blockerPlayerId === myPlayer.id;
    if (isBlocker) {
      return <Waiting text="Waiting to see if anyone challenges your block…" deadline={state.responseDeadline} />;
    }
    return (
      <div className="mx-auto mt-6 flex flex-col items-center gap-3">
        <Countdown deadline={state.responseDeadline} />
        <Button variant="dark" disabled={busy} onClick={() => run(onChallengeBlock)}>
          <SwordIcon className="h-4 w-4" />
          Challenge the Block
        </Button>
      </div>
    );
  }

  // --- Ambassador exchange: pick which cards to keep -----------------------
  if (state.phase === "awaiting_exchange_select" && state.pendingAction) {
    const isActor = state.pendingAction.actorPlayerId === myPlayer.id;
    if (!isActor) {
      const actorName = state.players.find((p) => p.id === state.pendingAction!.actorPlayerId)?.name ?? "…";
      return <Waiting text={`${actorName} is exchanging cards…`} deadline={state.responseDeadline} />;
    }

    const keepCount = myPlayer.influenceRemaining;
    return (
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-3">
        <p className="text-sm text-white/70">
          Choose {keepCount} card{keepCount === 1 ? "" : "s"} to keep
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {state.myHand.map((card) => {
            const selected = keepIds.includes(card.id);
            return (
              <PlayingCard
                key={card.id}
                character={card.character}
                revealed
                selected={selected}
                onClick={() =>
                  setKeepIds((ids) =>
                    selected
                      ? ids.filter((id) => id !== card.id)
                      : ids.length < keepCount
                        ? [...ids, card.id]
                        : ids,
                  )
                }
              />
            );
          })}
        </div>
        <Button
          variant="primary"
          disabled={busy || keepIds.length !== keepCount}
          onClick={() => run(() => onResolveExchange(keepIds))}
        >
          Confirm
        </Button>
      </div>
    );
  }

  // --- Someone must reveal an Influence -------------------------------------
  if (state.phase === "awaiting_influence_loss" && state.pendingLoss) {
    const isMe = state.pendingLoss.playerId === myPlayer.id;
    if (!isMe) {
      const name = state.players.find((p) => p.id === state.pendingLoss!.playerId)?.name ?? "A player";
      return <Waiting text={`${name} is choosing which Influence to reveal…`} deadline={state.responseDeadline} />;
    }
    return (
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-3">
        <p className="text-sm font-medium text-white">Choose an Influence to reveal</p>
        <div className="flex flex-wrap justify-center gap-2">
          {state.myHand.map((card) => (
            <PlayingCard
              key={card.id}
              character={card.character}
              revealed
              onClick={() => run(() => onChooseInfluence(card.id))}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
