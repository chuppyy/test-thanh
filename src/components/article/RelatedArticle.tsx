"use client";

import { memo } from "react";
import { ArticleContent } from "./ArticleContent";
import { useAdsState } from "@/store/AdsStateContext";
import { Article } from "@/types/article";

type RelatedArticleProps = {
  article: Article;
};

export const RelatedArticle = memo(function RelatedArticle({
  article,
}: RelatedArticleProps) {
  const { adsMoved } = useAdsState();

  return (
    <div
      style={{
        maxHeight: adsMoved ? "none" : "0px",
        overflow: adsMoved ? "visible" : "hidden",
        opacity: adsMoved ? 1 : 0,
        pointerEvents: adsMoved ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
      aria-hidden={!adsMoved}
    >
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
        <ArticleContent
          title={article.name}
          datePosted={article.dateTimeStart}
          htmlContent={article.content}
        />
      </div>
    </div>
  );
});
