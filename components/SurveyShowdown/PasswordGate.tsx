"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/Icon";

interface PasswordGateProps {
  roomName: string;
  onSubmit: (password: string) => Promise<boolean>;
}

export function PasswordGate({ roomName, onSubmit }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit() {
    setChecking(true);
    setError(false);
    const ok = await onSubmit(password);
    setChecking(false);
    if (!ok) setError(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/50 p-8 text-center text-white backdrop-blur-md">
      <LockIcon className="h-8 w-8 text-primary" />
      <div>
        <h2 className="text-lg font-semibold">{roomName || "Private Room"}</h2>
        <p className="mt-1 text-sm text-white/60">This room is private. Enter the password to join.</p>
      </div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder="Room password"
        autoFocus
        className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
      />
      {error && <p className="text-sm text-red-400">Incorrect password. Try again.</p>}
      <Button variant="primary" className="w-full" onClick={handleSubmit} loading={checking}>
        Enter Room
      </Button>
    </div>
  );
}
