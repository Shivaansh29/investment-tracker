import type { AssetType } from "@/lib/types";

/**
 * Each asset type always gets the same color, in every chart.
 * The values are CSS variables defined in globals.css, so SVG charts and
 * Tailwind classes draw from one palette.
 */
export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  stock: "var(--series-1)",
  mutual_fund: "var(--series-2)",
  etf: "var(--series-3)",
  // Gold gets the amber slot so it reads as gold; deposits get the pink one
  fd: "var(--series-5)",
  gold: "var(--series-4)",
  crypto: "var(--series-6)",
  other: "var(--series-7)",
};
