"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type XAxisTickContentProps,
} from "recharts";
import { useElementWidth } from "@/hooks/use-element-width";
import type { AssetTypeBreakdown } from "@/lib/portfolio";
import { formatINRAxisTick, formatINRWhole, formatSignedPercent } from "@/lib/format";
import { ASSET_TYPE_COLORS, GRID_COLOR, MUTED_COLOR } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

type Row = AssetTypeBreakdown & { color: string; returnPct: number };

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

/** Below this chart width (px), multi-word category labels wrap onto two lines. */
const NARROW_WIDTH = 480;

/** Grouped columns: what you put in (gray) vs what it's worth now (asset color). */
export function ValueByTypeChart({ data }: { data: AssetTypeBreakdown[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const narrow = width > 0 && width < NARROW_WIDTH;

  const rows: Row[] = data.map((d) => ({
    ...d,
    color: ASSET_TYPE_COLORS[d.assetType],
    returnPct: d.invested ? ((d.currentValue - d.invested) / d.invested) * 100 : 0,
  }));
  const axisMax = Math.max(0, ...rows.flatMap((r) => [r.invested, r.currentValue]));

  return (
    <div ref={ref} className="space-y-4">
      <ul
        aria-label="Chart legend"
        className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs"
      >
        <li className="flex items-center gap-1.5">
          <span className="bg-muted-foreground/45 h-3.5 w-2.5 rounded-t-[3px]" aria-hidden />
          Invested
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="ring-foreground/50 h-3.5 w-2.5 rounded-t-[3px] ring-[1.5px] ring-inset"
            aria-hidden
          />
          Current value, in each asset type&apos;s colour
        </li>
      </ul>

      <BarChart
        responsive
        style={{ width: "100%", height: 280 }}
        data={rows}
        margin={{ top: 20, right: 4, bottom: 0, left: 0 }}
        barGap={2}
        barCategoryGap="28%"
        title="Invested versus current value by asset type"
      >
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          interval={0}
          tickLine={false}
          axisLine={{ stroke: GRID_COLOR }}
          tick={(props: XAxisTickContentProps) => <CategoryTick {...props} wrap={narrow} />}
          height={narrow ? 40 : 30}
        />
        <YAxis
          tickFormatter={(v: number) => formatINRAxisTick(v, axisMax)}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as Row | undefined;
            if (!active || !row) return null;
            return (
              <ChartTooltip
                title={row.label}
                rows={[
                  { label: "Invested", value: formatINRWhole(row.invested), color: MUTED_COLOR },
                  {
                    label: "Current value",
                    value: formatINRWhole(row.currentValue),
                    color: row.color,
                  },
                  { label: "Return", value: formatSignedPercent(row.returnPct) },
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
        >
          {/* Growth % above each pair answers "how has it grown?" at a glance */}
          <LabelList
            dataKey="returnPct"
            position="top"
            offset={6}
            formatter={(v) => formatSignedPercent(Number(v))}
            fill="var(--muted-foreground)"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </div>
  );
}

/** Category label; on narrow charts "Fixed deposits" becomes two lines instead of colliding. */
function CategoryTick({ x, y, payload, wrap }: XAxisTickContentProps & { wrap: boolean }) {
  const label = String(payload.value);
  const lines = wrap && label.includes(" ") ? label.split(" ") : [label];
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 12 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
