"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { fetchLogEvents, subscribeToLogEvents } from "@/components/Koup/data";
import type { LogEvent } from "@/components/Koup/types";

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

export function GameLogPanel({ roomId }: { roomId: string }) {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    fetchLogEvents(roomId).then((history) => {
      if (!cancelled) setEvents(history);
    });
    const unsubscribe = subscribeToLogEvents(roomId, (event) => {
      setEvents((prev) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [...prev, event].slice(-200);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [roomId]);

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
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1 text-sm"
    >
      {events.length === 0 ? (
        <p className="text-white/40">No events yet.</p>
      ) : (
        events.map((event) => {
          const Icon = KIND_ICON[event.kind] ?? CrownIcon;
          return (
            <p key={event.id} className="flex items-start gap-2 text-white/85">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="wrap-break-word">{event.text}</span>
            </p>
          );
        })
      )}
    </div>
  );
}
