"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { shortLabel } from "@/components/holdings/labels";
import { formatSignedPercent } from "@/lib/format";
import type { HoldingMetrics } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * A stock-exchange style tape of the sample holdings and their returns.
 * The list is rendered twice so the slide can loop without a gap; the second
 * copy is hidden from screen readers.
 *
 * Moving text must be stoppable, so the tape pauses on hover and has a
 * pause button. With reduced motion it does not move at all (see globals.css).
 */
export function TickerTape({ holdings }: { holdings: HoldingMetrics[] }) {
  const [paused, setPaused] = useState(false);
  const Icon = paused ? Play : Pause;

  return (
    <div className="border-line bg-background/80 relative flex border-y backdrop-blur-sm">
      {/* Exchange tapes show today's move; this one shows the return since each holding
          was bought, so the label says so to avoid being read as live prices */}
      <p className="border-line bg-background z-10 flex shrink-0 flex-col justify-center border-r px-4 leading-tight sm:px-8">
        <span className="type-wide text-bullion text-[0.7rem] font-semibold">Sample portfolio</span>
        <span className="text-muted-foreground text-xs">Return since bought</span>
      </p>
      <div
        className="ticker min-w-0 flex-1 overflow-hidden"
        role="group"
        aria-label="Sample holdings and their return since bought"
      >
        <div
          className="ticker-track flex w-max"
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          <TapeItems holdings={holdings} />
          <TapeItems holdings={holdings} hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play the ticker" : "Pause the ticker"}
        className="border-line bg-background text-muted-foreground hover:text-foreground z-10 flex w-11 shrink-0 items-center justify-center border-l motion-reduce:hidden"
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function TapeItems({ holdings, hidden }: { holdings: HoldingMetrics[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden}>
      {holdings.map((h) => {
        const up = h.pnlPct >= 0;
        return (
          <li
            key={h.id}
            className="border-line flex items-center gap-3 border-r px-5 py-3 text-sm whitespace-nowrap"
          >
            <span className="font-medium">{shortLabel(h)}</span>
            <span className={cn("tabular-nums", up ? "text-gain" : "text-loss")}>
              <span aria-hidden>{up ? "↗" : "↘"} </span>
              {formatSignedPercent(h.pnlPct)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
