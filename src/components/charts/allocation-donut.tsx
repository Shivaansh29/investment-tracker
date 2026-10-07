"use client";

import { Pie, PieChart, Sector, Tooltip, type PieSectorShapeProps } from "recharts";
import type { AssetTypeBreakdown } from "@/lib/portfolio";
import { formatINR, formatINRCompact, formatPercent } from "@/lib/format";
import { ASSET_TYPE_COLORS, SURFACE_COLOR } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

type Slice = AssetTypeBreakdown & { color: string };

export function AllocationDonut({
  data,
  totalValue,
}: {
  data: AssetTypeBreakdown[];
  totalValue: number;
}) {
  const slices: Slice[] = data.map((d) => ({ ...d, color: ASSET_TYPE_COLORS[d.assetType] }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative size-52 shrink-0">
        <PieChart width={208} height={208}>
          <Pie
            data={slices}
            dataKey="currentValue"
            nameKey="label"
            innerRadius={68}
            outerRadius={100}
            cornerRadius={4}
            startAngle={90}
            endAngle={-270}
            stroke={SURFACE_COLOR}
            strokeWidth={2}
            shape={(props: PieSectorShapeProps) => (
              <Sector {...props} fill={(props.payload as Slice).color} />
            )}
          />
          <Tooltip
            content={({ active, payload }) => {
              const slice = payload?.[0]?.payload as Slice | undefined;
              if (!active || !slice) return null;
              return (
                <ChartTooltip
                  title={slice.label}
                  rows={[
                    { label: "Current value", value: formatINR(slice.currentValue) },
                    { label: "Share of portfolio", value: formatPercent(slice.allocationPct) },
                  ]}
                />
              );
            }}
          />
        </PieChart>
        {/* Total in the donut hole */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="text-lg font-semibold">{formatINRCompact(totalValue)}</span>
        </div>
      </div>

      {/* Legend: color dot + name + share, so identity never relies on color alone */}
      <ul className="w-full space-y-2.5 text-sm">
        {slices.map((s) => (
          <li key={s.assetType} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1">{s.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatINRCompact(s.currentValue)}
            </span>
            <span className="w-12 text-right font-medium tabular-nums">
              {formatPercent(s.allocationPct)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
