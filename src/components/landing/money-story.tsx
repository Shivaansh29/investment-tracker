"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ReturnCandles } from "@/components/charts/return-candles";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { formatINRWhole, formatSignedINR, formatSignedPercent } from "@/lib/format";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/** Short screens below desktop width, matching the `short` variant in globals.css. */
const SHORT_SCREEN = "(max-height: 40rem) and (max-width: 63.99rem)";

/**
 * A scroll-driven walk through the sample portfolio. The section is three
 * screens tall with a pinned stage; scrolling moves every holding from its
 * buy price to its current price while the headline figure counts along.
 *
 * With reduced motion the section is a normal block showing the end state.
 */
export function MoneyStory({
  holdings,
  summary,
}: {
  holdings: HoldingMetrics[];
  summary: PortfolioSummary;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  // Same condition as the `short` variant in globals.css, which un-pins the section
  const shortScreen = useMediaQuery(SHORT_SCREEN);
  // Not pinned (less motion asked for, or a screen too short to fit the stage):
  // show the finished state instead of tying it to scroll
  const unpinned = usePrefersReducedMotion() || shortScreen;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // 0 = everything at buy price, 1 = everything at its current sample price
  const scrolledGrowth = useTransform(scrollYProgress, [0.1, 0.72], [0, 1], { clamp: true });
  const finished = useMotionValue(1);
  const growth = unpinned ? finished : scrolledGrowth;
  const figure = useTransform(growth, (g) => formatINRWhole(summary.invested + summary.pnl * g));

  // Which of the three steps the scroll position has reached
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(v < 0.14 ? 0 : v < 0.72 ? 1 : 2));
  const reached = unpinned ? 2 : step;

  const steps = [
    { label: "What you put in", value: formatINRWhole(summary.invested) },
    { label: "What it is worth now", value: formatINRWhole(summary.currentValue) },
    {
      label: "The difference",
      value: `${formatSignedINR(summary.pnl)} (${formatSignedPercent(summary.pnlPct)})`,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="story"
      aria-labelledby="story-heading"
      className="short:h-auto relative h-[240vh] motion-reduce:h-auto"
    >
      <div className="short:static short:h-auto short:py-24 sticky top-0 flex h-svh flex-col justify-center pt-(--header-h) motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <div className="mx-auto grid max-h-full w-full max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
          <div>
            <h2
              id="story-heading"
              className="type-condensed text-4xl leading-[0.95] font-extrabold sm:text-6xl"
            >
              From what you paid to what it is worth
            </h2>

            <motion.p className="type-condensed text-bullion mt-4 text-6xl leading-none font-bold tabular-nums sm:mt-8 sm:text-8xl">
              {figure}
            </motion.p>

            <ol className="border-line mt-4 border-t sm:mt-8">
              {steps.map((s, index) => (
                <li
                  key={s.label}
                  aria-current={index === reached ? "step" : undefined}
                  className={cn(
                    "border-line flex items-baseline justify-between gap-4 border-b py-2 transition-colors duration-300 sm:py-3",
                    // Steps not reached yet are quieter, but still readable
                    index > reached && "text-muted-foreground",
                  )}
                >
                  <span className="text-sm sm:text-base">{s.label}</span>
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums sm:text-base",
                      index === 2 &&
                        reached === 2 &&
                        (summary.pnl >= 0 ? "text-gain" : "text-loss"),
                    )}
                  >
                    {/* Values appear as the scroll reaches them, so the count-up is not spoiled */}
                    {index <= reached ? s.value : <span aria-hidden>—</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <ReturnCandles
            holdings={holdings}
            progress={growth}
            interactive
            className="short:h-96 h-[34svh] motion-reduce:h-96 lg:h-[56svh]"
          />
        </div>
      </div>
    </section>
  );
}
