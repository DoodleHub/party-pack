"use client";

import { SkullIcon, SpinnerIcon } from "@/components/ui/Icon";
import type { CardInfo, CardTeam } from "@/components/Codenames/types";

interface WordCardProps {
  card: CardInfo;
  // The key's team for this card's position — only known to the viewer when
  // they're an actual spymaster (RLS hides codenames_key rows otherwise).
  keyTeam: CardTeam | null;
  spymasterPreview: boolean;
  clickable: boolean;
  busy: boolean;
  onClick?: () => void;
}

const REVEALED_STYLES: Record<CardTeam, string> = {
  red: "bg-red-600 text-white",
  blue: "bg-blue-600 text-white",
  neutral: "bg-[#b9ad8f] text-[#2a2318]",
  assassin: "bg-[#151515] text-white",
};

const PREVIEW_STYLES: Record<CardTeam, string> = {
  red: "bg-red-500/25 border-red-400/70 text-white",
  blue: "bg-blue-500/25 border-blue-400/70 text-white",
  neutral: "bg-[#e8dcc0] border-[#c9bd9e] text-[#2a2318]",
  assassin: "bg-black border-white/50 text-white",
};

const UNKNOWN_STYLE = "bg-[#e8dcc0] border-[#d8caa4] text-[#2a2318] hover:bg-[#ddd0ac]";

export function WordCard({ card, keyTeam, spymasterPreview, clickable, busy, onClick }: WordCardProps) {
  const revealedStyle = card.revealed && card.revealedTeam ? REVEALED_STYLES[card.revealedTeam] : null;
  const previewStyle = !card.revealed && spymasterPreview && keyTeam ? PREVIEW_STYLES[keyTeam] : null;
  const style = revealedStyle ?? previewStyle ?? UNKNOWN_STYLE;
  const showSkull = (card.revealed && card.revealedTeam === "assassin") || (previewStyle !== null && keyTeam === "assassin");

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable || busy}
      className={`relative flex aspect-[3/2] w-full items-center justify-center gap-1.5 rounded-xl border px-2 text-center text-sm font-bold tracking-wide uppercase transition-colors sm:text-base ${style} ${
        clickable ? "cursor-pointer" : "cursor-default"
      } ${!card.revealed && !previewStyle ? "border-[#d8caa4]" : ""} disabled:cursor-not-allowed`}
    >
      {showSkull && <SkullIcon className="h-4 w-4 shrink-0 opacity-80" />}
      <span className="wrap-break-word">{card.word}</span>
      {busy && <SpinnerIcon className="absolute right-1.5 bottom-1.5 h-3.5 w-3.5 animate-spin opacity-70" />}
    </button>
  );
}
