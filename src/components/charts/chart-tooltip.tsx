type TooltipRow = {
  label: string;
  value: string;
  /** Optional color swatch shown next to the row. */
  color?: string;
};

/** Shared tooltip box so every chart's hover card looks the same. */
export function ChartTooltip({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="bg-popover text-popover-foreground ring-foreground/10 min-w-44 rounded-lg px-3 py-2 text-xs shadow-md ring-1">
      <p className="mb-1.5 font-medium">{title}</p>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground flex items-center gap-1.5">
              {row.color && (
                <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
              )}
              {row.label}
            </dt>
            <dd className="font-medium tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
