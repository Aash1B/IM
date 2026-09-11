import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_PROXY_URL ||
  "http://instantmechanicbackend-env.eba-eucrqz6v.eu-north-1.elasticbeanstalk.com";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: BACKEND_URL.replace(/\/+$/, "") + "/api/:path*",
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "false",
  },
};

export default nextConfig;

