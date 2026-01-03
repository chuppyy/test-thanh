import Script from "next/script";

export const VARIABLES = {
  appApi: "https://apisport.vbonews.com",
  appApi2: "https://apisport.vbonews.com",
  nextPublicAppApi: "https://apisport.vbonews.com",
  nextPublicAppApi2: "https://apisport.vbonews.com",
  verificationCode: "OQhbutYIbK",
  domain: "topnewsus",

  // Google Ads
  googleAnalytics: "G-RZ218Z0QZ1",
  googleClientId: "ca-pub-2388584177550957",
  googleClientSlotId: "9127559985",
  googleAdSlot: "1932979136",

  // Video Ads
  videoScriptSrc:
    "https://videoadstech.org/ads/topnews_livextop_com.0a05145f-8239-4054-9dc9-acd55fcdddd5.video.js",

  // MGID
  mgWidgetId1: "1903360",
  mgWidgetId2: "1903360",
  mgWidgetFeedId: "1903357",
  adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",

  // Other
  year: "2026",
};

export const SCRIPTS = {
  /**
   * SCRIPTS FOR ARTICLE PAGES ONLY (moved from layout)
   */
  tabolaScript: (
    <Script id="taboola-script" strategy="afterInteractive">
      {`
            window._taboola = window._taboola || [];
            _taboola.push({article:'auto'});
            !function (e, f, u, i) {
              if (!document.getElementById(i)){
                e.async = 1;
                e.src = u;
                e.id = i;
                f.parentNode.insertBefore(e, f);
              }
            }(
              document.createElement('script'),
              document.getElementsByTagName('script')[0],
              '//cdn.taboola.com/libtrc/metaconex-anhusfejiio/loader.js',
              'tb_loader_script'
            );

            if(window.performance && typeof window.performance.mark === 'function') {
              window.performance.mark('tbl_ic');
            }
          `}
    </Script>
  ),
  metaconexScript: (
    <Script
      defer
      src="https://adsconex.com/js/config.js"
      data-config="all"
      strategy="afterInteractive"
    ></Script>
  ),

  /**
   * GOOGLE ANALYTICS Script - Loaded at the slug page (article detail page)
   */
  googleAnalyticsScript: (
    <>
      <Script
        id="gg-1"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${VARIABLES.googleAnalytics}`}
      />
      <Script id="gg-2" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${VARIABLES.googleAnalytics}');
        `}
      </Script>
    </>
  ),

  /**
   * AD SCRIPTS - Loaded at the slug page (article detail page)
   */
  adsKeeperScript: (
    <Script src={VARIABLES.adsKeeperSrc} strategy="lazyOnload"></Script>
  ),

  adsconexPlayerScript: (
    <Script
      src="https://cdn.adsconex.com/js/adsconex-player.js"
      strategy="lazyOnload"
    />
  ),
  adsconexBannerScript: (
    <Script
      src="https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js"
      strategy="lazyOnload"
    />
  ),
  googleAdManagerScript: (
    <>
      <Script
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="lazyOnload"
      />
      <Script id="google-ad-manager-init" strategy="lazyOnload">
        {`
          window.googletag = window.googletag || {cmd: []};
        `}
      </Script>
    </>
  ),
};
