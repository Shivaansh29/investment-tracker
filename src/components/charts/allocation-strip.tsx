"use client";

import { useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { ASSET_TYPE_COLORS } from "@/components/charts/chart-colors";
import { formatINRWhole, formatPercent, formatSignedINR, formatSignedPercent } from "@/lib/format";
import type { AssetTypeBreakdown } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * The whole portfolio as one bar, split by asset type. Hovering, focusing or
 * tapping a type shows its numbers.
 *
 * Two layouts share the same behaviour:
 * - "feature" (landing page): a tall bar with a very large read-out underneath.
 * - "panel" (dashboard): a compact read-out on top, then the bar, then the type buttons.
 */
export function AllocationStrip({
  data,
  variant = "feature",
}: {
  data: AssetTypeBreakdown[];
  variant?: "feature" | "panel";
}) {
  const largest = data.reduce((a, b) => (b.allocationPct > a.allocationPct ? b : a), data[0]);
  const [selectedType, setSelectedType] = useState(largest?.assetType);
  const selected = data.find((d) => d.assetType === selectedType) ?? largest;
  if (!selected) return null;

  const pnl = selected.currentValue - selected.invested;
  const returnPct = selected.invested ? (pnl / selected.invested) * 100 : 0;
  const isPanel = variant === "panel";

  const bar = (
    // The bar is for pointing and tapping; the named buttons below it do the
    // same job for keyboards and screen readers, so the bar itself is hidden from them.
    <motion.div
      aria-hidden
      className={cn("flex origin-left gap-1", isPanel ? "h-12 sm:h-14" : "h-24 sm:h-32")}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {data.map((d) => {
        const isSelected = d.assetType === selected.assetType;
        return (
          <button
            key={d.assetType}
            type="button"
            tabIndex={-1}
            onPointerEnter={() => setSelectedType(d.assetType)}
            onClick={() => setSelectedType(d.assetType)}
            className={cn(
              "min-w-3 rounded-[3px] transition-[opacity,translate] duration-200",
              isSelected
                ? // White, not gold, so a selected Gold (amber) segment still stands out
                  cn(
                    "outline-foreground outline-2 outline-offset-2",
                    !isPanel && "-translate-y-1.5",
                  )
                : "opacity-70",
            )}
            style={{
              flexGrow: d.allocationPct,
              flexBasis: 0,
              backgroundColor: ASSET_TYPE_COLORS[d.assetType],
            }}
          />
        );
      })}
    </motion.div>
  );

  const buttons = (
    <ul aria-label="Asset types" className="flex flex-wrap gap-2">
      {data.map((d) => {
        const isSelected = d.assetType === selected.assetType;
        return (
          <li key={d.assetType}>
            <button
              type="button"
              aria-current={isSelected ? "true" : undefined}
              onPointerEnter={() => setSelectedType(d.assetType)}
              onFocus={() => setSelectedType(d.assetType)}
              onClick={() => setSelectedType(d.assetType)}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                isSelected
                  ? "border-bullion text-foreground"
                  : "border-line text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: ASSET_TYPE_COLORS[d.assetType] }}
              />
              {d.label}
              <span className="tabular-nums">{formatPercent(d.allocationPct)}</span>
              {/* The read-out is not a live region (it would talk on every hover),
                  so focusing a button reads its figures from here instead */}
              <span className="sr-only">
                , {formatINRWhole(d.invested)} invested, now {formatINRWhole(d.currentValue)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const figures = [
    { label: "Invested", value: formatINRWhole(selected.invested) },
    { label: "Current value", value: formatINRWhole(selected.currentValue) },
    {
      label: "Return",
      // The panel has room for the rupee amount too; the landing read-out keeps it short
      value: isPanel
        ? `${formatSignedINR(pnl)} (${formatSignedPercent(returnPct)})`
        : formatSignedPercent(returnPct),
      tone: returnPct >= 0 ? "text-gain" : "text-loss",
    },
  ];

  const readOut = (
    <div
      className={cn(
        "grid gap-6",
        isPanel
          ? "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          : "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end",
      )}
    >
      <div>
        <p
          className={cn(
            "type-condensed leading-none font-extrabold",
            isPanel ? "text-4xl sm:text-5xl" : "text-6xl sm:text-8xl",
          )}
        >
          {selected.label}
        </p>
        <p className={cn("text-muted-foreground", isPanel ? "mt-2 text-sm" : "mt-3 text-base")}>
          {formatPercent(selected.allocationPct)} of the{" "}
          {isPanel ? "portfolio" : "sample portfolio"}
        </p>
      </div>
      <dl
        className={cn(
          "grid gap-x-8 gap-y-4 text-sm",
          isPanel ? "grid-cols-2 lg:grid-cols-3 lg:text-right" : "grid-cols-3 sm:text-right",
        )}
      >
        {figures.map((f) => (
          <div
            key={f.label}
            className={cn(isPanel && f.label === "Return" && "col-span-2 lg:col-span-1")}
          >
            <dt className="text-muted-foreground">{f.label}</dt>
            <dd className={cn("mt-1 text-lg font-medium tabular-nums", f.tone)}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    // reducedMotion="user": the bar appears without growing when the visitor asks for less motion
    <MotionConfig reducedMotion="user">
      {isPanel ? (
        <div className="space-y-6">
          {readOut}
          {bar}
          {buttons}
        </div>
      ) : (
        <div>
          {bar}
          <div className="mt-5">{buttons}</div>
          <div className="mt-8">{readOut}</div>
        </div>
      )}
    </MotionConfig>
  );
}
