import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * One dashboard panel: a hairline box with a title bar and a body.
 * It is a real <section> named by its heading, so screen reader users can
 * jump between "Allocation", "Holdings" and so on.
 */
export function SectionCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = useId();

  return (
    // min-w-0 lets the panel shrink inside a grid column instead of being
    // pushed wider by the chart it holds
    <section
      aria-labelledby={headingId}
      className={cn("border-line bg-card min-w-0 rounded-lg border", className)}
    >
      <header className="border-line border-b px-4 py-4 sm:px-6">
        <h2 id={headingId} className="type-condensed text-2xl leading-none font-bold sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
