import { AllocationStrip } from "@/components/charts/allocation-strip";
import { ReturnCandles } from "@/components/charts/return-candles";
import { SectionCard } from "@/components/dashboard/section-card";
import { PortfolioOverview } from "@/components/dashboard/summary-cards";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import {
  breakdownByAssetType,
  getHoldingMetrics,
  rankByReturn,
  summarizePortfolio,
} from "@/lib/portfolio";
import type { Holding } from "@/lib/types";

/**
 * Everything on the dashboard below the page heading: the overview band, the
 * allocation bar, the return candles and the holdings table.
 *
 * It only takes a list of holdings and works every figure out from it with the
 * functions in lib/portfolio, so no number is typed in by hand. The page decides
 * where the holdings come from (the sample portfolio today, the signed-in
 * user's own holdings later) and whether the visitor may see them at all.
 *
 * The allocation bar and the candles are the same components the landing page
 * uses, so the product looks and behaves the same before and after signing in.
 */
export function DashboardView({ holdings }: { holdings: Holding[] }) {
  const summary = summarizePortfolio(holdings);
  const byType = breakdownByAssetType(holdings);
  const ranked = rankByReturn(holdings);
  // map() makes a new array, so sorting it leaves the caller's list in its own order
  const tableRows = holdings.map(getHoldingMetrics).sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PortfolioOverview
        summary={summary}
        assetTypeCount={byType.length}
        best={ranked[0]}
        worst={ranked.at(-1)}
      />

      <SectionCard
        title="Allocation"
        description="Share of current value in each asset type. Point at a type, or tap it, to see its numbers."
      >
        <AllocationStrip data={byType} variant="panel" />
      </SectionCard>

      <SectionCard
        title="Returns by holding"
        description="Each bar runs from the price you paid to the current price, best first"
      >
        {/* growIn: the candles rise out of the buy-price line when scrolled into view */}
        <ReturnCandles holdings={ranked} interactive growIn className="h-96 sm:h-[26rem]" />
      </SectionCard>

      <SectionCard title="Holdings" description="Every holding, largest first">
        <HoldingsTable holdings={tableRows} summary={summary} />
      </SectionCard>
    </div>
  );
}
