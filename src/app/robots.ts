import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/test/',
        '/_next/',
        '/private/',
        '/careers/profile/',
        '/careers/apply/',
        '/*.json$',
      ],
    },
    sitemap: 'https://metrica-dip.com/sitemap.xml',
  };
}