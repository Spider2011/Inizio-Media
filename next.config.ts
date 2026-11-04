import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  /* Retired pages. Testimonials waits for real, approved quotes; old links land on Clientele.
     Events & Weddings is gone as a page; event coverage is still listed on Services. */
  async redirects() {
    return [
      { source: '/testimonials', destination: '/clientele', permanent: true },
      { source: '/events', destination: '/services', permanent: true }
    ];
  }
};

export default nextConfig;
