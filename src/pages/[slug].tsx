import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import Head from "next/head";

/** ===== Types: khớp C# NewsMainModel ===== */
export type NewsMainModel = {
  Id: string;
  Name: string;
  Summary: string;
  UserCode: string;
  Content: string;
  AvatarLink: string;
  UrlRootLink: string;
  IsDeleted: boolean;
  DateTimeStart: string; // backend trả JSON thường là ISO string
};

export type PageParameters = {
  videoScriptSrc?: string;
  googleClientId?: string;
  googleClientSlotId?: string;
  googleAdSlot?: string;
  mgWidgetId1?: string;
  mgWidgetId2?: string;
  mgWidgetFeedId?: string;
  adsKeeperSrc?: string;
  googleTagId?: string;
  isMgid?: number | string; // 1 hoặc 0
};

export type PageProps = {
  data: NewsMainModel[]; // ✅ LIST
  parameters: PageParameters;
};

/** ===== Utils ===== */
const formatDate = (str: string) => {
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const getIdFromSlug = (slug?: string) => {
  if (!slug) return "";
  const s = String(slug);
  return s.slice(s.lastIndexOf("-") + 1);
};

/** ===== Component ===== */
export default function Page(props: PageProps) {
  const {
    adsKeeperSrc = "",
    googleTagId = "",
    mgWidgetId1 = "",
    mgWidgetId2 = "",
    mgWidgetFeedId = "",
    isMgid = 0,
  } = props.parameters || {};

  const useMgid = Number(isMgid) === 1;

  // ✅ normalize + filter deleted
  const list: NewsMainModel[] = useMemo(() => {
    const arr = Array.isArray(props.data) ? props.data : [];
    return arr.filter((x) => x && !x.IsDeleted);
  }, [props.data]);
 console.log("Bài đầu tiên (render):", props.data?.[0]);
 console.log("Bài đầu đ(render):", list);
  // ✅ chỉ render bài đầu, scroll thì bung thêm
  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );
  const [expanded, setExpanded] = useState(false);

  // sentinel để detect gần cuối
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // reset khi list đổi (navigating)
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setExpanded(false);
  }, [list]);

  // ✅ bung toàn bộ list khi scroll tới gần đáy (không fetch)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (expanded) return;
    if (list.length < 2) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(list); // append các bài đã cache sẵn
          setExpanded(true);
        }
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [expanded, list]);

  // ✅ Ads init + iframe sizing: chạy 1 lần hoặc khi expanded (vì content DOM thay đổi)
  useEffect(() => {
    try {
      // Giữa bài: nếu dùng MGID chèn widget MGID, nếu không dùng Taboola chèn div Taboola
      const qcDivTaboo = document.getElementById("qctaboo-mid");
      if (qcDivTaboo && !qcDivTaboo.dataset.inited) {
        qcDivTaboo.dataset.inited = "1";
        const newDiv = document.createElement("div");
        if (useMgid) {
          newDiv.innerHTML = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
        } else {
          newDiv.innerHTML = `<div id="taboola-below-mid-article"></div>`;
        }
        qcDivTaboo.appendChild(newDiv);
      }

      // Adjust iframe dimensions
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe: HTMLIFrameElement) => {
        if (!iframe?.src) return;
        if (iframe.src.includes("twitter")) {
          iframe.style.height = window.innerWidth <= 525 ? "650px" : "827px";
          iframe.style.width = window.innerWidth <= 525 ? "100%" : "550px";
        } else if (iframe.src.includes("instagram")) {
          iframe.style.height = window.innerWidth <= 525 ? "553px" : "628px";
          iframe.style.width = "100%";
        } else {
          iframe.style.height = window.innerWidth <= 525 ? "250px" : "300px";
          iframe.style.width = "100%";
        }
      });
    } catch (err) {
      console.error("Error with ads", err);
    }
  }, [useMgid, mgWidgetId1, expanded]);

  const first = visible[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.Name}-${first.UserCode}` : "News"}</title>
        {first?.AvatarLink && (
          <meta property="og:image" content={first.AvatarLink} />
        )}
        {first && (
          <meta
            property="og:title"
            content={`${first.Name}-${first.UserCode}`}
          />
        )}
      </Head>

      {/* MGID / AdsKeeper */}
      {adsKeeperSrc ? <Script src={adsKeeperSrc} strategy="afterInteractive" /> : null}

      {/* Google Analytics */}
      {googleTagId ? (
        <>
          <Script
            id="gg-1"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
          />
          <Script
            id="gg-2"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleTagId}');
              `,
            }}
          />
        </>
      ) : null}

      <main>
        {/* Render bài 1, scroll thì bung thêm */}
        {visible.map((article, idx) => (
          <section key={article.Id || idx} className="container-flu details">
            {idx === 0 && (
              <div
                className="adsconex-banner"
                data-ad-placement="banner1"
                id="ub-banner1"
              />
            )}

            <h1>{article.Name}</h1>
            <p className="mb-4 text-lg">
              Posted: {formatDate(article.DateTimeStart)}
            </p>

            <Suspense fallback={<p>Loading ...</p>}>
              <article
                className="content"
                dangerouslySetInnerHTML={{ __html: article.Content }}
              />
            </Suspense>

            {idx < visible.length - 1 && (
              <hr style={{ margin: "32px 0" }} />
            )}
          </section>
        ))}

        {/* ======= GIỮA BÀI (container để useEffect chèn widget) ======= */}
        <div id="qctaboo-mid" />

        {/* Nếu dùng Taboola: inject scripts */}
        {!useMgid && (
          <Script
            id="taboola-mid"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window._taboola = window._taboola || [];
                _taboola.push({
                  mode: 'thumbs-feed-01-b',
                  container: 'taboola-below-mid-article',
                  placement: 'Mid article',
                  target_type: 'mix'
                });
              `,
            }}
          />
        )}

        {/* Nếu dùng MGID: loader */}
        {useMgid && mgWidgetId2 && (
          <>
            <div data-type="_mgwidget" data-widget-id={mgWidgetId2} />
            <Script
              id="mgid-load"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})
                  (window,"_mgq");
                `,
              }}
            />
          </>
        )}

        {/* ======= CUỐI BÀI ======= */}
        <div className="end-article-ads">
          {useMgid ? (
            <>
              {mgWidgetFeedId ? (
                <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
              ) : null}
              <Script
                id="mgid-feed-load"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})
                    (window,"_mgq");
                  `,
                }}
              />
            </>
          ) : (
            <>
              <div id="taboola-below-article-thumbnails" />
              <Script
                id="taboola-below"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window._taboola = window._taboola || [];
                    _taboola.push({
                      mode: 'thumbs-feed-01',
                      container: 'taboola-below-article-thumbnails',
                      placement: 'Below Article Thumbnails',
                      target_type: 'mix'
                    });
                    _taboola.push({ flush: true });
                  `,
                }}
              />
            </>
          )}
        </div>

        {/* ✅ Sentinel: chạm gần đáy => bung thêm bài (đã cache sẵn) */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {!expanded && list.length >= 2 ? (
          <p style={{ padding: 16, opacity: 0.8 }}>
            Kéo xuống để tự tải bài tiếp theo…
          </p>
        ) : null}
      </main>
    </>
  );
}

/** ===== Next.js data fetching ===== */
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const slug = params?.slug as string | undefined;
    const id = getIdFromSlug(slug);
console.log("API /News/news-detailnew response:", id);
    // ✅ API của bạn trả List<NewsMainModel> (ví dụ 2 bài)
    const response = await fetch(
      `${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`
    ).then((res) => res.json());
    console.log("API /News/news-detailnew response:", response);
    
    const parameters: PageParameters = {
      videoScriptSrc:
        "https://videoadstech.org/ads/topnews_livextop_com.0a05145f-8239-4054-9dc9-acd55fcdddd5.video.js",
      googleClientId: "ca-pub-2388584177550957",
      googleClientSlotId: "9127559985",
      googleAdSlot: "1932979136",
      mgWidgetId1: "1903360",
      mgWidgetId2: "1903360",
      mgWidgetFeedId: "1903357",
      adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
      googleTagId: "G-8R34GZG4J2",
      isMgid: 0, // 1 = MGID, 0 = Taboola
    };

    return {
      props: {
        data: (response.data || []) as NewsMainModel[],
        parameters,
      },
      revalidate: 360000, // ✅ cache theo đúng ý bạn
    };
  } catch (error) {
    return {
      props: { data: [] as NewsMainModel[], parameters: {} as PageParameters },
      revalidate: 60,
    };
  }
}
