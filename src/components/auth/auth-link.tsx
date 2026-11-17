import Link from "next/link";

/**
 * Text link used around the auth forms ("Create an account", "Log in").
 * Underlined so it reads as a link without relying on colour. The vertical
 * padding, cancelled out by the negative margin, makes it a 40px tap target
 * without pushing the surrounding line apart.
 */
export function AuthLink({ href, children }: { href: "/login" | "/signup"; children: string }) {
  return (
    <Link
      href={href}
      className="text-link hover:text-foreground -my-2.5 inline-block rounded-sm py-2.5 font-medium underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
