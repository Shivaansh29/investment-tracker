import { PageBackdrop } from "@/components/backdrop/page-backdrop";
import { ReturnCandles } from "@/components/charts/return-candles";
import { formatSignedPercent } from "@/lib/format";
import { rankByReturn } from "@/lib/portfolio";
import { SAMPLE_HOLDINGS } from "@/lib/sample-data";

/**
 * Frame for the login and sign-up pages: the form on the left and, on wide
 * screens, a panel on the right that shows what the product does using the
 * sample portfolio. Phones and tablets get the form on its own.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Same data and the same function the dashboard uses, so the chart is real
  const ranked = rankByReturn(SAMPLE_HOLDINGS);
  const best = ranked.at(0);
  const worst = ranked.at(-1);

  // The candles are plain coloured bars, so screen readers get this sentence instead
  const chartSummary =
    best && worst
      ? `Returns of the ${ranked.length} holdings in the sample portfolio, from ${formatSignedPercent(best.pnlPct)} for ${best.name} to ${formatSignedPercent(worst.pnlPct)} for ${worst.name}. Bars above the buy price line are gains, bars below it are losses.`
      : "Returns of the holdings in the sample portfolio.";

  return (
    <>
      {/* Hidden candles behind the page, lit by the pointer. The layout stays mounted
          between log in and sign up, so the field doesn't restart on that switch. */}
      <PageBackdrop />
      {/* overflow-x-clip: the graph-paper backdrop below is wider than its column on purpose */}
      <main id="main" className="flex flex-1 flex-col overflow-x-clip pt-(--header-h)">
        <div className="mx-auto grid w-full max-w-7xl flex-1 px-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Top-aligned on phones so the heading sits near the top; centred once there is room */}
          <div className="flex items-start py-10 sm:items-center sm:py-16 lg:pr-16">{children}</div>

          <aside
            aria-label="Sample portfolio"
            className="border-line relative isolate hidden flex-col justify-center gap-8 border-l py-12 pl-16 lg:flex"
          >
            {/* A solid backing over the page's candle field: the decorative candles stay on
                the form side and never mix with the real chart here */}
            <div aria-hidden className="bg-background absolute inset-y-0 left-0 -z-20 w-screen" />
            {/* Its own element because graph-paper applies a fade mask, which would also
              fade the text. w-screen lets it run to the right edge of the window. */}
            <div aria-hidden className="graph-paper absolute inset-y-0 left-0 -z-10 w-screen" />

            <p className="type-condensed max-w-xl text-6xl leading-[0.9] font-extrabold xl:text-7xl">
              Every return, measured from the price you paid.
            </p>

            <figure className="space-y-5">
              <div role="img" aria-label={chartSummary}>
                {/* 40svh: statement, chart and caption fit one laptop screen without scrolling */}
                {/* growIn: the candles rise out of the buy-price line as the page opens */}
                <ReturnCandles holdings={ranked} growIn className="h-[40svh]" />
              </div>
              <figcaption className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                Each bar is one holding in the sample portfolio, drawn from its buy price to its
                current sample price, which is illustrative and not a live quote.
              </figcaption>
            </figure>
          </aside>
        </div>
      </main>
    </>
  );
}
