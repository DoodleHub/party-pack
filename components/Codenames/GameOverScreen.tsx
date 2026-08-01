import { TrophyIcon } from "@/components/ui/Icon";
import { ChatPanel } from "@/components/Codenames/ChatPanel";
import { WordGrid } from "@/components/Codenames/WordGrid";
import type { RoomState } from "@/components/Codenames/types";

const TEAM_TEXT: Record<"red" | "blue", string> = {
  red: "text-red-400",
  blue: "text-blue-400",
};

export function GameOverScreen({ state, senderId }: { state: RoomState; senderId: string }) {
  const winner = state.winnerTeam;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 lg:flex-row">
      <div className="flex w-full flex-1 flex-col items-center gap-6 rounded-2xl border border-white/10 bg-black/50 p-8 text-center text-white backdrop-blur-md">
        <TrophyIcon className="h-10 w-10 text-amber-400" />
        <div>
          <h1 className="text-3xl font-extrabold">Game Over</h1>
          <p className={`mt-2 text-lg font-semibold ${winner ? TEAM_TEXT[winner] : "text-white/70"}`}>
            {winner ? `${winner === "red" ? "Red" : "Blue"} team wins!` : "The room has cleared."}
          </p>
        </div>

        <div className="w-full">
          <WordGrid
            cards={state.cards}
            keyEntries={state.key}
            spymasterPreview
            canGuess={false}
            guessingCardId={null}
            onGuess={() => {}}
          />
        </div>
      </div>

      {state.enableChat && (
        <div className="h-96 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md lg:w-80">
          <ChatPanel roomId={state.roomId} senderId={senderId} />
        </div>
      )}
    </div>
  );
}
