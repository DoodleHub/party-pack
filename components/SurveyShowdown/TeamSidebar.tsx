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
  activePlayerId: string | null;
  onlineUserIds: Set<string>;
}

function TeamPanel({ team, active, activePlayerId, onlineUserIds }: TeamPanelProps) {
  const style = TEAM_STYLES[team.slot];

  return (
    <div
      className={`rounded-2xl border bg-black/50 p-5 backdrop-blur-md transition-shadow ${
        active ? "border-primary/60 shadow-[0_0_0_2px_var(--color-primary)]" : "border-white/10"
      }`}
    >
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white ${style.badge}`}
      >
        {style.label}
      </span>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-4xl font-extrabold text-white">{team.score}</p>
        <div className="flex items-center gap-1 pb-1" title={`${team.strikes} / 3 strikes`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                i < team.strikes ? "bg-red-500 text-white" : "bg-white/10 text-white/30"
              }`}
            >
              ✕
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {team.players.map((player) => {
          const isUp = player.id === activePlayerId;
          const online = !!player.userId && onlineUserIds.has(player.userId);
          return (
            <li key={player.id} className="flex items-center gap-3">
              <span className="relative shrink-0">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                    isUp ? "ring-2 ring-amber-400" : ""
                  }`}
                  style={{ backgroundColor: avatarColor(player.name) }}
                >
                  {initials(player.name)}
                </span>
                <span
                  title={online ? "Online" : "Offline"}
                  className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/50 ${
                    online ? "bg-emerald-400" : "bg-zinc-400"
                  }`}
                />
              </span>
              <span className={`text-sm ${isUp ? "font-semibold text-white" : "text-white/90"}`}>
                {player.name}
              </span>
              {isUp && <span className="text-xs font-semibold text-amber-400">Up now</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface TeamSidebarProps {
  teams: Team[];
  activeTeamSlot: 1 | 2;
  activePlayerId: string | null;
  onlineUserIds: Set<string>;
}

export function TeamSidebar({
  teams,
  activeTeamSlot,
  activePlayerId,
  onlineUserIds,
}: TeamSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      {teams.map((team) => (
        <TeamPanel
          key={team.id}
          team={team}
          active={team.slot === activeTeamSlot}
          activePlayerId={activePlayerId}
          onlineUserIds={onlineUserIds}
        />
      ))}
    </div>
  );
}
