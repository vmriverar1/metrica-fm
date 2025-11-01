'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { PWAJsonReader } from '@/lib/pwa-json-reader';
import { PWACacheInvalidator } from '@/middleware/pwa-cache-invalidator';

type PWAStatus = 'online' | 'offline' | 'syncing' | 'cached' | 'error';

export default function PWAStatusIndicator() {
  const [status, setStatus] = useState<PWAStatus>('online');
  const [isVisible, setIsVisible] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [lastActivity, setLastActivity] = useState<string>('');

  // Detectar estado de conexión y PWA
  useEffect(() => {
    const updateStatus = () => {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      // Verificar si hay datos en cache
      const stats = PWAJsonReader.getCacheStats();
      setCacheStats(stats);
      
      if (stats.validEntries > 0) {
        setStatus('cached');
      } else {
        setStatus('online');
      }
    };

    // Estado inicial
    updateStatus();

    // Escuchar cambios de conectividad
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Verificar estado cada 30 segundos
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  // Escuchar actualizaciones PWA via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('metrica-json-updates');

    const handleUpdate = (event: MessageEvent) => {
      if (event.data.type === 'JSON_UPDATED') {
        setStatus('syncing');
        setLastActivity(`Actualizado: ${event.data.path}`);
        setIsVisible(true);

        // Volver a cached después de 2 segundos
        setTimeout(() => {
          setStatus('cached');
        }, 2000);

        // Ocultar después de 5 segundos
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    channel.addEventListener('message', handleUpdate);

    return () => {
      channel.removeEventListener('message', handleUpdate);
      channel.close();
    };
  }, []);

  // Componente deshabilitado - no mostrar en ningún lado
  return null;

  const getStatusConfig = (status: PWAStatus) => {
    switch (status) {
      case 'online':
        return {
          icon: <Wifi className="w-3 h-3" />,
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'En línea'
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          color: 'bg-red-100 text-red-700 border-red-200',
          text: 'Sin conexión'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          text: 'Sincronizando'
        };
      case 'cached':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'Cache PWA'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          text: 'Advertencia'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-300 ${config.color}`}>
        {config.icon}
        <span>{config.text}</span>
        
        {cacheStats && cacheStats.validEntries > 0 && (
          <span className="text-xs opacity-75">
            ({cacheStats.validEntries})
          </span>
        )}
        
        {lastActivity && status === 'syncing' && (
          <div className="text-xs opacity-75 max-w-32 truncate">
            {lastActivity}
          </div>
        )}
      </div>
      
      {/* Cache Stats expandido para desarrollo */}
      {process.env.NODE_ENV === 'development' && cacheStats && (
        <PWACacheDebugPanel stats={cacheStats} />
      )}
    </div>
  );
}

// Componente debug solo para desarrollo
function PWACacheDebugPanel({ stats }: { stats: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Clock className="w-3 h-3 inline mr-1" />
        Debug
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-white rounded-lg border shadow-lg text-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-900">PWA Cache Stats</h4>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1 text-gray-600">
        <div>Total: {stats.totalEntries}</div>
        <div>Válidas: {stats.validEntries}</div>
        <div>Paths: {stats.cachePaths?.length || 0}</div>
        
        {stats.newestEntry && (
          <div className="text-xs">
            Último: {new Date(stats.newestEntry.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t">
        <button
          onClick={() => {
            PWAJsonReader.clearCache();
            location.reload();
          }}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Limpiar Cache
        </button>
      </div>
    </div>
  );
}

// Hook para usar el estado PWA en otros componentes
export function usePWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      setCacheStats(PWAJsonReader.getCacheStats());
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const interval = setInterval(updateStatus, 10000); // cada 10s

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    cacheStats,
    hasValidCache: cacheStats?.validEntries > 0,
    clearCache: () => PWAJsonReader.clearCache()
  };
}