import type { Metadata } from "next";
import { Footer, Header } from "@/components/SiteChrome";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
