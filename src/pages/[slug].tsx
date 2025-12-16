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
  mgWidgetFeedId?: string;
  adsKeeperSrc?: string;
  googleTagId?: string;
  isMgid?: number | string; // 1 = MGID, 0 = Taboola
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

export default function Page(props: PageProps) {
  const { mgWidgetFeedId = "", adsKeeperSrc = "", googleTagId = "", isMgid = 0 } =
    props.parameters || {};

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

  // sentinel: gần hết bài 1 -> show ads
  const sentinelShowAdsRef = useRef<HTMLDivElement | null>(null);

  // ref cho end-article-ads để đo vị trí
  const endAdsRef = useRef<HTMLDivElement | null>(null);

  // reset khi đổi dữ liệu
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setShowEndAds(false);
    setExpanded(false);
  }, [list]);

  // (1) gần hết bài 1 -> show ads (IntersectionObserver đơn giản, ổn định)
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

  // (2) ads đã hiện -> khi ads vừa vào viewport ~10% chiều cao màn hình -> bung bài 2
useEffect(() => {
  if (!showEndAds) return;
  if (expanded) return;
  if (list.length < 2) return;

  const onScroll = () => {
    const adsEl = endAdsRef.current;
    if (!adsEl) return;

    const rect = adsEl.getBoundingClientRect();
    const vh = window.innerHeight;

    // ✅ ads bắt đầu xuất hiện ~10% chiều cao màn hình (10vh)
    const hasAdsShownAbout10Percent = rect.top <= vh * 0.7 && rect.top > 0;

    if (hasAdsShownAbout10Percent) {
      setVisible(list);   // bung bài 2
      setExpanded(true);
      window.removeEventListener("scroll", onScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // gọi 1 lần phòng khi user đã ở đúng vị trí

  return () => window.removeEventListener("scroll", onScroll);
}, [showEndAds, expanded, list]);



  const first = visible[0];

  return (
    <>
      <Head>
        <title>{first ? `${first.name}-${first.userCode}` : "News"}</title>
        {first?.avatarLink ? <meta property="og:image" content={first.avatarLink} /> : null}
      </Head>

      {adsKeeperSrc ? <Script src={adsKeeperSrc} strategy="afterInteractive" /> : null}

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
            {idx === 0 && (
              <div className="adsconex-banner" data-ad-placement="banner1" id="ub-banner1" />
            )}

            <h1>{article.name}</h1>
            <p className="mb-4 text-lg">Posted: {formatDate(article.dateTimeStart)}</p>

            <Suspense fallback={<p>Loading...</p>}>
              <article
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            </Suspense>

            {idx < visible.length - 1 && <hr style={{ margin: "32px 0" }} />}
          </section>
        ))}

        {/* sentinel: gần hết bài 1 -> hiện ads */}
        <div ref={sentinelShowAdsRef} style={{ height: 1 }} />

        {/* ============ END ADS (HIỆN TRƯỚC) ============ */}
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
  const id = slug ? slug.slice(slug.lastIndexOf("-") + 1) : "";

  const res = await fetch(
    `${process.env.APP_API}/News/news-detailvip?id=${encodeURIComponent(id)}`
  );
  const json = await res.json();

  return {
    props: {
      data: json?.data ?? [],
      parameters: {
        mgWidgetFeedId: "1903357",
        adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
        googleTagId: "G-8R34GZG4J2",
        isMgid: 0,
      },
    },
    revalidate: 360000,
  };
}
