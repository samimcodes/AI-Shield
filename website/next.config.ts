import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* AI-Shield Next.js configuration */
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin/ai-shield',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;


