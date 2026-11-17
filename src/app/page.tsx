import Link from "next/link";
import { MotionConfig } from "motion/react";
import { AllocationStrip } from "@/components/charts/allocation-strip";
import { HeroBackdrop } from "@/components/landing/hero-backdrop";
import { MoneyStory } from "@/components/landing/money-story";
import { TickerTape } from "@/components/landing/ticker-tape";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { formatINR, formatINRCompact } from "@/lib/format";
import { breakdownByAssetType, rankByReturn, summarizePortfolio } from "@/lib/portfolio";
import { SAMPLE_HOLDINGS } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Rupees, lakhs and crores",
    body: `Amounts use Indian digit grouping, so ${formatINR(1234567.89)} reads the way you would say it. Charts shorten the same figure to ${formatINRCompact(1234567.89)}.`,
  },
  {
    title: "Returns, worked out",
    body: "Each holding shows what went in, what it is worth now, and the profit or loss in rupees and as a percentage. The portfolio adds them up.",
  },
  {
    title: "Every asset type together",
    body: "Stocks, mutual funds, ETFs, fixed deposits and gold sit side by side. Each type keeps one colour across every chart and table.",
  },
  {
    title: "Private to your account",
    body: "Sign in with your email and a password. The dashboard checks your session on the server before it shows a single number.",
  },
  {
    title: "Readable without colour",
    body: "Every gain and loss carries a plus or minus sign, so green and red are never the only clue.",
  },
];

const ROADMAP = [
  { status: "Built", title: "Dashboard with charts, on a sample portfolio" },
  { status: "Built", title: "Email and password sign-in, with a protected dashboard" },
  { status: "Next", title: "Your own holdings, saved to your account" },
  { status: "Planned", title: "A public deployment with a demo account" },
  { status: "Planned", title: "Live NSE, BSE and mutual fund prices" },
  { status: "Planned", title: "XIRR returns, CSV import and a portfolio history chart" },
];

export default function LandingPage() {
  // Everything on this page is computed from the sample portfolio, with the
  // same functions the dashboard uses. No figure is typed in by hand.
  const summary = summarizePortfolio(SAMPLE_HOLDINGS);
  const ranked = rankByReturn(SAMPLE_HOLDINGS);
  const byType = breakdownByAssetType(SAMPLE_HOLDINGS);

  return (
    // reducedMotion="user": Motion skips transform animations when the visitor asks for less motion
    <MotionConfig reducedMotion="user">
      <main id="main">
        {/* Hero: runs under the fixed header and fills the first screen */}
        <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
          <HeroBackdrop />
          {/* Keeps the headline readable over the candles. Below lg the text sits at the
              bottom and the candles above it, so the fade stops short of them; on
              desktop the text is on the left and the fade runs sideways. */}
          <div
            aria-hidden
            className="from-background via-background/70 lg:via-background/40 absolute inset-0 bg-linear-to-t from-30% via-55% to-transparent to-80% lg:bg-linear-to-r lg:from-0% lg:via-35% lg:to-100%"
          />

          <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-(--header-h) pb-10 sm:px-8 lg:justify-center lg:pb-0">
            {/* data-hero-headline: the candle field keeps its candles above this when stacked */}
            <h1
              data-hero-headline
              className="type-condensed text-[clamp(4.5rem,15vw,14rem)] leading-[0.82] font-extrabold tracking-[-0.01em]"
            >
              <span className="rise-line">
                <span>Know what</span>
              </span>
              <span
                className="rise-line"
                style={{ "--rise-delay": "120ms" } as React.CSSProperties}
              >
                <span>you own.</span>
              </span>
            </h1>

            <div
              className="fade-in mt-8 max-w-xl space-y-8"
              style={{ "--fade-delay": "500ms" } as React.CSSProperties}
            >
              <p className="text-lg leading-relaxed sm:text-xl">
                Stocks, mutual funds, ETFs, fixed deposits and gold on one dashboard, with every
                return worked out in rupees.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/signup" className={buttonVariants({ size: "xl" })}>
                  Create account
                </Link>
                {/* Log in already sits in the header; the second action shows what the product does */}
                <a href="#story" className={buttonVariants({ variant: "outline", size: "xl" })}>
                  See how it works
                </a>
              </div>
              <p className="text-muted-foreground text-sm">
                It runs on a sample Indian portfolio today. Adding your own holdings comes next.
              </p>
            </div>
          </div>

          <div
            className="fade-in relative"
            style={{ "--fade-delay": "800ms" } as React.CSSProperties}
          >
            <TickerTape holdings={ranked} />
          </div>
        </section>

        <MoneyStory holdings={ranked} summary={summary} />

        <section
          aria-labelledby="allocation-heading"
          className="border-line border-t py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <div className="mb-12 max-w-2xl space-y-4">
              <h2
                id="allocation-heading"
                className="type-condensed text-4xl leading-[0.95] font-extrabold sm:text-6xl"
              >
                Where the money sits
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                One bar is the whole portfolio. Point at a piece, or tap it, to see how much is
                there and how it has done.
              </p>
            </div>
            <AllocationStrip data={byType} />
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-line border-t py-24 sm:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <h2
              id="features-heading"
              className="type-condensed mb-12 max-w-2xl text-4xl leading-[0.95] font-extrabold sm:text-6xl"
            >
              What it does today
            </h2>
            <dl className="border-line border-t">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="border-line grid gap-2 border-b py-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16"
                >
                  <dt className="type-condensed text-3xl leading-none font-bold sm:text-4xl">
                    {feature.title}
                  </dt>
                  <dd className="text-muted-foreground max-w-xl text-base leading-relaxed">
                    {feature.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          id="roadmap"
          aria-labelledby="roadmap-heading"
          className="border-line scroll-mt-(--header-h) border-t py-24 sm:py-32"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="space-y-4">
              <h2
                id="roadmap-heading"
                className="type-condensed text-4xl leading-[0.95] font-extrabold sm:text-6xl"
              >
                Built so far, and what comes next
              </h2>
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                This project is still being built. Here is what works today and what is planned.
              </p>
            </div>
            <ol className="border-line border-t">
              {ROADMAP.map((item) => (
                <li
                  key={item.title}
                  className="border-line grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 border-b py-4"
                >
                  <span
                    className={cn(
                      "type-wide text-xs font-semibold",
                      item.status === "Built" && "text-gain",
                      item.status === "Next" && "text-bullion",
                      item.status === "Planned" && "text-muted-foreground",
                    )}
                  >
                    {item.status}
                  </span>
                  <span
                    className={cn(
                      "text-base",
                      item.status === "Planned" && "text-muted-foreground",
                    )}
                  >
                    {item.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="start-heading" className="border-line border-t py-28 sm:py-40">
          <div className="mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-8">
            <h2
              id="start-heading"
              className="type-condensed max-w-5xl text-[clamp(3.5rem,10vw,9rem)] leading-[0.85] font-extrabold"
            >
              Try the dashboard.
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              Create a free account and the dashboard opens on the sample portfolio. Adding your own
              holdings comes next.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className={buttonVariants({ size: "xl" })}>
                Create account
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "xl" })}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}
