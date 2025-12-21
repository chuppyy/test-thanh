"use client";

import { TaboolaAd } from "./TaboolaAd";
import { MidAd } from "./MgidAd";

type ArticleAdsProps = {
  useMgid: boolean;
  mgWidgetId1?: string;
  mgWidgetId2?: string;
  mgWidgetFeedId?: string;
};

export const ArticleMidAds = ({
  useMgid,
  mgWidgetId1 = "1903360",
}: ArticleAdsProps) => {
  if (useMgid) {
    return <MidAd widgetId={mgWidgetId1} />;
  }

  return (
    <TaboolaAd
      container="taboola-below-mid-article"
      placement="Mid article"
      mode="thumbs-feed-01-b"
    />
  );
};

export const ArticleEndAds = ({
  useMgid,
  mgWidgetFeedId = "1903357",
}: ArticleAdsProps) => {
  if (useMgid) {
    return <MidAd widgetId={mgWidgetFeedId} />;
  }

  return (
    <TaboolaAd
      container="taboola-below-article-thumbnails"
      placement="Below Article Thumbnails"
      mode="thumbs-feed-01"
    />
  );
};
