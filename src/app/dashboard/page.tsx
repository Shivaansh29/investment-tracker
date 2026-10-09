import type { Metadata } from "next";
import { BarChart3, ChartPie, List, TrendingUp } from "lucide-react";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { ReturnsByHoldingChart } from "@/components/charts/returns-by-holding-chart";
import { ValueByTypeChart } from "@/components/charts/value-by-type-chart";
import { SectionCard } from "@/components/dashboard/section-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import {
  breakdownByAssetType,
  getHoldingMetrics,
  rankByReturn,
  summarizePortfolio,
} from "@/lib/portfolio";
import { SAMPLE_HOLDINGS } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Dashboard · Investment Tracker" };

export default function DashboardPage() {
  // Sample data for now; Milestone 4 swaps this for the signed-in user's holdings.
  const holdings = SAMPLE_HOLDINGS;

  const summary = summarizePortfolio(holdings);
  const byType = breakdownByAssetType(holdings);
  const ranked = rankByReturn(holdings);
  const tableRows = holdings.map(getHoldingMetrics).sort((a, b) => b.currentValue - a.currentValue);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio overview</h1>
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
            Sample data
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          An example Indian portfolio. Your own holdings will appear here once sign-in is added.
        </p>
      </div>

      <SummaryCards
        summary={summary}
        assetTypeCount={byType.length}
        best={ranked[0]}
        worst={ranked.at(-1)}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={ChartPie}
          title="Allocation"
          description="Share of current value by asset type"
        >
          <AllocationDonut data={byType} totalValue={summary.currentValue} />
        </SectionCard>

        <SectionCard
          icon={BarChart3}
          title="Invested vs current value"
          description="What you put in, what it is worth now, and the growth"
        >
          <ValueByTypeChart data={byType} />
        </SectionCard>
      </div>

      <SectionCard
        icon={TrendingUp}
        title="Returns by holding"
        description="Percentage gain or loss on each investment"
      >
        <ReturnsByHoldingChart data={ranked} />
      </SectionCard>

      <SectionCard icon={List} title="Holdings" description="Everything you own, largest first">
        <HoldingsTable holdings={tableRows} summary={summary} />
      </SectionCard>
    </main>
  );
}
