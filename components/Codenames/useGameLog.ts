import { useEffect, useState } from "react";
import { fetchLogEvents, subscribeToLogEvents } from "@/components/Codenames/data";
import type { LogEvent } from "@/components/Codenames/types";

export function useGameLog(roomId: string): LogEvent[] {
  const [events, setEvents] = useState<LogEvent[]>([]);

  useEffect(() => {
    if (!roomId) return;
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
