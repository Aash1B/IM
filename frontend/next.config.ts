import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Add this rewrite rules section:
  async rewrites() {
    return [
      {
        // This will intercept requests starting with /api/
        source: '/api/:path*', 
        // And forward them to your Beanstalk backend
        destination: 'http://instantmechanicbackend-env.eba-eucrqz6v.eu-north-1.elasticbeanstalk.com/api/:path*',
      },
    ]
  },
  env: {
    // Change this to point to your Vercel domain instead of the Beanstalk URL
    NEXT_PUBLIC_API_URL: "https://instantmechanic-dashboard.vercel.app/api/v1",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "true",
  },
};

export default nextConfig;