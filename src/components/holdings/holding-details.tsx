"use client";

import { displaySymbol } from "@/components/holdings/labels";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { AssetTypePill } from "@/components/holdings/asset-type-pill";
import {
  formatDate,
  formatINR,
  formatINRWhole,
  formatPercent,
  formatSignedINR,
  formatSignedPercent,
} from "@/lib/format";
import type { HoldingMetrics } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * The details panel for one holding. It is a modal dialog styled as a sheet:
 * it slides up from the bottom on phones and in from the right edge on larger
 * screens. Base UI's Dialog traps focus inside it, closes it on Escape or a
 * click outside, and stops the page behind from scrolling.
 */
export function HoldingDetails({
  holding,
  portfolioValue,
  open,
  onOpenChange,
  returnFocusRef,
}: {
  /** The holding to show. Undefined until a row has been opened for the first time. */
  holding: HoldingMetrics | undefined;
  /** Current value of the whole portfolio, for the "share of portfolio" fact. */
  portfolioValue: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The element that should get focus back when the panel closes. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Base UI adds data-starting-style / data-ending-style for one frame as the
            dialog opens and while it closes; the transitions below animate from and
            to those states. With motion reduced there is no transition at all. */}
        <Dialog.Backdrop className="bg-background/70 fixed inset-0 z-50 transition-opacity duration-250 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          finalFocus={returnFocusRef}
          className={cn(
            // Phones: a bottom sheet that never covers the whole screen
            "bg-popover text-popover-foreground border-line fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto overscroll-contain rounded-t-lg border-t pb-[env(safe-area-inset-bottom)]",
            // Larger screens: a full-height sheet on the right edge
            "sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-t-0 sm:border-l",
            // The sheet is only focused by script (when opened by touch), so it
            // skips the gold outline that is meant for the controls inside it
            "outline-none",
            "transition-[translate,opacity] duration-250 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "max-sm:data-ending-style:translate-y-full max-sm:data-starting-style:translate-y-full",
            "sm:data-ending-style:translate-x-full sm:data-starting-style:translate-x-full",
          )}
        >
          {holding && <DetailsContent holding={holding} portfolioValue={portfolioValue} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailsContent({
  holding,
  portfolioValue,
}: {
  holding: HoldingMetrics;
  portfolioValue: number;
}) {
  const isGain = holding.pnl >= 0;
  // Guard the division: an empty or worthless portfolio has no shares to speak of
  const shareOfPortfolio = portfolioValue === 0 ? 0 : (holding.currentValue / portfolioValue) * 100;

  const facts = [
    { label: "Units", value: holding.quantity.toLocaleString("en-IN") },
    { label: "Average buy price", value: formatINR(holding.avgBuyPrice) },
    { label: "Current price", value: formatINR(holding.currentPrice) },
    { label: "Invested", value: formatINRWhole(holding.invested) },
    { label: "Current value", value: formatINRWhole(holding.currentValue) },
    { label: "Share of portfolio", value: formatPercent(shareOfPortfolio) },
    { label: "Bought on", value: formatDate(holding.buyDate) },
  ];

  return (
    <>
      {/* A zero-height sticky row keeps Close in the top corner while the sheet
          scrolls, without pushing the title down. The button is 40px square. */}
      <div className="sticky top-0 z-10 flex h-0 justify-end">
        <Dialog.Close
          aria-label="Close"
          className="bg-popover text-muted-foreground hover:bg-accent hover:text-foreground mt-3 mr-3 inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors"
        >
          <X className="size-5" aria-hidden />
        </Dialog.Close>
      </div>

      <div className="space-y-3 px-5 pt-6 pb-6 sm:px-6">
        {/* Right padding leaves room for the Close button */}
        <Dialog.Title className="type-condensed pr-12 text-4xl leading-[0.95] font-extrabold">
          {holding.name}
        </Dialog.Title>
        <Dialog.Description className="flex flex-wrap items-center gap-2 text-sm">
          <AssetTypePill assetType={holding.assetType} />
          {displaySymbol(holding.symbol) && (
            <span className="text-muted-foreground">{displaySymbol(holding.symbol)}</span>
          )}
        </Dialog.Description>
      </div>

      <div className="border-line border-t px-5 py-6 sm:px-6">
        <p className="text-muted-foreground text-sm">Return</p>
        {/* The sign carries the meaning; colour only repeats it */}
        <p
          className={cn(
            "type-condensed mt-1 text-7xl leading-none font-extrabold tabular-nums",
            isGain ? "text-gain" : "text-loss",
          )}
        >
          <span className="sr-only">{isGain ? "Gain" : "Loss"} </span>
          {formatSignedPercent(holding.pnlPct)}
        </p>
        <p className="mt-2 text-sm tabular-nums">
          <span className="font-medium">{formatSignedINR(holding.pnl)}</span>{" "}
          <span className="text-muted-foreground">
            on {formatINRWhole(holding.invested)} invested
          </span>
        </p>
      </div>

      <div className="border-line border-t px-5 py-6 sm:px-6">
        <p className="text-muted-foreground mb-4 text-sm">Buy price to current price</p>
        <PriceTrack avgBuyPrice={holding.avgBuyPrice} currentPrice={holding.currentPrice} />
      </div>

      <div className="border-line border-t px-5 pb-6 sm:px-6">
        <dl className="text-sm">
          {facts.map((fact) => (
            <div key={fact.label} className="border-line grid grid-cols-2 gap-4 border-b py-3">
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="text-right font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-muted-foreground mt-5 text-sm">
          Sample data. Prices are illustrative, not live quotes.
        </p>
      </div>
    </>
  );
}

/** How far in from each end of the track the outer marker sits, in %. */
const TRACK_EDGE = 12;

/**
 * A horizontal track with one marker at the average buy price and one at the
 * current price. The stretch between them is green when the price has gone up
 * and red when it has gone down. Everything is derived from the two prices.
 */
function PriceTrack({ avgBuyPrice, currentPrice }: { avgBuyPrice: number; currentPrice: number }) {
  const low = Math.min(avgBuyPrice, currentPrice);
  const span = Math.abs(currentPrice - avgBuyPrice);

  // Where a price sits along the track, in %: the lower price lands TRACK_EDGE
  // in from the left and the higher one the same distance in from the right.
  // If the two prices are equal there is no span to divide by, so both sit in the middle.
  const positionOf = (price: number) =>
    span === 0 ? 50 : TRACK_EDGE + ((price - low) / span) * (100 - 2 * TRACK_EDGE);

  const buyAt = positionOf(avgBuyPrice);
  const nowAt = positionOf(currentPrice);
  const isGain = currentPrice >= avgBuyPrice;

  return (
    // One image to a screen reader: the label says it all, and the exact
    // prices are repeated in the list of facts below
    <div
      role="img"
      aria-label={`Average buy price ${formatINR(avgBuyPrice)}, current price ${formatINR(currentPrice)}`}
    >
      {/* The buy price is labelled above the track and the current price below
          it, so the two labels can never collide, however close the prices are */}
      <div className="relative h-10">
        <TrackLabel
          at={buyAt}
          label="Average buy price"
          value={formatINR(avgBuyPrice)}
          className="bottom-0"
        />
      </div>

      <div className="bg-foreground/15 relative my-2.5 h-1.5 rounded-[2px]">
        <span
          className={cn(
            "meter-fill absolute inset-y-0 rounded-[2px]",
            isGain ? "bg-gain" : "bg-loss",
          )}
          style={{
            left: `${Math.min(buyAt, nowAt)}%`,
            width: `${Math.abs(nowAt - buyAt)}%`,
            // The fill always grows away from the buy price, towards the current one
            transformOrigin: isGain ? "left" : "right",
          }}
        />
        {/* Each marker reaches towards its own label: buy price up, current price down */}
        <span
          className="bg-foreground absolute -top-2.5 bottom-0 w-0.5 -translate-x-1/2"
          style={{ left: `${buyAt}%` }}
        />
        <span
          className="bg-foreground absolute top-0 -bottom-2.5 w-0.5 -translate-x-1/2"
          style={{ left: `${nowAt}%` }}
        />
      </div>

      <div className="relative h-10">
        <TrackLabel
          at={nowAt}
          label="Current price"
          value={formatINR(currentPrice)}
          className="top-0"
        />
      </div>
    </div>
  );
}

function TrackLabel({
  at,
  label,
  value,
  className,
}: {
  /** Position of the marker this label belongs to, in % along the track. */
  at: number;
  label: string;
  value: string;
  className?: string;
}) {
  // Hang the text off the side of the marker that has more room, so it can
  // never run past the end of the track
  const onRightHalf = at > 50;
  return (
    <p
      className={cn(
        "absolute text-xs leading-tight whitespace-nowrap",
        onRightHalf && "text-right",
        className,
      )}
      style={onRightHalf ? { right: `${100 - at}%` } : { left: `${at}%` }}
    >
      <span className="text-muted-foreground block">{label}</span>
      <span className="block text-sm font-medium tabular-nums">{value}</span>
    </p>
  );
}
