import type { Metadata } from "next";
import { Bitter, Inter } from "next/font/google";
import { Footer, Header } from "@/components/SiteChrome";
import "./globals.css";

// display "optional": on a slow cold visit the metric-matched fallback is
// used for that view instead of paying a multi-second LCP penalty on the
// swap (Lighthouse gate). On normal connections the fonts make the window
// and render; on warm/cache visits they always render.
const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "optional",
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com"),
  title: {
    default: "Warmlo — Furnace Error Codes & HVAC Quote Check",
    template: "%s | Warmlo",
  },
  description:
    "Know what's wrong. Know what it should cost. Know who to call. Free furnace error code lookup and HVAC quote checking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${bitter.variable} ${inter.variable}`}>
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
