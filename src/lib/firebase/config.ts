/**
 * Configuración de Firebase para Newsletter/Blog
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, Storage } from 'firebase/storage';

// Detectar si estamos en producción y tenemos credenciales
const hasRealCredentials = (
  // En producción, siempre intentar usar Firebase si tenemos PROJECT_ID
  (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'metrica-fm') ||
  // En desarrollo, verificar que las credenciales no sean demo
  (process.env.NODE_ENV === 'development' &&
   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'metrica-fm' &&
   process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
   !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo'))
);

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAkpwp6CJRuhVnscV2HbNR-nQ-DpvglH_U',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'metrica-fm.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'metrica-fm',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'metrica-fm.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '806061146235',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:806061146235:web:54b354f94f5872ef56a2de'
};

// Inicializar Firebase App
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar servicios
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: Storage = getStorage(app);

// NOTA: Emulador desactivado temporalmente para forzar conexión a producción
// Conectar al emulador si usamos credenciales de demo o si está en desarrollo
if (false && typeof window !== 'undefined' && (!hasRealCredentials || process.env.NODE_ENV === 'development')) {
  try {
    const projectId = firebaseConfig.projectId;
    if (!projectId.includes('demo-') && !hasRealCredentials) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch {
    // Emulator not available or already connected
  }
}

// Nombres de las colecciones
export const COLLECTIONS = {
  // Newsletter/Blog collections
  AUTHORS: 'blog_authors',
  CATEGORIES: 'blog_categories',
  ARTICLES: 'blog_articles',

  // Newsletter collections (aliases for blog collections)
  NEWSLETTER_CATEGORIES: 'blog_categories',
  NEWSLETTER_ARTICLES: 'blog_articles',
  NEWSLETTER_AUTHORS: 'blog_authors',
  NEWSLETTER_SUBSCRIBERS: 'newsletter_subscribers',

  // Portfolio collections (optimized for Firebase App Hosting)
  PORTFOLIO_CATEGORIES: 'portfolio_categories',
  PORTFOLIO_PROJECTS: 'portfolio_projects',
  PORTFOLIO_IMAGES: 'portfolio_images',

  // Career collections
  CAREER_DEPARTMENTS: 'careers_departments', // Fixed to match existing collection
  CAREER_POSITIONS: 'careers_positions', // Correct collection name
  CAREER_APPLICATIONS: 'career_applications',

  // Navigation collections
  MEGAMENU: 'megamenu'
} as const;

// Configuración de desarrollo vs producción
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isDemoMode = !hasRealCredentials;
export const isEmulator = typeof window !== 'undefined' && isDemoMode;

export default app;