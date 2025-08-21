'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  permissions?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo = '/admin/login',
  permissions = []
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, actions } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Guardar la ruta actual para redireccionar después del login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push(redirectTo);
      } else if (isAuthenticated && permissions.length > 0) {
        // Verificar permisos específicos
        const hasRequiredPermissions = permissions.every(permission => 
          actions.hasPermission(permission, 'read')
        );
        
        if (!hasRequiredPermissions) {
          router.push('/admin/dashboard?error=insufficient-permissions');
        }
      }
    }
  }, [loading, isAuthenticated, requireAuth, permissions, pathname, router, redirectTo, actions]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/70 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado, no mostrar contenido
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si está autenticado o no requiere autenticación, mostrar el contenido
  return <>{children}</>;
}