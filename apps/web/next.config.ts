import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/shared", "@repo/auth"],
};

export default nextConfig;
