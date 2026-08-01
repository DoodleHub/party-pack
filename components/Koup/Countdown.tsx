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
  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <p className={`text-2xl font-extrabold tabular-nums ${seconds <= 3 ? "text-red-600" : "text-amber-600"}`}>
      {seconds}s
    </p>
  );
}
