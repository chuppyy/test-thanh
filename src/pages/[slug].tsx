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
export default function Page({ data, parameters }: { data: any; parameters: PageParameters }) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } = parameters;
  const useMgid = Number(isMgid) === 1;

  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : data ? [data] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [data]);

  const [visibleCount, setVisibleCount] = useState(1);
  const midInjected = useRef(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 1. XỬ LÝ CHÈN QUẢNG CÁO VÀO ID CÓ SẴN TRONG CONTENT (Dùng MutationObserver)
  useEffect(() => {
    if (midInjected.current) return;

    const injectMidAd = () => {
      const target = document.getElementById("qctaboo-mid");
      if (target && !midInjected.current) {
        const newDiv = document.createElement("div");
        newDiv.className = "injected-mid-ad";
        if (useMgid) {
          newDiv.innerHTML = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
        } else {
          newDiv.innerHTML = `<div id="taboola-below-mid-article"></div>`;
        }
        target.appendChild(newDiv);
        midInjected.current = true;
        
        // Kích hoạt script quét quảng cáo
        if (typeof window !== "undefined") {
           const cmd = useMgid 
            ? `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`
            : `window._taboola = window._taboola || []; _taboola.push({ mode: 'thumbs-feed-01-b', container: 'taboola-below-mid-article', placement: 'Mid article', target_type: 'mix' });`;
           const s = document.createElement("script");
           s.innerHTML = cmd;
           document.body.appendChild(s);
        }
        return true;
      }
      return false;
    };

    // Kiểm tra ngay lập tức
    if (injectMidAd()) return;

    // Nếu chưa thấy, quan sát sự thay đổi của DOM
    const observer = new MutationObserver(() => {
      if (injectMidAd()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [useMgid, mgWidgetId1]);

  // 2. LOGIC BUNG BÀI: Khi khu vực quảng cáo chạm mốc 30% chiều cao màn hình
  useEffect(() => {
    if (list.length < 2) return;

    const onScroll = () => {
      if (visibleCount >= list.length || !triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      // rect.top là vị trí của đỉnh khối quảng cáo so với mép trên màn hình.
      // Khi rect.top <= vh * 0.7, có nghĩa là khối đó đã trồi lên khỏi đáy màn hình được 30% chiều cao màn hình.
      if (rect.top <= vh * 0.7) {
        setVisibleCount(list.length);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visibleCount, list.length]);

  return (
    <>
      <Head>
        <title>{list[0]?.name || "News"}</title>
      </Head>

      {adsKeeperSrc && <Script src={adsKeeperSrc} strategy="afterInteractive" />}
      {googleTagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
          <Script id="ga-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date()); gtag('config', '${googleTagId}');`}
          </Script>
        </>
      )}

      <main>
        {list.slice(0, visibleCount).map((article, idx) => (
          <div key={article.id || idx}>
            <section className="container-flu details" style={{ paddingBottom: '10px' }}>
              <h1>{article.name}</h1>
              <article 
                className="content" 
                dangerouslySetInnerHTML={{ __html: article.content || "" }} 
              />
            </section>

            {/* KHỐI QUẢNG CÁO CUỐI BÀI 1 & VÙNG TRIGGER */}
            {idx === 0 && (
              <div 
                ref={triggerRef}
                className="end-ads-container"
                style={{ 
                  minHeight: '40vh', // Cố định chiều cao vùng này để tính toán 30% luôn chuẩn
                  margin: '30px 0',
                  background: '#fafafa' // Màu nền nhẹ để bạn dễ kiểm tra vùng kích hoạt
                }}
              >
                {/* Phần quảng cáo thực tế */}
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
              </div>
            )}
            {idx > 0 && <hr style={{ margin: '40px 0', borderTop: '1px solid #eee' }} />}
          </div>
        ))}
      </main>

      <style jsx global>{`
        .content { font-size: 18px; line-height: 1.6; }
        .content iframe { width: 100% !important; min-height: 300px; }
        #qctaboo-mid { min-height: 250px; margin: 20px 0; clear: both; }
      `}</style>
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