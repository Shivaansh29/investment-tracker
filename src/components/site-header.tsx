import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/brand/logo";
import { SignedOutNav } from "@/components/signed-out-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";

/**
 * Fixed to the top of every page. Pages leave room for it with
 * `pt-(--header-h)`; the landing hero instead runs underneath it.
 */
export function SiteHeader() {
  return (
    <header className="border-line bg-background/70 fixed inset-x-0 top-0 z-40 h-(--header-h) border-b backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          aria-label="Investment Tracker home"
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center rounded-md"
        >
          <Logo compact />
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

  if (!user) return <SignedOutNav />;

  return (
    <nav aria-label="Account" className="flex min-w-0 items-center gap-3 text-sm">
      <span className="text-muted-foreground hidden truncate md:inline" title={user.email}>
        {user.email}
      </span>
      <Link
        href="/dashboard"
        className={buttonVariants({ variant: "ghost", size: "lg", className: "h-10" })}
      >
        Dashboard
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="lg" className="h-10">
          <LogOut aria-hidden />
          Sign out
        </Button>
      </form>
    </nav>
  );
}
