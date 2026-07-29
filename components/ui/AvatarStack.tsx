import { avatarColor, initials } from "@/lib/avatar";

interface AvatarStackProps {
  names: string[];
  max?: number;
}

export function AvatarStack({ names, max = 5 }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <span
          key={`${name}-${i}`}
          title={name}
          style={{ backgroundColor: avatarColor(name) }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-card"
        >
          {initials(name)}
        </span>
      ))}
      {overflow > 0 && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-hover text-xs font-semibold text-card-muted ring-2 ring-card">
          +{overflow}
        </span>
      )}
    </div>
  );
}
