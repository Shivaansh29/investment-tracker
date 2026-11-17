"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Shown in place of a page when something throws while it renders.
 *
 * Next.js passes in the thrown value and a `retry` function. `retry` fetches
 * and renders the page again, which is what "Try again" should do when the
 * cause was temporary, such as a dropped connection.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // The details go to the console for whoever is debugging. They are never
    // put on the page: a raw error message can leak how the app works inside,
    // and it would not help the visitor anyway.
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 flex-col justify-center pt-(--header-h)">
      {/* A Client Component cannot export metadata; React moves this tag into <head> */}
      <title>Something went wrong · Investment Tracker</title>

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-8 sm:py-24">
        <h1 className="type-condensed text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-extrabold">
          Something went wrong
        </h1>
        {/* role="alert": the page changed without a navigation, so screen readers are told why */}
        <p role="alert" className="text-muted-foreground max-w-xl text-lg leading-relaxed">
          This page hit a problem and could not be shown. Try again, and if it keeps happening, go
          back to the home page.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xl" onClick={() => retry()}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "xl" })}>
            Go to home page
          </Link>
        </div>
      </div>
    </main>
  );
}
