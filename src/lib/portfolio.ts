import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetType, type Holding } from "./types";

export type HoldingMetrics = Holding & {
  invested: number;
  currentValue: number;
  pnl: number;
  /** Return as a percentage of the amount invested, e.g. 12.5 means +12.5%. */
  pnlPct: number;
};

export type PortfolioSummary = {
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  holdingsCount: number;
};

export type AssetTypeBreakdown = {
  assetType: AssetType;
  label: string;
  invested: number;
  currentValue: number;
  /** Share of total current value, 0–100. */
  allocationPct: number;
};

/** Percentage change, guarding against division by zero. */
function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}

export function getHoldingMetrics(holding: Holding): HoldingMetrics {
  const invested = holding.quantity * holding.avgBuyPrice;
  const currentValue = holding.quantity * holding.currentPrice;
  const pnl = currentValue - invested;
  return { ...holding, invested, currentValue, pnl, pnlPct: percentOf(pnl, invested) };
}

export function summarizePortfolio(holdings: Holding[]): PortfolioSummary {
  let invested = 0;
  let currentValue = 0;
  for (const h of holdings.map(getHoldingMetrics)) {
    invested += h.invested;
    currentValue += h.currentValue;
  }
  const pnl = currentValue - invested;
  return {
    invested,
    currentValue,
    pnl,
    pnlPct: percentOf(pnl, invested),
    holdingsCount: holdings.length,
  };
}

/**
 * Totals per asset type, in the fixed ASSET_TYPES order (so each type keeps
 * the same chart color everywhere). Types the user doesn't hold are omitted.
 */
export function breakdownByAssetType(holdings: Holding[]): AssetTypeBreakdown[] {
  const totalValue = summarizePortfolio(holdings).currentValue;

  return ASSET_TYPES.flatMap((assetType) => {
    const ofType = holdings.filter((h) => h.assetType === assetType);
    if (ofType.length === 0) return [];
    const { invested, currentValue } = summarizePortfolio(ofType);
    return [
      {
        assetType,
        label: ASSET_TYPE_LABELS[assetType],
        invested,
        currentValue,
        allocationPct: percentOf(currentValue, totalValue),
      },
    ];
  });
}

/** Holdings with metrics, sorted from best to worst return. */
export function rankByReturn(holdings: Holding[]): HoldingMetrics[] {
  return holdings.map(getHoldingMetrics).sort((a, b) => b.pnlPct - a.pnlPct);
}
