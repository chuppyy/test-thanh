"use client";

import { useEffect, useId } from "react";

type TaboolaAdProps = {
  container: string;
  placement: string;
  mode?: string;
  flush?: boolean;
};

export const TaboolaAd = ({
  container,
  placement,
  mode = "thumbs-feed-01",
  flush = true,
}: TaboolaAdProps) => {
  const uniqueId = useId().replace(/:/g, "-");
  const containerId = `${container}-${uniqueId}`;

  useEffect(() => {
    // Initialize Taboola for this container
    if (typeof window !== "undefined") {
      window._taboola = window._taboola || [];
      window._taboola.push({
        mode: mode,
        container: containerId,
        placement: placement,
        target_type: "mix",
      });
      if (flush) {
        window._taboola.push({ flush: true });
      }
    }

    // Cleanup on unmount
    return () => {
      const containerEl = document.getElementById(containerId);
      if (containerEl) {
        containerEl.innerHTML = "";
      }
    };
  }, [containerId, mode, placement, flush]);

  return <div id={containerId}></div>;
};

// Add type declaration for window._taboola
declare global {
  interface Window {
    _taboola?: Array<Record<string, unknown>>;
  }
}
