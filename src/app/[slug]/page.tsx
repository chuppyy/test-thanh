import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoogleAnalytics, AdsKeeper } from "@/components/ads";
import { SkeletonLoader } from "@/components/ui";
import {
  ArticleContent,
  LazyRelatedArticle,
  AdsContainer,
  AdsSection,
} from "@/components/article";
import { AdsStateProvider } from "@/store/AdsStateContext";
import { getArticles } from "@/services/get-article";

const defaultParameters = {
  videoScriptSrc:
    "https://videoadstech.org/ads/topnews_livextop_com.0a05145f-8239-4054-9dc9-acd55fcdddd5.video.js",
  googleClientId: "ca-pub-2388584177550957",
  googleClientSlotId: "9127559985",
  googleAdSlot: "1932979136",
  mgWidgetId1: "1903360",
  mgWidgetId2: "1903360",
  mgWidgetFeedId: "1903357",
  adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
  googleTagId: "G-5T8RGH9Y7E",
  isMgid: 0,
} as const;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const articles = await getArticles(slug);

  if (!articles || articles.length === 0) {
    return {
      title: "Article Not Found | NewsEdge",
    };
  }

  const article = articles[0];

  return {
    title: `${article.name} | NewsEdge`,
  };
};

export default async function DetailArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const articles = await getArticles(slug);

  if (!articles || articles.length === 0) {
    notFound();
  }

  // First article
  const mainArticle = articles[0];

  // Second article
  const relatedArticle = articles[1];

  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } =
    defaultParameters;

  const useMgid = Number(isMgid) === 1;

  return (
    <>
      <AdsKeeper src={adsKeeperSrc} />
      <GoogleAnalytics tagId={googleTagId} />

      <AdsStateProvider>
        <main className="container mx-auto px-8 sm:px-20 lg:px-40 xl:px-56 py-10">
          <Suspense fallback={<SkeletonLoader type="text" />}>
            <ArticleContent
              title={mainArticle.name}
              datePosted={mainArticle.dateTimeStart}
              htmlContent={mainArticle.content}
            />
            <AdsSection useMgid={useMgid} mgWidgetId1={mgWidgetId1} />
          </Suspense>

          {/* Lazy load the second article if exists */}
          {relatedArticle && <LazyRelatedArticle article={relatedArticle} />}

          {/* Unified ads container - partial then full */}
          <AdsContainer useMgid={useMgid} mgWidgetFeedId={mgWidgetFeedId} />
        </main>
      </AdsStateProvider>
    </>
  );
}
