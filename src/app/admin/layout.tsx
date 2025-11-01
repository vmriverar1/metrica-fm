'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider as FirebaseAuthProvider } from '@/components/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PWAStatusIndicator from '@/components/pwa/PWAStatusIndicator';
import { AdminOfflineGuard } from '@/components/offline/OfflineIndicator';
import CacheClearButton from '@/components/admin/CacheClearButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Rutas que no requieren autenticación
  const publicRoutes = ['/admin/login', '/admin'];

  return (
    <FirebaseAuthProvider>
      <AdminOfflineGuard />
      {publicRoutes.includes(pathname) ? (
        <>
          {children}
          <PWAStatusIndicator />
        </>
      ) : (
        <ProtectedRoute>
          {children}
          <PWAStatusIndicator />
          <CacheClearButton />
        </ProtectedRoute>
      )}
    </FirebaseAuthProvider>
  );
}