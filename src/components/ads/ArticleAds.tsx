"use client";

import { TaboolaAd } from "./TaboolaAd";
import { MidAd } from "./MgidAd";
import { VARIABLES } from "@/constant/variables";

type ArticleAdsProps = {
  useMgid: boolean;
  mgWidgetId1?: string;
  mgWidgetId2?: string;
  mgWidgetFeedId?: string;
};

export const ArticleMidAds = ({
  useMgid,
  mgWidgetId1 = VARIABLES.mgWidgetId1,
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
  mgWidgetFeedId = VARIABLES.mgWidgetFeedId,
}: ArticleAdsProps) => {
  if (useMgid) {
    return <MidAd widgetId={mgWidgetFeedId} />;
  }

  return (
    <TaboolaAd
      container="taboola-below-article-thumbnails"
      placement="Below Article Thumbnails"
      mode="thumbs-feed-01"
      flush={true}
    />
  );
};
