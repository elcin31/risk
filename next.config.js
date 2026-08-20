/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_TWELVE_DATA_API_KEY: process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '',
  },
}

module.exports = nextConfig
