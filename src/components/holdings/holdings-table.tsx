import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSET_TYPE_COLORS } from "@/components/charts/chart-colors";
import { ChangeBadge } from "@/components/dashboard/summary-cards";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { formatINR, formatINRWhole, formatSignedINR } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/types";

const num = "text-right tabular-nums";
const detail = "text-muted-foreground mt-0.5 text-xs";

export function HoldingsTable({
  holdings,
  summary,
}: {
  holdings: HoldingMetrics[];
  summary: PortfolioSummary;
}) {
  return (
    <>
      {/* Phones: a stacked list, since four number columns can't fit side by side */}
      <HoldingsList holdings={holdings} summary={summary} />

      {/* Larger screens: the full table */}
      <div className="hidden sm:block">
        <HoldingsGrid holdings={holdings} summary={summary} />
      </div>
    </>
  );
}

function HoldingsGrid({
  holdings,
  summary,
}: {
  holdings: HoldingMetrics[];
  summary: PortfolioSummary;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-auto py-2">Holding</TableHead>
          <TableHead className={`${num} h-auto py-2`}>
            Invested
            <span className="text-muted-foreground block text-xs font-normal">
              Units × avg. buy price
            </span>
          </TableHead>
          <TableHead className={`${num} h-auto py-2`}>
            Current value
            <span className="text-muted-foreground block text-xs font-normal">
              Current price per unit
            </span>
          </TableHead>
          <TableHead className={`${num} h-auto py-2`}>Returns</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <TableRow key={h.id}>
            <TableCell className="min-w-48 whitespace-normal">
              <p className="leading-snug font-medium">{h.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <AssetTypePill assetType={h.assetType} />
                {h.symbol && <span className="text-muted-foreground">{h.symbol}</span>}
              </div>
            </TableCell>
            <TableCell className={num}>
              <p className="font-medium">{formatINRWhole(h.invested)}</p>
              <p className={detail}>
                {h.quantity.toLocaleString("en-IN")} × {formatINR(h.avgBuyPrice)}
                <span className="sr-only"> average buy price</span>
              </p>
            </TableCell>
            <TableCell className={num}>
              <p className="font-medium">{formatINRWhole(h.currentValue)}</p>
              <p className={detail}>{formatINR(h.currentPrice)} per unit</p>
            </TableCell>
            <TableCell className={num}>
              <ReturnsCell pnl={h.pnl} pnlPct={h.pnlPct} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-medium">Total</TableCell>
          <TableCell className={num}>{formatINRWhole(summary.invested)}</TableCell>
          <TableCell className={num}>{formatINRWhole(summary.currentValue)}</TableCell>
          <TableCell className={num}>
            <ReturnsCell pnl={summary.pnl} pnlPct={summary.pnlPct} />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function HoldingsList({
  holdings,
  summary,
}: {
  holdings: HoldingMetrics[];
  summary: PortfolioSummary;
}) {
  return (
    <div className="sm:hidden">
      <ul className="divide-y">
        {holdings.map((h) => (
          <li key={h.id} className="space-y-1.5 py-3 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <p className="leading-snug font-medium">{h.name}</p>
              <p className="shrink-0 font-medium tabular-nums">{formatINRWhole(h.currentValue)}</p>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <AssetTypePill assetType={h.assetType} />
                {h.symbol && <span className="text-muted-foreground truncate">{h.symbol}</span>}
              </div>
              <ChangeBadge percent={h.pnlPct} className="shrink-0" />
            </div>
            <div className="text-muted-foreground flex justify-between gap-3 text-xs tabular-nums">
              <span>
                Invested {formatINRWhole(h.invested)} ({h.quantity.toLocaleString("en-IN")} ×{" "}
                {formatINR(h.avgBuyPrice)})
              </span>
              <span className="text-foreground shrink-0 font-medium">{formatSignedINR(h.pnl)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-muted/50 mt-1 flex items-start justify-between gap-3 rounded-lg p-3 text-sm">
        <div>
          <p className="font-medium">Total</p>
          <p className="text-muted-foreground text-xs tabular-nums">
            Invested {formatINRWhole(summary.invested)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium tabular-nums">{formatINRWhole(summary.currentValue)}</p>
          <ChangeBadge amount={summary.pnl} percent={summary.pnlPct} className="mt-1" />
        </div>
      </div>
    </div>
  );
}

/** Tinted pill in the asset type's chart color, so the table matches the charts. */
function AssetTypePill({ assetType }: { assetType: AssetType }) {
  const color = ASSET_TYPE_COLORS[assetType];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {ASSET_TYPE_LABELS[assetType]}
    </span>
  );
}

/** Profit/loss amount with its % badge underneath, keeping the column narrow. */
function ReturnsCell({ pnl, pnlPct }: { pnl: number; pnlPct: number }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-medium">{formatSignedINR(pnl)}</span>
      <ChangeBadge percent={pnlPct} />
    </div>
  );
}
