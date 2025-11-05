/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      },
    ],
    unoptimized: true,
  },
  // SQL Server support
  serverExternalPackages: ['mssql'],
  // Enhanced PWA Configuration
  experimental: {
    webpackBuildWorker: true,
  },
  // Enable service worker and offline capabilities
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ]
  },
};

export default nextConfig;
