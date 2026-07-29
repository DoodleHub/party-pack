"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { AlertTriangleIcon, CheckIcon, LockIcon, MailIcon, UserIcon } from "@/components/ui/Icon";

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signup, undefined);
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  if (state && "confirmEmail" in state) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 p-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="font-medium text-card-foreground">Check your email</p>
        <p className="text-sm text-card-muted">
          We sent you a confirmation link. Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-card-foreground">
          Username
        </label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-card-muted" />
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            placeholder="e.g. party_champ"
            className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card pl-11 pr-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
          />
        </div>
        <p className="text-xs text-card-muted">
          3-20 characters. Letters, numbers, and underscores only.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-card-foreground">
          Email
        </label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-card-muted" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card pl-11 pr-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-card-foreground">
          Password
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-card-muted" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card pl-11 pr-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-card-muted" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card pl-11 pr-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full">
        {pending ? "Creating Account…" : "Create Account"}
      </Button>

      <p className="text-center text-sm text-card-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
