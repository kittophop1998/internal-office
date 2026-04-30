import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'https://office.ruangthongpharmacy.com';

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${BACKEND_URL}/service/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
