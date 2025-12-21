"use client";

import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArticleMidAds } from "@/components/ads";

type AdsSectionProps = {
  useMgid: boolean;
  mgWidgetId1?: string;
};

export const AdsSection = memo(function AdsSection({
  useMgid,
  mgWidgetId1,
}: AdsSectionProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let retries = 0;
    const maxRetries = 10;
    let timeoutId: NodeJS.Timeout;

    const findElement = () => {
      const element = document.getElementById("qctaboo-mid");
      if (element) {
        setTargetElement(element);
      } else if (retries < maxRetries) {
        retries++;
        timeoutId = setTimeout(findElement, 100);
      }
    };

    findElement();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!targetElement) {
    return null;
  }

  return createPortal(
    <ArticleMidAds useMgid={useMgid} mgWidgetId1={mgWidgetId1} />,
    targetElement
  );
});
