"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ArticleContent } from "./ArticleContent";
import { SkeletonLoader } from "@/components/ui";
import { Article } from "@/types/article";

type RelatedArticleProps = {
  article: Article;
};

export const RelatedArticle = memo(function RelatedArticle({
  article,
}: RelatedArticleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(currentRef);

    return () => observer.unobserve(currentRef);
  }, []);

  return (
    <div ref={containerRef} className="mt-12 pt-8 border-t-2 border-gray-200">
      {!isVisible ? (
        <div>
          <SkeletonLoader type="text" />
        </div>
      ) : (
        <ArticleContent
          title={article.name}
          datePosted={article.dateTimeStart}
          htmlContent={article.content}
          showVideo={false}
        />
      )}
    </div>
  );
});
