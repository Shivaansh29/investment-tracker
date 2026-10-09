import { Trophy, TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { formatINRWhole, formatSignedINR, formatSignedPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Green ▲ for gains, red ▼ for losses; the sign and icon mean it never relies on color alone. */
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
  const Icon = isGain ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums",
        isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{isGain ? "Gain" : "Loss"} </span>
      {amount !== undefined && formatSignedINR(amount)}
      {amount !== undefined ? ` (${formatSignedPercent(percent)})` : formatSignedPercent(percent)}
    </span>
  );
}

export function SummaryCards({
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
  const TrendIcon = isGain ? TrendingUp : TrendingDown;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Hero figure: the one number the dashboard leads with */}
      <div className="from-hero-from to-hero-to relative flex flex-col justify-center overflow-hidden rounded-xl bg-linear-to-br p-6 text-white shadow-md md:col-span-2">
        {/* Soft decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm text-white/80">Current value</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {formatINRWhole(summary.currentValue)}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium tabular-nums",
              isGain ? "text-gain" : "text-loss",
            )}
          >
            <TrendIcon className="size-4" aria-hidden />
            <span className="sr-only">{isGain ? "Gain" : "Loss"} </span>
            {formatSignedINR(summary.pnl)} ({formatSignedPercent(summary.pnlPct)})
          </span>
          <span className="text-white/80">total returns</span>
        </p>
      </div>

      <StatTile icon={Wallet} label="Invested">
        <p className="text-2xl font-semibold tabular-nums">{formatINRWhole(summary.invested)}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Across {pluralize(summary.holdingsCount, "holding")} in{" "}
          {pluralize(assetTypeCount, "asset type")}
        </p>
      </StatTile>

      <StatTile icon={Trophy} label="Top and bottom performers">
        <div className="divide-y">
          {best && <PerformerRow label="Best" holding={best} />}
          {worst && worst.id !== best?.id && <PerformerRow label="Weakest" holding={worst} />}
        </div>
      </StatTile>
    </div>
  );
}

/** "1 holding" / "10 holdings", so the counts read correctly for any portfolio size. */
function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function StatTile({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col">
        <div className="mb-2 flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/** One holding with its return; long names wrap onto a second line instead of being cut off. */
function PerformerRow({ label, holding }: { label: string; holding: HoldingMetrics }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="line-clamp-2 text-sm leading-snug font-medium" title={holding.name}>
          {holding.name}
        </p>
      </div>
      <ChangeBadge percent={holding.pnlPct} className="mt-4 shrink-0" />
    </div>
  );
}
