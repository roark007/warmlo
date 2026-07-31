declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (command: "event", name: string, params?: Record<string, string>) => void;
  }
}

/** Fire a custom event via Plausible when present, else GA4 (gtag). */
export function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  if (window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  } else if (window.gtag) {
    window.gtag("event", name, props);
  }
}
