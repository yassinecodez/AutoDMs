import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bullmq", "ioredis"],
  async redirects() {
    return [
      { source: '/automations', destination: '/dashboard/automations', permanent: true },
      { source: '/automation', destination: '/dashboard/automations', permanent: true },
      { source: '/accounts', destination: '/dashboard/accounts', permanent: true },
      { source: '/logs', destination: '/dashboard/logs', permanent: true },
    ];
  }
};

export default nextConfig;
