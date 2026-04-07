/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      { protocol: 'https', hostname: 'downloads.ctfassets.net' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: '**.ctfassets.net' },
    ],
    unoptimized: false,
  },

  // Security & SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // 301 redirects — old multi-page routes → single-page hash anchors
  async redirects() {
    return [
      { source: '/skills', destination: '/#skills', permanent: true },
      { source: '/experience', destination: '/#experience', permanent: true },
      { source: '/education', destination: '/#education', permanent: true },
      { source: '/projects', destination: '/#projects', permanent: true },
      { source: '/rewards', destination: '/#rewards', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
    ]
  },
}

module.exports = nextConfig
