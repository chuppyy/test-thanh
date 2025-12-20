import { useEffect, useMemo, useRef, useState, Suspense, memo } from "react";
import Script from "next/script";
import Head from "next/head";

/* ================== TYPES & CONSTANTS ================== */
type NewsMainModel = {
  id: string | null;
  name: string;
  summary?: string;
  userCode: string;
  content?: string;
  avatarLink?: string;
  urlRootLink?: string;
  isDeleted?: boolean;
  dateTimeStart?: string;
};

type PageParameters = {
  mgWidgetId1: string;
  mgWidgetFeedId: string;
  adsKeeperSrc: string;
  googleTagId: string;
  isMgid: number;
};

type PageProps = {
  data: NewsMainModel[] | NewsMainModel;
  parameters: PageParameters;
};

const FEJI_HB_ZONE = "feji.io_long";
const FEJI_PLAYER_ID = "feji.io_1723454353847";

/* ================== HELPERS ================== */
const formatDate = (str?: string) => {
  if (!str) return "";
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
};

const normalize = (x: any): NewsMainModel => ({
  id: x?.id ?? x?.Id ?? null,
  name: x?.name ?? x?.Name ?? "",
  summary: x?.summary ?? x?.Summary ?? "",
  userCode: x?.userCode ?? x?.UserCode ?? "",
  content: x?.content ?? x?.Content ?? "",
  avatarLink: x?.avatarLink ?? x?.AvatarLink ?? "",
  urlRootLink: x?.urlRootLink ?? x?.UrlRootLink ?? "",
  isDeleted: x?.isDeleted ?? x?.IsDeleted ?? false,
  dateTimeStart: x?.dateTimeStart ?? x?.DateTimeStart ?? "",
});

const getIdFromSlug = (slug?: string) => {
  if (!slug) return "";
  const s = String(slug);
  return s.slice(s.lastIndexOf("-") + 1);
};

/* ================== SUB-COMPONENTS ================== */
// Memoize ArticleItem để tránh render lại không cần thiết
const ArticleItem = memo(({ article, idx, isFirst }: { article: NewsMainModel; idx: number; isFirst: boolean }) => (
  <section className="container-flu details">
    {/* Dynamic Banner Placement */}
    <div 
      className="adsconex-banner" 
      data-ad-placement={idx === 0 ? "banner1" : "banner10"} 
      id={idx === 0 ? "ub-banner1" : "ub-banner10"} 
    />

    <h1>{article.name}</h1>

    {isFirst && (
      <>
        <Script id="feji-hb-init" strategy="afterInteractive">
          {`window.unibotshb = window.unibotshb || { cmd: [] };
            window.unibotshb.cmd.push(function () { ubHB("${FEJI_HB_ZONE}"); });`}
        </Script>
        <div id={`div-ub-${FEJI_PLAYER_ID}`}>
          <Script id="feji-player-init" strategy="afterInteractive">
            {`window.unibots = window.unibots || { cmd: [] };
              window.unibots.cmd.push(function () { unibotsPlayer("${FEJI_PLAYER_ID}"); });`}
          </Script>
        </div>
      </>
    )}

    <p className="mb-4 text-lg" style={{ color: '#666' }}>
      Posted: {formatDate(article.dateTimeStart)}
    </p>

    <Suspense fallback={<p>Loading content...</p>}>
      <article 
        className="content" 
        dangerouslySetInnerHTML={{ __html: article.content || "" }} 
      />
    </Suspense>
    
    <hr style={{ margin: "40px 0", opacity: 0.2 }} />
  </section>
));

ArticleItem.displayName = "ArticleItem";

/* ================== MAIN PAGE ================== */
export default function Page({ data, parameters }: PageProps) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } = parameters;
  const useMgid = Number(isMgid) === 1;

  // Xử lý list dữ liệu
  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : data ? [data] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [data]);

  const [visibleCount, setVisibleCount] = useState(1);
  const [showEndAds, setShowEndAds] = useState(false);
  
  const sentinelAdsRef = useRef<HTMLDivElement>(null);
  const triggerNextRef = useRef<HTMLDivElement>(null);

  // 1. Tối ưu Iframe Resize
  useEffect(() => {
    const resizeIframes = () => {
      const iframes = document.querySelectorAll("iframe");
      const isMobile = window.innerWidth <= 525;
      
      iframes.forEach((iframe) => {
        if (!iframe.src) return;
        if (iframe.src.includes("twitter")) {
          iframe.style.height = isMobile ? "650px" : "827px";
          iframe.style.width = isMobile ? "100%" : "550px";
        } else if (iframe.src.includes("instagram")) {
          iframe.style.height = isMobile ? "553px" : "628px";
          iframe.style.width = "100%";
        } else {
          iframe.style.height = isMobile ? "250px" : "300px";
          iframe.style.width = "100%";
        }
      });
    };

    resizeIframes();
    window.addEventListener('resize', resizeIframes);
    return () => window.removeEventListener('resize', resizeIframes);
  }, [visibleCount]);

  // 2. Observer: Hiện End Ads khi cuộn đến cuối bài 1
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEndAds(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (sentinelAdsRef.current) observer.observe(sentinelAdsRef.current);
    return () => observer.disconnect();
  }, []);

  // 3. Observer: Bung toàn bộ bài viết khi thấy Ads (Thay thế scroll listener)
  useEffect(() => {
    if (!showEndAds || visibleCount >= list.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(list.length);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } 
    );

    if (triggerNextRef.current) observer.observe(triggerNextRef.current);
    return () => observer.disconnect();
  }, [showEndAds, list.length, visibleCount]);

  const firstArticle = list[0];

  return (
    <>
      <Head>
        <title>{firstArticle ? `${firstArticle.name} - ${firstArticle.userCode}` : "News"}</title>
        {firstArticle?.avatarLink && <meta property="og:image" content={firstArticle.avatarLink} />}
        {firstArticle && <meta property="og:title" content={`${firstArticle.name} - ${firstArticle.userCode}`} />}
      </Head>

      {/* Scripts tối ưu */}
      {adsKeeperSrc && <Script src={adsKeeperSrc} strategy="afterInteractive" />}
      {googleTagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
          <Script id="ga-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTagId}');`}
          </Script>
        </>
      )}

      <main>
        {list.slice(0, visibleCount).map((article, idx) => (
          <ArticleItem 
            key={article.id || `${idx}-${article.userCode}`} 
            article={article} 
            idx={idx} 
            isFirst={idx === 0} 
          />
        ))}

        {/* MID ADS CONTAINER */}
        <div id="qctaboo-mid" className="my-8">
            {useMgid ? (
                <div data-type="_mgwidget" data-widget-id={mgWidgetId1}></div>
            ) : (
                <div id="taboola-below-mid-article"></div>
            )}
            <Script id="mid-ads-load" strategy="afterInteractive">
              {useMgid 
                ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
                : `window._taboola = window._taboola || [];
                   _taboola.push({ mode: 'thumbs-feed-01-b', container: 'taboola-below-mid-article', placement: 'Mid article', target_type: 'mix' });`
              }
            </Script>
        </div>

        {/* Sentinel để kích hoạt hiển thị Ads dưới bài */}
        <div ref={sentinelAdsRef} style={{ height: "1px" }} />

        {/* END ARTICLE ADS & TRIGGER NEXT ARTICLES */}
        {showEndAds && (
          <div ref={triggerNextRef} className="end-article-ads" style={{ minHeight: '300px' }}>
            {useMgid ? (
              <>
                <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
                <Script id="mgid-feed-load" strategy="afterInteractive">
                  {`(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                </Script>
              </>
            ) : (
              <>
                <div id="taboola-below-article-thumbnails" />
                <Script id="taboola-end-init" strategy="afterInteractive">
                  {`window._taboola = window._taboola || [];
                    _taboola.push({ mode: 'thumbs-feed-01', container: 'taboola-below-article-thumbnails', placement: 'Below Article Thumbnails', target_type: 'mix' });
                    _taboola.push({ flush: true });`}
                </Script>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}

/* ================== SERVER SIDE ================== */
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const id = getIdFromSlug(params?.slug);
    const res = await fetch(`${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`);
    const json = await res.json();

    const parameters: PageParameters = {
      mgWidgetId1: "1903360",
      mgWidgetFeedId: "1903357",
      adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
      googleTagId: "G-RZ218Z0QZ1",
      isMgid: 0,
    };

    return {
      props: {
        data: json?.data ?? [],
        parameters,
      },
      revalidate: 3600, // 1 hour
    };
  } catch (err) {
    return {
      props: {
        data: [],
        parameters: {
          mgWidgetId1: "1903360",
          mgWidgetFeedId: "1903357",
          adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
          googleTagId: "G-RZ218Z0QZ1",
          isMgid: 0,
        },
      },
      revalidate: 60,
    };
  }
}