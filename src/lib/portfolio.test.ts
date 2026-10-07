import { describe, expect, it } from "vitest";
import {
  breakdownByAssetType,
  getHoldingMetrics,
  rankByReturn,
  summarizePortfolio,
} from "./portfolio";
import type { Holding } from "./types";

function holding(overrides: Partial<Holding>): Holding {
  return {
    id: "x",
    assetType: "stock",
    name: "Test",
    symbol: null,
    quantity: 1,
    avgBuyPrice: 100,
    currentPrice: 100,
    buyDate: "2024-01-01",
    ...overrides,
  };
}

describe("getHoldingMetrics", () => {
  it("computes invested, value and profit", () => {
    const m = getHoldingMetrics(holding({ quantity: 10, avgBuyPrice: 100, currentPrice: 125 }));
    expect(m.invested).toBe(1000);
    expect(m.currentValue).toBe(1250);
    expect(m.pnl).toBe(250);
    expect(m.pnlPct).toBe(25);
  });

  it("reports losses as negative", () => {
    const m = getHoldingMetrics(holding({ quantity: 4, avgBuyPrice: 50, currentPrice: 40 }));
    expect(m.pnl).toBe(-40);
    expect(m.pnlPct).toBe(-20);
  });

  it("returns 0% instead of NaN when nothing was invested", () => {
    const m = getHoldingMetrics(holding({ avgBuyPrice: 0, currentPrice: 10 }));
    expect(m.pnlPct).toBe(0);
  });
});

describe("summarizePortfolio", () => {
  it("adds up all holdings", () => {
    const s = summarizePortfolio([
      holding({ quantity: 10, avgBuyPrice: 100, currentPrice: 120 }), // 1000 -> 1200
      holding({ quantity: 5, avgBuyPrice: 200, currentPrice: 180 }), // 1000 -> 900
    ]);
    expect(s.invested).toBe(2000);
    expect(s.currentValue).toBe(2100);
    expect(s.pnl).toBe(100);
    expect(s.pnlPct).toBe(5);
    expect(s.holdingsCount).toBe(2);
  });

  it("handles an empty portfolio", () => {
    expect(summarizePortfolio([])).toEqual({
      invested: 0,
      currentValue: 0,
      pnl: 0,
      pnlPct: 0,
      holdingsCount: 0,
    });
  });
});

describe("breakdownByAssetType", () => {
  const holdings = [
    holding({ assetType: "gold", quantity: 1, avgBuyPrice: 100, currentPrice: 100 }),
    holding({ assetType: "stock", quantity: 1, avgBuyPrice: 200, currentPrice: 300 }),
  ];

  it("keeps the fixed asset-type order and skips types not held", () => {
    expect(breakdownByAssetType(holdings).map((b) => b.assetType)).toEqual(["stock", "gold"]);
  });

  it("computes allocation as a share of current value", () => {
    const [stock, gold] = breakdownByAssetType(holdings);
    expect(stock.allocationPct).toBe(75);
    expect(gold.allocationPct).toBe(25);
  });
});

describe("rankByReturn", () => {
  it("sorts best to worst return", () => {
    const ranked = rankByReturn([
      holding({ id: "a", currentPrice: 90 }),
      holding({ id: "b", currentPrice: 150 }),
      holding({ id: "c", currentPrice: 110 }),
    ]);
    expect(ranked.map((h) => h.id)).toEqual(["b", "c", "a"]);
  });
});
