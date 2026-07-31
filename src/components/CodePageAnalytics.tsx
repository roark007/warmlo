"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface CodePageAnalyticsProps {
  brand: string;
  code: string;
}

export function CodePageAnalytics({ brand, code }: CodePageAnalyticsProps) {
  useEffect(() => {
    trackEvent("code_page_view", { brand, code });
  }, [brand, code]);

  return null;
}
