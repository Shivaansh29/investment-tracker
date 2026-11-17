"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { shortLabel } from "@/components/holdings/labels";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { formatINRWhole, formatSignedINR, formatSignedPercent } from "@/lib/format";
import type { HoldingMetrics } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * One candle per holding, drawn from its buy price (the baseline) to its
 * current price: green bodies rise above the line, red ones hang below it.
 * This is real data from the portfolio, unlike the hero's decorative field.
 *
 * `progress` (0 to 1) grows the candles out of the baseline, so a parent can
 * tie them to scroll. `growIn` grows them once by itself, the first time the
 * chart is on screen. With neither they are drawn at full height.
 */
export function ReturnCandles({
  holdings,
  progress,
  growIn = false,
  interactive = false,
  className,
}: {
  holdings: HoldingMetrics[];
  progress?: MotionValue<number>;
  growIn?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const plotRef = useRef<HTMLDivElement>(null);
  const ownProgress = useGrowOnView(plotRef, growIn && !progress);
  const barProgress = progress ?? ownProgress;
  const [selectedId, setSelectedId] = useState(holdings[0]?.id);
  const selected = holdings.find((h) => h.id === selectedId) ?? holdings[0];

  const max = Math.max(0, ...holdings.map((h) => h.pnlPct));
  const min = Math.min(0, ...holdings.map((h) => h.pnlPct));
  const range = max - min || 1;
  const baseline = (max / range) * 100; // distance of the 0% line from the top, in %

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
      {interactive && selected && (
        // The read-out replaces hover tooltips, so it works the same by touch and keyboard
        <dl className="border-line grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-1 border-b pb-3">
          <div className="min-w-0">
            <dt className="sr-only">Holding</dt>
            <dd className="truncate text-lg font-medium">{selected.name}</dd>
            <dd className="text-muted-foreground text-sm tabular-nums">
              {formatINRWhole(selected.invested)} invested, now{" "}
              {formatINRWhole(selected.currentValue)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Return</dt>
            <dd
              className={cn(
                "type-condensed text-4xl leading-none font-bold tabular-nums",
                selected.pnl >= 0 ? "text-gain" : "text-loss",
              )}
            >
              {formatSignedPercent(selected.pnlPct)}
            </dd>
            <dd className="text-muted-foreground text-sm tabular-nums">
              {formatSignedINR(selected.pnl)}
            </dd>
          </div>
        </dl>
      )}

      <div ref={plotRef} className="relative min-h-40 flex-1">
        {/* Baseline: every holding starts here, at the price it was bought for */}
        <div
          className="border-foreground/40 absolute inset-x-0 border-t border-dashed"
          style={{ top: `${baseline}%` }}
        >
          {/* Sits under the line at the left, where the best performers leave room */}
          <span className="text-muted-foreground absolute top-1.5 left-0 text-xs">Buy price</span>
        </div>

        <div
          className="absolute inset-0 grid gap-1.5 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${holdings.length}, minmax(0, 1fr))` }}
        >
          {holdings.map((h, index) => {
            const up = h.pnlPct >= 0;
            const size = (Math.abs(h.pnlPct) / range) * 100;
            const isSelected = interactive && h.id === selected?.id;
            const body = (
              <Body
                up={up}
                top={up ? baseline - size : baseline}
                height={size}
                progress={barProgress}
                index={index}
                count={holdings.length}
                selected={isSelected}
              />
            );

            if (!interactive) {
              return (
                <div key={h.id} className="relative">
                  {body}
                </div>
              );
            }
            return (
              <button
                key={h.id}
                type="button"
                // Selection follows focus, so it is marked as current rather than pressed. The
                // label carries the read-out figures, since the read-out is not a live region.
                aria-current={isSelected ? "true" : undefined}
                aria-label={`${h.name}: ${formatSignedPercent(h.pnlPct)}, ${formatINRWhole(h.invested)} invested, now ${formatINRWhole(h.currentValue)}`}
                onPointerEnter={() => setSelectedId(h.id)}
                onFocus={() => setSelectedId(h.id)}
                onClick={() => setSelectedId(h.id)}
                className={cn(
                  "relative rounded-sm transition-colors",
                  isSelected ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]",
                )}
              >
                {body}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickers under each candle, once there is room for them. Only with the
          read-out, where pointing at a candle spells out the full name. */}
      {interactive && (
        <ul
          aria-hidden
          className="text-muted-foreground hidden gap-1.5 text-xs sm:grid md:gap-3"
          style={{ gridTemplateColumns: `repeat(${holdings.length}, minmax(0, 1fr))` }}
        >
          {holdings.map((h) => (
            <li
              key={h.id}
              className={cn("truncate text-center", h.id === selected?.id && "text-foreground")}
            >
              {shortLabel(h)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Body({
  up,
  top,
  height,
  progress,
  index,
  count,
  selected,
}: {
  up: boolean;
  top: number;
  height: number;
  progress?: MotionValue<number>;
  index: number;
  count: number;
  selected: boolean;
}) {
  const className = cn(
    "absolute inset-x-[18%] rounded-[2px]",
    up ? "bg-gain origin-bottom" : "bg-loss origin-top",
    selected && "outline-foreground outline-2 outline-offset-2",
  );
  const style = { top: `${top}%`, height: `max(${height}%, 3px)` };

  if (!progress) return <span className={className} style={style} />;
  return (
    <GrowingBody
      className={className}
      style={style}
      progress={progress}
      index={index}
      count={count}
    />
  );
}

/**
 * A 0 to 1 value that runs up once, the first time `ref` is half on screen, or
 * undefined when `enabled` is false. With motion reduced it is simply 1.
 */
function useGrowOnView(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const value = useMotionValue(enabled ? 0 : 1);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    if (reduceMotion) {
      value.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(value, 1, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1] });
    return () => controls.stop();
  }, [enabled, inView, reduceMotion, value]);

  return enabled ? value : undefined;
}

/** Scales a candle out of the baseline; later candles start a little later. */
function GrowingBody({
  className,
  style,
  progress,
  index,
  count,
}: {
  className: string;
  style: React.CSSProperties;
  progress: MotionValue<number>;
  index: number;
  count: number;
}) {
  const start = (index / count) * 0.4;
  const scaleY = useTransform(progress, [start, start + 0.6], [0.02, 1], { clamp: true });
  return <motion.span className={className} style={{ ...style, scaleY }} />;
}
