import Link from "next/link";
import { ChartPie } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold">
          <span className="from-hero-from to-hero-to flex size-8 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-sm">
            <ChartPie className="size-4.5" aria-hidden />
          </span>
          Investment Tracker
        </Link>
        <nav className="flex gap-1 text-sm">
          <Link
            href="/dashboard"
            className="bg-primary/10 text-primary rounded-md px-3 py-1.5 font-medium"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
