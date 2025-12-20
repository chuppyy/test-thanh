import { useEffect, useMemo, useRef, useState, Suspense, memo } from "react";
import Script from "next/script";
import Head from "next/head";

/* ================== TYPES ================== */
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
  <section className="container-flu details">
    <div 
      className="adsconex-banner" 
      data-ad-placement={idx === 0 ? "banner1" : "banner10"} 
      id={idx === 0 ? "ub-banner1" : "ub-banner10"} 
    />

    <h1>{article.name}</h1>

    {isFirst && (
      <div id={`div-ub-${FEJI_PLAYER_ID}`} style={{ margin: '15px 0' }}>
        <Script id="feji-hb-init" strategy="afterInteractive">
          {`window.unibotshb = window.unibotshb || { cmd: [] };
            window.unibotshb.cmd.push(function () { ubHB("${FEJI_HB_ZONE}"); });`}
        </Script>
        <Script id="feji-player-init" strategy="afterInteractive">
          {`window.unibots = window.unibots || { cmd: [] };
            window.unibots.cmd.push(function () { unibotsPlayer("${FEJI_PLAYER_ID}"); });`}
        </Script>
      </div>
    )}

    <p className="mb-4 text-sm" style={{ color: '#888' }}>
      Posted: {formatDate(article.dateTimeStart)}
    </p>

    <Suspense fallback={<p>Loading...</p>}>
      <article className="content" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
    </Suspense>
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
  const triggerRef = useRef<HTMLDivElement>(null);

  // 1. Kích hoạt hiện khung Ads sớm hơn (khi cách đáy màn hình 600px)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowEndAds(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" } 
    );

    const sentinel = document.getElementById("ad-sentinel");
    if (sentinel) io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  // 2. LOGIC QUAN TRỌNG: Bung bài 2 khi quảng cáo hiện 30% màn hình
  useEffect(() => {
    if (!showEndAds || visibleCount >= list.length) return;

    const onScroll = () => {
      const el = triggerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      
      // Tính toán: Khi đỉnh của khung quảng cáo đã đi lên được 30% chiều cao màn hình tính từ đáy
      // Nghĩa là: khoảng cách từ đỉnh màn hình tới element <= 70% chiều cao màn hình
      const isReached30Percent = rect.top <= vh * 0.7;

      if (isReached30Percent) {
        setVisibleCount(list.length);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showEndAds, list.length, visibleCount]);

  // 3. Iframe Resize
  useEffect(() => {
    document.querySelectorAll("iframe").forEach((iframe) => {
      if (!iframe.src) return;
      const isMobile = window.innerWidth <= 525;
      iframe.style.width = "100%";
      if (iframe.src.includes("twitter")) {
        iframe.style.height = isMobile ? "650px" : "827px";
        if (!isMobile) iframe.style.width = "550px";
      } else {
        iframe.style.height = isMobile ? "250px" : "300px";
      }
    });
  }, [visibleCount]);

  const first = list[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.name} - ${first.userCode}` : "News"}</title>
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
          <div key={article.id || idx}>
            <ArticleItem article={article} idx={idx} isFirst={idx === 0} />
    
            {idx < visibleCount - 1 && <hr style={{ margin: "50px 0", border: '0', borderTop: '2px dashed #eee' }} />}
          </div>
        ))}

        {/* VÙNG QUẢNG CÁO CUỐI BÀI 1 */}
        <div 
          ref={triggerRef} 
          style={{ 
            minHeight: showEndAds ? '350px' : '0px', 
            visibility: showEndAds ? 'visible' : 'hidden',
            marginTop: '20px'
          }}
        >
          {showEndAds && (
            <>
              {useMgid ? (
                <>
                  <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId}></div>
                  <Script id="mgid-f-load" strategy="afterInteractive">
                    {`(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                  </Script>
                </>
              ) : (
                <>
                  <div id="taboola-below-article-thumbnails"></div>
                  <Script id="taboola-f-load" strategy="afterInteractive">
                    {`window._taboola = window._taboola || [];
                      _taboola.push({ mode: 'thumbs-feed-01', container: 'taboola-below-article-thumbnails', placement: 'Below Article Thumbnails', target_type: 'mix' });
                      _taboola.push({ flush: true });`}
                  </Script>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

/* ================== NEXT DATA ================== */
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

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