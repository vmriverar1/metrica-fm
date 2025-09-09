import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import LoadingProvider from '@/components/loading/LoadingProvider';
import AppInitializer from '@/components/loading/AppInitializer';
import RobustNavigationProvider from '@/components/loading/RobustNavigationProvider';
import { PageErrorBoundary } from '@/components/error-boundary';
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from '@/lib/pwa';
import { initializeAccessibility } from '@/lib/accessibility';
import { initializePWA } from '@/lib/pwa';
import { initializeAnalytics } from '@/lib/analytics';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://metrica-fm.com'),
  title: {
    default: 'Métrica FM - Dirección Integral de Proyectos',
    template: '%s | Métrica FM'
  },
  description: 'Dirección Integral de Proyectos que transforman la infraestructura del Perú. Especialistas en construcción, gestión de proyectos y consultoría técnica con certificación ISO 9001.',
  keywords: [
    'dirección de proyectos',
    'construcción Perú',
    'ingeniería civil',
    'consultoría técnica',
    'ISO 9001',
    'infraestructura',
    'gestión de proyectos',
    'supervisión de obras'
  ],
  authors: [{ name: 'Métrica FM' }],
  creator: 'Métrica FM',
  publisher: 'Métrica FM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: '/',
    siteName: 'Métrica FM',
    title: 'Métrica FM - Dirección Integral de Proyectos',
    description: 'Dirección Integral de Proyectos que transforman la infraestructura del Perú',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Métrica FM - Dirección Integral de Proyectos',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Métrica FM - Dirección Integral de Proyectos',
    description: 'Dirección Integral de Proyectos que transforman la infraestructura del Perú',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <PageErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <OfflineIndicator />
          <AppInitializer>
            <RobustNavigationProvider>
              <LoadingProvider enableRouteLoading={false} minLoadingTime={1200}>
                {children}
              </LoadingProvider>
              <Toaster />
            </RobustNavigationProvider>
          </AppInitializer>
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
        </PageErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  ${initializeAccessibility.toString()}
                  ${initializePWA.toString()}
                  ${initializeAnalytics.toString()}
                  
                  initializeAccessibility();
                  initializePWA();
                  initializeAnalytics();
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
