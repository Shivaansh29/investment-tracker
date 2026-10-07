"use client";

import { useEffect, useRef, useState } from "react";
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
import type { HoldingMetrics } from "@/lib/portfolio";
import { formatINR, formatSignedINR, formatSignedPercent } from "@/lib/format";
import { GAIN_COLOR, GRID_COLOR, LOSS_COLOR } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

const ROW_HEIGHT = 36;
const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

/** Below this chart width (px), use a narrower name column so bars keep room. */
const NARROW_WIDTH = 520;

/** Holding name on one line (Recharts would otherwise wrap long names). */
function makeNameTick(maxChars: number) {
  return function NameTick({ x, y, payload }: YAxisTickContentProps) {
    const name = String(payload.value);
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="var(--foreground)">
        <title>{name}</title>
        {name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name}
      </text>
    );
  };
}

/** Tracks an element's width so the chart can adapt to small screens. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Horizontal bars of % return per holding, best first. Gains green, losses red. */
export function ReturnsByHoldingChart({ data }: { data: HoldingMetrics[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const narrow = width > 0 && width < NARROW_WIDTH;
  const hasLoss = data.some((h) => h.pnlPct < 0);

  return (
    <div ref={ref}>
      <BarChart
        responsive
        layout="vertical"
        style={{ width: "100%", height: data.length * ROW_HEIGHT + 32 }}
        data={data}
        margin={{ top: 0, right: 64, bottom: 0, left: 0 }}
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
          width={narrow ? 112 : 190}
          tickLine={false}
          axisLine={false}
          tick={makeNameTick(narrow ? 15 : 26)}
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
                  { label: "Invested", value: formatINR(h.invested) },
                  { label: "Current value", value: formatINR(h.currentValue) },
                  { label: "Profit / loss", value: formatSignedINR(h.pnl) },
                  { label: "Return", value: formatSignedPercent(h.pnlPct) },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="pnlPct" maxBarSize={20} shape={ReturnBar}>
          <LabelList
            dataKey="pnlPct"
            position="right"
            formatter={(v) => formatSignedPercent(Number(v))}
            fill="var(--foreground)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </div>
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
