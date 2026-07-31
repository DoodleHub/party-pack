"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/Koup/ChatPanel";
import { GameLogPanel } from "@/components/Koup/GameLogPanel";
import { InfluencePanel } from "@/components/Koup/InfluencePanel";
import type { HandCard } from "@/components/Koup/types";

interface RightPanelProps {
  roomId: string;
  senderId: string;
  enableChat: boolean;
  hand: HandCard[];
  eliminated: boolean;
  isPlayer: boolean;
}

export function RightPanel({ roomId, senderId, enableChat, hand, eliminated, isPlayer }: RightPanelProps) {
  const [tab, setTab] = useState<"log" | "chat">("log");

  return (
    <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="flex h-96 flex-col rounded-2xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur-md">
        {enableChat ? (
          <div className="flex items-center gap-4 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setTab("log")}
              className={`cursor-pointer text-sm font-semibold transition-colors ${
                tab === "log" ? "text-primary" : "text-white/50 hover:text-white"
              }`}
            >
              Game Log
            </button>
            <button
              type="button"
              onClick={() => setTab("chat")}
              className={`cursor-pointer text-sm font-semibold transition-colors ${
                tab === "chat" ? "text-primary" : "text-white/50 hover:text-white"
              }`}
            >
              Chat
            </button>
          </div>
        ) : (
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-primary">Game Log</h3>
          </div>
        )}

        <div className="mt-3 min-h-0 flex-1">
          {tab === "log" || !enableChat ? (
            <GameLogPanel roomId={roomId} />
          ) : (
            <ChatPanel roomId={roomId} senderId={senderId} />
          )}
        </div>
      </div>

      <InfluencePanel hand={hand} eliminated={eliminated} isPlayer={isPlayer} />
    </div>
  );
}
