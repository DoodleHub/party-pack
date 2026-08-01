"use client";

import { GameLogPanel } from "@/components/Koup/GameLogPanel";
import { QuickReferencePanel } from "@/components/Koup/QuickReferencePanel";
import type { Player } from "@/components/Koup/types";

interface RightPanelProps {
  roomId: string;
  players: Player[];
  senderId: string;
  enableChat: boolean;
}

export function RightPanel({ roomId, players, senderId, enableChat }: RightPanelProps) {
  return (
    <div className="flex w-full flex-col gap-4 xl:w-72 xl:shrink-0">
      <GameLogPanel roomId={roomId} players={players} senderId={senderId} enableChat={enableChat} />
      <QuickReferencePanel />
    </div>
  );
}
