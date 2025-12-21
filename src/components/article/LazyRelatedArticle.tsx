"use client";

import { memo } from "react";
import { RelatedArticle } from "./RelatedArticle";
import { useAdsState } from "../../store/AdsStateContext";
import { Article } from "@/types/article";

type LazyRelatedArticleProps = {
  article: Article;
};

export const LazyRelatedArticle = memo(function LazyRelatedArticle({
  article,
}: LazyRelatedArticleProps) {
  const { adsMoved } = useAdsState();

  if (!adsMoved) {
    return null;
  }

  return <RelatedArticle article={article} />;
});
