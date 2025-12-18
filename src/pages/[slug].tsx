import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Head from "next/head";
import Script from "next/script";

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
  // mid-article
  mgWidgetId1?: string;

  // end-article
  mgWidgetFeedId?: string;

  // common
  adsKeeperSrc?: string;
  googleTagId?: string;
  isMgid?: number | string; // 1 = MGID, 0 = Taboola

  // FEJI ids (nếu bạn muốn cấu hình)
  fejiHbZone?: string; // "feji.io_long"
  fejiPlayerId?: string; // "feji.io_1723454353847"
};

type PageProps = {
  data: NewsMainModel[] | NewsMainModel;
  parameters: PageParameters;
};

/* ================== UTILS ================== */
const formatDate = (str?: string) => {
  if (!str) return "";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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

/* ================== PAGE ================== */
export default function Page(props: PageProps) {
  const {
    mgWidgetId1 = "",
    mgWidgetFeedId = "",
    adsKeeperSrc = "",
    googleTagId = "",
    isMgid = 0,
    fejiHbZone = "feji.io_long",
    fejiPlayerId = "feji.io_1723454353847",
  } = props.parameters || {};

  const useMgid = Number(isMgid) === 1;

  // normalize -> list
  const list = useMemo(() => {
    const raw = props.data;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [props.data]);

  // visible: ban đầu chỉ bài 1
  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );

  // ads cuối bài: ban đầu ẩn
  const [showEndAds, setShowEndAds] = useState(false);

  // đã bung bài 2 chưa
  const [expanded, setExpanded] = useState(false);

  // sentinel A: gần hết bài 1 -> show end-ads
  const sentinelShowAdsRef = useRef<HTMLDivElement | null>(null);

  // ref để đo vị trí end-ads trong viewport
  const endAdsRef = useRef<HTMLDivElement | null>(null);

  // reset khi list thay đổi
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setShowEndAds(false);
    setExpanded(false);
  }, [list]);

  /* ===== (1) GẦN HẾT BÀI 1 => HIỆN END-ADS ===== */
  useEffect(() => {
    const el = sentinelShowAdsRef.current;
    if (!el || showEndAds) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowEndAds(true);
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showEndAds]);

  /* ===== (2) END-ADS VỪA “LÓ” ~10% VIEWPORT => BUNG BÀI 2 =====
     Điều kiện:
     - rect.top <= 0.9 * vh  => ads đã vào viewport ~10%
     - rect.top > 0          => ads chưa lên tới top (bài 1 vẫn còn ở trên)
  */
  useEffect(() => {
    if (!showEndAds) return;
    if (expanded) return;
    if (list.length < 2) return;

    const onScroll = () => {
      const adsEl = endAdsRef.current;
      if (!adsEl) return;

      const rect = adsEl.getBoundingClientRect();
      const vh = window.innerHeight;

      const adsShownAbout10Percent = rect.top <= vh * 0.65 && rect.top > 0;

      if (adsShownAbout10Percent) {
        setVisible(list); // bung bài 2
        setExpanded(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [showEndAds, expanded, list]);

  /* ===== IFRAME RESIZE: chạy lại khi bung bài 2 ===== */
  useEffect(() => {
    try {
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
      console.error("Error with iframe resize", err);
    }
  }, [visible.length]);

  const first = visible[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.name}-${first.userCode}` : "News"}</title>
        {first?.avatarLink ? <meta property="og:image" content={first.avatarLink} /> : null}
        {first ? <meta property="og:title" content={`${first.name}-${first.userCode}`} /> : null}
      </Head>

      {/* AdsKeeper */}
      {adsKeeperSrc ? <Script src={adsKeeperSrc} strategy="afterInteractive" /> : null}

      {/* Google Analytics */}
      {googleTagId ? (
        <>
          <Script
            id="ga-lib"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-config"
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
        {/* =================== ARTICLES =================== */}
        {visible.map((article, idx) => (
          <section
            key={article.id ?? article.urlRootLink ?? `${idx}-${article.userCode}`}
            className="container-flu details"
          >
            {/* ===== Banner theo bài ===== */}
            {idx === 0 && (
              <div className="adsconex-banner" data-ad-placement="banner1" id="ub-banner1" />
            )}
            {idx === 1 && (
              <div className="adsconex-banner" data-ad-placement="banner10" id="ub-banner10" />
            )}

            <h1>{article.name}</h1>

            {/* ===== FEJI chỉ cho bài 1 ===== */}
            {idx === 0 && (
              <>
                <Script
                  id="feji-hb-init"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.unibotshb = window.unibotshb || { cmd: [] };
                      window.unibotshb.cmd.push(function () { ubHB("${fejiHbZone}"); });
                    `,
                  }}
                />
                <div id={`div-ub-${fejiPlayerId}`}>
                  <Script
                    id="feji-player-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                      __html: `
                        window.unibots = window.unibots || { cmd: [] };
                        window.unibots.cmd.push(function () { unibotsPlayer("${fejiPlayerId}"); });
                      `,
                    }}
                  />
                </div>
              </>
            )}

            <p className="mb-4 text-lg">Posted: {formatDate(article.dateTimeStart)}</p>

            <Suspense fallback={<p>Loading...</p>}>
              <article
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            </Suspense>

            {/* phân cách giữa bài 1 và bài 2 */}
            {idx < visible.length - 1 && <hr style={{ margin: "32px 0" }} />}

            {/* ===== Giữa bài (slot ads) chỉ render 1 lần sau nội dung bài 1 ===== */}
            {idx === 0 && (
              <>
                <div id="qctaboo-mid">
                  {useMgid ? (
                    <div data-type="_mgwidget" data-widget-id={mgWidgetId1} />
                  ) : (
                    <div id="taboola-below-mid-article" />
                  )}
                </div>

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
                  <Script
                    id="mgid-mid-load"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                      __html: `
                        (function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})
                        (window,"_mgq");
                      `,
                    }}
                  />
                )}
              </>
            )}
          </section>
        ))}

        {/* Sentinel A: gần hết bài 1 => hiện end-ads */}
        <div ref={sentinelShowAdsRef} style={{ height: 1 }} />

        {/* =================== END-ARTICLE-ADS (HIỆN TRƯỚC) =================== */}
        {showEndAds && (
          <div ref={endAdsRef} className="end-article-ads">
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
                  id="taboola-below-flush"
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
        )}
      </main>
    </>
  );
}

/* ================== DATA FETCH ================== */
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: any }) {
  const slug = params?.slug as string | undefined;
  const id = getIdFromSlug(slug);

  const res = await fetch(
    `${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`
  );
  const json = await res.json();

  // Bạn nói API trả list 2 bài -> json.data là array
  const parameters: PageParameters = {
    mgWidgetId1: "1903360",
    mgWidgetFeedId: "1903357",
    adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
    googleTagId: "G-RZ218Z0QZ1",
    isMgid: 0,
    fejiHbZone: "feji.io_long",
    fejiPlayerId: "feji.io_1723454353847",
  };

  return {
    props: {
      data: json?.data ?? [],
      parameters,
    },
    revalidate: 360000,
  };
}
