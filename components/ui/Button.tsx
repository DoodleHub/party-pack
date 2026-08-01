import { ButtonHTMLAttributes } from "react";
import { SpinnerIcon } from "@/components/ui/Icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "panel" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Shows a spinner and disables the button — for the gap between a click
  // and its RPC round-trip resolving, since this app has no optimistic UI.
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-primary-tint text-primary hover:bg-primary hover:text-white",
  ghost:
    "bg-transparent text-ink border border-muted/30 hover:bg-surface-alt",
  outline:
    "bg-card text-card-foreground border border-card-foreground/10 hover:bg-card-hover",
  // Like `outline`, but for use inside a bg-panel surface (which flips dark) —
  // see the token-family doc comment in app/globals.css.
  panel:
    "bg-panel text-panel-foreground border border-panel-foreground/10 hover:bg-panel-hover",
  dark:
    "bg-solid text-white ring-1 ring-inset ring-white/10 hover:bg-solid-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <SpinnerIcon className="h-4 w-4 shrink-0 animate-spin" />}
      {children}
    </button>
  );
}
