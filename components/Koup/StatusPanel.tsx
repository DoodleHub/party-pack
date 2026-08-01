"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoIcon, ShieldIcon, SwordIcon } from "@/components/ui/Icon";
import { Countdown } from "@/components/Koup/Countdown";
import { ACTION_META, CHARACTER_META } from "@/components/Koup/characters";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { Character, Player, RoomState } from "@/components/Koup/types";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-panel-foreground shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">{children}</div>
    </div>
  );
}

function Waiting({ text, deadline }: { text: string; deadline: string | null }) {
  return (
    <>
      <p className="text-sm text-panel-muted">{text}</p>
      <Countdown deadline={deadline} />
    </>
  );
}

interface StatusPanelProps {
  state: RoomState;
  myPlayer: Player | null;
  onChallengeAction: () => Promise<void>;
  onBlockAction: (character: Character) => Promise<void>;
  onChallengeBlock: () => Promise<void>;
  onChooseInfluence: (cardId: string) => Promise<void>;
  onResolveExchange: (cardIds: string[]) => Promise<void>;
}

export function StatusPanel({
  state,
  myPlayer,
  onChallengeAction,
  onBlockAction,
  onChallengeBlock,
  onChooseInfluence,
  onResolveExchange,
}: StatusPanelProps) {
  // Tracks which specific button triggered the in-flight RPC, so only that
  // one shows a spinner instead of every button in the card going busy.
  const [busyAction, setBusyAction] = useState<string | null>(null);
  // "Let it pass" is a cosmetic local acknowledgment only — the round still resolves the
  // same way it does today (via the response timer, or someone else challenging/blocking).
  const [passed, setPassed] = useState(false);
  const [keepIds, setKeepIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local UI state whenever the server-driven phase moves on
    setPassed(false);
    setKeepIds([]);
    setBusyAction(null);
  }, [state.phase, state.turnNumber]);

  const busy = busyAction !== null;

  async function run(key: string, fn: () => Promise<void>) {
    setBusyAction(key);
    try {
      await fn();
    } finally {
      setBusyAction(null);
    }
  }

  function nameOf(id: string | null) {
    return state.players.find((p) => p.id === id)?.name ?? "…";
  }

  if (!myPlayer) {
    return (
      <Card>
        <p className="text-sm text-panel-muted">You&apos;re spectating this game.</p>
      </Card>
    );
  }

  if (myPlayer.eliminated) {
    return (
      <Card>
        <p className="text-sm text-panel-muted">You&apos;ve been eliminated. Keep watching to see who wins!</p>
      </Card>
    );
  }

  // --- My turn to choose (the grid below handles the actual choice) --------
  if (state.phase === "awaiting_action") {
    const isMyTurn = state.turnPlayerId === myPlayer.id;
    if (!isMyTurn) {
      return (
        <Card>
          <Waiting text={`Waiting for ${nameOf(state.turnPlayerId)}'s move…`} deadline={state.responseDeadline} />
        </Card>
      );
    }
    return (
      <Card>
        <p className="text-sm font-semibold text-primary">It&apos;s your turn!</p>
        <p className="text-sm text-panel-muted">Choose an action below.</p>
        <Countdown deadline={state.responseDeadline} />
      </Card>
    );
  }

  // --- Someone declared a challengeable / blockable action ------------------
  if (state.phase === "awaiting_response" && state.pendingAction) {
    const { pendingAction } = state;
    const meta = ACTION_META[pendingAction.type];
    const Icon = meta.icon;
    const isActor = pendingAction.actorPlayerId === myPlayer.id;
    const actorName = nameOf(pendingAction.actorPlayerId);
    const claimedLabel = pendingAction.claimedCharacter
      ? CHARACTER_META[pendingAction.claimedCharacter].label
      : null;
    const headline = claimedLabel ? `Claiming ${claimedLabel}` : meta.label;
    const subtitle = meta.effect ? `${meta.verb} (${meta.effect})` : meta.verb;

    const canChallenge = meta.challengeable && !isActor;
    const blockOptions: Character[] =
      pendingAction.type === "foreign_aid" && !isActor
        ? ["duke"]
        : pendingAction.type === "assassinate" && pendingAction.targetPlayerId === myPlayer.id
          ? ["contessa"]
          : pendingAction.type === "steal" && pendingAction.targetPlayerId === myPlayer.id
            ? ["captain", "ambassador"]
            : [];
    const canAct = (canChallenge || blockOptions.length > 0) && !passed;

    return (
      <Card>
        <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
          {actorName}&apos;s Action
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className={`h-6 w-6 ${meta.color}`} />
        </span>
        <h2 className="text-2xl font-bold text-panel-foreground">{headline}</h2>
        <p className="text-sm text-panel-muted">{subtitle}</p>

        <div className="my-1 h-px w-full max-w-xs bg-panel-foreground/10" />

        {canAct ? (
          <>
            <p className="text-sm text-panel-muted">No one has challenged yet.</p>
            <Countdown deadline={state.responseDeadline} />
            <div className="flex flex-wrap justify-center gap-3">
              {canChallenge && (
                <Button
                  variant="primary"
                  disabled={busy}
                  loading={busyAction === "challenge"}
                  onClick={() => run("challenge", onChallengeAction)}
                >
                  <SwordIcon className="h-4 w-4" />
                  Challenge
                </Button>
              )}
              {blockOptions.map((character) => (
                <Button
                  key={character}
                  variant="panel"
                  disabled={busy}
                  loading={busyAction === `block-${character}`}
                  onClick={() => run(`block-${character}`, () => onBlockAction(character))}
                >
                  <ShieldIcon className="h-4 w-4" />
                  Block with {CHARACTER_META[character].label}
                </Button>
              ))}
              <Button variant="panel" disabled={busy} onClick={() => setPassed(true)}>
                Let it pass
              </Button>
            </div>
            {canChallenge && claimedLabel && (
              <p className="flex items-center gap-1.5 text-xs text-panel-muted">
                <InfoIcon className="h-3.5 w-3.5" />
                You can challenge because {claimedLabel} can be challenged.
              </p>
            )}
          </>
        ) : (
          <Waiting
            text={
              passed
                ? "You chose to let it pass."
                : isActor
                  ? "Waiting to see if anyone responds…"
                  : `Waiting to see if anyone responds to ${actorName}…`
            }
            deadline={state.responseDeadline}
          />
        )}
      </Card>
    );
  }

  // --- Someone blocked; anyone may challenge the block -----------------------
  if (state.phase === "awaiting_block_challenge" && state.pendingBlock) {
    const { pendingBlock } = state;
    const meta = CHARACTER_META[pendingBlock.claimedCharacter];
    const Icon = meta.icon;
    const blockerName = nameOf(pendingBlock.blockerPlayerId);
    const isBlocker = pendingBlock.blockerPlayerId === myPlayer.id;
    const canAct = !isBlocker && !passed;

    return (
      <Card>
        <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
          {blockerName}&apos;s Block
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className={`h-6 w-6 ${meta.color}`} />
        </span>
        <h2 className="text-2xl font-bold text-panel-foreground">Blocking with {meta.label}</h2>

        <div className="my-1 h-px w-full max-w-xs bg-panel-foreground/10" />

        {canAct ? (
          <>
            <p className="text-sm text-panel-muted">No one has challenged the block yet.</p>
            <Countdown deadline={state.responseDeadline} />
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                disabled={busy}
                loading={busyAction === "challenge-block"}
                onClick={() => run("challenge-block", onChallengeBlock)}
              >
                <SwordIcon className="h-4 w-4" />
                Challenge the Block
              </Button>
              <Button variant="panel" disabled={busy} onClick={() => setPassed(true)}>
                Let it pass
              </Button>
            </div>
          </>
        ) : (
          <Waiting
            text={passed ? "You chose to let it pass." : "Waiting to see if anyone challenges your block…"}
            deadline={state.responseDeadline}
          />
        )}
      </Card>
    );
  }

  // --- Ambassador exchange: pick which cards to keep --------------------------
  if (state.phase === "awaiting_exchange_select" && state.pendingAction) {
    const isActor = state.pendingAction.actorPlayerId === myPlayer.id;
    if (!isActor) {
      return (
        <Card>
          <Waiting
            text={`${nameOf(state.pendingAction.actorPlayerId)} is exchanging cards…`}
            deadline={state.responseDeadline}
          />
        </Card>
      );
    }

    const keepCount = myPlayer.influenceRemaining;
    return (
      <Card>
        <p className="text-sm font-medium text-panel-foreground">
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
          loading={busyAction === "resolve-exchange"}
          onClick={() => run("resolve-exchange", () => onResolveExchange(keepIds))}
        >
          Confirm
        </Button>
      </Card>
    );
  }

  // --- Someone must reveal an Influence ---------------------------------------
  if (state.phase === "awaiting_influence_loss" && state.pendingLoss) {
    const isMe = state.pendingLoss.playerId === myPlayer.id;
    if (!isMe) {
      return (
        <Card>
          <Waiting
            text={`${nameOf(state.pendingLoss.playerId)} is choosing which Influence to reveal…`}
            deadline={state.responseDeadline}
          />
        </Card>
      );
    }
    return (
      <Card>
        <p className="text-sm font-medium text-panel-foreground">Choose an Influence to reveal</p>
        <div className="flex flex-wrap justify-center gap-2">
          {state.myHand.map((card) => (
            <PlayingCard
              key={card.id}
              character={card.character}
              revealed
              dim={busy}
              onClick={busy ? undefined : () => run(`reveal-${card.id}`, () => onChooseInfluence(card.id))}
            />
          ))}
        </div>
      </Card>
    );
  }

  return null;
}
