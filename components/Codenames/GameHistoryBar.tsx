import { CheckIcon, CloseIcon, SkullIcon } from "@/components/ui/Icon";
import type { LogEvent } from "@/components/Codenames/types";

interface ClueGroup {
  key: string;
  clueGiverAndText: string;
  guesses: { text: string; kind: string }[];
}

// Groups the log feed structurally by event kind (not by string-matching): a
// "clue" event starts a new group, and subsequent "guess_*" events belong to
// it until the next "clue" or "turn" event ends the turn.
function groupHistory(events: LogEvent[]): ClueGroup[] {
  const groups: ClueGroup[] = [];
  let current: ClueGroup | null = null;

  for (const event of events) {
    if (event.kind === "clue") {
      current = { key: event.id, clueGiverAndText: event.text, guesses: [] };
      groups.push(current);
    } else if (event.kind.startsWith("guess_") && current) {
      current.guesses.push({ text: event.text, kind: event.kind });
    } else if (event.kind === "turn") {
      current = null;
    }
  }

  return groups;
}

function extractGuessWord(text: string): string {
  const match = text.match(/guesses (.+?) — /);
  return match ? match[1] : text;
}

function extractClueLabel(text: string): { giver: string; label: string } {
  const match = text.match(/^(.+?) gives the clue: (.+)$/);
  if (!match) return { giver: "", label: text };
  return { giver: match[1], label: match[2] };
}

const GUESS_ICON: Record<string, { icon: typeof CheckIcon; color: string }> = {
  guess_own: { icon: CheckIcon, color: "text-emerald-400" },
  guess_opponent: { icon: CloseIcon, color: "text-red-400" },
  guess_neutral: { icon: CloseIcon, color: "text-white/40" },
  guess_assassin: { icon: SkullIcon, color: "text-white" },
};

export function GameHistoryBar({ events }: { events: LogEvent[] }) {
  const groups = groupHistory(events).slice(-8);

  if (groups.length === 0) return null;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur-md">
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-white/50 uppercase">Game History</h3>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {groups.map((group) => {
          const { giver, label } = extractClueLabel(group.clueGiverAndText);
          return (
            <div key={group.key} className="flex shrink-0 items-center gap-2 text-sm">
              {giver && <span className="font-semibold text-primary">{giver}</span>}
              <span className="font-medium">{label}</span>
              {group.guesses.map((g, i) => {
                const meta = GUESS_ICON[g.kind];
                const Icon = meta?.icon ?? CheckIcon;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs"
                  >
                    <Icon className={`h-3 w-3 ${meta?.color ?? "text-white/60"}`} />
                    {extractGuessWord(g.text)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
