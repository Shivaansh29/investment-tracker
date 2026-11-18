import type { Metadata } from "next";
import { Suspense } from "react";
import { PageBackdrop } from "@/components/backdrop/page-backdrop";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageTransition } from "@/components/page-transition";
import { requireUser } from "@/lib/auth";
import { SAMPLE_HOLDINGS } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Dashboard · Investment Tracker" };

export default function DashboardPage() {
  return (
    <>
      {/* Outside PageTransition: its entrance moves the page, and the field must stay put */}
      <PageBackdrop />
      <PageTransition>
        {/* The header is fixed, so the top padding is its height plus the page's own */}
        <main
          id="main"
          className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-[calc(var(--header-h)+2.5rem)] pb-16 sm:space-y-10 sm:px-8 sm:pb-24"
        >
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {/* rise-line: the heading rises into place, like the landing headline */}
              <h1 className="type-condensed text-5xl leading-[0.95] font-extrabold sm:text-6xl">
                <span className="rise-line">
                  <span>Portfolio overview</span>
                </span>
              </h1>
              <span className="type-wide border-line text-bullion rounded-[3px] border px-2 py-1 text-xs font-semibold">
                Sample data
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
              This is an example Indian portfolio with illustrative prices, not live market data.
              Adding your own holdings comes next.
            </p>
          </header>

          {/* The heading above is static; everything below needs the signed-in user */}
          <Suspense fallback={<DashboardSkeleton />}>
            <PortfolioDashboard />
          </Suspense>
        </main>
      </PageTransition>
    </>
  );
}

async function PortfolioDashboard() {
  // Server-side check: the proxy already redirects signed-out visitors, but
  // the page never relies on that alone. Nothing below renders until it passes.
  await requireUser();

  // Sample data for now; Milestone 4 swaps this for the signed-in user's holdings.
  return <DashboardView holdings={SAMPLE_HOLDINGS} />;
}
