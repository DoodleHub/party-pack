import type { Team } from "@/components/SurveyShowdown/types";

const AVATAR_COLORS = [
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#3b82f6",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

const TEAM_STYLES = {
  1: { badge: "bg-pink-600", label: "TEAM 1" },
  2: { badge: "bg-blue-600", label: "TEAM 2" },
} as const;

interface TeamPanelProps {
  team: Team;
  active: boolean;
  onSetActive: () => void;
}

function TeamPanel({ team, active, onSetActive }: TeamPanelProps) {
  const style = TEAM_STYLES[team.slot];

  return (
    <div
      className={`rounded-2xl border bg-black/50 p-5 backdrop-blur-md transition-shadow ${
        active ? "border-primary/60 shadow-[0_0_0_2px_var(--color-primary)]" : "border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={onSetActive}
        title="Set as team in control"
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${style.badge}`}
      >
        {style.label}
      </button>
      <p className="mt-3 text-4xl font-extrabold text-white">{team.score}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {team.players.map((player) => (
          <li key={player.id} className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: avatarColor(player.name) }}
            >
              {initials(player.name)}
            </span>
            <span className="text-sm text-white/90">{player.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TeamSidebarProps {
  teams: Team[];
  activeTeamSlot: 1 | 2;
  onSetActiveTeam: (slot: 1 | 2) => void;
}

export function TeamSidebar({ teams, activeTeamSlot, onSetActiveTeam }: TeamSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      {teams.map((team) => (
        <TeamPanel
          key={team.id}
          team={team}
          active={team.slot === activeTeamSlot}
          onSetActive={() => onSetActiveTeam(team.slot)}
        />
      ))}
    </div>
  );
}
