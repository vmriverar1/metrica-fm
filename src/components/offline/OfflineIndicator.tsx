'use client';

// FASE 4A: Offline Status Indicator Component
// Componente para mostrar estado de conexión y sincronización

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff, Loader2 } from 'lucide-react';

interface SyncStatus {
  isOnline: boolean;
  hasPendingTasks: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

function OfflineIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    hasPendingTasks: false,
    pendingCount: 0,
    lastSyncTime: null,
    isSyncing: false,
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    // Monitor sync status from background sync manager
    const updateSyncStatus = () => {
      // This would integrate with backgroundSync.getSyncStatus()
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          // Send message to SW to get sync status
          navigator.serviceWorker.controller?.postMessage({
            type: 'GET_SYNC_STATUS'
          });
        });
      }
    };

    // Listen to online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen to messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_STATUS_UPDATE') {
        setSyncStatus(prev => ({
          ...prev,
          hasPendingTasks: event.data.pendingCount > 0,
          pendingCount: event.data.pendingCount,
          lastSyncTime: event.data.lastSyncTime ? new Date(event.data.lastSyncTime) : null,
          isSyncing: event.data.isSyncing,
        }));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Initial status check
    updateOnlineStatus();
    updateSyncStatus();

    // Periodic sync status check
    const syncInterval = setInterval(updateSyncStatus, 30000); // 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      clearInterval(syncInterval);
    };
  }, []);

  // Don't show if online with no pending tasks
  if (syncStatus.isOnline && !syncStatus.hasPendingTasks && !syncStatus.isSyncing) {
    return null;
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-500';
    if (syncStatus.isSyncing) return 'bg-yellow-500';
    if (syncStatus.hasPendingTasks) return 'bg-cyan-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline && syncStatus.hasPendingTasks) {
      return `Sin conexión - ${syncStatus.pendingCount} pendientes`;
    }
    if (!syncStatus.isOnline) {
      return 'Sin conexión';
    }
    if (syncStatus.isSyncing) {
      return 'Sincronizando...';
    }
    if (syncStatus.hasPendingTasks) {
      return `${syncStatus.pendingCount} tareas pendientes`;
    }
    return 'Conectado';
  };

  const getIcon = () => {
    if (syncStatus.isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (!syncStatus.isOnline) {
      return syncStatus.hasPendingTasks ? <CloudOff className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
    }
    return syncStatus.hasPendingTasks ? <Cloud className="h-4 w-4" /> : <Wifi className="h-4 w-4" />;
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Hace unos segundos';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Hace 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;

    return date.toLocaleDateString('es-PE');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium
          transition-all duration-300 cursor-pointer select-none
          ${getStatusColor()}
          ${showDetails ? 'rounded-b-none' : 'hover:shadow-lg'}
        `}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getIcon()}
        <span>{getStatusText()}</span>
      </div>

      {showDetails && (
        <div className="bg-gray-900 text-white text-xs p-3 rounded-lg rounded-t-none border-t border-gray-700">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={syncStatus.isOnline ? 'text-green-400' : 'text-red-400'}>
                {syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>

            {syncStatus.hasPendingTasks && (
              <div className="flex justify-between">
                <span>Pendientes:</span>
                <span className="text-cyan-400">{syncStatus.pendingCount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Última sync:</span>
              <span className="text-gray-400">{formatLastSync(syncStatus.lastSyncTime)}</span>
            </div>

            {syncStatus.isSyncing && (
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-yellow-400">Sincronizando...</span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-500">
            Toca para {showDetails ? 'ocultar' : 'ver'} detalles
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para usar en otros componentes
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
}

// Hook para queue operations when offline
export function useOfflineQueue() {
  const isOnline = useOfflineStatus();

  const queueOrExecute = async (
    operation: () => Promise<any>,
    queueData: {
      type: 'contact-form' | 'newsletter-signup' | 'analytics' | 'admin-operation';
      data: any;
    }
  ) => {
    if (isOnline) {
      try {
        return await operation();
      } catch (error) {
        // If online operation fails, queue it
        console.warn('Online operation failed, queuing for later:', error);

        // Import background sync dynamically to avoid SSR issues
        const { backgroundSync } = await import('../../lib/service-worker/background-sync');
        return backgroundSync.addToQueue(
          getQueueNameForType(queueData.type),
          queueData.type,
          queueData.data
        );
      }
    } else {
      // Queue for when back online
      const { backgroundSync } = await import('../../lib/service-worker/background-sync');
      return backgroundSync.addToQueue(
        getQueueNameForType(queueData.type),
        queueData.type,
        queueData.data
      );
    }
  };

  return { queueOrExecute, isOnline };
}

function getQueueNameForType(type: string): string {
  switch (type) {
    case 'contact-form': return 'contact-forms';
    case 'newsletter-signup': return 'newsletter-signups';
    case 'analytics': return 'portfolio-analytics';
    case 'admin-operation': return 'admin-operations';
    default: return 'default';
  }
}

// Admin offline guard component
export function AdminOfflineGuard() {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Sin conexión - El panel admin requiere internet para funcionar correctamente</span>
      </div>
    </div>
  );
}

// Default export
export default OfflineIndicator;