import { cn } from "@/lib/utils";

/**
 * The mark: three candles stepping upward, the last one in gold.
 * Decorative on its own; pair it with the wordmark or an aria-label.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <rect width="28" height="28" rx="6" fill="var(--primary)" />
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
        <line x1="8" y1="13" x2="8" y2="23" opacity="0.7" />
        <line x1="14" y1="9" x2="14" y2="20" opacity="0.7" />
      </g>
      <rect x="6" y="15" width="4" height="6" rx="1" fill="white" opacity="0.7" />
      <rect x="12" y="11" width="4" height="7" rx="1" fill="white" />
      <line
        x1="20"
        y1="5"
        x2="20"
        y2="17"
        stroke="var(--bullion)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="18" y="7" width="4" height="8" rx="1" fill="var(--bullion)" />
    </svg>
  );
}

/** Mark plus the product name set in Archivo's wide width. */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn("type-wide text-[0.8rem] font-semibold", compact && "sr-only sm:not-sr-only")}
      >
        Investment Tracker
      </span>
    </span>
  );
}
