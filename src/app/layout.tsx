import type { Metadata } from "next";
import { Bitter, Inter } from "next/font/google";
import { Footer, Header } from "@/components/SiteChrome";
import { PlausibleScript } from "@/components/PlausibleScript";
import "./globals.css";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bitter",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
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
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="flex min-h-full flex-col">
        <PlausibleScript />
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
