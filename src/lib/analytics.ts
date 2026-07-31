declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

/** Fire a Plausible custom event when analytics is configured. */
export function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  if (window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
}
