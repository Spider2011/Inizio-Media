import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects';

/* What the pages may load. Everything is first-party except Unsplash stock photos; fonts are
   self-hosted by next/font and the loader's art is inline data. Scripts keep 'unsafe-inline' because
   Next.js and the loader boot from inline scripts in statically prerendered HTML (a nonce would make
   every page dynamic). Dev mode needs eval for hot reload, so the policy applies to builds only. */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests'
].join('; ');

const isProduction = process.env.NODE_ENV === 'production';

const securityHeaders = [
  ...(isProduction ? [{ key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY }] : []),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
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
      { source: '/events', destination: '/services', permanent: true },
      ...LEGACY_REDIRECTS
    ];
  }
};

export default nextConfig;
