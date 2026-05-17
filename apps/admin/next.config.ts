import type { NextConfig } from "next";

const basePath = process.env.ADMIN_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
