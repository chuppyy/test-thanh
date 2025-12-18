import Head from "next/head";
import App, { AppProps, AppContext } from "next/app";
import Layout from "../layouts/layout";
import '../globals.css'
import Script from "next/script";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
<script async src="https://cdn.unibotscdn.com/player/mvp/player.js"></script>
<script async src="https://cdn.unibots.in/headerbidding/common/hb.js"></script>     
        
        {/* --- HẾT Mã FEJI (HEAD) --- */}
      </Head>
{/* 🔥 TABOOLA SCRIPT — đặt ngoài HEAD */}
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
      '//cdn.taboola.com/libtrc/metaconex-topnewsusfejiio/loader.js',
      'tb_loader_script'
    );

    if(window.performance && typeof window.performance.mark === 'function') {
      window.performance.mark('tbl_ic');
    }
  `}
</Script>



  {/* <!-- Metaconex tag (gtag.js) --> */}
<Script defer src="https://adsconex.com/js/config.js" data-config="all" strategy="beforeInteractive"></Script>
<meta name="verification" content="OQhbutYIbK"></meta>

{/* --- Mã FEJI (HEAD) --- */}
        {/* VIDEO PLAYER FEJI: Mã Player Script chính */}
        <Script id="feji-video-player-script" strategy="beforeInteractive">
          {`
            (function(){let a="ZG9jdW1lbnQ=",b="Y3JlYXRlRWxlbWVudA==",c="c2NyaXB0",d="YXN5bmM=",e="c3Jj",f="YXBwZW5kQ2hpbGQ=",g="aHR0cHM6Ly9jZG4udW5pYm90c2Nkbi5jb20vcGxheWVyL212cC9wbGF5ZXIuanM=",s=window[atob(a)][atob(b)](atob(c));s[atob(d)]=!0,s[atob(e)]=atob(g),window[atob(a)].head[atob(f)](s);})();
          `}
        </Script>
        {/* VIDEO PLAYER FEJI: Mã Style ẩn logo */}
        <Script id="feji-video-player-style" strategy="beforeInteractive">
          {`
            (function(){ var b64 = "PHN0eWxlPgphI3VicF9sb2dvIHsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9Cjwvc3R5bGU+"; var html = atob(b64); document.head.insertAdjacentHTML("beforeend", html); })();
          `}
        </Script>

        {/* BANNER FEJI: Mã Header Bidding Script chính */}
        <Script id="feji-banner-script" strategy="beforeInteractive">
          {`
            (function(){
              let a="ZG9jdW1lbnQ=",b="Y3JlYXRlRWxlbWVudA==",c="c2NyaXB0",d="YXN5bmM=",
                e="ZGF0YS1uZXR3b3Jr",f="YWRzY29uZXg=",g="c3Jj",
                h="aHR0cHM6Ly9jZG4udW5pYm90cy5pbi9oZWFkZXJiaWRkaW5nL2NvbW1vbi9oYi5qcw==",
                s=Object.assign(window[atob(a)][atob(b)](atob(c)),{[atob(d)]:1,[atob(e)]:atob(f),[atob(g)]:atob(h)});
              window[atob(a)].head.appendChild(s);
            })();
          `}
        </Script>
{/* --- Mã BANNER FEJI (BODY Top) --- */}
      {/* Script khởi tạo Banner FEJI (Đặt ở đây hoặc trong Layout) */}
      <Script id="feji-banner-init">
        {`
          (function(){
            let a="d2luZG93",b="LnVuaWJvdHNoYiA9IHdpbmRvdy51bmlib3RzaGIgfHwg",
              c="e2NtZDogW119Ow==",d="LnVuaWJvdHNoYi5jbWQucHVzaCgoKSA9PiB7",
              e="IHViSEIoImZlamkuaW8fbG9uZyIpO30pOw==";
            Function(atob(a)+atob(b)+atob(c)+atob(a)+atob(d)+atob(e))();
          })();
        `}
      </Script>
      {/* --- HẾT Mã BANNER FEJI (BODY Top) --- */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  return {
    ...appProps,
  };
};