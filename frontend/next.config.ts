import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "http://localhost:81",
    "https://preview-chat-d3da0074-a662-42e5-9dfe-281c1f497032.space-z.ai",
  ],
};

export default nextConfig;
