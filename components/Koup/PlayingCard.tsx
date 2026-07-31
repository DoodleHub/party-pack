import { CrownIcon } from "@/components/ui/Icon";
import { CHARACTER_META } from "@/components/Koup/characters";
import type { Character } from "@/components/Koup/types";

type CardSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: "h-14 w-10",
  md: "h-20 w-14",
  lg: "h-28 w-20",
};

const ICON_SIZE: Record<CardSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

interface PlayingCardProps {
  character?: Character | null;
  revealed?: boolean;
  size?: CardSize;
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PlayingCard({
  character,
  revealed = false,
  size = "md",
  selected = false,
  dim = false,
  onClick,
  className = "",
}: PlayingCardProps) {
  const isFaceUp = revealed && !!character;
  const meta = character ? CHARACTER_META[character] : null;
  const Icon = meta?.icon ?? CrownIcon;

  const base = `relative flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 shadow-md transition-transform ${SIZE_CLASSES[size]}`;
  const interactive = onClick ? "cursor-pointer hover:-translate-y-1" : "";
  const dimmed = dim ? "opacity-40 grayscale" : "";
  const selectedRing = selected ? "ring-2 ring-offset-2 ring-offset-[#150c2e] ring-primary" : "";

  if (isFaceUp) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`${base} ${meta!.bg} border-current ${meta!.color} ${interactive} ${dimmed} ${selectedRing} ${className}`}
      >
        <Icon className={ICON_SIZE[size]} />
        {size !== "sm" && (
          <span className="px-1 text-center text-[9px] leading-tight font-bold tracking-wide uppercase opacity-90">
            {meta!.label}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${base} border-amber-400/50 bg-linear-to-b from-[#4a3466] to-[#2c1c47] ${interactive} ${dimmed} ${selectedRing} ${className}`}
    >
      <CrownIcon className={`${ICON_SIZE[size]} text-amber-300/70`} />
    </button>
  );
}
