"use client";

import { useEffect, useRef, useState } from "react";

// Grid/flex "auto" tracks size themselves off each item's own intrinsic content
// height, so a chat panel with unbounded message history would inflate its own
// row/track to fit all its content instead of being clipped. Measuring a
// sibling directly and applying its height as an explicit pixel value sidesteps
// that entirely.
export function useMatchHeight<T extends HTMLElement>() {
  const sourceRef = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [sourceRef, height] as const;
}
