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
import GSAPNavigationHandler from '@/components/gsap/GSAPNavigationHandler';
import './globals.css';

export const metadata: Metadata = {
  title: 'Métrica FM | Gerencia de Proyectos y Supervisión de Obras',
  description: 'Gerenciamos y supervisamos proyectos con control, metodología y eficiencia. Experiencia en retail, industrial, salud, vivienda, etc.',
  keywords: 'gerencia de proyectos, supervisión de obra, control de obra, gerencia industrial, metrica fm, dirección de proyectos, construcción industrial, retail, logística',
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

        {/* Schema.org JSON-LD - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Métrica FM",
              "url": "https://metricafm.com",
              "logo": "https://metricafm.com/img/logo-color.png",
              "description": "Gerencia de Proyectos y supervisión de obras con control de costos, tiempos y calidad. Metodologías PMI y Prince2.",
              "sameAs": [
                "https://www.linkedin.com/company/metrica-fm",
                "https://www.youtube.com/@metricafm"
              ]
            })
          }}
        />

        {/* Schema.org JSON-LD - WebSite with Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Métrica FM",
              "url": "https://metricafm.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://metricafm.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Schema.org JSON-LD - ItemList for Main Navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": [
                {
                  "@type": "SiteNavigationElement",
                  "position": 1,
                  "name": "Servicios",
                  "description": "Nuestros servicios de gerencia de proyectos y supervisión de obras",
                  "url": "https://metricafm.com/services"
                },
                {
                  "@type": "SiteNavigationElement",
                  "position": 2,
                  "name": "Proyectos",
                  "description": "Portfolio de proyectos realizados",
                  "url": "https://metricafm.com/portfolio"
                },
                {
                  "@type": "SiteNavigationElement",
                  "position": 3,
                  "name": "Contacto",
                  "description": "Contáctanos para tu proyecto",
                  "url": "https://metricafm.com/contact"
                },
                {
                  "@type": "SiteNavigationElement",
                  "position": 4,
                  "name": "Nosotros",
                  "description": "Conoce nuestra historia y trayectoria",
                  "url": "https://metricafm.com/about/historia"
                }
              ]
            })
          }}
        />
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
                <GSAPNavigationHandler />
              </RobustNavigationProvider>
            </AppInitializer>
          </AnalyticsProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
