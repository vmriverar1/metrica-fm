'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNotFoundPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading } = useAuth();
  
  const attemptedPath = `/admin/${Array.isArray(params.slug) ? params.slug.join('/') : params.slug}`;

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      // Guardar la ruta intentada para después del login
      sessionStorage.setItem('redirectAfterLogin', attemptedPath);
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, attemptedPath, router]);

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-lg w-full">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ruta Administrativa No Encontrada
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            La ruta <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{attemptedPath}</code> no existe en el panel de administración.
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Verifica la URL o navega a una sección válida del panel administrativo.
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regresar
            </Button>
            
            <Button 
              onClick={() => router.push('/admin/dashboard')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Panel Principal
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Rutas Administrativas Disponibles:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button 
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                📊 Dashboard
              </button>
              <button 
                type="button"
                onClick={() => router.push('/admin/json-crud')}
                className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                📝 Editor de Contenido
              </button>
              <button 
                type="button"
                onClick={() => router.push('/admin/json-crud/pages')}
                className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                📄 Gestión de Páginas
              </button>
              <button 
                type="button"
                onClick={() => router.push('/admin/json-crud/portfolio')}
                className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                🏗️ Portafolio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}