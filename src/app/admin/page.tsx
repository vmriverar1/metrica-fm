'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogIn, Settings } from 'lucide-react';

export default function AdminRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [message, setMessage] = useState('Verificando acceso...');

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setMessage(`Bienvenido ${user?.name || 'Admin'}, redirigiendo al panel...`);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setMessage('Acceso no autorizado, redirigiendo al login...');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1000);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : isAuthenticated ? (
              <Settings className="w-8 h-8 text-blue-600" />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Administración
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {!loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <LogIn className="w-4 h-4 mr-2" />
              <span>Métrica DIP - Sistema Administrativo</span>
            </div>
            
            {!isAuthenticated && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Necesitas credenciales válidas para acceder al panel de administración
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}