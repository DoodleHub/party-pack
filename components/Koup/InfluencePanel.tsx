import { CoinsIcon, EyeOffIcon } from "@/components/ui/Icon";
import { PlayingCard } from "@/components/Koup/PlayingCard";
import type { HandCard } from "@/components/Koup/types";

interface InfluencePanelProps {
  hand: HandCard[];
  coins: number;
  eliminated: boolean;
  isPlayer: boolean;
  // TV Mode on mobile: fold Influence + Coins into one compact row instead of
  // two full-size cards, since the side columns that normally give the
  // center column room are hidden. Unused above the sm breakpoint, where
  // there's already enough space for the regular two-card layout.
  compact?: boolean;
}

export function InfluencePanel({ hand, coins, eliminated, isPlayer, compact = false }: InfluencePanelProps) {
  if (!isPlayer) return null;

  return (
    <>
      {compact && (
        <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-panel-foreground/10 bg-panel p-4 text-panel-foreground shadow-sm sm:hidden">
          {eliminated ? (
            <p className="text-sm text-panel-muted">You&apos;ve been eliminated.</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {hand.map((card) => (
                  <PlayingCard key={card.id} character={card.character} revealed size="sm" />
                ))}
              </div>
              <span className="flex items-center gap-1.5 text-lg font-bold text-panel-foreground">
                <CoinsIcon className="h-5 w-5 text-amber-500" />
                {coins}
              </span>
            </>
          )}
        </div>
      )}

      <div className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] ${compact ? "hidden sm:grid" : ""}`}>
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
    </>
  );
}
