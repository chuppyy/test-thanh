import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import Head from "next/head";

/** ✅ Model đúng theo API camelCase */
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

type PageProps = {
  data: NewsMainModel[] | NewsMainModel; // backend có thể trả list hoặc 1 item
  parameters: PageParameters;
};

const formatDate = (str?: string) => {
  if (!str) return "";
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const getIdFromSlug = (slug?: string) => {
  if (!slug) return "";
  const s = String(slug);
  return s.slice(s.lastIndexOf("-") + 1);
};

/** ✅ Normalize để chịu được cả camelCase/PascalCase */
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

  /** ✅ normalize data về list */
  const list: NewsMainModel[] = useMemo(() => {
    const raw = props.data;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [props.data]);

  /** ✅ Hiển thị bài 1 trước */
  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );
  const [expanded, setExpanded] = useState(false);

  /** ✅ Sentinel đặt NGAY SAU bài viết (trước ads cuối bài) */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** reset khi list đổi */
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setExpanded(false);
  }, [list]);

  /** ✅ Log bài đầu tiên để check */
  useEffect(() => {
    console.log("list.length =", list.length);
    console.log("first article =", list[0]);
    console.log("first content length =", list[0]?.content?.length);
  }, [list]);

  /** ✅ Đọc gần hết bài 1 thì bung bài 2 (không gọi API thêm) */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (expanded) return;
    if (list.length < 2) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(list); // bung hết list (2 bài hoặc hơn)
          setExpanded(true);
        }
      },
      {
        root: null,
        // preload sớm 400px trước khi chạm sentinel (mượt)
        rootMargin: "400px 0px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [expanded, list]);

  /** Ads init + iframe adjust */
  useEffect(() => {
    try {
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
        <title>{first ? `${first.name}-${first.userCode}` : "News"}</title>
        {first?.avatarLink ? <meta property="og:image" content={first.avatarLink} /> : null}
        {first ? <meta property="og:title" content={`${first.name}-${first.userCode}`} /> : null}
      </Head>

      {adsKeeperSrc ? <Script src={adsKeeperSrc} strategy="afterInteractive" /> : null}

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
        {/* =================== NỘI DUNG (BÀI 1 + BÀI 2) =================== */}
        {visible.map((article, idx) => (
          <section
            key={article.id ?? article.urlRootLink ?? `${idx}-${article.userCode}`}
            className="container-flu details"
          >
            {/* banner chỉ 1 lần cho bài đầu */}
            {idx === 0 && (
              <div className="adsconex-banner" data-ad-placement="banner1" id="ub-banner1" />
            )}

            <h1>{article.name}</h1>

            <p className="mb-4 text-lg">
              Posted: {formatDate(article.dateTimeStart)}
            </p>

            <Suspense fallback={<p>Loading ...</p>}>
              <article
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            </Suspense>

            {idx < visible.length - 1 && <hr style={{ margin: "32px 0" }} />}
          </section>
        ))}

        {/* ✅ Sentinel đặt ở đây => đọc gần hết bài 1 thì bung bài 2 */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* =================== GIỮA BÀI ADS =================== */}
        <div id="qctaboo-mid" />

        {!useMgid ? (
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
        ) : (
          <>
            {mgWidgetId2 ? <div data-type="_mgwidget" data-widget-id={mgWidgetId2} /> : null}
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

        {/* =================== CUỐI BÀI ADS (SAU NỘI DUNG BÀI 2) =================== */}
        <div className="end-article-ads">
          {useMgid ? (
            <>
              {mgWidgetFeedId ? <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} /> : null}
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

        {list.length === 0 ? (
          <p style={{ padding: 16 }}>Không có dữ liệu bài viết.</p>
        ) : null}
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const slug = params?.slug as string | undefined;
    const id = getIdFromSlug(slug);

    const res = await fetch(
      `${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`
    );
    const json = await res.json();

    // server log (xem ở terminal / vercel logs)
    console.log("news-detailnew type:", Array.isArray(json?.data) ? "array" : typeof json?.data);
    console.log("news-detailnew first:", Array.isArray(json?.data) ? json.data[0] : json?.data);

    const parameters: PageParameters = {
      mgWidgetId1: "1903360",
      mgWidgetId2: "1903360",
      mgWidgetFeedId: "1903357",
      adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
      googleTagId: "G-8R34GZG4J2",
      isMgid: 0,
    };

    return {
      props: { data: json?.data ?? [], parameters },
      revalidate: 360000,
    };
  } catch (error) {
    console.error("getStaticProps error:", error);
    return {
      props: { data: [], parameters: {} },
      revalidate: 60,
    };
  }
}
