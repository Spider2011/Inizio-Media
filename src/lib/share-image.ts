/* The link-preview image (src/app/opengraph-image.png). Pages that set their own `openGraph`
   replace the root one entirely, so they list this image again to keep the preview picture. */
export const SHARE_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'Inizio Media: We build brands. A digital marketing and branding agency in Mumbai.'
} as const;
