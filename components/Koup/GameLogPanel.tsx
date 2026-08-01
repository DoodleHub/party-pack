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
  SpinnerIcon,
  SwordIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import { fetchChatMessages, sendChatMessage, subscribeToChat } from "@/components/Koup/data";
import { matchLogActor, useGameLog } from "@/components/Koup/useGameLog";
import type { ChatMessage, LogEvent, Player } from "@/components/Koup/types";

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
  | { id: string; createdAt: string; type: "log"; event: LogEvent }
  | { id: string; createdAt: string; type: "chat"; message: ChatMessage };

function mergeFeed(events: LogEvent[], messages: ChatMessage[]): FeedItem[] {
  const items: FeedItem[] = [
    ...events.map((event): FeedItem => ({ id: `log-${event.id}`, createdAt: event.createdAt, type: "log", event })),
    ...messages.map((message): FeedItem => ({
      id: `chat-${message.id}`,
      createdAt: message.createdAt,
      type: "chat",
      message,
    })),
  ];
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

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

function ChatMessageRow({ message, senderId }: { message: ChatMessage; senderId: string }) {
  if (message.userId === null) {
    return <p className="text-center text-xs italic text-panel-muted">{message.text}</p>;
  }

  return (
    <p className="text-sm wrap-break-word">
      <span
        className={`font-semibold ${message.userId === senderId ? "text-primary" : "text-panel-foreground"}`}
      >
        {message.name}:
      </span>{" "}
      <span className="text-panel-foreground/90">{message.text}</span>
    </p>
  );
}

function FeedItemRow({ item, players, senderId }: { item: FeedItem; players: Player[]; senderId: string }) {
  return item.type === "log" ? (
    <LogEntryRow event={item.event} players={players} />
  ) : (
    <ChatMessageRow message={item.message} senderId={senderId} />
  );
}

interface GameLogPanelProps {
  roomId: string;
  players: Player[];
  senderId: string;
  enableChat: boolean;
}

export function GameLogPanel({ roomId, players, senderId, enableChat }: GameLogPanelProps) {
  const events = useGameLog(roomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    if (!enableChat) return;
    let cancelled = false;
    fetchChatMessages(roomId).then((history) => {
      if (!cancelled) setMessages(history);
    });
    const unsubscribe = subscribeToChat(roomId, (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].slice(-200);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [roomId, enableChat]);

  const feed = mergeFeed(events, enableChat ? messages : []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [feed.length]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const list = e.currentTarget;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    setSending(true);
    await sendChatMessage(roomId, text);
    setSending(false);
  }

  const title = enableChat ? "Chat" : "Game Log";

  return (
    <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
      <h3 className="border-b-2 border-primary pb-2 text-sm font-semibold text-panel-foreground">{title}</h3>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="mt-3 flex h-72 flex-col gap-3 overflow-y-auto pr-1"
      >
        {feed.length === 0 ? (
          <p className="text-sm text-panel-muted">No events yet.</p>
        ) : (
          feed.slice(-30).map((item) => <FeedItemRow key={item.id} item={item} players={players} senderId={senderId} />)
        )}
      </div>

      {enableChat && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Say something…"
            className="h-9 min-w-0 flex-1 rounded-full border border-panel-foreground/10 bg-panel-hover px-4 text-sm text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
