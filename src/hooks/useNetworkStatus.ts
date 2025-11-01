'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      let isSlowConnection = false;
      let connectionType = null;
      let effectiveType = null;
      let downlink = null;
      let rtt = null;

      // Get network information if available
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        connectionType = connection.type || null;
        effectiveType = connection.effectiveType || null;
        downlink = connection.downlink || null;
        rtt = connection.rtt || null;

        // Determine if connection is slow
        if (effectiveType) {
          isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
        } else if (downlink) {
          isSlowConnection = downlink < 0.5; // Less than 500kbps
        }
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType,
        effectiveType,
        downlink,
        rtt
      });
    };

    // Initial check
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}

// Hook specifically for admin protection
export function useAdminNetworkGuard() {
  const { isOnline } = useNetworkStatus();
  const [shouldBlockAdmin, setShouldBlockAdmin] = useState(false);

  useEffect(() => {
    // Only block admin if offline for more than 10 seconds
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShouldBlockAdmin(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShouldBlockAdmin(false);
    }
  }, [isOnline]);

  return {
    isOnline,
    shouldBlockAdmin,
    canAccessAdmin: isOnline || !shouldBlockAdmin
  };
}