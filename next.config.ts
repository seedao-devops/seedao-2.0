import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Pin the workspace root so Turbopack doesn't walk the entire home directory
// because of the stray ~/pnpm-lock.yaml. Without this, dev/build can be 10x slower.
const here =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(here),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "fonts.googleapis.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
    ],
  },
};

export default nextConfig;
