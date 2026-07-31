import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { AnalyticsScript } from "@/components/AnalyticsScript";
import { RevealInit } from "@/components/RevealInit";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
  adjustFontFallback: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  adjustFontFallback: true,
});

/** Hub pages: display fonts + analytics + scroll reveals. Code pages skip this
    layout — system font fallbacks there to hold the Lighthouse ≥95 gate. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bricolage.variable} ${spaceGrotesk.variable} fonts-loaded`}>
      <AnalyticsScript />
      <RevealInit />
      {children}
    </div>
  );
}
