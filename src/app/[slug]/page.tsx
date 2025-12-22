import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { SkeletonLoader } from "@/components/ui";
import {
  ArticleContent,
  AdsContainer,
  AdsSection,
  RelatedArticle,
  IframeAdjuster,
} from "@/components/article";
import { AdsStateProvider } from "@/store/AdsStateContext";
import { getArticles } from "@/services/get-article";
import { VARIABLES } from "@/constant/variables";

const defaultParameters = {
  videoScriptSrc: VARIABLES.videoScriptSrc,

  googleClientId: VARIABLES.googleClientId,
  googleClientSlotId: VARIABLES.googleClientSlotId,
  googleAdSlot: VARIABLES.googleAdSlot,

  mgWidgetId1: VARIABLES.mgWidgetId1,
  mgWidgetId2: VARIABLES.mgWidgetId2,
  mgWidgetFeedId: VARIABLES.mgWidgetFeedId,

  adsKeeperSrc: VARIABLES.adsKeeperSrc,
  googleTagId: VARIABLES.GOOGLE_ANALYSIS,

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
    title: `${article.name}-${article.userCode}`,
    openGraph: {
      title: `${article.name}-${article.userCode}`,
      images: [article.avatarLink],
    },
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

  const {
    mgWidgetId1,
    // mgWidgetId2,
    mgWidgetFeedId,
    adsKeeperSrc,
    googleTagId,
    isMgid,
  } = defaultParameters;

  const useMgid = Number(isMgid) === 1;

  return (
    <>
      <Script src={adsKeeperSrc} async></Script>
      <Script
        id="gg-1"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
      />
      <Script id="gg-2" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleTagId}');
        `}
      </Script>

      <IframeAdjuster />

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

          {/* Article 2 - always render HTML but clipped until ads move */}
          {relatedArticle && <RelatedArticle article={relatedArticle} />}

          {/* Unified ads container - partial then full */}
          <AdsContainer useMgid={useMgid} mgWidgetFeedId={mgWidgetFeedId} />
        </main>
      </AdsStateProvider>
    </>
  );
}
