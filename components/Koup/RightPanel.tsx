"use client";

import { GameFeedPanel } from "@/components/Koup/GameFeedPanel";
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
  return (
    <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="flex h-96 flex-col rounded-2xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur-md">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-sm font-semibold text-primary">Game Log</h3>
        </div>

        <div className="mt-3 min-h-0 flex-1">
          <GameFeedPanel roomId={roomId} senderId={senderId} enableChat={enableChat} />
        </div>
      </div>

      <InfluencePanel hand={hand} eliminated={eliminated} isPlayer={isPlayer} />
    </div>
  );
}
