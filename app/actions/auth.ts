"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error: string } | undefined;

// Only allow same-origin, relative redirect targets to avoid an open redirect.
function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export type SignupFormState = { error: string } | { confirmEmail: true } | undefined;

export async function signup(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = safeNext(formData.get("next"));

  if (!username || !email || !password) {
    return { error: "Please fill in your username, email, and password." };
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
    };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    return { error: "That username is already taken." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      data: { username },
    },
  });

  if (error) {
    // The database rejects duplicate usernames at insert time (see the
    // handle_new_user trigger), which surfaces here as a generic 5xx from
    // GoTrue rather than a readable message. The pre-check above catches
    // the common case; this is the fallback for the rare race condition.
    if (error.status && error.status >= 500) {
      return {
        error: "That username was just taken, or something went wrong. Please try again.",
      };
    }
    return { error: error.message };
  }

  if (data.session) {
    redirect(next);
  }

  return { confirmEmail: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
