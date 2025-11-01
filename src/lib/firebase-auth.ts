/**
 * Firebase Authentication Helper Functions
 *
 * Utility functions for Google Sign-In authentication
 * Cualquier usuario registrado en Firebase Authentication puede acceder
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth as getFirebaseAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

// Firebase config (same as analytics.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkpwp6CJRuhVnscV2HbNR-nQ-DpvglH_U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "metrica-fm.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "metrica-fm",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "metrica-fm.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "806061146235",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:806061146235:web:54b354f94f5872ef56a2de",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BTFSHLQNN6"
};

// Initialize Auth instance (singleton pattern)
let authInstance: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Get Firebase Auth instance (following analytics.ts pattern)
 */
async function getAuth(): Promise<Auth | null> {
  if (typeof window === 'undefined') return null;

  if (authInstance) return authInstance;

  try {
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    authInstance = getFirebaseAuth(app);

    // Configure Google Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account' // Always show account selection
    });

    console.log('[Auth] Firebase Auth initialized successfully');
    return authInstance;
  } catch (error) {
    console.error('[Auth] Init error:', error);
    return null;
  }
}

/**
 * User data interface
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAuthorized: boolean;
}

/**
 * Check if user is authorized
 * Cualquier usuario que exista en Firebase Authentication está autorizado
 */
async function checkUserAuthorization(email: string | null): Promise<boolean> {
  if (!email) {
    console.warn('[Auth] No email provided');
    return false;
  }

  // Si el usuario tiene un email válido de Firebase Auth, está autorizado
  console.log('[Auth] User authenticated via Firebase:', email);
  return true;
}

/**
 * Sign in with Google
 * Cualquier usuario que pueda autenticarse tiene acceso
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const auth = await getAuth();

    if (!auth || !googleProvider) {
      console.error('[Auth] Auth not available');
      return {
        success: false,
        error: 'Servicio de autenticación no disponible'
      };
    }

    // Show Google Sign-In popup
    console.log('[Auth] Opening Google Sign-In popup...');
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    console.log('[Auth] Google Sign-In successful:', firebaseUser.email);

    // Check if user is authorized
    const isAuthorized = await checkUserAuthorization(firebaseUser.email);

    if (!isAuthorized) {
      // Este caso no debería ocurrir, pero por seguridad
      await firebaseSignOut(auth);
      console.warn('[Auth] Authentication failed for:', firebaseUser.email);
      return {
        success: false,
        error: 'Error de autenticación. Por favor intenta de nuevo.'
      };
    }

    const user: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAuthorized: true
    };

    console.log('[Auth] User authorized and signed in:', user.email);

    return {
      success: true,
      user
    };
  } catch (error: any) {
    console.error('[Auth] Sign in error:', error);

    // Handle specific error codes
    let errorMessage = 'Error al iniciar sesión';

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Inicio de sesión cancelado';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloqueado por el navegador. Permite popups para este sitio.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const auth = await getAuth();

    if (!auth) {
      console.log('[Auth] Auth not available, skipping sign out');
      return;
    }

    await firebaseSignOut(auth);
    console.log('[Auth] User signed out successfully');
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const auth = await getAuth();

    if (!auth) {
      return null;
    }

    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    // Verify authorization
    const isAuthorized = await checkUserAuthorization(firebaseUser.email);

    if (!isAuthorized) {
      // Sign out if somehow got in but not authorized
      await firebaseSignOut(auth);
      return null;
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAuthorized: true
    };
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export async function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): Promise<(() => void) | null> {
  try {
    const auth = await getAuth();

    if (!auth) {
      console.log('[Auth] Auth not available for state listener');
      return null;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        console.log('[Auth] State changed: User signed out');
        callback(null);
        return;
      }

      console.log('[Auth] State changed: User detected:', firebaseUser.email);

      // Verify authorization
      const isAuthorized = await checkUserAuthorization(firebaseUser.email);

      if (!isAuthorized) {
        console.warn('[Auth] State changed: Authentication verification failed, signing out');
        await firebaseSignOut(auth);
        callback(null);
        return;
      }

      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAuthorized: true
      };

      callback(user);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Auth] Error setting up auth listener:', error);
    return null;
  }
}

// Pre-configured auth object for convenience (following analytics.ts pattern)
export const auth = {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange
};

export default auth;
