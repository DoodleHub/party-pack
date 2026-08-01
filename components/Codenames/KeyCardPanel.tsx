import { SkullIcon } from "@/components/ui/Icon";
import type { KeyEntry } from "@/components/Codenames/types";

const SWATCH: Record<KeyEntry["team"], string> = {
  red: "bg-red-600",
  blue: "bg-blue-600",
  neutral: "bg-[#b9ad8f]",
  assassin: "bg-[#151515]",
};

export function KeyCardPanel({ keyEntries }: { keyEntries: KeyEntry[] }) {
  if (keyEntries.length === 0) return null;

  const byPosition = new Map(keyEntries.map((k) => [k.position, k.team]));
  const redCount = keyEntries.filter((k) => k.team === "red").length;
  const blueCount = keyEntries.filter((k) => k.team === "blue").length;
  const neutralCount = keyEntries.filter((k) => k.team === "neutral").length;
  const assassinCount = keyEntries.filter((k) => k.team === "assassin").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Key Card</h3>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1">
        {Array.from({ length: 25 }, (_, i) => {
          const team = byPosition.get(i);
          return (
            <span
              key={i}
              className={`flex aspect-square items-center justify-center rounded-sm ${team ? SWATCH[team] : "bg-white/10"}`}
            >
              {team === "assassin" && <SkullIcon className="h-3 w-3 text-white" />}
            </span>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-col gap-1.5 text-xs text-white/70">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          {redCount} Red Agents
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          {blueCount} Blue Agents
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#b9ad8f]" />
          {neutralCount} Neutral
        </li>
        <li className="flex items-center gap-2">
          <SkullIcon className="h-3 w-3 text-white" />
          {assassinCount} Assassin
        </li>
      </ul>
    </div>
  );
}
