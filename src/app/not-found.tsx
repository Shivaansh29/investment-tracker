import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found · Investment Tracker" };

/**
 * Shown for any address the app has no page for (Next.js also answers with a
 * 404 status). It is deliberately plain: no data and no sign-in check, so it
 * renders even when everything else is having a bad day.
 */
export default function NotFound() {
  return (
    // pt-(--header-h) leaves room for the fixed header; flex-1 fills the rest of
    // the screen so the message can sit in the middle of it
    <main id="main" className="flex flex-1 flex-col justify-center pt-(--header-h)">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-8 sm:py-24">
        <h1 className="type-condensed text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-extrabold">
          Page not found
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
          There is no page at this address. Check the link for a typo, or start again from the home
          page.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonVariants({ size: "xl" })}>
            Go to home page
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "xl" })}>
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
