'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { pwaAnalytics } from '@/lib/pwa-analytics';

interface UpdateInfo {
  version: string;
  timestamp: number;
  features: string[];
  critical: boolean;
  size: number;
}

interface PWAUpdateManagerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoUpdate?: boolean;
  updateCheckInterval?: number; // milliseconds
}

export default function PWAUpdateManager({
  position = 'top-right',
  autoUpdate = false,
  updateCheckInterval = 60000 // 1 minute
}: PWAUpdateManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<number>(0);
  const [dismissedUpdates, setDismissedUpdates] = useState<Set<string>>(new Set());

  // Check for updates periodically
  useEffect(() => {
    const checkForUpdates = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if there's an update available
        await registration.update();
        
        if (registration.waiting) {
          const updateInfo = await getUpdateInfo();
          handleUpdateAvailable(updateInfo);
        }
        
        setLastUpdateCheck(Date.now());
      } catch (error) {
        console.log('[PWAUpdateManager] Update check failed:', error);
      }
    };

    // Initial check
    checkForUpdates();

    // Periodic checks
    const interval = setInterval(checkForUpdates, updateCheckInterval);

    return () => clearInterval(interval);
  }, [updateCheckInterval]);

  // Listen for service worker updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleControllerChange = async () => {
      // New service worker took control
      pwaAnalytics.trackPWAEvent('sw_update_applied');
      setUpdateAvailable(false);
      setShowUpdatePrompt(false);
      setIsUpdating(false);
      
      // Show brief success message
      showUpdateSuccess();
    };

    const handleMessage = async (event: MessageEvent) => {
      const { type, data } = event.data || {};
      
      switch (type) {
        case 'UPDATE_AVAILABLE':
          const updateInfo = await getUpdateInfo(data);
          handleUpdateAvailable(updateInfo);
          break;
        case 'UPDATE_PROGRESS':
          setUpdateProgress(data.progress);
          break;
        case 'UPDATE_ERROR':
          handleUpdateError(data.error);
          break;
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdateAvailable = useCallback((updateInfo: UpdateInfo) => {
    // Check if this update was already dismissed
    if (dismissedUpdates.has(updateInfo.version)) return;

    setUpdateInfo(updateInfo);
    setUpdateAvailable(true);
    
    pwaAnalytics.trackPWAEvent('update_available', {
      version: updateInfo.version,
      critical: updateInfo.critical,
      size: updateInfo.size
    });

    // Auto-update for critical updates or if enabled
    if (updateInfo.critical || autoUpdate) {
      setTimeout(() => {
        applyUpdate();
      }, 3000); // Give user 3 seconds to see the notification
    } else {
      setShowUpdatePrompt(true);
    }
  }, [autoUpdate, dismissedUpdates]);

  const applyUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsUpdating(true);
    setUpdateProgress(0);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Simulate progress for user feedback
        const progressInterval = setInterval(() => {
          setUpdateProgress(prev => {
            const next = prev + 10;
            if (next >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return next;
          });
        }, 200);
        
        pwaAnalytics.trackPWAEvent('update_initiated', {
          version: updateInfo?.version
        });
      }
    } catch (error) {
      handleUpdateError(error as Error);
    }
  }, [updateInfo]);

  const dismissUpdate = useCallback(() => {
    if (updateInfo) {
      setDismissedUpdates(prev => new Set([...prev, updateInfo.version]));
      pwaAnalytics.trackPWAEvent('update_dismissed', {
        version: updateInfo.version
      });
    }
    
    setShowUpdatePrompt(false);
    setUpdateAvailable(false);
  }, [updateInfo]);

  const handleUpdateError = (error: Error) => {
    console.error('[PWAUpdateManager] Update failed:', error);
    setIsUpdating(false);
    setUpdateProgress(0);
    
    pwaAnalytics.trackPWAEvent('update_error', {
      error: error.message,
      version: updateInfo?.version
    });
  };

  const showUpdateSuccess = () => {
    // Show success notification briefly
    const successNotification = document.createElement('div');
    successNotification.className = `
      fixed top-4 right-4 z-50 bg-green-50 border border-green-200 
      rounded-lg p-4 shadow-lg text-green-700 text-sm font-medium
      flex items-center gap-2 animate-in slide-in-from-right-full
    `;
    successNotification.innerHTML = `
      <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span>Aplicación actualizada correctamente</span>
    `;
    
    document.body.appendChild(successNotification);
    
    setTimeout(() => {
      if (successNotification.parentNode) {
        successNotification.parentNode.removeChild(successNotification);
      }
    }, 4000);
  };

  const getUpdateInfo = async (data?: any): Promise<UpdateInfo> => {
    // In a real implementation, this would fetch update info from your API
    return {
      version: data?.version || `v${Date.now()}`,
      timestamp: Date.now(),
      features: data?.features || [
        'Mejoras de rendimiento',
        'Corrección de errores',
        'Nueva funcionalidad PWA'
      ],
      critical: data?.critical || false,
      size: data?.size || Math.floor(Math.random() * 500) + 100 // KB
    };
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora mismo';
  };

  if (!updateAvailable && !isUpdating) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 max-w-sm`}>
      {/* Update Progress */}
      {isUpdating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900">Actualizando aplicación</h3>
              <p className="text-sm text-blue-700">Por favor espera...</p>
            </div>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${updateProgress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-blue-600 mt-2 text-right">
            {updateProgress}%
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && updateInfo && !isUpdating && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {updateInfo.critical ? (
                <AlertCircle className="w-5 h-5 text-cyan-500" />
              ) : (
                <Download className="w-5 h-5 text-blue-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {updateInfo.critical ? 'Actualización crítica' : 'Nueva actualización disponible'}
                </h3>
                <p className="text-sm text-gray-600">{updateInfo.version}</p>
              </div>
            </div>
            
            {!updateInfo.critical && (
              <button
                onClick={dismissUpdate}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Update Features */}
          {updateInfo.features.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 mb-1">Novedades:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {updateInfo.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Update Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>Tamaño: {updateInfo.size}KB</span>
            <span>Disponible: {formatTimeAgo(updateInfo.timestamp)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyUpdate}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${updateInfo.critical 
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {updateInfo.critical ? 'Actualizar ahora' : 'Actualizar'}
            </button>
            
            {!updateInfo.critical && (
              <button
                onClick={dismissUpdate}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Después
              </button>
            )}
          </div>

          {updateInfo.critical && (
            <p className="text-xs text-cyan-600 mt-2">
              Esta actualización contiene correcciones importantes de seguridad.
            </p>
          )}
        </div>
      )}

      {/* Last Update Check Info (Development) */}
      {process.env.NODE_ENV === 'development' && lastUpdateCheck > 0 && (
        <div className="mt-2 text-xs text-gray-400 text-right">
          <Clock className="w-3 h-3 inline mr-1" />
          Última verificación: {formatTimeAgo(lastUpdateCheck)}
        </div>
      )}
    </div>
  );
}

// Hook for manual update management
export function usePWAUpdates() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      const hasUpdate = !!registration.waiting;
      setUpdateAvailable(hasUpdate);
      return hasUpdate;
    } catch (error) {
      console.error('Update check failed:', error);
      return false;
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    setUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new service worker to take control
        await new Promise<void>((resolve) => {
          const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        });
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    updateAvailable,
    updating,
    checkForUpdates,
    applyUpdate
  };
}