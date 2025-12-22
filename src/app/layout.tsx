import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { VARIABLES } from "@/constant/variables";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NewsEdge",
  description: "News website",
  verification: {
    other: {
      verification: [VARIABLES.VERIFICATION_CODE],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://cdn.unibotscdn.com" />
        <link rel="preconnect" href="https://cdn.unibots.in" />
        <link rel="preconnect" href="https://cdn.taboola.com" />
        <link rel="preconnect" href="https://apisport.vbonews.com" />
        {/* External ad scripts - async to not block render */}
        <script
          async
          src="https://cdn.unibotscdn.com/player/mvp/player.js"
        ></script>
        <script
          async
          src="https://cdn.unibots.in/headerbidding/common/hb.js"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* 🔥 TABOOLA SCRIPT */}
        <Script id="taboola-script" strategy="lazyOnload">
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

        {/* Metaconex tag (gtag.js) - deferred */}
        <Script
          defer
          src="https://adsconex.com/js/config.js"
          data-config="all"
          strategy="lazyOnload"
        ></Script>

        {/* VIDEO PLAYER FEJI: Mã Player Script chính */}
        <Script id="feji-video-player-script" strategy="lazyOnload">
          {`
            (function(){let a="ZG9jdW1lbnQ=",b="Y3JlYXRlRWxlbWVudA==",c="c2NyaXB0",d="YXN5bmM=",e="c3Jj",f="YXBwZW5kQ2hpbGQ=",g="aHR0cHM6Ly9jZG4udW5pYm90c2Nkbi5jb20vcGxheWVyL212cC9wbGF5ZXIuanM=",s=window[atob(a)][atob(b)](atob(c));s[atob(d)]=!0,s[atob(e)]=atob(g),window[atob(a)].head[atob(f)](s);})();
          `}
        </Script>

        {/* VIDEO PLAYER FEJI: Mã Style ẩn logo */}
        <Script id="feji-video-player-style" strategy="lazyOnload">
          {`
            (function(){ var b64 = "PHN0eWxlPgphI3VicF9sb2dvIHsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9Cjwvc3R5bGU+"; var html = atob(b64); document.head.insertAdjacentHTML("beforeend", html); })();
          `}
        </Script>

        {/* BANNER FEJI: Mã Header Bidding Script chính */}
        <Script id="feji-banner-script" strategy="lazyOnload">
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

        {/* Script khởi tạo Banner FEJI */}
        <Script id="feji-banner-init" strategy="lazyOnload">
          {`
            (function(){
              window.unibotshb = window.unibotshb || { cmd: [] };
              window.unibotshb.cmd.push(function() {
                ubHB("feji.io_long");
              });
            })();
          `}
        </Script>

        <header>
          <Navbar />
        </header>

        <main className="grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
