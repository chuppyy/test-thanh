import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apisport.vbonews.com",
      },
    ],
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Reduce image quality slightly for faster loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable experimental features for better performance
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
  },

  // Compress responses
  compress: true,

  // Enable powered by header removal for security
  poweredByHeader: false,

  // Optimize output
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  async headers() {
    return [
      {
        // Cache static assets aggressively
        source:
          "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf|eot|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Preconnect to external domains for faster script loading
        source: "/:slug",
        headers: [
          {
            key: "Link",
            value:
              "<https://cdn.taboola.com>; rel=preconnect; crossorigin, " +
              "<https://adsconex.com>; rel=preconnect; crossorigin, " +
              "<https://cdn.adsconex.com>; rel=preconnect; crossorigin, " +
              "<https://www.googletagmanager.com>; rel=preconnect; crossorigin, " +
              "<https://securepubads.g.doubleclick.net>; rel=preconnect; crossorigin, " +
              "<https://jsc.mgid.com>; rel=preconnect; crossorigin",
          },
          {
            key: "Cache-Control",
            // CDN cache 10 minutes, allow stale while revalidating
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // Cache homepage
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=1800",
          },
        ],
      },
      {
        // Cache API responses
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // Security headers for all pages
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
