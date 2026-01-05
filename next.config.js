/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.autoblogging.ai',
      },
    ],
  },
}

module.exports = nextConfig
