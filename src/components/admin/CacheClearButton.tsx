'use client';

import React, { useState } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearServerCache } from '@/app/actions/clear-cache';

export default function CacheClearButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const clearCache = async () => {
    setIsClearing(true);
    setStatus('idle');

    try {
      // Usar Server Action en lugar de API route
      const result = await clearServerCache();

      if (result.success) {
        setStatus('success');
        console.log('✅ Cache limpiado:', result.message);

        // Mostrar éxito por 3 segundos
        setTimeout(() => {
          setStatus('idle');
        }, 3000);

        // Recargar la página después de 1 segundo
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setStatus('error');
        console.error('❌ Error:', result.error);

        // Ocultar error después de 3 segundos
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      setStatus('error');

      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      {/* Botón flotante siempre visible */}
      <button
        onClick={clearCache}
        disabled={isClearing}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "group flex items-center gap-2 px-4 py-3",
          "bg-primary text-white rounded-full shadow-lg",
          "hover:bg-primary/90 hover:scale-105",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          status === 'success' && "bg-green-500 hover:bg-green-500",
          status === 'error' && "bg-red-500 hover:bg-red-500"
        )}
        title="Limpiar cache del servidor"
      >
        {/* Icono */}
        <div className="relative">
          {status === 'success' ? (
            <Check className="w-5 h-5" />
          ) : status === 'error' ? (
            <X className="w-5 h-5" />
          ) : (
            <RefreshCw
              className={cn(
                "w-5 h-5",
                isClearing && "animate-spin"
              )}
            />
          )}
        </div>

        {/* Texto (se muestra solo en hover o cuando hay status) */}
        <span className={cn(
          "font-medium text-sm whitespace-nowrap",
          "max-w-0 overflow-hidden transition-all duration-300",
          "group-hover:max-w-xs",
          (status !== 'idle' || isClearing) && "max-w-xs"
        )}>
          {isClearing ? 'Limpiando...' :
           status === 'success' ? '¡Cache limpiado!' :
           status === 'error' ? 'Error' :
           'Limpiar Cache'}
        </span>
      </button>

      {/* Toast de notificación adicional */}
      {status !== 'idle' && (
        <div className={cn(
          "fixed top-4 right-4 z-50",
          "px-4 py-2 rounded-lg shadow-lg",
          "animate-in slide-in-from-top-2 duration-300",
          status === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
        )}>
          <div className="flex items-center gap-2">
            {status === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Cache limpiado exitosamente</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>Error al limpiar cache</span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}