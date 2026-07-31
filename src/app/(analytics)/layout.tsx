import { AnalyticsScript } from "@/components/AnalyticsScript";
import { RevealInit } from "@/components/RevealInit";

/** Hub pages: analytics (Plausible or GA4) + scroll-reveal engine. Fonts load in the root layout. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsScript />
      <RevealInit />
      {children}
    </>
  );
}
