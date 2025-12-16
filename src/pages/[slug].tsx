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
  mgWidgetId1?: string;
  mgWidgetId2?: string;
  mgWidgetFeedId?: string;
  adsKeeperSrc?: string;
  googleTagId?: string;
  isMgid?: number | string;
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

/* ================== PAGE ================== */
export default function Page(props: PageProps) {
  const {
    mgWidgetId2 = "",
    mgWidgetFeedId = "",
    adsKeeperSrc = "",
    googleTagId = "",
    isMgid = 0,
  } = props.parameters || {};

  const useMgid = Number(isMgid) === 1;

  const list = useMemo(() => {
    const raw = props.data;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map(normalize).filter((x) => x && !x.isDeleted);
  }, [props.data]);

  // ✅ chỉ show bài 1 trước
  const [visible, setVisible] = useState<NewsMainModel[]>(() =>
    list.length ? [list[0]] : []
  );

  // ✅ ads cuối bài: ban đầu ẩn, tới gần cuối bài 1 thì bật
  const [showEndAds, setShowEndAds] = useState(false);

  // ✅ đã bung bài 2 chưa
  const [expanded, setExpanded] = useState(false);

  // Sentinel 1: tới gần cuối bài 1 -> bật showEndAds
  const sentinelShowAdsRef = useRef<HTMLDivElement | null>(null);

  // Sentinel 2: kéo qua ads 1 xíu -> bung bài 2
  const sentinelLoadNextRef = useRef<HTMLDivElement | null>(null);

  // reset khi đổi bài/props
  useEffect(() => {
    setVisible(list.length ? [list[0]] : []);
    setShowEndAds(false);
    setExpanded(false);
  }, [list]);

  // ✅ 1) Gần hết bài 1 -> showEndAds = true
  useEffect(() => {
    const el = sentinelShowAdsRef.current;
    if (!el) return;
    if (showEndAds) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShowEndAds(true);
        }
      },
      {
        // đến gần cuối nội dung bài 1 thì bật ads
        rootMargin: "200px 0px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showEndAds]);

  // ✅ 2) Sau khi ads đã hiện -> kéo qua ads 1 xíu -> bung bài 2
  useEffect(() => {
    const el = sentinelLoadNextRef.current;
    if (!el) return;
    if (!showEndAds) return;
    if (expanded) return;
    if (list.length < 2) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(list); // bung bài 2
          setExpanded(true);
        }
      },
      {
        // “qua ads một đoạn” mới bung (tăng/giảm để chỉnh cảm giác)
        rootMargin: "100px 0px",
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
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />
          <Script
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
        {/* =================== NỘI DUNG (ban đầu chỉ bài 1, sau đó bung bài 2) =================== */}
        {visible.map((article:NewsMainModel, idx: number) => (
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

        {/* ✅ Sentinel 1: gần hết bài 1 -> bật end-article-ads */}
        <div ref={sentinelShowAdsRef} style={{ height: 1 }} />

        {/* =================== END-ARTICLE-ADS HIỆN TRƯỚC =================== */}
        {showEndAds && (
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
        )}

        {/* ✅ Sentinel 2: kéo qua ads một xíu -> bung bài 2 */}
        <div ref={sentinelLoadNextRef} style={{ height: 1 }} />
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
    `${process.env.APP_API}/News/news-detailnew?id=${encodeURIComponent(id)}`
  );
  const json = await res.json();

  return {
    props: {
      data: json?.data ?? [],
      parameters: {
        mgWidgetId2: "1903360",
        mgWidgetFeedId: "1903357",
        adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
        googleTagId: "G-8R34GZG4J2",
        isMgid: 0,
      },
    },
    revalidate: 360000,
  };
}
