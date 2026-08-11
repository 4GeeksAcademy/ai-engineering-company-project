import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@healthcore": path.resolve(__dirname, "../../src"),
    };
    return config;
  },
};

export default nextConfig;
