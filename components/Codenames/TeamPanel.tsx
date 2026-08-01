import { EyeIcon } from "@/components/ui/Icon";
import { avatarColor, initials } from "@/lib/avatar";
import type { Player, Team } from "@/components/Codenames/types";

const TEAM_STYLES: Record<Team, { border: string; badgeBg: string; label: string }> = {
  red: { border: "border-red-500/30", badgeBg: "bg-red-600", label: "RED TEAM" },
  blue: { border: "border-blue-500/30", badgeBg: "bg-blue-600", label: "BLUE TEAM" },
};

const AVATAR_STACK_LIMIT = 3;

interface TeamPanelProps {
  team: Team;
  players: Player[];
  remaining: number;
}

export function TeamPanel({ team, players, remaining }: TeamPanelProps) {
  const style = TEAM_STYLES[team];
  const spymaster = players.find((p) => p.role === "spymaster");
  const operatives = players.filter((p) => p.role === "operative");
  const shown = operatives.slice(0, AVATAR_STACK_LIMIT);
  const overflow = operatives.length - shown.length;

  return (
    <div className={`rounded-2xl border bg-black/50 p-5 text-white backdrop-blur-md ${style.border}`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${style.badgeBg}`}>
          {style.label}
        </span>
        <span className="text-right">
          <span className="block text-xl font-extrabold tabular-nums">{remaining}</span>
          <span className="block text-[10px] text-white/50">Agents Remaining</span>
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-white/50">Spymaster</p>
        {spymaster ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: avatarColor(spymaster.name) }}
            >
              {initials(spymaster.name)}
            </span>
            <span className="text-sm font-medium">{spymaster.name}</span>
            <EyeIcon className="h-3.5 w-3.5 text-white/50" />
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-white/40">None</p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-white/50">Operatives</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {operatives.length === 0 ? (
            <span className="text-sm text-white/40">None</span>
          ) : (
            <>
              {shown.map((p) => (
                <span
                  key={p.id}
                  title={p.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: avatarColor(p.name) }}
                >
                  {initials(p.name)}
                </span>
              ))}
              {overflow > 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                  +{overflow}
                </span>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
