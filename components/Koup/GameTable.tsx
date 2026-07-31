import { CoinsIcon, CrownIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { ACTION_META, CHARACTER_META } from "@/components/Koup/characters";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { Player, RoomState } from "@/components/Koup/types";

interface GameTableProps {
  state: RoomState;
  myPlayerId: string | null;
  onlineUserIds: Set<string>;
}

function describeCenterBanner(state: RoomState, nameById: Map<string, string>) {
  const { phase, pendingAction, pendingBlock, pendingLoss } = state;

  if (phase === "awaiting_influence_loss" && pendingLoss) {
    const name = nameById.get(pendingLoss.playerId) ?? "A player";
    return { title: `${name} must choose`, body: "Losing an Influence…", icon: CrownIcon };
  }

  if (phase === "awaiting_block_challenge" && pendingBlock) {
    const blocker = nameById.get(pendingBlock.blockerPlayerId) ?? "A player";
    const meta = CHARACTER_META[pendingBlock.claimedCharacter];
    return {
      title: `${blocker}'s Block`,
      body: `Claiming ${meta.label}`,
      icon: meta.icon,
    };
  }

  if (pendingAction) {
    const actor = nameById.get(pendingAction.actorPlayerId) ?? "A player";
    const meta = ACTION_META[pendingAction.type];
    const target = pendingAction.targetPlayerId ? nameById.get(pendingAction.targetPlayerId) : null;

    if (phase === "awaiting_exchange_select") {
      return { title: `${actor}'s Action`, body: "Exchanging cards…", icon: meta.icon };
    }

    // Foreign Aid claims nothing — claimedCharacter there only names which
    // character a block would need, not something the actor is claiming.
    const body =
      pendingAction.claimedCharacter && pendingAction.type !== "foreign_aid"
        ? `Claiming ${CHARACTER_META[pendingAction.claimedCharacter].label}`
        : meta.label + (target ? ` — ${target}` : "");

    return { title: `${actor}'s Action`, body, icon: meta.icon };
  }

  return null;
}

function seatAngles(count: number) {
  // Spread seats evenly around an ellipse, starting at the top (-90deg) and
  // going clockwise — seat 0 (the viewer, when seated) always lands at top.
  return Array.from({ length: count }, (_, i) => -90 + (360 / count) * i);
}

function Seat({
  player,
  isTurn,
  isMe,
  online,
}: {
  player: Player;
  isTurn: boolean;
  isMe: boolean;
  online: boolean;
}) {
  const slots = [
    ...player.revealedCards.map((c) => ({ character: c, revealed: true })),
    ...Array.from({ length: player.influenceRemaining }, () => ({ character: null, revealed: false })),
  ];

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${player.eliminated ? "opacity-50 grayscale" : ""}`}
    >
      <div className="flex items-center gap-1">
        {slots.map((slot, i) => (
          <PlayingCard key={i} character={slot.character} revealed={slot.revealed} size="sm" />
        ))}
      </div>
      <div className="relative">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white ring-3 ring-offset-2 ring-offset-[#150c2e] ${
            isTurn ? "ring-primary" : isMe ? "ring-white/70" : "ring-transparent"
          }`}
          style={{ backgroundColor: avatarColor(player.name) }}
        >
          {initials(player.name)}
        </span>
        <span
          title={online ? "Online" : "Offline"}
          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-[#150c2e] ${
            online ? "bg-emerald-400" : "bg-zinc-400"
          }`}
        />
      </div>
      <p className="max-w-20 truncate text-sm font-semibold text-white">
        {player.name}
        {isMe && <span className="text-white/50"> (You)</span>}
      </p>
      <p className="flex items-center gap-1 text-xs font-semibold text-amber-300">
        <CoinsIcon className="h-3.5 w-3.5" />
        {player.coins}
      </p>
    </div>
  );
}

export function GameTable({ state, myPlayerId, onlineUserIds }: GameTableProps) {
  const players = state.players;
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  // Rotate seating so the viewer's seat lands at the top; spectators just see
  // the table in its natural turn order.
  const myIndex = myPlayerId ? players.findIndex((p) => p.id === myPlayerId) : -1;
  const ordered =
    myIndex >= 0 ? [...players.slice(myIndex), ...players.slice(0, myIndex)] : players;
  const angles = seatAngles(ordered.length);

  const banner = describeCenterBanner(state, nameById);
  const BannerIcon = banner?.icon;

  const rx = 42;
  const ry = 38;

  return (
    // Seats (cards + avatar + name) have a fixed pixel height, but this
    // box's height is width-driven (aspect-ratio), so seats always overflow
    // its top/bottom edge by some amount — worse on narrow widths, but never
    // fully zero even at max-w-3xl. This padding stays at every breakpoint
    // (including the lg 3-column layout, whose middle column can be just as
    // narrow as mobile — e.g. iPad Pro's ~350px) so the overflow lands in
    // blank space instead of the sidebar/status message stacked around it.
    <div className="mx-auto w-full max-w-3xl py-16">
      <div className="relative aspect-16/10 w-full">
        <div className="absolute inset-[6%] rounded-[50%] border-4 border-[#5a3f8a]/50 bg-linear-to-b from-[#3a2657] to-[#241539] shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />

        {banner && BannerIcon && (
          <div className="absolute top-1/2 left-1/2 flex w-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-center text-white backdrop-blur-md">
            <p className="text-xs font-medium text-primary">{banner.title}</p>
            <p className="flex items-center gap-1.5 text-base font-bold">
              <BannerIcon className="h-4 w-4 shrink-0" />
              {banner.body}
            </p>
          </div>
        )}

        {ordered.map((player, i) => {
          const angle = (angles[i] * Math.PI) / 180;
          const left = 50 + rx * Math.cos(angle);
          const top = 50 + ry * Math.sin(angle);
          return (
            <div
              key={player.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <Seat
                player={player}
                isTurn={player.id === state.turnPlayerId}
                isMe={player.id === myPlayerId}
                online={onlineUserIds.has(player.userId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
