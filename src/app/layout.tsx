import type { Metadata } from "next";
import { Bitter, Inter } from "next/font/google";
import { Footer, Header } from "@/components/SiteChrome";
import "./globals.css";

const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "optional",
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
  preload: false,
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
    <html lang="en" className={`${bitter.variable} ${inter.variable} h-full`}>
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
