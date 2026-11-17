/**
 * Wrap a page's content in this to give it a short fade-and-rise when it
 * appears (the `page-enter` animation in globals.css; off with reduced motion).
 *
 * It is deliberately plain CSS rather than React's <ViewTransition>. With view
 * transitions the browser kept a picture of the old page on screen and faded it
 * out over the new one, so two pages' headlines overlapped for a moment.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter w-full">{children}</div>;
}
