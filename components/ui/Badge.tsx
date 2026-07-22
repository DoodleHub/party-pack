import { HTMLAttributes } from "react";

type BadgeVariant = "primary" | "muted" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-tint text-primary",
  muted: "bg-surface-alt text-muted",
  outline: "border border-muted/30 text-ink",
};

export function Badge({ variant = "primary", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
