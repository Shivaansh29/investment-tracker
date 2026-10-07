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
import { formatINR, formatINRWhole } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/types";

const num = "text-right tabular-nums";

export function HoldingsTable({
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
          <TableHead>Holding</TableHead>
          <TableHead className={num}>Quantity</TableHead>
          <TableHead className={num}>Avg. buy price</TableHead>
          <TableHead className={num}>Current price</TableHead>
          <TableHead className={num}>Invested</TableHead>
          <TableHead className={num}>Current value</TableHead>
          <TableHead className={num}>Returns</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <TableRow key={h.id}>
            <TableCell>
              <p className="font-medium">{h.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <AssetTypePill assetType={h.assetType} />
                {h.symbol && <span className="text-muted-foreground">{h.symbol}</span>}
              </div>
            </TableCell>
            <TableCell className={num}>{h.quantity.toLocaleString("en-IN")}</TableCell>
            <TableCell className={num}>{formatINR(h.avgBuyPrice)}</TableCell>
            <TableCell className={num}>{formatINR(h.currentPrice)}</TableCell>
            <TableCell className={num}>{formatINRWhole(h.invested)}</TableCell>
            <TableCell className={num}>{formatINRWhole(h.currentValue)}</TableCell>
            <TableCell className={num}>
              <ChangeBadge amount={h.pnl} percent={h.pnlPct} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4} className="font-medium">
            Total
          </TableCell>
          <TableCell className={num}>{formatINRWhole(summary.invested)}</TableCell>
          <TableCell className={num}>{formatINRWhole(summary.currentValue)}</TableCell>
          <TableCell className={num}>
            <ChangeBadge amount={summary.pnl} percent={summary.pnlPct} />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
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
