import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_CLIP_API: process.env.NEXT_PUBLIC_CLIP_API || 'http://localhost:8001',
    NEXT_PUBLIC_GEMINI_API: process.env.NEXT_PUBLIC_GEMINI_API || 'http://localhost:8002',
    NEXT_PUBLIC_DIFFUSION_API: process.env.NEXT_PUBLIC_DIFFUSION_API || 'http://localhost:8003',
  },
};

export default nextConfig;

