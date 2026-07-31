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
import {
  fetchChatMessages,
  fetchLogEvents,
  sendChatMessage,
  subscribeToChat,
  subscribeToLogEvents,
} from "@/components/Koup/data";
import type { ChatMessage, LogEvent } from "@/components/Koup/types";

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

type FeedItem =
  | ({ feedType: "log" } & LogEvent)
  | ({ feedType: "chat" } & ChatMessage);

function mergeSorted(items: FeedItem[]): FeedItem[] {
  return [...items]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-200);
}

interface GameFeedPanelProps {
  roomId: string;
  senderId: string;
  enableChat: boolean;
}

export function GameFeedPanel({ roomId, senderId, enableChat }: GameFeedPanelProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchLogEvents(roomId),
      enableChat ? fetchChatMessages(roomId) : Promise.resolve([]),
    ]).then(([logHistory, chatHistory]) => {
      if (cancelled) return;
      setItems(
        mergeSorted([
          ...logHistory.map((event): FeedItem => ({ feedType: "log", ...event })),
          ...chatHistory.map((message): FeedItem => ({ feedType: "chat", ...message })),
        ]),
      );
    });

    function appendItem(item: FeedItem) {
      setItems((prev) => {
        if (prev.some((existing) => existing.feedType === item.feedType && existing.id === item.id)) {
          return prev;
        }
        return mergeSorted([...prev, item]);
      });
    }

    const unsubscribeLog = subscribeToLogEvents(roomId, (event) =>
      appendItem({ feedType: "log", ...event }),
    );
    const unsubscribeChat = enableChat
      ? subscribeToChat(roomId, (message) => appendItem({ feedType: "chat", ...message }))
      : undefined;

    return () => {
      cancelled = true;
      unsubscribeLog();
      unsubscribeChat?.();
    };
  }, [roomId, enableChat]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [items]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const list = e.currentTarget;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendChatMessage(roomId, text);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1 text-sm"
      >
        {items.length === 0 ? (
          <p className="text-white/40">No activity yet.</p>
        ) : (
          items.map((item) =>
            item.feedType === "log" ? (
              <p key={`log-${item.id}`} className="flex items-start gap-2 text-white/85">
                {(() => {
                  const Icon = KIND_ICON[item.kind] ?? CrownIcon;
                  return <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />;
                })()}
                <span className="wrap-break-word">{item.text}</span>
              </p>
            ) : item.userId === null ? (
              <p key={`chat-${item.id}`} className="text-center text-xs italic text-white/50">
                {item.text}
              </p>
            ) : (
              <p key={`chat-${item.id}`} className="wrap-break-word">
                <span
                  className={`font-semibold ${item.userId === senderId ? "text-primary" : "text-white/80"}`}
                >
                  {item.name}:
                </span>{" "}
                <span className="text-white/90">{item.text}</span>
              </p>
            ),
          )
        )}
      </div>

      {enableChat && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Say something…"
            className="h-9 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
