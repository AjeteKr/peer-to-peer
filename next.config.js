/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mssql', 'bcryptjs'],
  },
  // Use Node.js runtime for middleware
  runtime: 'nodejs'
}

module.exports = nextConfig