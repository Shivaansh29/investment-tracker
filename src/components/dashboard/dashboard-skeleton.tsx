import { cn } from "@/lib/utils";

/** One placeholder per figure in the overview row. */
const FIGURE_CELLS = ["invested", "holdings", "best", "weakest"];

/**
 * Placeholder with the dashboard's shape, shown while the server checks who is
 * signed in. It uses the same panels and spacing as DashboardView, so the page
 * does not jump when the real figures arrive.
 */
export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your portfolio"
      className="space-y-4 sm:space-y-6"
    >
      {/* Overview band: label, big figure, meter, then the row of figures */}
      <div className="border-line bg-card overflow-hidden rounded-lg border">
        <div className="space-y-8 px-4 py-6 sm:space-y-10 sm:p-8">
          <div className="space-y-3">
            <Block className="h-4 w-28" />
            <Block className="h-14 w-64 max-w-full sm:h-24 sm:w-96" />
          </div>
          <div className="space-y-3">
            <Block className="h-2.5 w-full" />
            <Block className="h-4 w-40" />
          </div>
        </div>
        <div className="border-line bg-line grid grid-cols-2 gap-px border-t lg:grid-cols-4">
          {FIGURE_CELLS.map((cell) => (
            <div key={cell} className="bg-card space-y-3 px-4 py-5 sm:px-8 sm:py-6">
              <Block className="h-4 w-20" />
              <Block className="h-7 w-28 max-w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Allocation bar, then the return candles */}
      <PanelPlaceholder bodyClassName="h-48" />
      <PanelPlaceholder bodyClassName="h-96" />
    </div>
  );
}

/** A pulsing block. The pulse stops for visitors who ask for less motion. */
function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-[3px] motion-reduce:animate-none", className)}
    />
  );
}

/** Same outline as a SectionCard: a title bar and a body. */
function PanelPlaceholder({ bodyClassName }: { bodyClassName: string }) {
  return (
    <div className="border-line bg-card rounded-lg border">
      <div className="border-line space-y-2 border-b px-4 py-4 sm:px-6">
        <Block className="h-5 w-36" />
        <Block className="h-4 w-56 max-w-full" />
      </div>
      <div className="p-4 sm:p-6">
        <Block className={cn("w-full", bodyClassName)} />
      </div>
    </div>
  );
}
