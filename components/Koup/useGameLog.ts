import { useEffect, useState } from "react";
import { fetchLogEvents, subscribeToLogEvents } from "@/components/Koup/data";
import type { LogEvent, Player } from "@/components/Koup/types";

export function useGameLog(roomId: string): LogEvent[] {
  const [events, setEvents] = useState<LogEvent[]>([]);

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

  return events;
}

// Log events are stored as flat text (e.g. "Noah claims Duke and takes Tax") rather than
// structured actor/description fields, so this is a best-effort match on a leading player
// name to attach an avatar — not a guaranteed parse.
export function matchLogActor(text: string, players: Player[]): Player | null {
  return players.find((p) => text.startsWith(p.name)) ?? null;
}
