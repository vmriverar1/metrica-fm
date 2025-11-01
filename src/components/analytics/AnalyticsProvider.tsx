'use client';

/**
 * Analytics Provider Component
 *
 * Initializes Firebase Analytics globally and tracks page views automatically
 * Version sin useSearchParams para evitar errores de build
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics as getFirebaseAnalytics, logEvent, isSupported } from 'firebase/analytics';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB6KuX1pOsfyxRiGqLhrENT93SsGfiTdOM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "metrica-dip.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "metrica-dip",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "metrica-dip.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "423005031416",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:423005031416:web:99ea0e37451fbad1d0e40d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BTFSHLQNN6"
};

// Initialize Analytics
let analyticsInstance: any = null;

async function getAnalytics() {
  if (typeof window === 'undefined') return null;

  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isSupported();
    if (!supported) return null;

    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    analyticsInstance = getFirebaseAnalytics(app);
    return analyticsInstance;
  } catch (error) {
    console.error('[Analytics] Init error:', error);
    return null;
  }
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Initialize Analytics on mount
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analytics = await getAnalytics();
        if (analytics) {
          console.log('[Analytics] Provider initialized successfully');

          // Log initial session
          logEvent(analytics, 'session_start', {
            engagement_time_msec: Date.now(),
          });
        }
      } catch (error) {
        console.error('[Analytics] Provider initialization error:', error);
      }
    };

    initAnalytics();
  }, []);

  // Track page views on route changes (SIN useSearchParams)
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const analytics = await getAnalytics();

        if (!analytics) {
          return;
        }

        // Log page view event - solo con pathname, sin query params
        logEvent(analytics, 'page_view', {
          page_path: pathname,
          page_title: document.title,
        });

        console.log('[Analytics] Page view tracked:', pathname);
      } catch (error) {
        console.error('[Analytics] Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [pathname]); // Solo depende de pathname, NO de searchParams

  return <>{children}</>;
}