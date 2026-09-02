import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*', 
        destination: 'http://instantmechanicbackend-env.eba-eucrqz6v.eu-north-1.elasticbeanstalk.com/api/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: "https://instantmechanic-dashboard.vercel.app/api/v1",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "true",
  },
};

export default nextConfig;