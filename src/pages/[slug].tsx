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
const ArticleItem = memo(({ article, idx, isFirst }: { article: NewsMainModel; idx: number; isFirst: boolean }) => (
  <section className="container-flu details">
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

    <p className="mb-4 text-lg">Posted: {formatDate(article.dateTimeStart)}</p>

    <Suspense fallback={<p>Loading...</p>}>
      <article className="content" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
    </Suspense>
    
    <hr style={{ margin: "40px 0", opacity: 0.1 }} />
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
  
  const sentinelAdsRef = useRef<HTMLDivElement>(null);
  const triggerNextRef = useRef<HTMLDivElement>(null);

  // 1. Hiện khối Ads khi gần hết bài 1 (cách 300px)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEndAds(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (sentinelAdsRef.current) observer.observe(sentinelAdsRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. TRIGGER QUAN TRỌNG: Bung bài 2 khi Ads hiện lên 30% chiều cao màn hình
  useEffect(() => {
    if (!showEndAds || visibleCount >= list.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi đỉnh của vùng quảng cáo đi vào vùng an toàn (cách đáy màn hình 30% chiều cao)
        if (entry.isIntersecting) {
          setVisibleCount(list.length);
          observer.disconnect();
        }
      },
      { 
        // rootMargin âm ở bottom sẽ đẩy "vạch kích hoạt" từ đáy màn hình lên trên
        // -30% có nghĩa là phần tử phải lú lên quá 30% chiều cao màn hình thì mới tính là giao thoa
        rootMargin: "0px 0px -30% 0px",
        threshold: 0 
      }
    );

    if (triggerNextRef.current) observer.observe(triggerNextRef.current);
    return () => observer.disconnect();
  }, [showEndAds, list.length, visibleCount]);

  // 3. Iframe Resize logic
  useEffect(() => {
    const resizer = () => {
      document.querySelectorAll("iframe").forEach((iframe) => {
        const isM = window.innerWidth <= 525;
        if (iframe.src.includes("twitter")) {
          iframe.style.height = isM ? "650px" : "827px";
          iframe.style.width = isM ? "100%" : "550px";
        } else {
          iframe.style.height = isM ? "250px" : "300px";
          iframe.style.width = "100%";
        }
      });
    };
    resizer();
  }, [visibleCount]);

  const first = list[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.name}-${first.userCode}` : "News"}</title>
        {first?.avatarLink && <meta property="og:image" content={first.avatarLink} />}
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
          <ArticleItem key={article.id || idx} article={article} idx={idx} isFirst={idx === 0} />
        ))}

        {/* Mid Widget Container */}
        <div id="qctaboo-mid" className="my-6">
            {useMgid ? (
                <div data-type="_mgwidget" data-widget-id={mgWidgetId1}></div>
            ) : (
                <div id="taboola-below-mid-article"></div>
            )}
            <Script id="mid-init" strategy="afterInteractive">
              {useMgid 
                ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
                : `window._taboola = window._taboola || [];
                   _taboola.push({ mode: 'thumbs-feed-01-b', container: 'taboola-below-mid-article', placement: 'Mid article', target_type: 'mix' });`
              }
            </Script>
        </div>

        {/* Điểm neo để bắt đầu hiện Ads */}
        <div ref={sentinelAdsRef} style={{ height: "1px" }} />

        {/* Khối quảng cáo và Vùng kích hoạt bung bài */}
        {showEndAds && (
          <div 
            ref={triggerNextRef} 
            className="end-article-ads" 
            style={{ minHeight: '30vh', background: 'transparent' }}
          >
            {useMgid ? (
              <>
                <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
                <Script id="mgid-f-load" strategy="afterInteractive">
                  {`(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                </Script>
              </>
            ) : (
              <>
                <div id="taboola-below-article-thumbnails" />
                <Script id="taboola-f-init" strategy="afterInteractive">
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

export async function getStaticPaths() { return { paths: [], fallback: "blocking" }; }
export async function getStaticProps({ params }: any) {
  try {
    const id = getIdFromSlug(params?.slug);
    const res = await fetch(`${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`);
    const json = await res.json();
    return {
      props: {
        data: json?.data ?? [],
        parameters: {
          mgWidgetId1: "1903360",
          mgWidgetFeedId: "1903357",
          adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
          googleTagId: "G-RZ218Z0QZ1",
          isMgid: 0,
        },
      },
      revalidate: 3600,
    };
  } catch {
    return { props: { data: [], parameters: {} }, revalidate: 60 };
  }
}