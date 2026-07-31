"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function HeaderAuth({ fullWidth = false }: { fullWidth?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) {
    return <div className={fullWidth ? "h-10 w-full" : "h-10 w-40"} />;
  }

  if (user) {
    return (
      <div
        className={
          fullWidth
            ? "flex w-full flex-col gap-2"
            : "flex items-center gap-3"
        }
      >
        <span
          className={
            fullWidth
              ? "truncate text-sm font-medium text-ink/80"
              : "max-w-40 truncate text-sm font-medium text-ink/80"
          }
        >
          {(user.user_metadata?.username as string | undefined) ?? user.email}
        </span>
        <form action={logout} className={fullWidth ? "w-full" : undefined}>
          <Button
            type="submit"
            variant={fullWidth ? "ghost" : "dark"}
            className={fullWidth ? "w-full" : undefined}
          >
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div
      className={
        fullWidth ? "flex w-full flex-col gap-2" : "flex items-center gap-2"
      }
    >
      <Link href="/signup" className={fullWidth ? "block w-full" : undefined}>
        <Button variant="ghost" className={fullWidth ? "w-full" : undefined}>
          Sign Up
        </Button>
      </Link>
      <Link href="/login" className={fullWidth ? "block w-full" : undefined}>
        <Button variant="dark" className={fullWidth ? "w-full" : undefined}>
          Sign In
        </Button>
      </Link>
    </div>
  );
}
