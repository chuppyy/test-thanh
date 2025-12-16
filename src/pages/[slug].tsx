import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Head from "next/head";
import Script from "next/script";

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
  isMgid?: number | string;
};

type PageProps = {
  data: NewsMainModel[] | NewsMainModel;
  parameters: PageParameters;
};

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

  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );

  const [showEndAds, setShowEndAds] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Sentinel A: gần hết bài 1 => hiện ads
  const sentinelShowAdsRef = useRef<HTMLDivElement | null>(null);

  // Sentinel B: nằm trong ads ở vị trí 20vh (1/5 màn hình) => bung bài 2
  const sentinelAdProgressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setShowEndAds(false);
    setExpanded(false);
  }, [list]);

  // (1) Gần hết bài 1 => show ads
  useEffect(() => {
    const el = sentinelShowAdsRef.current;
    if (!el || showEndAds) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShowEndAds(true);
      },
      {
        // tới gần cuối content bài 1 thì bật ads
        rootMargin: "200px 0px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showEndAds]);

  // (2) Ads đã hiện + user scroll qua ~20vh trong ads => bung bài 2
  useEffect(() => {
    const el = sentinelAdProgressRef.current;
    if (!el) return;
    if (!showEndAds) return;
    if (expanded) return;
    if (list.length < 2) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(list);
          setExpanded(true);
        }
      },
      {
        // không preload sớm, đúng “qua 1/5 màn hình”
        rootMargin: "0px 0px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
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
        {/* ====== NỘI DUNG (bài 1, rồi bài 2 bung ra) ====== */}
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

        {/* Sentinel A: gần hết bài 1 -> hiện ads */}
        <div ref={sentinelShowAdsRef} style={{ height: 1 }} />

        {/* ====== END ARTICLE ADS HIỆN TRƯỚC ====== */}
        {showEndAds && (
          <div className="end-article-ads" style={{ position: "relative" }}>
            {/* ✅ Trigger nằm cách top ads đúng 20vh (1/5 màn hình) */}
            <div
              ref={sentinelAdProgressRef}
              style={{
                height: 1,
                marginTop: "40vh", // 👈 chính là 1/5 chiều cao màn hình
              }}
            />

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
