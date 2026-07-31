import { PlausibleScript } from "@/components/PlausibleScript";

/** Analytics on interactive/content hub pages — omitted on code pages for Lighthouse. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PlausibleScript />
      {children}
    </>
  );
}
