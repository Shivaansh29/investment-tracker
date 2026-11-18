import { ASSET_TYPE_COLORS } from "@/components/charts/chart-colors";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A small tag in the asset type's chart colour, so the table matches the charts.
 * The colour only tints the background and fills the dot; the label itself stays
 * in the normal text colour, because some series colours are too dim to read as text.
 */
export function AssetTypePill({
  assetType,
  className,
}: {
  assetType: AssetType;
  className?: string;
}) {
  const color = ASSET_TYPE_COLORS[assetType];
  return (
    <span
      className={cn(
        "text-foreground inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 22%, transparent)` }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {ASSET_TYPE_LABELS[assetType]}
    </span>
  );
}
