"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a CSS media query currently matches, kept up to date as it changes.
 *
 * The server cannot know, so it renders as if the query does not match, and so
 * does the browser's first (hydration) render. React then re-renders with the
 * real value. Reading the query straight away instead would make the first
 * browser render differ from the server HTML, which React reports as a
 * hydration error and recovers from by throwing the server HTML away.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Whether the visitor asked their device for less motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
