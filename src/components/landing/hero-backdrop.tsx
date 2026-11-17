"use client";

import dynamic from "next/dynamic";

// The canvas effect is decoration, so its code loads after the page is
// readable and never runs on the server.
const CandleField = dynamic(() => import("@/components/backdrop/candle-field"), { ssr: false });

export function HeroBackdrop() {
  return <CandleField variant="hero" />;
}
