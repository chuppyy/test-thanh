import { Suspense, useEffect } from "react";
import Script from "next/script";
import Head from "next/head";
import RewardedAd from "@/components/navbars/reward";

const formatDate = (str: string) => {
  const date = new Date(str);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export default function Page(data: any) {
  const article = data.data;
  const {
    videoScriptSrc,
    googleClientId,
    googleClientSlotId,
    googleAdSlot,
    mgWidgetId1,
    mgWidgetId2,
    mgWidgetFeedId,
    adsKeeperSrc,
    googleTagId,
    isMgid, // <- flag bạn phải truyền vào parameters (1 hoặc 0)
  } = data.parameters;

  const useMgid = Number(isMgid) === 1;
  useEffect(() => {
    try {
      // Giữa bài: nếu dùng MGID chèn widget MGID, nếu không dùng Taboola chèn div Taboola
      const qcDivTaboo = document.getElementById("qctaboo-mid");
      if (qcDivTaboo) {
        const newDiv = document.createElement("div");
        if (useMgid) {
          newDiv.innerHTML = `<div data-type="_mgwidget" data-widget-id="${mgWidgetId1}"></div>`;
        } else {
          newDiv.innerHTML = `<div id="taboola-below-mid-article"></div>`;
        }
        qcDivTaboo.appendChild(newDiv);
      }
      // Adjust iframe dimensions (giữ nguyên)
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe: HTMLIFrameElement) => {
        if (!iframe) return;
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
  }, [googleClientId, googleAdSlot, mgWidgetId1, mgWidgetId2, useMgid]);

  return (
    <>
      <Head>
        <title>{article.name + "-" + article.userCode}</title>
        <meta property="og:image" content={article.avatarLink} />
        <meta property="og:title" content={article.name + "-" + article.userCode} />
      </Head>

      <Script src={adsKeeperSrc} async></Script>
      <Script id="gg-1" strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} />
      <Script id="gg-2" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleTagId}');
        `}
      </Script>

      <main>
        <div className="container-flu details">
          <div className="adsconex-banner" data-ad-placement="banner1" id="ub-banner1"></div>
          <h1>{article.name}</h1>
          {/* Banner FEJI */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.unibotshb = window.unibotshb || { cmd: [] };
            unibotshb.cmd.push(()=>{ ubHB("feji.io_long"); });
          `
        }}
      />
      
      {/* Video Player FEJI */}
      <div id="div-ub-feji.io_1723454353847">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.unibots = window.unibots || { cmd: [] };
              unibots.cmd.push(function() { unibotsPlayer("feji.io_1723454353847") });
            `
          }}
        />
      </div>
          <p className="mb-4 text-lg">Posted: {formatDate(article.dateTimeStart)}</p>

          <Suspense fallback={<p>Loading ...</p>}>
            <article className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
          </Suspense>
        </div>

        {/* ======= GIỮA BÀI (conditional render) ======= */}
        <div id="qctaboo-mid"></div>

        {/* Nếu dùng Taboola: inject Taboola scripts */}
        {!useMgid && (
          <>            
            <script
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
          </>
        )}

        {/* Nếu dùng MGID: loader mgid (ở giữa bài có thể thêm widget div phía trên bằng useEffect) */}
        {useMgid && (
          <>
            <div data-type="_mgwidget" data-widget-id={mgWidgetId2}></div>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})
                  (window,"_mgq");
                `,
              }}
              async
            />
          </>
        )}

        {/* ======= CUỐI BÀI (conditional render) ======= */}
        <div className="end-article-ads">
          {/* MGID feed always (nếu bạn muốn luôn show feed khi isMgid) */}
          {useMgid ? (
            <>
              <div data-type="_mgwidget" data-widget-id={mgWidgetFeedId}></div>
              <script
                dangerouslySetInnerHTML={{
                  __html: `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})
                  (window,"_mgq");`,
                }}
                async
              />
            </>
          ) : (
            // Taboola cuối bài
            <>
              <div id="taboola-below-article-thumbnails"></div>
              <script
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
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const slug = params?.slug;
    const response = await fetch(`${process.env.APP_API}/News/news-detailnew?id=${slug?.slice(slug?.lastIndexOf("-") + 1)}`).then((res) => res.json());

    const parameters = {
      videoScriptSrc: "https://videoadstech.org/ads/topnews_livextop_com.0a05145f-8239-4054-9dc9-acd55fcdddd5.video.js",
      googleClientId: "ca-pub-2388584177550957",
      googleClientSlotId: "9127559985",
      googleAdSlot: "1932979136",
      mgWidgetId1: "1903360",
      mgWidgetId2: "1903360",
      mgWidgetFeedId: "1903357",
      adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",
      googleTagId: "G-8R34GZG4J2",
      // <-- set isMgid = 1 để dùng MGID, = 0 để dùng Taboola
      isMgid: 0,
    };

    return {
      props: { data: response.data, parameters },
      revalidate: 360000,
    };
  } catch (error) {
    return {
      props: { data: {}, parameters: {} },
    };
  }
}
