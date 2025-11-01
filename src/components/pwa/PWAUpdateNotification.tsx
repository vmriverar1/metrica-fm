'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface UpdateNotification {
  id: string;
  path: string;
  timestamp: number;
  type: 'JSON_UPDATED' | 'CACHE_CLEARED' | 'PRELOAD_COMPLETED';
  message: string;
}

interface PWAUpdateNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoHideDuration?: number; // ms, 0 means no auto hide
  showOnlyInAdmin?: boolean;
}

export default function PWAUpdateNotification({
  position = 'top-right',
  maxNotifications = 3,
  autoHideDuration = 5000,
  showOnlyInAdmin = false
}: PWAUpdateNotificationProps) {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);

  useEffect(() => {
    // Only show in admin or if showOnlyInAdmin is false
    if (showOnlyInAdmin && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      return;
    }

    const channel = new BroadcastChannel('metrica-json-updates');

    const handleUpdate = (event: MessageEvent) => {
      const { type, path, timestamp } = event.data;
      
      let message = '';
      switch (type) {
        case 'JSON_UPDATED':
          message = `Content updated: ${path.replace('json/', '').replace('.json', '')}`;
          break;
        case 'CACHE_CLEARED':
          message = 'Cache cleared - fresh content loaded';
          break;
        case 'PRELOAD_COMPLETED':
          message = 'Critical content preloaded';
          break;
        default:
          return;
      }

      const newNotification: UpdateNotification = {
        id: `${type}-${timestamp}-${Math.random()}`,
        path,
        timestamp,
        type,
        message
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications);
        return updated;
      });

      // Auto hide if duration is set
      if (autoHideDuration > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, autoHideDuration);
      }
    };

    channel.addEventListener('message', handleUpdate);

    return () => {
      channel.removeEventListener('message', handleUpdate);
      channel.close();
    };
  }, [maxNotifications, autoHideDuration, showOnlyInAdmin]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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

  const getIcon = (type: UpdateNotification['type']) => {
    switch (type) {
      case 'JSON_UPDATED':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'CACHE_CLEARED':
        return <RefreshCw className="w-4 h-4 text-cyan-500" />;
      case 'PRELOAD_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: UpdateNotification['type']) => {
    switch (type) {
      case 'JSON_UPDATED':
        return 'bg-blue-50 border-blue-200';
      case 'CACHE_CLEARED':
        return 'bg-cyan-50 border-cyan-200';
      case 'PRELOAD_COMPLETED':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 w-80 max-w-sm`}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            ${getBackgroundColor(notification.type)}
            rounded-lg border p-4 shadow-lg
            transform transition-all duration-300 ease-in-out
            ${index === 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-90'}
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white/60 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook version
export function usePWAUpdateNotifications() {
  const [updates, setUpdates] = useState<UpdateNotification[]>([]);

  useEffect(() => {
    const channel = new BroadcastChannel('metrica-json-updates');

    const handleUpdate = (event: MessageEvent) => {
      const { type, path, timestamp } = event.data;
      
      const newUpdate: UpdateNotification = {
        id: `${type}-${timestamp}`,
        path,
        timestamp,
        type,
        message: `${type}: ${path}`
      };

      setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep last 10
    };

    channel.addEventListener('message', handleUpdate);

    return () => {
      channel.removeEventListener('message', handleUpdate);
      channel.close();
    };
  }, []);

  return {
    updates,
    clearUpdates: () => setUpdates([])
  };
}