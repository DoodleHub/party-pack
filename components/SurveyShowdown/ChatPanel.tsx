"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChatIcon } from "@/components/ui/Icon";
import { fetchChatMessages, sendChatMessage, subscribeToChat } from "@/components/SurveyShowdown/data";
import type { ChatMessage } from "@/components/SurveyShowdown/types";

interface ChatPanelProps {
  roomId: string;
  senderId: string;
}

export function ChatPanel({ roomId, senderId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Runs synchronously after the new message is painted into the (fixed-height,
  // scrollable) list, so the scroll jump happens before the user sees a flash
  // of the list stuck at its old position.
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendChatMessage(roomId, text);
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <ChatIcon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Chat</h3>
      </div>

      <div ref={listRef} className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {messages.length === 0 ? (
          <p className="text-white/40">No messages yet.</p>
        ) : (
          messages.map((m) =>
            m.userId === null ? (
              <p key={m.id} className="text-center text-xs italic text-white/50">
                {m.text}
              </p>
            ) : (
              <p key={m.id} className="wrap-break-word">
                <span
                  className={`font-semibold ${m.userId === senderId ? "text-primary" : "text-white/80"}`}
                >
                  {m.name}:
                </span>{" "}
                <span className="text-white/90">{m.text}</span>
              </p>
            ),
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
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
    </div>
  );
}
