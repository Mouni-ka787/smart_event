/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' since we have dynamic routes that require runtime data fetching
  // output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig