import Link from "next/link";
import { Logo } from "@/components/brand/logo";

// 40px rows give each link a comfortable tap height on phones
const linkClass =
  "hover:text-foreground inline-flex min-h-10 items-center rounded-sm underline-offset-4 hover:underline";

export function SiteFooter() {
  return (
    <footer className="border-line border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            A portfolio tracker for Indian investors. The figures on this site come from a sample
            portfolio with illustrative prices. They are not live quotes and nothing here is
            investment advice.
          </p>
        </div>

        <nav aria-label="Product" className="text-muted-foreground space-y-3 text-sm">
          <p className="text-foreground font-medium">Product</p>
          <ul>
            <li>
              <Link href="/signup" className={linkClass}>
                Create account
              </Link>
            </li>
            <li>
              <Link href="/login" className={linkClass}>
                Log in
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={linkClass}>
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Project" className="text-muted-foreground space-y-3 text-sm">
          <p className="text-foreground font-medium">Project</p>
          <ul>
            <li>
              <a
                href="https://github.com/Shivaansh29/investment-tracker"
                className={linkClass}
                rel="noreferrer"
              >
                Source on GitHub
              </a>
            </li>
            <li>
              <a href="#roadmap" className={linkClass}>
                Roadmap
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
