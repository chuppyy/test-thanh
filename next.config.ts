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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports - reduces bundle size
    optimizePackageImports: ["@tanstack/react-query"],
  },

  // Compress responses
  compress: true,

  // Enable powered by header removal for security
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache article pages at CDN level
        source: "/:slug",
        headers: [
          {
            key: "Cache-Control",
            // CDN cache 10 minutes, allow stale while revalidating
            value: "public, s-maxage=600, stale-while-revalidate=60",
          },
        ],
      },
      {
        // Cache API responses
        source: "/api/article/:id",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
