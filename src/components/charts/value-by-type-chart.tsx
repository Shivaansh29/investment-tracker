"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import type { AssetTypeBreakdown } from "@/lib/portfolio";
import { formatINR, formatINRCompact, formatSignedPercent } from "@/lib/format";
import { ASSET_TYPE_COLORS, GRID_COLOR, MUTED_COLOR } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

type Row = AssetTypeBreakdown & { color: string };

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

/** Grouped columns: what you put in (gray) vs what it's worth now (asset color). */
export function ValueByTypeChart({ data }: { data: AssetTypeBreakdown[] }) {
  const rows: Row[] = data.map((d) => ({ ...d, color: ASSET_TYPE_COLORS[d.assetType] }));

  return (
    <div className="space-y-3">
      <div className="text-muted-foreground flex gap-4 text-xs">
        <LegendKey colors={[MUTED_COLOR]} label="Invested" faded />
        <LegendKey colors={rows.map((r) => r.color)} label="Current value" />
      </div>

      <BarChart
        responsive
        style={{ width: "100%", height: 260 }}
        data={rows}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        barGap={2}
        barCategoryGap="30%"
      >
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: GRID_COLOR }}
          tick={AXIS_TICK}
        />
        <YAxis
          tickFormatter={formatINRCompact}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={64}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as Row | undefined;
            if (!active || !row) return null;
            const change = row.invested
              ? ((row.currentValue - row.invested) / row.invested) * 100
              : 0;
            return (
              <ChartTooltip
                title={row.label}
                rows={[
                  { label: "Invested", value: formatINR(row.invested), color: MUTED_COLOR },
                  { label: "Current value", value: formatINR(row.currentValue), color: row.color },
                  { label: "Return", value: formatSignedPercent(change) },
                ]}
              />
            );
          }}
        />
        <Bar
          dataKey="invested"
          name="Invested"
          maxBarSize={24}
          radius={[4, 4, 0, 0]}
          fill={MUTED_COLOR}
          fillOpacity={0.45}
        />
        <Bar
          dataKey="currentValue"
          name="Current value"
          maxBarSize={24}
          radius={[4, 4, 0, 0]}
          shape={(props: BarShapeProps) => (
            <Rectangle {...props} fill={(props.payload as Row).color} />
          )}
        />
      </BarChart>
    </div>
  );
}

/** A legend swatch; "Current value" shows each asset type's color, since its bars use them. */
function LegendKey({ colors, label, faded }: { colors: string[]; label: string; faded?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex -space-x-0.5">
        {colors.map((color) => (
          <span
            key={color}
            className="ring-card size-2.5 rounded-full ring-1"
            style={{ backgroundColor: color, opacity: faded ? 0.45 : 1 }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}
