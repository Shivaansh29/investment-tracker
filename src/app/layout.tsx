import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// One variable family for the whole product. The extra width axis ("wdth")
// lets headlines go condensed and the wordmark go wide without a second font.
// "latin-ext" carries the rupee sign (₹).
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Investment Tracker",
  description:
    "Track stocks, mutual funds, ETFs, fixed deposits and gold in one dashboard, with returns worked out in rupees.",
};

export const viewport: Viewport = {
  themeColor: "#0d0b20",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: smooth scrolling (globals.css) is for in-page links only;
    // this tells Next.js to jump instantly when it scrolls to the top of a new page
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} dark bg-background h-full antialiased`}
    >
      {/* isolate: lets a page's fixed backdrop (z-index -10) sit above the body's
          own background but under everything else on the page */}
      <body className="isolate flex min-h-full flex-col">
        <a
          href="#main"
          className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
