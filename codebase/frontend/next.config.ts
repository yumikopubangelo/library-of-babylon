/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/**',
      },
    ],
    // Alternatively, you can use unoptimized for local development
    unoptimized: true,
  },
}

module.exports = nextConfig