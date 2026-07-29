"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { AlertTriangleIcon, LockIcon, MailIcon } from "@/components/ui/Icon";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

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
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card pl-11 pr-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing In…" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-card-muted">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
