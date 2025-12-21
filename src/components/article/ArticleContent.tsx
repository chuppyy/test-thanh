"use client";

import { memo, useEffect, useMemo } from "react";

type ArticleContentProps = {
  title: string;
  datePosted: string;
  htmlContent: string;
  showVideo?: boolean;
};

const formatDate = (str: string) => {
  const date = new Date(str);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const normalizeHtmlContent = (html: string): string => {
  if (!html) return "";

  // Handle mismatches HTML content by normalizing common issues
  return (
    html
      // Remove empty paragraph tags that might cause mismatch
      .replace(/<p>\s*<\/p>/gi, "")
      // Remove empty paragraphs before headings (common issue)
      .replace(/<p>\s*(<h[1-6])/gi, "$1")
      // Remove paragraphs wrapping block elements
      .replace(/<p>\s*(<div|<table|<ul|<ol|<blockquote)/gi, "$1")
      .replace(
        /(<\/div>|<\/table>|<\/ul>|<\/ol>|<\/blockquote>)\s*<\/p>/gi,
        "$1"
      )
      // Trim whitespace
      .trim()
  );
};

export const ArticleContent = memo(function ArticleContent({
  title,
  datePosted,
  htmlContent,
  showVideo = true,
}: ArticleContentProps) {
  const normalizedContent = useMemo(
    () => normalizeHtmlContent(htmlContent),
    [htmlContent]
  );

  // Initialize FEJI ads on mount - only runs on client
  useEffect(() => {
    // If not show video, skip FEJI video player init
    if (!showVideo) return;

    // FEJI Banner
    if (typeof window !== "undefined") {
      window.unibotshb = window.unibotshb || { cmd: [] };
      window.unibotshb.cmd.push(() => {
        if (typeof window.ubHB === "function") {
          window.ubHB("feji.io_long");
        }
      });

      // FEJI Video Player
      window.unibots = window.unibots || { cmd: [] };
      window.unibots.cmd.push(() => {
        if (typeof window.unibotsPlayer === "function") {
          window.unibotsPlayer("feji.io_1723454353847");
        }
      });
    }

    // Cleanup on unmount
    return () => {
      // Clear FEJI containers
      const fejiBanner = document.getElementById("ub-banner1");
      if (fejiBanner) {
        fejiBanner.innerHTML = "";
      }
      const fejiPlayer = document.getElementById(
        "div-ub-feji.io_1723454353847"
      );
      if (fejiPlayer) {
        fejiPlayer.innerHTML = "";
      }
    };
  }, [showVideo]);

  return (
    <>
      {/* Ad banner placeholder - use banner10 for article 2 when showVideo=false */}
      <div
        className="adsconex-banner mb-4"
        data-ad-placement={showVideo ? "banner1" : "banner10"}
        id={showVideo ? "ub-banner1" : "ub-banner10"}
      />

      {/* Article Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
        {title}
      </h1>

      {/* FEJI Video Player Container */}
      {showVideo && <div id="div-ub-feji.io_1723454353847" className="mb-4" />}

      {/* Posted Date */}
      <p className="mb-10 text-gray-500 text-lg">
        Posted: {formatDate(datePosted)}
      </p>

      <article
        className="prose prose-xl max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-justify prose-img:my-10 prose-img:rounded-lg prose-headings:mt-10 prose-headings:mb-6"
        dangerouslySetInnerHTML={{ __html: normalizedContent }}
        suppressHydrationWarning
      />
    </>
  );
});

// Type declarations for FEJI
declare global {
  interface Window {
    unibotshb?: { cmd: Array<() => void> };
    unibots?: { cmd: Array<() => void> };
    ubHB?: (id: string) => void;
    unibotsPlayer?: (id: string) => void;
  }
}
