import { HTMLAttributes } from "react";

type BadgeVariant = "primary" | "muted" | "outline" | "card" | "panel";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-tint text-primary",
  muted: "bg-surface-alt text-muted",
  outline: "border border-muted/30 text-ink",
  // Fixed light background, for use inside always-light surfaces (e.g. GameCard)
  // that don't flip in dark mode — bg-surface-alt/text-muted would mismatch there.
  card: "bg-card-hover text-card-muted",
  // Like `card`, but for use inside a bg-panel surface (which flips dark) —
  // see the token-family doc comment in app/globals.css.
  panel: "bg-panel-hover text-panel-muted",
};

export function Badge({ variant = "primary", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
