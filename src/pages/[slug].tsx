import { useEffect, useMemo, useRef, useState, memo } from "react";
import Script from "next/script";
import Head from "next/head";

/* ================== TYPES ================== */
type NewsMainModel = {
  id: string | null;
  name: string;
  userCode: string;
  content?: string;
  isDeleted?: boolean;
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
  userCode: x?.userCode ?? x?.UserCode ?? "",
  content: x?.content ?? x?.Content ?? "",
  isDeleted: x?.isDeleted ?? x?.IsDeleted ?? false,
});

const getIdFromSlug = (slug?: string) => {
  if (!slug) return "";
  const s = String(slug);
  return s.slice(s.lastIndexOf("-") + 1);
};

/* ================== MAIN PAGE ================== */
export default function Page({ data, parameters }: PageProps) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } = parameters;
  const useMgid = Number(isMgid) === 1;

  // Xử lý danh sách bài viết
  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : data ? [data] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [data]);

  const [visibleCount, setVisibleCount] = useState(1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isExpanded = useRef(false);

  // LOGIC QUAN TRỌNG: Bung bài khi quảng cáo hiện 30% màn hình
  useEffect(() => {
    if (list.length < 2) return;

    const handleScroll = () => {
      if (isExpanded.current || !triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Kích hoạt khi "đỉnh" của khối quảng cáo cách đỉnh màn hình 70% chiều cao 
      // (Tương đương việc nó đã hiện lên được 30% từ dưới lên)
      if (rect.top <= viewportHeight * 0.7) {
        setVisibleCount(list.length);
        isExpanded.current = true;
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Kiểm tra ngay lập tức nếu bài 1 quá ngắn
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [list.length]);

  // Xử lý nội dung bài viết để chèn quảng cáo vào đúng ID qctaboo-mid
  const renderContentWithAds = (content: string) => {
    if (!content) return "";
    
    // Nếu là MGID
    if (useMgid) {
      const mgidHtml = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
      return content.replace('id="qctaboo-mid"', `id="qctaboo-mid">${mgidHtml}`);
    } 
    
    // Nếu là Taboola
    const taboolaHtml = `<div id="taboola-below-mid-article"></div>`;
    return content.replace('id="qctaboo-mid"', `id="qctaboo-mid">${taboolaHtml}`);
  };

  return (
    <>
      <Head>
        <title>{list[0]?.name || "News"}</title>
      </Head>

      {/* Nạp script quảng cáo và GA */}
      {adsKeeperSrc && <Script src={adsKeeperSrc} strategy="afterInteractive" />}
      {googleTagId && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
      )}

      <main>
        {list.slice(0, visibleCount).map((article, idx) => (
          <div key={article.id || idx} className="article-wrapper">
            <section className="container-flu details">
              <h1>{article.name}</h1>
              <article 
                className="content" 
                dangerouslySetInnerHTML={{ __html: renderContentWithAds(article.content || "") }} 
              />
            </section>

            {/* QUẢNG CÁO GIỮA BÀI 1 VÀ BÀI 2 (TRIGGER) */}
            {idx === 0 && (
              <div 
                ref={triggerRef} 
                className="ads-trigger-container"
                style={{ 
                  minHeight: "300px", 
                  margin: "40px 0",
                  background: "#fcfcfc",
                  borderTop: "1px solid #eee"
                }}
              >
                {/* Khối quảng cáo Feed/Thumbnails */}
                {useMgid ? (
                  <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
                ) : (
                  <div id="taboola-below-article-thumbnails" />
                )}
                
                {/* Script kích hoạt cho cả Mid và End Ads */}
                <Script id={`ads-init-${idx}`} strategy="afterInteractive">
                  {useMgid 
                    ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
                    : `window._taboola = window._taboola || [];
                       _taboola.push({ mode: 'thumbs-feed-01-b', container: 'taboola-below-mid-article', placement: 'Mid article', target_type: 'mix' });
                       _taboola.push({ mode: 'thumbs-feed-01', container: 'taboola-below-article-thumbnails', placement: 'Below Article Thumbnails', target_type: 'mix' });
                       _taboola.push({ flush: true });`}
                </Script>
              </div>
            )}
            
            {idx > 0 && <hr style={{ margin: "50px 0" }} />}
          </div>
        ))}
      </main>

      <style jsx global>{`
        .content iframe { width: 100% !important; height: auto; min-height: 300px; }
        #qctaboo-mid { margin: 20px 0; min-height: 50px; }
      `}</style>
    </>
  );
}

/* ================== SERVER SIDE ================== */
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