import { describe, expect, it } from "vitest";
import {
  formatINR,
  formatINRAxisTick,
  formatINRCompact,
  formatPercent,
  formatSignedINR,
  formatSignedPercent,
} from "./format";

describe("INR formatting", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(1234567.89)).toBe("₹12,34,567.89");
  });

  it("compacts to lakh and crore", () => {
    expect(formatINRCompact(250000)).toBe("₹2.5L");
    expect(formatINRCompact(12300000)).toBe("₹1.23Cr");
  });

  it("keeps one unit across a chart axis", () => {
    expect(formatINRAxisTick(0, 320000)).toBe("₹0");
    expect(formatINRAxisTick(80000, 320000)).toBe("₹0.8L");
    expect(formatINRAxisTick(160000, 320000)).toBe("₹1.6L");
    expect(formatINRAxisTick(25000000, 30000000)).toBe("₹2.5Cr");
    expect(formatINRAxisTick(5000, 20000)).toBe("₹5K");
  });

  it("signs gains and losses", () => {
    expect(formatSignedINR(1250)).toBe("+₹1,250");
    expect(formatSignedINR(-980)).toBe("−₹980");
    expect(formatSignedINR(0)).toBe("₹0");
  });
});

describe("percent formatting", () => {
  it("signs percentages", () => {
    expect(formatSignedPercent(12.345)).toBe("+12.35%");
    expect(formatSignedPercent(-4.1)).toBe("−4.10%");
  });

  it("formats plain percentages", () => {
    expect(formatPercent(23.456)).toBe("23.5%");
  });
});
