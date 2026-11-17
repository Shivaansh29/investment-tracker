"use client";

import { displaySymbol } from "@/components/holdings/labels";
import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { ASSET_TYPE_COLORS } from "@/components/charts/chart-colors";
import { ChangeBadge } from "@/components/dashboard/summary-cards";
import { AssetTypePill } from "@/components/holdings/asset-type-pill";
import { HoldingDetails } from "@/components/holdings/holding-details";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatINRWhole, formatSignedINR } from "@/lib/format";
import type { HoldingMetrics, PortfolioSummary } from "@/lib/portfolio";
import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Which holdings are shown: every one, or only one asset type. */
type Filter = AssetType | "all";

/** The columns the list can be ordered by. Each is also a field of a holding. */
type SortKey = "name" | "invested" | "currentValue" | "pnl";
type SortDirection = "asc" | "desc";
type Sort = { key: SortKey; direction: SortDirection };

type Totals = Pick<PortfolioSummary, "invested" | "currentValue" | "pnl" | "pnlPct">;

/** The order the dashboard hands the rows over in: largest holding first. */
const DEFAULT_SORT: Sort = { key: "currentValue", direction: "desc" };

/** The direction a column starts in when it is first chosen: names A to Z, amounts largest first. */
const FIRST_DIRECTION: Record<SortKey, SortDirection> = {
  name: "asc",
  invested: "desc",
  currentValue: "desc",
  pnl: "desc",
};

/** Every column and direction, worded for the "Sort by" menu on phones. */
const SORT_OPTIONS: (Sort & { label: string })[] = [
  { key: "currentValue", direction: "desc", label: "Current value, highest first" },
  { key: "currentValue", direction: "asc", label: "Current value, lowest first" },
  { key: "invested", direction: "desc", label: "Invested, highest first" },
  { key: "invested", direction: "asc", label: "Invested, lowest first" },
  { key: "pnl", direction: "desc", label: "Returns, highest first" },
  { key: "pnl", direction: "asc", label: "Returns, lowest first" },
  { key: "name", direction: "asc", label: "Name, A to Z" },
  { key: "name", direction: "desc", label: "Name, Z to A" },
];

/** Opens the details panel. `row` is the table row or list item that was used. */
type OpenDetails = (id: string, row: HTMLElement) => void;

// Shared by the table rows and the phone list rows. Hovering is only for a
// mouse, so the same tint also shows while the name button has keyboard focus
// and while the row is being pressed.
const rowInteraction =
  "group/row hover:bg-accent/40 active:bg-accent/40 has-[button:focus-visible]:bg-accent/40 cursor-pointer transition-colors";

const nameButton =
  "cursor-pointer rounded-sm text-left leading-snug font-medium underline-offset-4 group-hover/row:underline";

const num = "text-right tabular-nums";
const detail = "text-muted-foreground mt-0.5 text-xs";

/**
 * The holdings explorer: filter by asset type, sort by any column, and open any
 * holding to see its details. Phones get a stacked list; larger screens a table.
 *
 * It is a Client Component because the filter, the sort order and the open
 * panel are all state that changes as the user clicks.
 */
export function HoldingsTable({
  holdings,
  summary,
}: {
  holdings: HoldingMetrics[];
  summary: PortfolioSummary;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);

  // Which holding the panel shows, and whether it is open, are kept apart on
  // purpose: the holding stays set while the panel slides shut, so its content
  // does not vanish halfway through the closing animation.
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // The name button of the row that opened the panel. Focus goes back to it on close.
  const detailsTriggerRef = useRef<HTMLElement | null>(null);

  const sortSelectId = useId();

  if (holdings.length === 0) return <EmptyState />;

  // Asset types in their fixed order (the same order the charts use), skipping
  // the ones this portfolio does not hold
  const types = ASSET_TYPES.filter((type) => holdings.some((h) => h.assetType === type));
  // If the chosen type is no longer in the data, fall back to showing everything
  const activeFilter: Filter = filter !== "all" && types.includes(filter) ? filter : "all";

  const filtered =
    activeFilter === "all" ? holdings : holdings.filter((h) => h.assetType === activeFilter);
  // Copy before sorting: sort() reorders the array it is called on, and
  // `filtered` can be the very array the dashboard passed in
  const rows = [...filtered].sort((a, b) => compareHoldings(a, b, sort));

  // With everything showing, the totals are the portfolio summary itself, so
  // they match the figures at the top of the dashboard exactly
  const totals: Totals = activeFilter === "all" ? summary : totalsOf(filtered);
  const totalLabel = activeFilter === "all" ? "Total" : `Total, ${ASSET_TYPE_LABELS[activeFilter]}`;

  // SORT_OPTIONS lists every column in both directions, so this always finds one
  const sortOptionIndex = SORT_OPTIONS.findIndex(
    (option) => option.key === sort.key && option.direction === sort.direction,
  );

  /** Clicking the column that is already sorted flips it; a new column starts in its usual direction. */
  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: FIRST_DIRECTION[key] },
    );
  }

  const openDetails: OpenDetails = (id, row) => {
    detailsTriggerRef.current = row.querySelector("button");
    setDetailsId(id);
    setDetailsOpen(true);
  };

  const detailsHolding = holdings.find((h) => h.id === detailsId);

  return (
    // gap, not space-y: space-y works by setting margins on the children, and
    // the filter row below sets its own (negative) margin, which would cancel it
    <div className="flex flex-col gap-4">
      {/* With a single asset type there is nothing to filter by */}
      {types.length > 1 && (
        // The row scrolls sideways on phones instead of wrapping into a tall block.
        // A scrolling box clips whatever sticks out of it, so the padding (cancelled
        // by the negative margin) leaves room for the buttons' focus outlines.
        <div
          role="group"
          aria-label="Filter by asset type"
          className="-m-1 flex [scrollbar-width:none] gap-2 overflow-x-auto p-1 sm:flex-wrap"
        >
          <FilterButton
            label="All"
            count={holdings.length}
            selected={activeFilter === "all"}
            onSelect={() => setFilter("all")}
          />
          {types.map((type) => (
            <FilterButton
              key={type}
              label={ASSET_TYPE_LABELS[type]}
              count={holdings.filter((h) => h.assetType === type).length}
              color={ASSET_TYPE_COLORS[type]}
              selected={activeFilter === type}
              onSelect={() => setFilter(type)}
            />
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-sm">Select a holding to see its details.</p>

      {/* Phones and small tablets have no column headers to click, so sorting is a menu */}
      <div className="flex items-center gap-3 md:hidden">
        <label htmlFor={sortSelectId} className="text-muted-foreground shrink-0 text-sm">
          Sort by
        </label>
        <div className="relative min-w-0 flex-1">
          <select
            id={sortSelectId}
            value={sortOptionIndex}
            onChange={(event) => {
              const option = SORT_OPTIONS[Number(event.target.value)];
              setSort({ key: option.key, direction: option.direction });
            }}
            // 16px text: iOS zooms the page when a form control with smaller text gets focus
            className="border-input bg-panel text-foreground h-11 w-full appearance-none rounded-md border pr-10 pl-3 text-base"
          >
            {SORT_OPTIONS.map((option, index) => (
              <option key={option.label} value={index}>
                {option.label}
              </option>
            ))}
          </select>
          {/* appearance-none removes the browser's own arrow, so this one stands in for it */}
          <ChevronDown
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          />
        </div>
      </div>

      {/* Tells screen reader users what a filter or sort click just did */}
      <p aria-live="polite" className="sr-only">
        Showing {rows.length} of {holdings.length} holdings. Sorted by{" "}
        {SORT_OPTIONS[sortOptionIndex].label}.
      </p>

      {/* Phones: a stacked list, since four number columns can't fit side by side */}
      <HoldingsList rows={rows} totals={totals} totalLabel={totalLabel} onOpen={openDetails} />

      {/* From 768px the full table fits its panel; below that its columns would be cut off */}
      <div className="hidden md:block">
        <HoldingsGrid
          rows={rows}
          totals={totals}
          totalLabel={totalLabel}
          sort={sort}
          onSort={toggleSort}
          onOpen={openDetails}
        />
      </div>

      <HoldingDetails
        holding={detailsHolding}
        portfolioValue={summary.currentValue}
        open={detailsOpen && detailsHolding !== undefined}
        onOpenChange={setDetailsOpen}
        returnFocusRef={detailsTriggerRef}
      />
    </div>
  );
}

/** Orders two holdings by the chosen column. A negative result puts `a` first. */
function compareHoldings(a: HoldingMetrics, b: HoldingMetrics, sort: Sort): number {
  const result =
    sort.key === "name" ? a.name.localeCompare(b.name, "en-IN") : a[sort.key] - b[sort.key];
  return sort.direction === "asc" ? result : -result;
}

/** Adds up a set of rows the same way summarizePortfolio() in lib/portfolio does. */
function totalsOf(rows: HoldingMetrics[]): Totals {
  let invested = 0;
  let currentValue = 0;
  for (const row of rows) {
    invested += row.invested;
    currentValue += row.currentValue;
  }
  const pnl = currentValue - invested;
  return { invested, currentValue, pnl, pnlPct: invested === 0 ? 0 : (pnl / invested) * 100 };
}

function FilterButton({
  label,
  count,
  color,
  selected,
  onSelect,
}: {
  label: string;
  count: number;
  /** The asset type's chart colour. "All" has none. */
  color?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors",
        // Gold marks the current choice, as it does everywhere else in the product
        selected
          ? "border-bullion text-foreground"
          : "border-line text-muted-foreground hover:text-foreground",
      )}
    >
      {color && (
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
      <span className="tabular-nums">
        {count}
        <span className="sr-only"> {count === 1 ? "holding" : "holdings"}</span>
      </span>
    </button>
  );
}

function HoldingsGrid({
  rows,
  totals,
  totalLabel,
  sort,
  onSort,
  onOpen,
}: {
  rows: HoldingMetrics[];
  totals: Totals;
  totalLabel: string;
  sort: Sort;
  onSort: (key: SortKey) => void;
  onOpen: OpenDetails;
}) {
  return (
    <Table aria-label="Holdings">
      <TableHeader>
        <TableRow>
          <SortableHead label="Holding" sortKey="name" sort={sort} onSort={onSort} />
          <SortableHead
            label="Invested"
            hint="Units × avg. buy price"
            sortKey="invested"
            sort={sort}
            onSort={onSort}
            alignRight
          />
          <SortableHead
            label="Current value"
            hint="Current price per unit"
            sortKey="currentValue"
            sort={sort}
            onSort={onSort}
            alignRight
          />
          <SortableHead label="Returns" sortKey="pnl" sort={sort} onSort={onSort} alignRight />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((h) => (
          // A click anywhere on the row opens the details. The name is a real
          // button for keyboard users: pressing it fires a click that bubbles
          // up to this same handler, so there is only one place that opens the panel.
          <TableRow
            key={h.id}
            onClick={(event) => onOpen(h.id, event.currentTarget)}
            className={rowInteraction}
          >
            <TableCell className="min-w-36 whitespace-normal">
              <button type="button" aria-haspopup="dialog" className={nameButton}>
                {h.name}
              </button>
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <AssetTypePill assetType={h.assetType} />
                {displaySymbol(h.symbol) && (
                  <span className="text-muted-foreground">{displaySymbol(h.symbol)}</span>
                )}
              </div>
            </TableCell>
            <TableCell className={num}>
              <p className="font-medium">{formatINRWhole(h.invested)}</p>
              <p className={detail}>
                {h.quantity.toLocaleString("en-IN")} × {formatINR(h.avgBuyPrice)}
                <span className="sr-only"> average buy price</span>
              </p>
            </TableCell>
            <TableCell className={num}>
              <p className="font-medium">{formatINRWhole(h.currentValue)}</p>
              <p className={detail}>{formatINR(h.currentPrice)} per unit</p>
            </TableCell>
            <TableCell className={num}>
              <ReturnsCell pnl={h.pnl} pnlPct={h.pnlPct} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="whitespace-normal">{totalLabel}</TableCell>
          <TableCell className={num}>{formatINRWhole(totals.invested)}</TableCell>
          <TableCell className={num}>{formatINRWhole(totals.currentValue)}</TableCell>
          <TableCell className={num}>
            <ReturnsCell pnl={totals.pnl} pnlPct={totals.pnlPct} />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

/** A column heading that sorts the table by its column when clicked. */
function SortableHead({
  label,
  hint,
  sortKey,
  sort,
  onSort,
  alignRight = false,
}: {
  label: string;
  /** A second, quieter line that explains the small print in the cells below. */
  hint?: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  alignRight?: boolean;
}) {
  const isSorted = sort.key === sortKey;
  const Arrow = !isSorted ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead
      // aria-sort tells screen readers which column is sorted and in which
      // direction; the arrow says the same thing to everyone else
      aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
      // Top-aligned so the four labels line up even though only two have a hint
      className={cn("py-1 align-top", alignRight && "text-right")}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "hover:text-foreground inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-sm transition-colors",
          isSorted && "text-foreground",
          // In a right-aligned column the arrow goes before the label, so the
          // label keeps its right edge in line with the figures underneath
          alignRight && "flex-row-reverse",
        )}
      >
        {label}
        <Arrow
          aria-hidden
          className={cn("size-3.5 shrink-0", isSorted ? "text-bullion" : "opacity-60")}
        />
      </button>
      {hint && <span className="-mt-1.5 block pb-1.5 text-xs font-normal">{hint}</span>}
    </TableHead>
  );
}

function HoldingsList({
  rows,
  totals,
  totalLabel,
  onOpen,
}: {
  rows: HoldingMetrics[];
  totals: Totals;
  totalLabel: string;
  onOpen: OpenDetails;
}) {
  return (
    // The list is 8px wider than the text on each side (-mx-2 here, px-2 on the
    // rows), so the tint of a pressed row does not sit hard against the letters
    <div className="-mx-2 md:hidden">
      <ul className="border-line border-t">
        {rows.map((h) => (
          // Same idea as the table rows: tap anywhere, or use the name button
          <li
            key={h.id}
            onClick={(event) => onOpen(h.id, event.currentTarget)}
            className={cn(rowInteraction, "border-line space-y-2 border-b px-2 py-3.5")}
          >
            <div className="flex items-start justify-between gap-3">
              <button type="button" aria-haspopup="dialog" className={nameButton}>
                {h.name}
              </button>
              <p className="shrink-0 font-medium tabular-nums">{formatINRWhole(h.currentValue)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <AssetTypePill assetType={h.assetType} />
                {displaySymbol(h.symbol) && (
                  <span className="text-muted-foreground truncate">{displaySymbol(h.symbol)}</span>
                )}
              </div>
              <ChangeBadge percent={h.pnlPct} className="shrink-0" />
            </div>
            <div className="flex justify-between gap-3 text-sm tabular-nums">
              <span className="text-muted-foreground">Invested {formatINRWhole(h.invested)}</span>
              <span className="shrink-0 font-medium">{formatSignedINR(h.pnl)}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* The sum is ruled off with a stronger line than the rows, like the table's footer */}
      <div className="border-foreground/30 -mt-px flex items-start justify-between gap-3 border-t px-2 pt-3.5">
        <div>
          <p className="font-medium">{totalLabel}</p>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            Invested {formatINRWhole(totals.invested)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium tabular-nums">{formatINRWhole(totals.currentValue)}</p>
          <ChangeBadge amount={totals.pnl} percent={totals.pnlPct} className="mt-1" />
        </div>
      </div>
    </div>
  );
}

/** Profit/loss amount with its % underneath, keeping the column narrow. */
function ReturnsCell({ pnl, pnlPct }: { pnl: number; pnlPct: number }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-medium">{formatSignedINR(pnl)}</span>
      <ChangeBadge percent={pnlPct} />
    </div>
  );
}

/** Shown when the portfolio has no holdings at all. */
function EmptyState() {
  return (
    <div className="max-w-xl space-y-2">
      <h3 className="text-base font-medium">No holdings yet</h3>
      {/* No "Add holding" button here: adding is not built yet, and a button
          that does nothing would be worse than none */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        This is where each thing you own is listed, with what you paid for it, what it is worth now
        and the return. Adding your own holdings comes next.
      </p>
    </div>
  );
}
