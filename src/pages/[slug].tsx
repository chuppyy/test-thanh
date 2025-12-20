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

/* ================== HELPERS ================== */
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

/* ================== SUB-COMPONENT ================== */
const ArticleItem = memo(({ article, idx }: { article: NewsMainModel; idx: number }) => (
  <section className="container-flu details">
    {/* Banner mặc định */}
    <div 
      className="adsconex-banner" 
      data-ad-placement={idx === 0 ? "banner1" : "banner10"} 
      id={idx === 0 ? "ub-banner1" : "ub-banner10"} 
    />
    <h1>{article.name}</h1>
    
    <Suspense fallback={<p>Loading...</p>}>
      {/* Nội dung bài viết - Nơi chứa thẻ <div id="qctaboo-mid"> sẵn có */}
      <article className="content" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
    </Suspense>
  </section>
));

ArticleItem.displayName = "ArticleItem";

/* ================== MAIN PAGE ================== */
export default function Page(props: PageProps) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } = props.parameters;
  const useMgid = Number(isMgid) === 1;

  const list = useMemo(() => {
    const raw = props.data;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [props.data]);

  const [visibleCount, setVisibleCount] = useState(1);
  const [showEndAds, setShowEndAds] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const endAdsRef = useRef<HTMLDivElement>(null);
  const midInjectedRef = useRef(false);

  // 1. CHÈN QUẢNG CÁO VÀO THẺ CÓ SẴN TRONG CONTENT
  useEffect(() => {
    // Chỉ chạy 1 lần và chỉ chạy khi đã có nội dung bài viết
    if (midInjectedRef.current || list.length === 0) return;

    const qcDivTaboo = document.getElementById("qctaboo-mid");
    if (qcDivTaboo) {
      const newDiv = document.createElement("div");
      if (useMgid) {
        newDiv.innerHTML = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
      } else {
        newDiv.innerHTML = `<div id="taboola-below-mid-article"></div>`;
      }
      qcDivTaboo.appendChild(newDiv);
      midInjectedRef.current = true;
    }
  }, [list, useMgid, mgWidgetId1]);

  // 2. TỰ ĐỘNG HIỆN KHỐI END-ADS KHI CUỘN GẦN HẾT BÀI 1
  useEffect(() => {
    const handleInitialScroll = () => {
      if (window.scrollY > 500) { // Khi cuộn qua 500px thì bắt đầu chuẩn bị khối Ads cuối
        setShowEndAds(true);
        window.removeEventListener("scroll", handleInitialScroll);
      }
    };
    window.addEventListener("scroll", handleInitialScroll);
    return () => window.removeEventListener("scroll", handleInitialScroll);
  }, []);

  // 3. LOGIC BUNG BÀI 2: Khi Ads hiện đúng 30% chiều cao màn hình
  useEffect(() => {
    if (!showEndAds || expanded || list.length < 2) return;

    const onScroll = () => {
      const el = endAdsRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // rect.top là khoảng cách từ đỉnh màn hình đến đầu khối Ads.
      // vh * 0.7 nghĩa là vạch 70% màn hình tính từ trên xuống (tương đương 30% từ dưới lên).
      if (rect.top <= vh * 0.7 && rect.top > 0) {
        setVisibleCount(list.length);
        setExpanded(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showEndAds, expanded, list.length]);

  return (
    <>
      <Head>
        <title>{list[0]?.name || "News"}</title>
      </Head>

      {adsKeeperSrc && <Script src={adsKeeperSrc} strategy="afterInteractive" />}
      {googleTagId && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
      )}

      <main>
        {list.slice(0, visibleCount).map((article, idx) => (
          <div key={article.id || idx}>
            <ArticleItem article={article} idx={idx} />
            
            {/* Khối quảng cáo nằm giữa bài 1 và bài 2 (Trigger bung bài) */}
            {idx === 0 && (
              <div 
                ref={endAdsRef} 
                style={{ 
                  minHeight: showEndAds ? '320px' : '1px', 
                  margin: '20px 0' 
                }}
              >
                {showEndAds && (
                  <>
                    {useMgid ? (
                      <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
                    ) : (
                      <div id="taboola-below-article-thumbnails" />
                    )}
                    <Script id="end-ads-init" strategy="afterInteractive">
                      {useMgid 
                        ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
                        : `window._taboola = window._taboola || [];
                           _taboola.push({ mode: 'thumbs-feed-01', container: 'taboola-below-article-thumbnails', placement: 'Below Article Thumbnails', target_type: 'mix' });
                           _taboola.push({ flush: true });`}
                    </Script>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Nạp script cho cái ID qctaboo-mid nằm trong content */}
        <Script id="mid-content-init" strategy="afterInteractive">
          {useMgid 
            ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
            : `window._taboola = window._taboola || [];
               _taboola.push({ mode: 'thumbs-feed-01-b', container: 'taboola-below-mid-article', placement: 'Mid article', target_type: 'mix' });`}
        </Script>
      </main>
    </>
  );
}

/* ================== SERVER SIDE ================== */
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