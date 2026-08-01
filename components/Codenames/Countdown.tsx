"use client";

import { useEffect, useState } from "react";

function useCountdown(deadline: string | null) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!deadline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when there's no active deadline
      setRemainingMs(0);
      return;
    }
    const target = new Date(deadline).getTime();
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [deadline]);

  return remainingMs;
}

export function Countdown({ deadline }: { deadline: string | null }) {
  const remainingMs = useCountdown(deadline);
  if (!deadline) return null;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <p className={`text-2xl font-extrabold tabular-nums ${totalSeconds <= 10 ? "text-red-400" : "text-amber-400"}`}>
      {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`}
    </p>
  );
}
