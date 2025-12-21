"use client";

import { useEffect } from "react";

type GoogleAnalyticsProps = {
  tagId: string;
};

export const GoogleAnalytics = ({ tagId }: GoogleAnalyticsProps) => {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function if not exists
    if (!window.gtag) {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    }

    // Track page view
    window.gtag("js", new Date());
    window.gtag("config", tagId, {
      page_path: window.location.pathname,
    });
  }, [tagId]);

  return null;
};

// Type declarations
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
