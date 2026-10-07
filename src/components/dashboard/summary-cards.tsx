import { Trophy, TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { formatINRWhole, formatSignedINR, formatSignedPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Green ▲ for gains, red ▼ for losses; the sign and icon mean it never relies on color alone. */
export function ChangeBadge({ amount, percent }: { amount?: number; percent: number }) {
  const isGain = percent >= 0;
  const Icon = isGain ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums",
        isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {amount !== undefined && formatSignedINR(amount)}
      {amount !== undefined ? ` (${formatSignedPercent(percent)})` : formatSignedPercent(percent)}
    </span>
  );
}

export function SummaryCards({
  summary,
  best,
  worst,
}: {
  summary: PortfolioSummary;
  best: HoldingMetrics | undefined;
  worst: HoldingMetrics | undefined;
}) {
  const isGain = summary.pnl >= 0;
  const TrendIcon = isGain ? TrendingUp : TrendingDown;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Hero figure: the one number the dashboard leads with */}
      <div className="from-hero-from to-hero-to relative overflow-hidden rounded-xl bg-linear-to-br p-6 text-white shadow-md md:col-span-2">
        {/* Soft decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm text-white/80">Current value</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
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
            {formatSignedINR(summary.pnl)} ({formatSignedPercent(summary.pnlPct)})
          </span>
          <span className="text-white/80">total returns</span>
        </p>
      </div>

      <StatTile icon={Wallet} label="Invested" value={formatINRWhole(summary.invested)}>
        across {summary.holdingsCount} holdings
      </StatTile>

      <StatTile icon={Trophy} label="Best performer" value={best ? best.name : "—"}>
        {best && <ChangeBadge percent={best.pnlPct} />}
        {worst && worst.id !== best?.id && (
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="truncate">Weakest: {worst.name}</span>
            <ChangeBadge percent={worst.pnlPct} />
          </span>
        )}
      </StatTile>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
        <p className="truncate pt-1 text-2xl font-semibold" title={value}>
          {value}
        </p>
        <div className="text-muted-foreground text-sm">{children}</div>
      </CardContent>
    </Card>
  );
}
