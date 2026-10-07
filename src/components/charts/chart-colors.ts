import type { AssetType } from "@/lib/types";

/**
 * Each asset type always gets the same color, in every chart.
 * The values are CSS variables defined in globals.css (with dark-mode variants).
 */
export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  stock: "var(--series-1)",
  mutual_fund: "var(--series-2)",
  etf: "var(--series-3)",
  fd: "var(--series-4)",
  gold: "var(--series-5)",
  crypto: "var(--series-6)",
  other: "var(--series-7)",
};

export const GAIN_COLOR = "var(--gain)";
export const LOSS_COLOR = "var(--loss)";
export const MUTED_COLOR = "var(--muted-foreground)";
export const GRID_COLOR = "var(--border)";
export const SURFACE_COLOR = "var(--card)";
