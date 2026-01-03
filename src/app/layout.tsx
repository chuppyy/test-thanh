import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { SCRIPTS, VARIABLES } from "@/constant/variables";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "NewsEdge",
  description: "News website",
  verification: {
    other: {
      verification: [VARIABLES.verificationCode],
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
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="https://cdn.taboola.com" />
        <link rel="dns-prefetch" href="https://adsconex.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://cdn.taboola.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://apisport.vbonews.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* 🔥 TABOOLA SCRIPT */}
        {SCRIPTS.tabolaScript}

        {/* Metaconex tag (gtag.js) - deferred */}
        {SCRIPTS.metaconexScript}

        <header>
          <Navbar />
        </header>

        <main className="grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
