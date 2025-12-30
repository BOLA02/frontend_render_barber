/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optional: Add proxy to avoid CORS in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://barbing-salon-api.onrender.com/:path*',
      },
    ]
  },
}

export default nextConfig