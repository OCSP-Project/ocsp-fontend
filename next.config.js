// @ts-check
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Không cần experimental.appDir nữa ở Next 14+
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ["your-s3-bucket.s3.amazonaws.com"],
    formats: ["image/webp", "image/avif"],
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    // Chỉ tạo rewrite khi biến môi trường có giá trị
    if (!api) return [];
    // Đảm bảo không bị dư dấu "/" ở cuối
    const base = api.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
