import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { formatINRWhole, formatPercent, formatSignedINR, formatSignedPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A gain or loss as coloured text with an arrow. The arrow, the plus or minus
 * sign and the hidden "Gain"/"Loss" word mean it never relies on colour alone.
 * The holdings table uses this too, so its props stay stable.
 */
export function ChangeBadge({
  amount,
  percent,
  className,
}: {
  amount?: number;
  percent: number;
  className?: string;
}) {
  const isGain = percent >= 0;
  const Icon = isGain ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap tabular-nums",
        isGain ? "text-gain" : "text-loss",
        className,
      )}
    >
      {/* 1em keeps the arrow in step with whatever text size the caller sets */}
      <Icon className="size-[1em] shrink-0" aria-hidden />
      <span className="sr-only">{isGain ? "Gain" : "Loss"} </span>
      {amount !== undefined && formatSignedINR(amount)}
      {amount !== undefined ? ` (${formatSignedPercent(percent)})` : formatSignedPercent(percent)}
    </span>
  );
}

/** Grid columns for the figures row, by how many figures there are to show. */
const FIGURE_COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/**
 * The band at the top of the dashboard: the portfolio's current value, its
 * total return, a meter showing how much of the value is money put in versus
 * growth, and a row of supporting figures.
 */
export function PortfolioOverview({
  summary,
  assetTypeCount,
  best,
  worst,
}: {
  summary: PortfolioSummary;
  assetTypeCount: number;
  best: HoldingMetrics | undefined;
  worst: HoldingMetrics | undefined;
}) {
  const isGain = summary.pnl >= 0;
  const TrendIcon = isGain ? ArrowUpRight : ArrowDownRight;

  // With a single holding the best and the weakest are the same one: show it once
  const weakest = worst && worst.id !== best?.id ? worst : undefined;
  const figureCount = 2 + (best ? 1 : 0) + (weakest ? 1 : 0);

  return (
    <section
      aria-labelledby="overview-heading"
      className="border-line bg-card overflow-hidden rounded-lg border"
    >
      <h2 id="overview-heading" className="sr-only">
        Summary
      </h2>

      <div className="space-y-8 px-4 py-6 sm:space-y-10 sm:p-8">
        <dl className="flex flex-wrap items-end gap-x-14 gap-y-6">
          <div className="min-w-0">
            <dt className="text-muted-foreground text-sm">Current value</dt>
            {/* The size follows the screen width so a nine-character figure fits a phone;
                wrap-anywhere is the safety net for much larger portfolios */}
            <dd className="type-condensed mt-1 text-[clamp(3.5rem,15vw,7rem)] leading-[0.9] font-extrabold wrap-anywhere tabular-nums">
              {/* The real figure rises into place, like a board flipping over. It never
                  counts up through made-up in-between amounts. */}
              <span
                className="rise-line"
                style={{ "--rise-delay": "150ms" } as React.CSSProperties}
              >
                <span>{formatINRWhole(summary.currentValue)}</span>
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm">Total return</dt>
            <dd
              className={cn(
                "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums",
                isGain ? "text-gain" : "text-loss",
              )}
            >
              <span className="flex items-center gap-1.5">
                <TrendIcon className="size-7 shrink-0" aria-hidden />
                <span className="sr-only">{isGain ? "Gain" : "Loss"} </span>
                <span className="type-condensed text-4xl leading-none font-bold sm:text-5xl">
                  {formatSignedINR(summary.pnl)}
                </span>
              </span>
              <span className="text-lg font-medium sm:text-xl">
                {formatSignedPercent(summary.pnlPct)}
              </span>
            </dd>
          </div>
        </dl>

        <ValueMeter summary={summary} />
      </div>

      {/* The 1px gaps let the dl's hairline colour show between the cells, which
          draws the dividers for any number of columns without per-cell borders */}
      <dl className={cn("border-line bg-line grid gap-px border-t", FIGURE_COLUMNS[figureCount])}>
        <Figure label="Invested">
          <p className="type-condensed text-2xl leading-none font-bold wrap-anywhere tabular-nums sm:text-3xl">
            {formatINRWhole(summary.invested)}
          </p>
        </Figure>

        <Figure label="Holdings">
          <p className="type-condensed text-2xl leading-none font-bold tabular-nums sm:text-3xl">
            {summary.holdingsCount}
          </p>
          <p className="text-muted-foreground mt-1.5 text-sm">
            in {pluralize(assetTypeCount, "asset type")}
          </p>
        </Figure>

        {best && (
          // Three figures on a two-column phone grid: the last one takes the full row
          <Figure label="Best performer" className={cn(!weakest && "col-span-2 lg:col-span-1")}>
            <Performer holding={best} />
          </Figure>
        )}

        {weakest && (
          <Figure label="Weakest performer">
            <Performer holding={weakest} />
          </Figure>
        )}
      </dl>
    </section>
  );
}

/** "1 asset type" / "5 asset types", so the count reads correctly for any portfolio. */
function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * One bar for the whole position. In profit, the bar is the current value:
 * the indigo part is what was invested and the green part is the growth.
 * At a loss, the bar is the amount invested: the indigo part is what it is
 * worth now and the red part is the shortfall.
 */
function ValueMeter({ summary }: { summary: PortfolioSummary }) {
  const isGain = summary.pnl >= 0;
  const base = isGain ? summary.invested : summary.currentValue;
  const change = Math.abs(summary.pnl);

  // The meter's full width: current value when in profit, the amount invested when at a loss
  const whole = base + change;
  // An empty portfolio has nothing to compare
  if (whole === 0) return null;

  return (
    <div>
      {/* Decorative: the labels underneath give the same split as text. They show shares,
          not rupees, because the rupee amounts are already in the figures above and below. */}
      <div aria-hidden className="h-2.5 overflow-hidden rounded-[2px]">
        {/* flex-grow shares the width in proportion to the two amounts */}
        <div className="meter-fill flex h-full gap-0.5">
          <div className="bg-primary rounded-[2px]" style={{ flexGrow: base, flexBasis: 0 }} />
          {change > 0 && (
            <div
              className={cn("rounded-[2px]", isGain ? "bg-gain" : "bg-loss")}
              style={{ flexGrow: change, flexBasis: 0 }}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-x-8 gap-y-1.5 text-sm">
        <p className="flex items-center gap-2">
          <span aria-hidden className="bg-primary size-2 shrink-0 rounded-[2px]" />
          <span className="text-muted-foreground">{isGain ? "Money put in" : "Still worth"}</span>
          <span className="font-medium tabular-nums">{formatPercent((base / whole) * 100)}</span>
        </p>
        <p className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-[2px]", isGain ? "bg-gain" : "bg-loss")}
          />
          <span className="text-muted-foreground">{isGain ? "Growth" : "Lost"}</span>
          <span className={cn("font-medium tabular-nums", isGain ? "text-gain" : "text-loss")}>
            {formatPercent((change / whole) * 100)}
          </span>
        </p>
      </div>
    </div>
  );
}

/** One labelled cell in the figures row. */
function Figure({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("bg-card min-w-0 px-4 py-5 sm:px-8 sm:py-6", className)}>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

/** A holding's name with its return; long names wrap onto a second line, then cut off. */
function Performer({ holding }: { holding: HoldingMetrics }) {
  return (
    <>
      <p className="line-clamp-2 leading-snug font-medium" title={holding.name}>
        {holding.name}
      </p>
      <ChangeBadge percent={holding.pnlPct} className="mt-1.5 text-base" />
    </>
  );
}
