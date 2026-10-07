const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 2,
});

/** ₹12,34,567.89 (Indian digit grouping). */
export function formatINR(value: number): string {
  return inr.format(value);
}

/** ₹12,34,568, for large headline figures. */
export function formatINRWhole(value: number): string {
  return inrWhole.format(value);
}

/** ₹12.35L / ₹1.23Cr, for chart axes and tight spaces. */
export function formatINRCompact(value: number): string {
  return inrCompact.format(value);
}

/** Signed amount, e.g. +₹1,250 or −₹980. */
export function formatSignedINR(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + inrWhole.format(Math.abs(value));
}

/** Signed percentage, e.g. +12.34% or −4.10%. */
export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

/** Plain percentage, e.g. 23.4%. */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
