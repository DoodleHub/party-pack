"use client";

import { GameLogPanel } from "@/components/Koup/GameLogPanel";
import { QuickReferencePanel } from "@/components/Koup/QuickReferencePanel";
import type { Player } from "@/components/Koup/types";

interface RightPanelProps {
  roomId: string;
  players: Player[];
}

export function RightPanel({ roomId, players }: RightPanelProps) {
  return (
    <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <GameLogPanel roomId={roomId} players={players} />
      <QuickReferencePanel />
    </div>
  );
}
