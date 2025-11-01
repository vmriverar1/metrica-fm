'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth as useFirebaseAuth } from '@/components/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/admin/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    // Limpiar sesiones viejas del sistema anterior
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-session');
        sessionStorage.removeItem('auth-session');
      } catch (e) {
        console.error('Error clearing old sessions:', e);
      }
    }

    if (!loading) {
      if (requireAuth && !user) {
        // Guardar la ruta actual para redireccionar después del login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push(redirectTo);
      }
    }
  }, [loading, user, requireAuth, pathname, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/70 text-sm">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado con Firebase, no mostrar contenido
  if (requireAuth && !user) {
    return null;
  }

  // Si está autenticado con Firebase Auth, mostrar el contenido
  return <>{children}</>;
}
