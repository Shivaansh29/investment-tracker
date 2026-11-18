import { PageTransition } from "@/components/page-transition";

/**
 * Heading, description, form and footer line for the login and sign-up pages.
 * Despite the name there is no box around it: the column itself is the frame.
 */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    // Rendered by the page (not the layout), so this block eases in on login <-> sign-up
    <PageTransition>
      {/* Centred as a block below lg, where it is alone on the page; the text stays left-aligned */}
      <div className="group mx-auto w-full max-w-sm lg:mx-0">
        {/*
          After sign-up the form (a client component) swaps itself for a
          "Check your inbox" message marked with data-auth-sent. This server
          component cannot see that state, so CSS :has() reacts to it instead:
          the heading stays for screen readers only and the footer steps aside.
        */}
        <header className="space-y-4 group-has-[[data-auth-sent]]:sr-only">
          {/* rise-line: the heading rises into place, like the landing headline */}
          <h1 className="type-condensed text-5xl leading-[0.95] font-extrabold sm:text-6xl">
            <span className="rise-line">
              <span>{title}</span>
            </span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
        </header>

        <div className="mt-8 group-has-[[data-auth-sent]]:mt-0">{children}</div>

        <p className="border-line text-muted-foreground mt-8 border-t pt-6 text-sm group-has-[[data-auth-sent]]:hidden">
          {footer}
        </p>
      </div>
    </PageTransition>
  );
}
