export const ASSET_TYPES = [
  "stock",
  "mutual_fund",
  "etf",
  "fd",
  "gold",
  "crypto",
  "other",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: "Stocks",
  mutual_fund: "Mutual funds",
  etf: "ETFs",
  fd: "Fixed deposits",
  gold: "Gold",
  crypto: "Crypto",
  other: "Other",
};

export type Holding = {
  id: string;
  assetType: AssetType;
  name: string;
  /** Exchange ticker (e.g. "RELIANCE.NS") or mutual fund scheme code. */
  symbol: string | null;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  /** ISO date, e.g. "2024-03-15". */
  buyDate: string;
};
