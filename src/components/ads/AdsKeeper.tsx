"use client";

import { useEffect } from "react";

type AdsKeeperProps = {
  src: string;
};

export const AdsKeeper = ({ src }: AdsKeeperProps) => {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) return;

    // Create and append script
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector(`script[src="${src}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [src]);

  return null;
};
