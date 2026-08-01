"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CloseIcon,
  CoinsIcon,
  CrownIcon,
  EyeIcon,
  ShieldIcon,
  SwordIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { matchLogActor, useGameLog } from "@/components/Koup/useGameLog";
import type { LogEvent, Player } from "@/components/Koup/types";

const KIND_ICON: Record<string, typeof CrownIcon> = {
  income: CoinsIcon,
  action: CrownIcon,
  coup: SwordIcon,
  success: CoinsIcon,
  challenge: SwordIcon,
  block: ShieldIcon,
  blocked: CloseIcon,
  reveal: EyeIcon,
  elimination: AlertTriangleIcon,
  winner: TrophyIcon,
  join: UserIcon,
  leave: ArrowRightIcon,
  host: CrownIcon,
  disconnect: AlertTriangleIcon,
  reconnect: ArrowRightIcon,
  turn: ArrowRightIcon,
  system: CrownIcon,
};

function LogEntryRow({ event, players }: { event: LogEvent; players: Player[] }) {
  const actor = matchLogActor(event.text, players);
  const Icon = KIND_ICON[event.kind] ?? CrownIcon;

  if (!actor) {
    return (
      <div className="flex items-center gap-2 text-xs text-panel-muted italic">
        <Icon className="h-3.5 w-3.5 shrink-0 text-panel-muted" />
        <span className="wrap-break-word">{event.text}</span>
      </div>
    );
  }

  const rest = event.text.slice(actor.name.length).trim();

  return (
    <div className="flex items-start gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: avatarColor(actor.name) }}
      >
        {initials(actor.name)}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <span className="font-semibold text-panel-foreground">{actor.name}</span>{" "}
        <span className="wrap-break-word text-panel-muted">{rest}</span>
      </div>
      <Icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
    </div>
  );
}

export function GameLogPanel({ roomId, players }: { roomId: string; players: Player[] }) {
  const events = useGameLog(roomId);
  const [modalOpen, setModalOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [events]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const list = e.currentTarget;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
  }

  return (
    <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <h3 className="border-b-2 border-primary pb-2 text-sm font-semibold text-panel-foreground">
        Game Log
      </h3>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="mt-3 flex h-72 flex-col gap-3 overflow-y-auto pr-1"
      >
        {events.length === 0 ? (
          <p className="text-sm text-panel-muted">No events yet.</p>
        ) : (
          events.slice(-30).map((event) => <LogEntryRow key={event.id} event={event} players={players} />)
        )}
      </div>

      <Button
        variant="panel"
        className="mt-4 w-full"
        onClick={() => setModalOpen(true)}
        disabled={events.length === 0}
      >
        See Full Log
      </Button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-panel-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Full Game Log</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="cursor-pointer rounded-full p-1 text-panel-muted hover:bg-panel-hover hover:text-panel-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3 overflow-y-auto">
              {events.map((event) => (
                <LogEntryRow key={event.id} event={event} players={players} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
