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
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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
const ArticleItem = memo(({ article, idx, isFirst }: { article: NewsMainModel; idx: number; isFirst: boolean }) => (
  <section className="container-flu details" style={{ marginBottom: '20px' }}>
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
    
    <hr style={{ margin: "40px 0", border: '0', borderTop: '1px solid #eee' }} />
  </section>
));

ArticleItem.displayName = "ArticleItem";

/* ================== MAIN PAGE ================== */
export default function Page({ data, parameters }: PageProps) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } = parameters;
  const useMgid = Number(isMgid) === 1;

  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : data ? [data] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [data]);

  const [visibleCount, setVisibleCount] = useState(1);
  const [showEndAds, setShowEndAds] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sentinelAdsRef = useRef<HTMLDivElement>(null);
  const endAdsRef = useRef<HTMLDivElement>(null);

  // 1. Sentinel: Khi cuộn gần hết bài 1 -> Hiện khối End Ads
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEndAds(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" } 
    );

    if (sentinelAdsRef.current) observer.observe(sentinelAdsRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. TỐI ƯU QUAN TRỌNG: Bung bài 2 khi Ads chiếm 30% màn hình
  useEffect(() => {
    if (!showEndAds || isExpanded || list.length < 2) return;

    let ticking = false;

    const checkScroll = () => {
      if (!endAdsRef.current) return;

      const rect = endAdsRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      /**
       * GIẢI THÍCH LOGIC:
       * rect.top là khoảng cách từ đỉnh màn hình đến đỉnh của khối quảng cáo.
       * Nếu rect.top <= 70% chiều cao màn hình (viewportHeight * 0.7),
       * nghĩa là 30% phần dưới màn hình đã bị khối quảng cáo chiếm chỗ.
       */
      const triggerPoint = viewportHeight * 0.7; 

      if (rect.top <= triggerPoint && rect.top > 0) {
        setVisibleCount(list.length);
        setIsExpanded(true);
        window.removeEventListener("scroll", onScroll);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Chạy kiểm tra ngay lập tức khi vừa hiện Ads
    checkScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [showEndAds, isExpanded, list.length]);

  // 3. Iframe Resize
  useEffect(() => {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      const isMobile = window.innerWidth <= 525;
      if (iframe.src.includes("twitter")) {
        iframe.style.height = isMobile ? "650px" : "827px";
        iframe.style.width = isMobile ? "100%" : "550px";
      } else {
        iframe.style.height = isMobile ? "250px" : "300px";
        iframe.style.width = "100%";
      }
    });
  }, [visibleCount]);

  const firstArticle = list[0];

  return (
    <>
      <Head>
        <title>{firstArticle ? `${firstArticle.name}-${firstArticle.userCode}` : "News"}</title>
        {firstArticle?.avatarLink && <meta property="og:image" content={firstArticle.avatarLink} />}
      </Head>

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

        {/* MID ADS CONTAINER (Cố định giữa các bài) */}
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

        {/* Sentinel: Điểm neo để bắt đầu kích hoạt hiện Ads cuối bài 1 */}
        <div ref={sentinelAdsRef} style={{ height: "1px" }} />

        {/* END ARTICLE ADS: Vùng này hiện lên 30% màn hình là bung bài tiếp theo */}
        {showEndAds && (
          <div 
            ref={endAdsRef} 
            className="end-article-ads" 
            style={{ minHeight: '40vh', background: 'transparent' }} // minHeight giúp tính toán tọa độ chính xác hơn
          >
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
      props: { data: json?.data ?? [], parameters },
      revalidate: 3600,
    };
  } catch (err) {
    return {
      props: { 
        data: [], 
        parameters: { mgWidgetId1: "1903360", mgWidgetFeedId: "1903357", adsKeeperSrc: "", googleTagId: "", isMgid: 0 } 
      },
      revalidate: 60,
    };
  }
}