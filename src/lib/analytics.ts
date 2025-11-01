/**
 * Analytics Helper Functions
 *
 * Utility functions to track events throughout the application
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAnalytics as getFirebaseAnalytics,
  logEvent as firebaseLogEvent,
  setUserProperties,
  setUserId,
  isSupported
} from 'firebase/analytics';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkpwp6CJRuhVnscV2HbNR-nQ-DpvglH_U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "metrica-fm.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "metrica-fm",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "metrica-fm.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "806061146235",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:806061146235:web:54b354f94f5872ef56a2de",
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

/**
 * Custom event parameters type
 */
type EventParams = {
  [key: string]: string | number | boolean | string[] | undefined;
};

/**
 * Log a custom event to Analytics
 */
export async function logEvent(eventName: string, params?: EventParams): Promise<void> {
  try {
    // Import debugger dynamically to avoid circular dependencies
    if (typeof window !== 'undefined') {
      import('@/lib/analytics-debug').then(({ analyticsDebugger }) => {
        analyticsDebugger.log(eventName, params, 'pending');
      });
    }

    const analytics = await getAnalytics();

    if (!analytics) {
      console.log('[Analytics] Not available, skipping event:', eventName);
      if (typeof window !== 'undefined') {
        import('@/lib/analytics-debug').then(({ analyticsDebugger }) => {
          analyticsDebugger.log(eventName, params, 'error', 'Analytics not available');
        });
      }
      return;
    }

    firebaseLogEvent(analytics, eventName, params);
    console.log('[Analytics] Event logged:', eventName, params);

    if (typeof window !== 'undefined') {
      import('@/lib/analytics-debug').then(({ analyticsDebugger }) => {
        analyticsDebugger.log(eventName, params, 'success');
      });
    }
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
    if (typeof window !== 'undefined') {
      import('@/lib/analytics-debug').then(({ analyticsDebugger }) => {
        analyticsDebugger.log(eventName, params, 'error', String(error));
      });
    }
  }
}

/**
 * Track button click events
 */
export function trackButtonClick(buttonName: string, location?: string): void {
  logEvent('button_click', {
    button_name: buttonName,
    location: location || 'unknown',
  });
}

/**
 * Track form submission events
 */
export function trackFormSubmit(formName: string, success: boolean = true): void {
  logEvent('form_submit', {
    form_name: formName,
    success: success,
  });
}

/**
 * Track file downloads
 */
export function trackFileDownload(fileName: string, fileType?: string): void {
  logEvent('file_download', {
    file_name: fileName,
    file_type: fileType || 'unknown',
  });
}

/**
 * Track project views
 */
export function trackProjectView(projectName: string, category?: string, projectId?: string): void {
  logEvent('project_view', {
    project_name: projectName,
    project_category: category || 'uncategorized',
    project_id: projectId,
  });
}

/**
 * Track contact interactions
 */
export function trackContactInteraction(method: string, location?: string): void {
  logEvent('contact_interaction', {
    contact_method: method,
    location: location || 'unknown',
  });
}

/**
 * Set user properties
 */
export async function setUserProps(properties: EventParams): Promise<void> {
  try {
    const analytics = await getAnalytics();

    if (!analytics) {
      console.log('[Analytics] Not available, skipping user properties');
      return;
    }

    setUserProperties(analytics, properties);
    console.log('[Analytics] User properties set:', properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
}

/**
 * Set user ID for tracking
 */
export async function setAnalyticsUserId(userId: string): Promise<void> {
  try {
    const analytics = await getAnalytics();

    if (!analytics) {
      console.log('[Analytics] Not available, skipping user ID');
      return;
    }

    setUserId(analytics, userId);
    console.log('[Analytics] User ID set:', userId);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
}

// Pre-configured common events for convenience
export const analytics = {
  // User interactions
  buttonClick: trackButtonClick,
  formSubmit: trackFormSubmit,
  fileDownload: trackFileDownload,
  projectView: trackProjectView,
  contactInteraction: trackContactInteraction,

  // User management
  setUserId: setAnalyticsUserId,
  setUserProperties: setUserProps,

  // Custom events
  logEvent: logEvent,
};

export default analytics;