"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRightIcon, SpinnerIcon } from "@/components/ui/Icon";
import { fetchChatMessages, sendChatMessage, subscribeToChat } from "@/components/Yakuza/data";
import type { ChatMessage } from "@/components/Yakuza/types";

interface ChatPanelProps {
  roomId: string;
  senderId: string;
}

export function ChatPanel({ roomId, senderId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
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
  }, [roomId]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  function handleListScroll(e: React.UIEvent<HTMLDivElement>) {
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm"
      >
        {messages.length === 0 ? (
          <p className="text-panel-muted">No messages yet.</p>
        ) : (
          messages.map((m) =>
            m.userId === null ? (
              <p key={m.id} className="text-center text-xs italic text-panel-muted">
                {m.text}
              </p>
            ) : (
              <p key={m.id} className="wrap-break-word">
                <span
                  className={`font-semibold ${m.userId === senderId ? "text-primary" : "text-panel-foreground"}`}
                >
                  {m.name}:
                </span>{" "}
                <span className="text-panel-foreground/90">{m.text}</span>
              </p>
            ),
          )
        )}
      </div>

      <div className="flex items-center gap-2">
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
    </div>
  );
}
