"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's rendered width so charts can adapt their layout to the
 * space they actually have (a card column), not just the screen size.
 * Returns 0 until the first measurement.
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
