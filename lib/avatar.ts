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

export function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}
