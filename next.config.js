// Bundle analyzer para FASE 1 del plan de optimización
let withBundleAnalyzer;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (error) {
  console.warn('Bundle analyzer not available, skipping...');
  withBundleAnalyzer = (config) => config;
}

// FASE 4B: PWA configurada para Firebase App Hosting
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!sw.js', '!workbox-*.js'], // Ensure SW files are included
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: '/offline',
    navigateFallbackDenylist: [/^\/_/, /^\/api\//, /^\/__nextjs_original-stack-frame/],
    // Firebase App Hosting specific settings
    mode: 'production',
    swDest: 'public/sw.js', // Explicit destination
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Firebase App Hosting compatibility
  output: 'standalone',
  // Optimización MÁXIMA para hosting compartido
  typescript: {
    ignoreBuildErrors: true, // Siempre ignorar para builds más rápidos
  },
  eslint: {
    ignoreDuringBuilds: true, // Siempre ignorar para builds más rápidos
  },
  // Optimizaciones para build estático
  poweredByHeader: false, // Quitar headers innecesarios
  compress: true, // Comprimir respuestas
  generateEtags: false, // Menos procesamiento
  reactStrictMode: false, // Menos warnings en producción
  transpilePackages: ['gsap', '@gsap/react'],

  // FASE 5: Bundle splitting y optimización de performance
  experimental: {
    // optimizeCss: false, // Deshabilitado - puede causar problemas con NODE_OPTIONS
    optimizePackageImports: ['framer-motion', 'gsap', '@radix-ui/react-accordion'], // Removed lucide-react due to barrel optimization conflicts
    serverActions: {
      bodySizeLimit: '50mb', // Permitir subir imágenes grandes de cámaras profesionales (se procesan y reducen después)
    },
  },

  // Source maps configuration to avoid 404s in development
  productionBrowserSourceMaps: false, // Disable to avoid .map file requests

  // External packages for server components (moved from experimental)
  serverExternalPackages: ['sharp'],

  // Rewrites para el Service Worker
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/sw',
      },
      {
        source: '/workbox-:hash.js',
        destination: '/api/workbox/:hash',
      },
    ];
  },

  // Bundle splitting configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add alias for @ path resolution for Firebase App Hosting compatibility
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // Disable source maps in development to avoid 404s and reduce build time
    if (dev) {
      config.devtool = false;
    }

    // Bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Heavy animation libraries
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap|@gsap)[\\/]/,
            name: 'animations',
            priority: 10,
            chunks: 'all',
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx)[\\/]/,
            name: 'ui-libs',
            priority: 5,
            chunks: 'all',
          },
          // React ecosystem
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form)[\\/]/,
            name: 'react-vendor',
            priority: 15,
            chunks: 'all',
          },
        },
      }
    }

    return config
  },
  images: {
    // MÁXIMA optimización para hosting compartido - SIN Sharp
    unoptimized: true, // Desactiva Sharp completamente - 33MB menos en servidor
    dangerouslyAllowSVG: true, // Permitir SVGs en next/image
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'metrica-fm.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'metricafm.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'metrica-fm.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'statom.co.uk',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // FASE 5A: CDN Optimization Headers para Firebase App Hosting
  async headers() {
    return [
      {
        // Static assets - CACHE DESACTIVADO TEMPORALMENTE
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-CDN-Cache',
            value: 'MISS-STATIC-ASSET',
          },
        ],
      },
      {
        // Images - CACHE DESACTIVADO TEMPORALMENTE
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-CDN-Cache',
            value: 'MISS-IMAGE',
          },
        ],
      },
      {
        // Public folder - CACHE DESACTIVADO TEMPORALMENTE
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
        ],
      },
      {
        // Icons and PWA assets - CACHE DESACTIVADO TEMPORALMENTE
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
        ],
      },
      {
        // API Routes - CACHE DESACTIVADO TEMPORALMENTE
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-API-Cache',
            value: 'SHORT-CACHE',
          },
        ],
      },
      {
        // Portfolio bundles - CACHE DESACTIVADO TEMPORALMENTE
        source: '/api/bundles/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-Bundle-Cache',
            value: 'MEDIUM-CACHE',
          },
        ],
      },
      {
        // Main pages - CACHE DESACTIVADO TEMPORALMENTE
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-Page-Cache',
            value: 'HOMEPAGE-DYNAMIC',
          },
        ],
      },
      {
        // Other pages - CACHE DESACTIVADO TEMPORALMENTE
        source: '/(portfolio|services|about|contact)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // CACHE OFF
          },
          {
            key: 'X-Page-Cache',
            value: 'STATIC-PAGE',
          },
        ],
      },
      {
        // Service Worker - No cache to ensure updates, MIME type for Firebase App Hosting
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        // Workbox files - No cache to ensure updates
        source: '/workbox-:hash.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Manifest - Medium cache
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600', // 1 day + 1 hour SWR
          },
        ],
      },
      {
        // Para permitir videos externos en el admin
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "media-src 'self' https: data: blob:; video-src 'self' https: data: blob:;",
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate', // No cache for admin
          },
        ],
      },
    ];
  },
};

// Aplicar todos los wrappers: Bundle Analyzer + PWA + Next Config
module.exports = withBundleAnalyzer(withPWA(nextConfig));