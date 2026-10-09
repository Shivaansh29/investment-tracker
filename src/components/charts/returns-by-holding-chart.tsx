"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type YAxisTickContentProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useElementWidth } from "@/hooks/use-element-width";
import type { HoldingMetrics } from "@/lib/portfolio";
import { formatINRWhole, formatSignedINR, formatSignedPercent } from "@/lib/format";
import { GAIN_COLOR, GRID_COLOR, LOSS_COLOR } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

/** Below this chart width (px), names go on their own line above each bar. */
const STACKED_WIDTH = 560;
/** Approximate width of one character at 12px, used to fit names to the space. */
const CHAR_WIDTH = 6.6;
/** With more holdings than this, show the best and worst few until "Show all" is pressed. */
const COLLAPSED_LIMIT = 10;

function truncate(text: string, maxChars: number) {
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

/** Horizontal bars of % return per holding, best first. Gains green, losses red. */
export function ReturnsByHoldingChart({ data }: { data: HoldingMetrics[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [showAll, setShowAll] = useState(false);

  const stacked = width > 0 && width < STACKED_WIDTH;
  // Side-by-side: the name column takes ~30% of the chart, within sensible bounds.
  // Stacked: 1px, because Recharts skips drawing a 0-width axis (and its name labels).
  const nameColumn = stacked ? 1 : Math.round(Math.min(260, Math.max(160, width * 0.3)));
  const maxChars = Math.floor((stacked ? width - 8 : nameColumn - 12) / CHAR_WIDTH);
  const rowHeight = stacked ? 50 : 38;

  const collapsible = data.length > COLLAPSED_LIMIT;
  const half = COLLAPSED_LIMIT / 2;
  const visible = collapsible && !showAll ? [...data.slice(0, half), ...data.slice(-half)] : data;
  const hasLoss = visible.some((h) => h.pnlPct < 0);

  return (
    <div ref={ref} className="space-y-3">
      <BarChart
        responsive
        layout="vertical"
        style={{ width: "100%", height: visible.length * rowHeight + 30 }}
        data={visible}
        margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
        title="Percentage return on each holding"
      >
        <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${v}%`}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          // Leave room left of the red bars for their "−8.35%" labels
          padding={{ left: hasLoss ? 52 : 0 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={nameColumn}
          tickLine={false}
          axisLine={false}
          tick={(props: YAxisTickContentProps) => (
            <NameTick {...props} maxChars={maxChars} stacked={stacked} />
          )}
        />
        <ReferenceLine x={0} stroke="var(--muted-foreground)" />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={({ active, payload }) => {
            const h = payload?.[0]?.payload as HoldingMetrics | undefined;
            if (!active || !h) return null;
            return (
              <ChartTooltip
                title={h.name}
                rows={[
                  { label: "Invested", value: formatINRWhole(h.invested) },
                  { label: "Current value", value: formatINRWhole(h.currentValue) },
                  { label: "Profit / loss", value: formatSignedINR(h.pnl) },
                  { label: "Return", value: formatSignedPercent(h.pnlPct) },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="pnlPct" maxBarSize={stacked ? 10 : 18} shape={ReturnBar}>
          <LabelList
            dataKey="pnlPct"
            position="right"
            formatter={(v) => formatSignedPercent(Number(v))}
            fill="var(--foreground)"
            fontSize={12}
          />
        </Bar>
      </BarChart>

      {collapsible && (
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
          <span>
            {showAll
              ? `Showing all ${data.length} holdings`
              : `Showing best ${half} and worst ${half} of ${data.length} holdings`}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show fewer" : "Show all"}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Holding name drawn on a single line (Recharts would otherwise wrap it).
 * Side-by-side: right-aligned in the name column. Stacked: left-aligned above its bar.
 */
function NameTick({
  y,
  x,
  payload,
  maxChars,
  stacked,
}: YAxisTickContentProps & { maxChars: number; stacked: boolean }) {
  const name = String(payload.value);
  return (
    <text
      x={stacked ? 0 : x}
      y={stacked ? Number(y) - 13 : y}
      dy={stacked ? 0 : 4}
      textAnchor={stacked ? "start" : "end"}
      fontSize={12}
      fill="var(--foreground)"
      // Stacked names sit over the gridlines; a halo in the card color keeps them legible
      {...(stacked && {
        stroke: "var(--card)",
        strokeWidth: 4,
        strokeLinejoin: "round" as const,
        paintOrder: "stroke",
      })}
    >
      <title>{name}</title>
      {truncate(name, Math.max(8, maxChars))}
    </text>
  );
}

/** Rounds only the outer (data) end of the bar, whichever direction it points. */
function ReturnBar(props: BarShapeProps) {
  const width = props.width ?? 0;
  const isGain = (props.payload as HoldingMetrics).pnlPct >= 0;
  return (
    <Rectangle
      {...props}
      x={width < 0 ? (props.x ?? 0) + width : props.x}
      width={Math.abs(width)}
      radius={isGain ? [0, 4, 4, 0] : [4, 0, 0, 4]}
      fill={isGain ? GAIN_COLOR : LOSS_COLOR}
    />
  );
}
