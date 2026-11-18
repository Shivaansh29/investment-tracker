"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A field of candlesticks drawn as faint outlines. Wherever the pointer goes,
 * grid cells light up and show the same candles in full colour, then fade back.
 *
 * - "hero" fills its parent, the landing hero. With no pointer (phones, or a
 *   mouse left alone) a ghost lens sweeps along the candles so the effect is
 *   still visible, and a gold crosshair marks where the pointer is.
 * - "page" sits fixed behind a whole page (log in, sign up, the dashboard). The
 *   outlines are barely there and only the visitor's own pointer or tap brings
 *   them out. Nothing moves by itself, and drawing stops once the cells cool.
 *
 * The candles are a decorative pattern built from sine waves. They are not
 * market data, which is why no prices or labels are drawn on them.
 */
export type CandleFieldVariant = "hero" | "page";

const LOOK = {
  hero: {
    outline: "rgba(200, 192, 255, 0.34)",
    wash: "rgba(107, 91, 255, 0.13)",
    grid: "rgba(190, 180, 255, 0.26)",
    candleAlpha: 1,
    radius: { small: 110, large: 170 },
  },
  page: {
    outline: "rgba(200, 192, 255, 0.09)",
    wash: "rgba(107, 91, 255, 0.1)",
    grid: "rgba(190, 180, 255, 0.18)",
    candleAlpha: 0.85,
    radius: { small: 90, large: 140 },
  },
} as const;

type Candle = { open: number; close: number; high: number; low: number };

/** Smooth pseudo-price between 0 and 1 for column `i`. Deterministic, so no flicker on resize. */
function wave(i: number, count: number) {
  return (
    0.42 +
    0.2 * Math.sin(i * 0.115 + 0.6) +
    0.11 * Math.sin(i * 0.31 + 2.1) +
    0.05 * Math.sin(i * 0.87 + 4.0) +
    0.2 * (i / count)
  );
}

/** Stable 0..1 noise per cell, used to give the lens a ragged, pixelated edge. */
function cellNoise(col: number, row: number) {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function buildCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, i) => {
    const open = wave(i, count);
    const close = wave(i + 1, count);
    const reach = 0.02 + 0.05 * cellNoise(i, 7);
    return {
      open,
      close,
      high: Math.max(open, close) + reach,
      low: Math.min(open, close) - reach * (0.5 + cellNoise(i, 3)),
    };
  });
}

/** Below this width the hero stacks its text under the field instead of beside it. */
const STACKED_HERO = "(max-width: 63.99rem)";

export default function CandleField({ variant }: { variant: CandleFieldVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // The hero measures and listens on its section; the page field covers the window
    const host = variant === "hero" ? canvas?.parentElement : canvas;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const look = LOOK[variant];
    const sweeps = variant === "hero";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(document.documentElement);
    const gain = styles.getPropertyValue("--gain").trim();
    const loss = styles.getPropertyValue("--loss").trim();
    const bullion = styles.getPropertyValue("--bullion").trim();

    // Two pre-drawn layers: the faint outlines, and the full-colour version
    // that shows through the lit cells. Drawing them once keeps each frame cheap.
    const base = document.createElement("canvas");
    const reveal = document.createElement("canvas");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let pitch = 22; // width of one candle column, and the size of one grid cell
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    // The band the candles are drawn in, in pixels from the top
    let bandTop = 0;
    let bandBottom = 0;

    /** Vertical pixel position of a 0..1 pseudo-price inside the band. */
    function priceToY(value: number) {
      return bandTop + (1 - value) * (bandBottom - bandTop);
    }

    function placeBand() {
      bandTop = height * 0.16;
      bandBottom = height * 0.82;
      if (variant === "page") {
        bandTop = height * 0.14;
        bandBottom = height * 0.86;
        return;
      }
      // When the hero stacks, its headline sits in the lower half. Keep the candles
      // in the open space above it, where the readability fade doesn't cover them.
      const headline = host!.querySelector("[data-hero-headline]");
      if (!headline || !window.matchMedia(STACKED_HERO).matches) return;
      const top = 80; // just below the fixed header
      const bottom = headline.getBoundingClientRect().top - host!.getBoundingClientRect().top - 20;
      // Too little room (a phone held sideways): fall back to the full band
      if (bottom - top >= 96) {
        bandTop = top;
        bandBottom = bottom;
      }
    }

    function drawLayers() {
      const candles = buildCandles(cols);
      const y = priceToY;
      const body = Math.max(3, pitch * 0.5);

      for (const layer of [base, reveal]) {
        layer.width = canvas!.width;
        layer.height = canvas!.height;
        const c = layer.getContext("2d")!;
        c.scale(dpr, dpr);
        const lit = layer === reveal;

        // Lit cells get an indigo wash and a graph-paper grid
        if (lit) {
          c.fillStyle = look.wash;
          c.fillRect(0, 0, width, height);
          c.strokeStyle = look.grid;
          c.lineWidth = 1;
          c.beginPath();
          for (let col = 0; col <= cols; col++) {
            c.moveTo(col * pitch + 0.5, 0);
            c.lineTo(col * pitch + 0.5, height);
          }
          for (let row = 0; row <= rows; row++) {
            c.moveTo(0, row * pitch + 0.5);
            c.lineTo(width, row * pitch + 0.5);
          }
          c.stroke();
        }

        c.globalAlpha = lit ? look.candleAlpha : 1;
        candles.forEach((candle, i) => {
          const x = Math.round(i * pitch + pitch / 2) + 0.5;
          const up = candle.close >= candle.open;
          const bodyTop = y(Math.max(candle.open, candle.close));
          const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
          const left = Math.round(x - body / 2);

          c.lineWidth = 1;
          c.strokeStyle = c.fillStyle = lit ? (up ? gain : loss) : look.outline;
          // The wick is drawn above and below the body, never through it, so the
          // hollow outline stays hollow on any background
          c.beginPath();
          c.moveTo(x, y(candle.high));
          c.lineTo(x, bodyTop);
          c.moveTo(x, bodyTop + bodyHeight);
          c.lineTo(x, y(candle.low));
          c.stroke();

          if (lit) c.fillRect(left, bodyTop, body, bodyHeight);
          else c.strokeRect(left + 0.5, bodyTop + 0.5, body - 1, bodyHeight - 1);
        });
      }
    }

    // False while the field has no size. Next.js keeps the page you just left
    // mounted but hidden (display: none) so going back is instant; a canvas there
    // measures 0 by 0, and drawing a 0-by-0 canvas throws. It redraws on showing again.
    let ready = false;

    function resize() {
      const rect = host!.getBoundingClientRect();
      ready = rect.width >= 1 && rect.height >= 1;
      if (!ready) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      pitch = width < 640 ? 16 : 22;
      cols = Math.ceil(width / pitch);
      rows = Math.ceil(height / pitch);
      heat = new Float32Array(cols * rows);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      placeBand();
      drawLayers();
    }

    // Pointer position in canvas pixels; `seen` is when it last moved.
    const pointer = { x: 0, y: 0, seen: -Infinity };
    const lens = { x: 0, y: 0 };

    function onPointerMove(event: PointerEvent) {
      const rect = host!.getBoundingClientRect();
      // The page field has no lens until the first move, so it starts where the pointer is
      if (!sweeps && pointer.seen === -Infinity) {
        lens.x = event.clientX - rect.left;
        lens.y = event.clientY - rect.top;
      }
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.seen = performance.now();
      start();
    }

    function warm(cx: number, cy: number, radius: number) {
      const colFrom = Math.max(0, Math.floor((cx - radius) / pitch));
      const colTo = Math.min(cols - 1, Math.ceil((cx + radius) / pitch));
      const rowFrom = Math.max(0, Math.floor((cy - radius) / pitch));
      const rowTo = Math.min(rows - 1, Math.ceil((cy + radius) / pitch));
      for (let row = rowFrom; row <= rowTo; row++) {
        for (let col = colFrom; col <= colTo; col++) {
          const dx = (col + 0.5) * pitch - cx;
          const dy = (row + 0.5) * pitch - cy;
          const closeness = 1 - Math.hypot(dx, dy) / radius;
          // Cells near the rim only light up if their noise allows it
          if (closeness <= cellNoise(col, row) * 0.45) continue;
          const index = row * cols + col;
          heat[index] = Math.max(heat[index], Math.min(1, closeness * 1.9));
        }
      }
    }

    function paint(showCrosshair: boolean) {
      if (!ready) return;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.globalAlpha = 1;
      ctx!.drawImage(base, 0, 0);

      const cell = pitch * dpr;
      for (let index = 0; index < heat.length; index++) {
        const value = heat[index];
        if (value < 0.02) continue;
        const sx = (index % cols) * cell;
        const sy = Math.floor(index / cols) * cell;
        ctx!.globalAlpha = value;
        ctx!.drawImage(reveal, sx, sy, cell, cell, sx, sy, cell, cell);
      }

      if (showCrosshair) {
        // The chart-style crosshair, in gold: gold always marks where you are pointing
        ctx!.globalAlpha = 0.5;
        ctx!.strokeStyle = bullion;
        ctx!.lineWidth = dpr;
        ctx!.setLineDash([4 * dpr, 6 * dpr]);
        ctx!.beginPath();
        ctx!.moveTo(Math.round(lens.x * dpr) + 0.5, 0);
        ctx!.lineTo(Math.round(lens.x * dpr) + 0.5, canvas!.height);
        ctx!.moveTo(0, Math.round(lens.y * dpr) + 0.5);
        ctx!.lineTo(canvas!.width, Math.round(lens.y * dpr) + 0.5);
        ctx!.stroke();
        ctx!.setLineDash([]);
      }
      ctx!.globalAlpha = 1;
    }

    let frame = 0;
    let last = 0;
    // Draw only while the field is on screen AND the tab is showing. The two are
    // tracked separately so coming back to the tab never restarts an off-screen loop.
    let inView = true;
    let visible = true;

    function tick(now: number) {
      frame = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;

      // The hero follows the pointer, or sweeps along the candles when it is idle.
      // The page field only ever follows the pointer, and goes dark when it rests.
      const idle = now - pointer.seen > (sweeps ? 2500 : 900);
      if (sweeps || !idle) {
        const sweepX = width * (0.6 + 0.32 * Math.sin(now / 3400));
        const targetX = idle ? sweepX : pointer.x;
        const targetY = idle ? priceToY(wave(sweepX / pitch, cols)) : pointer.y;
        const ease = 1 - Math.exp(-dt / (idle ? 420 : 90));
        lens.x += (targetX - lens.x) * ease;
        lens.y += (targetY - lens.y) * ease;
      }

      const decay = Math.exp(-dt / 520);
      let warmest = 0;
      for (let index = 0; index < heat.length; index++) {
        heat[index] *= decay;
        if (heat[index] > warmest) warmest = heat[index];
      }
      if (sweeps || !idle) {
        warm(lens.x, lens.y, width < 640 ? look.radius.small : look.radius.large);
        warmest = 1;
      }

      paint(sweeps && !idle);
      // The page field stops once everything has faded, and wakes on the next move
      if (visible && ready && warmest >= 0.02) frame = requestAnimationFrame(tick);
    }

    function start() {
      if (!frame && visible && ready && !reduceMotion) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function drawStill() {
      // Reduced motion: the hero shows one still frame with a patch of the field
      // revealed; the page field shows its faint outlines only
      heat.fill(0);
      if (sweeps) {
        const x = width * 0.72;
        warm(x, priceToY(wave(x / pitch, cols)), Math.min(width, height) * 0.42);
      }
      paint(false);
    }

    resize();
    lens.x = width * 0.72;
    lens.y = priceToY(wave(lens.x / pitch, cols));

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) drawStill();
      else if (sweeps) start();
      else paint(false);
    });
    resizeObserver.observe(host);
    // The hero's band depends on where the headline sits, which moves if it rewraps
    const headline = host.querySelector("[data-hero-headline]");
    if (sweeps && headline) resizeObserver.observe(headline);

    // Stop drawing when the field is scrolled away or the tab is hidden
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      visible = inView && !document.hidden;
      if (visible && sweeps) start();
    });
    viewObserver.observe(host);
    const onVisibility = () => {
      visible = inView && !document.hidden;
      if (visible && sweeps) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // The page field reacts anywhere in the window, including over the panels on
    // top of it; pointerdown is the touch equivalent of moving a mouse.
    const target: HTMLElement | Window = sweeps ? host : window;
    if (reduceMotion) {
      drawStill();
    } else {
      target.addEventListener("pointermove", onPointerMove as EventListener);
      target.addEventListener("pointerdown", onPointerMove as EventListener);
      if (sweeps) start();
      else paint(false);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      target.removeEventListener("pointermove", onPointerMove as EventListener);
      target.removeEventListener("pointerdown", onPointerMove as EventListener);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "fade-in pointer-events-none",
        variant === "hero" ? "absolute inset-0 size-full" : "fixed inset-0 -z-10 size-full",
      )}
    />
  );
}
