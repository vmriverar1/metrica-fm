import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster"
import LoadingProvider from '@/components/loading/LoadingProvider';
import AppInitializer from '@/components/loading/AppInitializer';
import RobustNavigationProvider from '@/components/loading/RobustNavigationProvider';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import PWAPreloader from '@/components/pwa/PWAPreloader';
import PWAUpdateNotification from '@/components/pwa/PWAUpdateNotification';
import PWAUpdateManager from '@/components/pwa/PWAUpdateManager';
import OfflineIndicator from '@/components/offline/OfflineIndicator';
import FloatingEmail from '@/components/ui/FloatingEmail';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import ReCaptchaProvider from '@/components/recaptcha/ReCaptchaProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Métrica FM - Ingeniería y Construcción',
  description: 'Dirección Integral de Proyectos que transforman la infraestructura del Perú',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Métrica FM'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: '#003F6F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <ReCaptchaProvider>
          <AnalyticsProvider>
            <AppInitializer>
              <RobustNavigationProvider>
                <LoadingProvider enableRouteLoading={false} minLoadingTime={1200}>
                  {children}
                </LoadingProvider>
                <Toaster />
                <PWAInstallPrompt />
                <PWAPreloader />
                <PWAUpdateNotification showOnlyInAdmin={false} position="top-right" />
                <PWAUpdateManager position="top-right" autoUpdate={false} />
                <OfflineIndicator showOnlyWhenOffline={true} position="bottom-left" />
                <FloatingEmail hiddenOnPaths={['/portfolio*', '/admin*']} />
              </RobustNavigationProvider>
            </AppInitializer>
          </AnalyticsProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
