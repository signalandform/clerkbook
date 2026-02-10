import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next from inferring the OpenClaw workspace root (multiple lockfiles)
    root: __dirname,
  },
  async redirects() {
    return [
      { source: '/srtudents', destination: '/students', permanent: true },
    ];
  },
};

export default nextConfig;
