"use client";

import { useEffect } from "react";

export function IframeAdjuster() {
  useEffect(() => {
    try {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe: HTMLIFrameElement) => {
        if (!iframe) return;
        if (iframe.src.includes("twitter")) {
          iframe.style.height = window.innerWidth <= 525 ? "650px" : "827px";
          iframe.style.width = window.innerWidth <= 525 ? "100%" : "550px";
        } else if (iframe.src.includes("instagram")) {
          iframe.style.height = window.innerWidth <= 525 ? "553px" : "628px";
          iframe.style.width = "100%";
        } else {
          iframe.style.height = window.innerWidth <= 525 ? "250px" : "300px";
          iframe.style.width = "100%";
        }
      });
    } catch (err) {
      console.error("Error adjusting iframes", err);
    }
  }, []);

  return null;
}
