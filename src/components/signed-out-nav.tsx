"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

/**
 * Header actions for visitors who are not signed in. On the log-in and
 * sign-up pages it shows only the other action, so the header never offers a
 * link to the page you are already on.
 */
export function SignedOutNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex items-center gap-1.5 text-sm">
      {pathname !== "/login" && (
        <Link
          href="/login"
          className={buttonVariants({ variant: "ghost", size: "lg", className: "h-10" })}
        >
          Log in
        </Link>
      )}
      {pathname !== "/signup" && (
        <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-10" })}>
          Create account
        </Link>
      )}
    </nav>
  );
}
