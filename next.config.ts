import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up to the home directory
  // (a stray package-lock.json in ~ was being picked up otherwise).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
