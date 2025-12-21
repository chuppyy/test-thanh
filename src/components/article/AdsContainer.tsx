"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ArticleEndAds } from "@/components/ads";
import { useAdsState } from "@/store/AdsStateContext";

type AdsContainerProps = {
  useMgid: boolean;
  mgWidgetFeedId: string;
};

export const AdsContainer = memo(function AdsContainer({
  useMgid,
  mgWidgetFeedId,
}: AdsContainerProps) {
  const [showAds, setShowAds] = useState(false);
  const { adsMoved, setAdsMoved } = useAdsState();
  const triggerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 1. Sentinel - Detect ads container early (600px before entering viewport)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowAds(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    if (sentinelRef.current) {
      io.observe(sentinelRef.current);
    }

    return () => io.disconnect();
  }, []);

  // 2. Trigger - When ads occupies 30% of viewport, show article 2
  useEffect(() => {
    if (!showAds || adsMoved) return;

    let isTriggered = false;

    const onScroll = () => {
      if (!triggerRef.current || isTriggered) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      // Trigger when top of ads reaches 70% from top (ads occupies 30% viewport)
      if (rect.top <= vh * 0.7) {
        isTriggered = true;
        setAdsMoved(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAds, adsMoved, setAdsMoved]);

  return (
    <>
      {/* Sentinel point - triggers 600px before entering viewport */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* Ads container - smooth transition from partial to full */}
      <div
        ref={triggerRef}
        style={{
          minHeight: showAds ? "350px" : "0px",
          visibility: showAds ? "visible" : "hidden",
          marginTop: "20px",
          // Full-bleed (no article padding) for both partial + full.
          width: "100vw",
          position: "relative" as const,
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          // When article 2 is rendered, this same ad block is pushed below it.
          // At that point we allow the widget to expand fully.
          maxHeight: adsMoved ? "none" : "200px",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        {showAds && (
          <ArticleEndAds useMgid={useMgid} mgWidgetFeedId={mgWidgetFeedId} />
        )}
      </div>
    </>
  );
});
