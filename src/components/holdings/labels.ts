import type { Holding } from "@/lib/types";

/** Words that add length but not meaning to a fund name in a tight label. */
const FILLER_WORDS = new Set(["Fund", "India", "Index", "ETF"]);

/**
 * A fund or deposit name shortened for tight spaces such as the ticker tape and
 * the labels under the return bars: "Nippon India Small Cap Fund" -> "Nippon Small",
 * "UTI Nifty 50 Index Fund" -> "UTI Nifty 50", "SBI Fixed Deposit (7.1%)" -> "SBI FD".
 */
function compactName(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, "") // drop notes in brackets, like an interest rate
    .replace(/Fixed Deposit/i, "FD")
    .split(/\s+/)
    .filter((word) => word && !FILLER_WORDS.has(word));
  // Keep a number that belongs to the name ("Nifty 50"), otherwise two words is enough
  const keep = /^\d+$/.test(words[2] ?? "") ? 3 : 2;
  return words.slice(0, keep).join(" ") || name;
}

/**
 * The shortest recognisable label for a holding: the exchange ticker without
 * its ".NS" suffix (RELIANCE), or a shortened name when there is no ticker
 * (mutual fund scheme codes like "122639" mean nothing to a reader).
 */
export function shortLabel(holding: Pick<Holding, "name" | "symbol">): string {
  return holding.symbol?.endsWith(".NS") ? holding.symbol.slice(0, -3) : compactName(holding.name);
}

/**
 * The symbol worth showing next to a holding's name: exchange tickers yes,
 * bare mutual fund scheme codes no.
 */
export function displaySymbol(symbol: string | null): string | null {
  return symbol && !/^\d+$/.test(symbol) ? symbol : null;
}
