import { Bitter, Inter } from "next/font/google";
import { PlausibleScript } from "@/components/PlausibleScript";

const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "swap",
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

/** Hub pages: web fonts + Plausible. Code pages skip this layout for faster LCP. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bitter.variable} ${inter.variable}`}>
      <PlausibleScript />
      {children}
    </div>
  );
}
