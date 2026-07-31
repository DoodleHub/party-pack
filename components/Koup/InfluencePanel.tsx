import { EyeOffIcon } from "@/components/ui/Icon";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { HandCard } from "@/components/Koup/types";

interface InfluencePanelProps {
  hand: HandCard[];
  eliminated: boolean;
  isPlayer: boolean;
}

export function InfluencePanel({ hand, eliminated, isPlayer }: InfluencePanelProps) {
  if (!isPlayer) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
      <h3 className="text-sm font-semibold text-white/70">Your Influence</h3>
      {eliminated ? (
        <p className="mt-3 text-sm text-white/50">You&apos;ve been eliminated.</p>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            {hand.map((card) => (
              <PlayingCard key={card.id} character={card.character} revealed size="lg" />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
            <EyeOffIcon className="h-3.5 w-3.5" />
            Keep them secret!
          </p>
        </>
      )}
    </div>
  );
}
