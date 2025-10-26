import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production Output Configuration
  // Standalone mode creates a self-contained deployment package
  output: 'standalone',

  // Compression
  compress: true,

  // Production optimizations
  reactStrictMode: true,

  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Configure allowed domains for images (if using next/image)
  images: {
    remotePatterns: [
      // Add your image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },

  // Experimental features (if needed)
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '10mb',
  //   },
  // },
};

export default nextConfig;
