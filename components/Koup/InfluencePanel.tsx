import { CoinsIcon, EyeOffIcon } from "@/components/ui/Icon";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { HandCard } from "@/components/Koup/types";

interface InfluencePanelProps {
  hand: HandCard[];
  coins: number;
  eliminated: boolean;
  isPlayer: boolean;
}

export function InfluencePanel({ hand, coins, eliminated, isPlayer }: InfluencePanelProps) {
  if (!isPlayer) return null;

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
      <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm">
        <h3 className="text-sm font-semibold text-panel-muted">Your Influence</h3>
        {eliminated ? (
          <p className="mt-3 text-sm text-panel-muted">You&apos;ve been eliminated.</p>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              {hand.map((card) => (
                <PlayingCard key={card.id} character={card.character} revealed size="lg" />
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-panel-muted">
              <EyeOffIcon className="h-3.5 w-3.5" />
              Keep them secret!
            </p>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm sm:min-w-40">
        <h3 className="text-sm font-semibold text-panel-muted">Your Coins</h3>
        <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-panel-foreground">
          <CoinsIcon className="h-6 w-6 text-amber-500" />
          {coins}
        </p>
      </div>
    </div>
  );
}
