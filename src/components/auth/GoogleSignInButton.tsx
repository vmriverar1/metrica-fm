'use client';

/**
 * Google Sign-In Button Component
 *
 * Pre-built button component for Google authentication
 * Can be used in any page or component
 */

import { useState } from 'react';
import { signInWithGoogle, signOut } from '@/lib/firebase-auth';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  className
}: GoogleSignInButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        console.log('[GoogleSignInButton] Sign in successful:', result.user.email);
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al iniciar sesión';
        setError(errorMsg);
        onError?.(errorMsg);
        console.error('[GoogleSignInButton] Sign in failed:', errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('[GoogleSignInButton] Sign in exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut();
      console.log('[GoogleSignInButton] Sign out successful');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMsg);
      console.error('[GoogleSignInButton] Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    );
  }

  // If user is authenticated, show sign out button
  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>{user.displayName || user.email}</span>
        </div>
        <Button
          onClick={handleSignOut}
          disabled={loading}
          variant="outline"
          className={className}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cerrando sesión...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </>
          )}
        </Button>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  // Show sign in button
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleSignIn}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar sesión con Google
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
