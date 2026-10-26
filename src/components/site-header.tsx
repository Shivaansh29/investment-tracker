import Link from "next/link";
import { Suspense } from "react";
import { ChartPie, LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 font-semibold">
          <span className="from-hero-from to-hero-to flex size-8 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-sm">
            <ChartPie className="size-4.5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Investment Tracker</span>
        </Link>
        {/* Who is signed in is only known per request, so it streams in after the shell */}
        <Suspense>
          <UserNav />
        </Suspense>
      </div>
    </header>
  );
}

async function UserNav() {
  const user = await getOptionalUser();

  if (!user) {
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Log in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "sm" })}>
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="bg-primary/10 text-primary rounded-md px-3 py-1.5 font-medium"
      >
        Dashboard
      </Link>
      <span className="text-muted-foreground hidden truncate md:inline" title={user.email}>
        {user.email}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut aria-hidden />
          Sign out
        </Button>
      </form>
    </nav>
  );
}
