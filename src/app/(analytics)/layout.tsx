import { Bitter, Inter } from "next/font/google";
import { AnalyticsScript } from "@/components/AnalyticsScript";
import { RevealInit } from "@/components/RevealInit";

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

/** Hub pages: web fonts + analytics + scroll reveals. Code pages skip this
    layout — system fonts there to hold the Lighthouse ≥95 gate. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bitter.variable} ${inter.variable}`}>
      <AnalyticsScript />
      <RevealInit />
      {children}
    </div>
  );
}
