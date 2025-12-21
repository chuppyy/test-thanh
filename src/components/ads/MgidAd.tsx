"use client";

import { useEffect, useId } from "react";

type MgidAdProps = {
  widgetId: string;
};

export const MidAd = ({ widgetId }: MgidAdProps) => {
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    // Initialize MGID for this widget
    if (typeof window !== "undefined") {
      window._mgq = window._mgq || [];
      window._mgq.push(["_mgc.load"]);
    }

    // Cleanup on unmount
    return () => {
      const widgets = document.querySelectorAll(
        `[data-widget-id="${widgetId}"]`
      );
      widgets.forEach((widget) => {
        widget.innerHTML = "";
      });
    };
  }, [widgetId]);

  return (
    <div key={uniqueId} data-type="_mgwidget" data-widget-id={widgetId}></div>
  );
};

// Add type declaration for window._mgq
declare global {
  interface Window {
    _mgq?: Array<unknown>;
  }
}
