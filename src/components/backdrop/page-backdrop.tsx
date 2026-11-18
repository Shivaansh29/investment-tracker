"use client";

import dynamic from "next/dynamic";

// Decoration, so it loads after the page is readable and never runs on the server
const CandleField = dynamic(() => import("@/components/backdrop/candle-field"), { ssr: false });

/**
 * The hidden candle field behind a whole page: point anywhere (or tap) and the
 * candles under the pointer light up. Panels on top of it have solid
 * backgrounds, so it only ever shows in the margins and gaps, never behind figures.
 *
 * Render it outside any element that animates a transform (such as
 * PageTransition): a transform would make it scroll with that element instead
 * of staying fixed to the window.
 */
export function PageBackdrop() {
  return <CandleField variant="page" />;
}
