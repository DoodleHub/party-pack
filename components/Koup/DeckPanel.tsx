import { CardStackIcon } from "@/components/ui/Icon";

interface DeckPanelProps {
  deckCount: number;
  discardCount: number;
}

export function DeckPanel({ deckCount, discardCount }: DeckPanelProps) {
  return (
    <div className="flex w-full items-center gap-6 rounded-2xl border border-panel-foreground/10 bg-panel p-5 text-panel-foreground shadow-sm sm:gap-10">
      <div className="flex items-center gap-3">
        <CardStackIcon className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-panel-muted">Court Deck</p>
          <p className="text-lg font-bold text-panel-foreground">
            {deckCount} <span className="text-sm font-normal text-panel-muted">cards</span>
          </p>
        </div>
      </div>

      <div className="h-10 w-px bg-panel-foreground/10" />

      <div className="flex items-center gap-3">
        <CardStackIcon className="h-8 w-8 text-panel-muted" />
        <div>
          <p className="text-sm text-panel-muted">Discard Pile</p>
          <p className="text-lg font-bold text-panel-foreground">
            {discardCount} <span className="text-sm font-normal text-panel-muted">cards</span>
          </p>
        </div>
      </div>
    </div>
  );
}
