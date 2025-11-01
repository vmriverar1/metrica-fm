'use client';

/**
 * Auth Provider Component
 *
 * Initializes Firebase Authentication globally and tracks auth state automatically
 * Follows the same pattern as AnalyticsProvider.tsx
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, onAuthStateChange } from '@/lib/firebase-auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false
});

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth listener on mount (following AnalyticsProvider pattern)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const unsubscribe = await onAuthStateChange((authUser) => {
          setUser(authUser);
          setLoading(false);

          if (authUser) {
            console.log('[AuthProvider] User authenticated:', authUser.email);
          } else {
            console.log('[AuthProvider] No user authenticated');
          }
        });

        // If initialization failed, set loading to false
        if (!unsubscribe) {
          setLoading(false);
          console.warn('[AuthProvider] Failed to initialize auth listener');
        }

        // Cleanup on unmount
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('[AuthProvider] Initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context in components
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
