import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['gsap', '@gsap/react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'metrica-dip.com',
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
  async headers() {
    return [
      {
        // Para permitir videos externos en el admin
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "media-src 'self' https: data: blob:; video-src 'self' https: data: blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;