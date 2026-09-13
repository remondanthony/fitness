import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profile pictures are capped at 2 MB (MAX_AVATAR_BYTES); the rest is
      // headroom for multipart boundaries and part headers. The default 1 MB
      // would reject an ordinary phone photo before any of our own checks ran.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
