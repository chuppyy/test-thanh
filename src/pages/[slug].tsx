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
  mgWidgetId1: string;
  mgWidgetFeedId: string;
  adsKeeperSrc: string;
  googleTagId: string;
  isMgid: number; // 1 = MGID, 0 = Taboola
};

type PageProps = {
  data: NewsMainModel[] | NewsMainModel;
  parameters: PageParameters;
};

/* ================== HELPERS ================== */
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

// FEJI constants (không cần truyền từ parameters)
const FEJI_HB_ZONE = "feji.io_long";
const FEJI_PLAYER_ID = "feji.io_1723454353847";

/* ================== PAGE ================== */
export default function Page(props: PageProps) {
  const { mgWidgetId1, mgWidgetFeedId, adsKeeperSrc, googleTagId, isMgid } =
    props.parameters;

  const useMgid = Number(isMgid) === 1;

  const list = useMemo(() => {
    const raw = props.data;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [props.data]);

  // ban đầu chỉ hiển thị bài 1
  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );

  const [showEndAds, setShowEndAds] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // sentinel gần hết bài 1 -> hiện end-ads
  const sentinelShowAdsRef = useRef<HTMLDivElement | null>(null);

  // ref đo vị trí end-ads trong viewport
  const endAdsRef = useRef<HTMLDivElement | null>(null);

  // guard: mid widget chỉ append 1 lần
  const midInjectedRef = useRef(false);

  // reset khi list thay đổi
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setShowEndAds(false);
    setExpanded(false);
    midInjectedRef.current = false;
  }, [list]);

  /* (1) gần hết bài 1 => hiện end-ads */
  useEffect(() => {
    const el = sentinelShowAdsRef.current;
    if (!el || showEndAds) return;

    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShowEndAds(true),
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showEndAds]);

  /* (2) end-ads vừa “ló” ~10% viewport => bung bài 2 */
  useEffect(() => {
    if (!showEndAds || expanded || list.length < 2) return;

    const onScroll = () => {
      const adsEl = endAdsRef.current;
      if (!adsEl) return;

      const rect = adsEl.getBoundingClientRect();
      const vh = window.innerHeight;

      // ads top <= 90% viewport (ló ~10%), và chưa chạm top (bài 1 vẫn còn ở trên)
      const trigger = rect.top <= vh * 0.9 && rect.top > 0;

      if (trigger) {
        setVisible(list); // bung bài 2
        setExpanded(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [showEndAds, expanded, list]);

  /* Slot giữa bài + resize iframe: giữ kiểu code cũ nhưng chống duplicate */
  useEffect(() => {
    try {
      // ====== GIỮA BÀI: append vào #qctaboo-mid đúng 1 lần ======
      const qcDivTaboo = document.getElementById("qctaboo-mid");
      if (qcDivTaboo) {
        const alreadyHasMid =
          qcDivTaboo.querySelector("#taboola-below-mid-article") ||
          qcDivTaboo.querySelector('[data-type="_mgwidget"]');

        if (!alreadyHasMid && !midInjectedRef.current) {
          const newDiv = document.createElement("div");

          if (useMgid) {
            newDiv.innerHTML = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
          } else {
            newDiv.innerHTML = `<div id="taboola-below-mid-article"></div>`;
          }

          qcDivTaboo.appendChild(newDiv);
          midInjectedRef.current = true;
        }
      }

      // ====== Resize iframe (chạy lại khi bung bài 2) ======
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
      console.error("Error with mid-widget/iframes", err);
    }
  }, [useMgid, mgWidgetId1, visible.length]);

  const first = visible[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.name}-${first.userCode}` : "News"}</title>
        {first?.avatarLink ? (
          <meta property="og:image" content={first.avatarLink} />
        ) : null}
        {first ? (
          <meta
            property="og:title"
            content={`${first.name}-${first.userCode}`}
          />
        ) : null}
      </Head>

      {/* AdsKeeper */}
      {adsKeeperSrc ? (
        <Script src={adsKeeperSrc} strategy="afterInteractive" />
      ) : null}

      {/* GA */}
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
        {/* ============ ARTICLES ============ */}
        {visible.map((article, idx) => (
          <section
            key={article.id ?? article.urlRootLink ?? `${idx}-${article.userCode}`}
            className="container-flu details"
          >
            {/* Banner theo bài */}
            {idx === 0 && (
              <div
                className="adsconex-banner"
                data-ad-placement="banner1"
                id="ub-banner1"
              />
            )}

            {/* ✅ Bài 2: đổi banner2 -> banner10 */}
            {idx === 1 && (
              <div
                className="adsconex-banner"
                data-ad-placement="banner10"
                id="ub-banner10"
              />
            )}

            <h1>{article.name}</h1>

            {/* FEJI chỉ bài 1 */}
            {idx === 0 && (
              <>
                <Script
                  id="feji-hb-init"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.unibotshb = window.unibotshb || { cmd: [] };
                      window.unibotshb.cmd.push(function () { ubHB("${FEJI_HB_ZONE}"); });
                    `,
                  }}
                />

                <div id={`div-ub-${FEJI_PLAYER_ID}`}>
                  <Script
                    id="feji-player-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                      __html: `
                        window.unibots = window.unibots || { cmd: [] };
                        window.unibots.cmd.push(function () { unibotsPlayer("${FEJI_PLAYER_ID}"); });
                      `,
                    }}
                  />
                </div>
              </>
            )}

            <p className="mb-4 text-lg">
              Posted: {formatDate(article.dateTimeStart)}
            </p>

            <Suspense fallback={<p>Loading...</p>}>
              <article
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            </Suspense>

            {idx < visible.length - 1 && (
              <hr style={{ margin: "32px 0" }} />
            )}
          </section>
        ))}

        {/* ===== Slot giữa bài: container đặt ngoài, chỉ 1 lần ===== */}
        {/* <div id="qctaboo-mid" /> */}

        {/* Script init cho MID (chỉ render 1 lần vì nằm ngoài map) */}
        {useMgid ? (
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
        ) : (
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

        {/* Sentinel: gần hết bài 1 -> show end ads */}
        <div ref={sentinelShowAdsRef} style={{ height: 1 }} />

        {/* ============ END ARTICLE ADS ============ */}
        {showEndAds && (
          <div ref={endAdsRef} className="end-article-ads">
            {useMgid ? (
              <>
                <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId} />
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

/* ================== NEXT DATA ================== */
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const slug = params?.slug as string | undefined;
    const id = getIdFromSlug(slug);

    // ✅ đổi API sang news-detailvip
    const res = await fetch(
      `${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`
    );
    const json = await res.json();

    // ✅ bạn chỉ cần truyền 5 giá trị như yêu cầu
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
      revalidate: 360000,
    };
  } catch (err) {
    // fallback an toàn
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
