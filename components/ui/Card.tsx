import { HTMLAttributes } from "react";

type CardTone = "surface" | "alt" | "tint";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  surface: "bg-surface",
  alt: "bg-surface-alt",
  tint: "bg-primary-tint",
};

export function Card({ tone = "surface", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-ink/5 p-6 shadow-sm ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
