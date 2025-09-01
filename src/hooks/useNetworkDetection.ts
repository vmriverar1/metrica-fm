'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkConditions {
  speed: 'slow' | 'medium' | 'fast' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | 'unknown';
  downlink: number;
  rtt: number;
  isOnline: boolean;
  isSlowConnection: boolean;
  recommendedTimeout: number;
  recommendedRetryCount: number;
}

export const useNetworkDetection = () => {
  const [conditions, setConditions] = useState<NetworkConditions>({
    speed: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    isOnline: true,
    isSlowConnection: false,
    recommendedTimeout: 5000,
    recommendedRetryCount: 2
  });

  const updateNetworkConditions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    let newConditions: NetworkConditions = {
      ...conditions,
      isOnline: navigator.onLine
    };

    if (connection) {
      const effectiveType = connection.effectiveType || 'unknown';
      const downlink = connection.downlink || 0;
      const rtt = connection.rtt || 0;
      
      // Determinar velocidad basada en métricas reales
      let speed: 'slow' | 'medium' | 'fast' | 'unknown' = 'unknown';
      let isSlowConnection = false;
      let recommendedTimeout = 5000;
      let recommendedRetryCount = 2;

      if (effectiveType === '2g' || downlink < 0.5 || rtt > 2000) {
        speed = 'slow';
        isSlowConnection = true;
        recommendedTimeout = 12000; // 12 segundos para conexiones lentas
        recommendedRetryCount = 1; // Menos intentos en conexión lenta
      } else if (effectiveType === '3g' || downlink < 2 || rtt > 1000) {
        speed = 'medium';
        recommendedTimeout = 8000; // 8 segundos para conexiones medias
        recommendedRetryCount = 2;
      } else if (effectiveType === '4g' || downlink >= 2) {
        speed = 'fast';
        recommendedTimeout = 5000; // 5 segundos para conexiones rápidas
        recommendedRetryCount = 3;
      }

      newConditions = {
        speed,
        effectiveType,
        downlink,
        rtt,
        isOnline: navigator.onLine,
        isSlowConnection,
        recommendedTimeout,
        recommendedRetryCount
      };
    }

    setConditions(newConditions);
  }, []);

  useEffect(() => {
    updateNetworkConditions();

    // Listeners para cambios de red
    const handleOnline = () => updateNetworkConditions();
    const handleOffline = () => updateNetworkConditions();
    const handleConnectionChange = () => updateNetworkConditions();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Actualización periódica cada 30 segundos
    const interval = setInterval(updateNetworkConditions, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      clearInterval(interval);
    };
  }, [updateNetworkConditions]);

  return conditions;
};