import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main/activities',
        permanent: true,
      },
    ]
  }
};

export default nextConfig;
