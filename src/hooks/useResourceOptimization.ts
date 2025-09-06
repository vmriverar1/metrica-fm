'use client';

import { useState, useEffect } from 'react';

interface ResourceOptimizationHook {
  connectionType: string;
  saveData: boolean;
}

export function useResourceOptimization(): ResourceOptimizationHook {
  const [connectionType, setConnectionType] = useState('4g');
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    // Check if the browser supports Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Set initial connection type
      if (connection?.effectiveType) {
        setConnectionType(connection.effectiveType);
      }

      // Set initial save data preference
      if (connection?.saveData !== undefined) {
        setSaveData(connection.saveData);
      }

      // Listen for connection changes
      const handleConnectionChange = () => {
        if (connection?.effectiveType) {
          setConnectionType(connection.effectiveType);
        }
        if (connection?.saveData !== undefined) {
          setSaveData(connection.saveData);
        }
      };

      connection?.addEventListener('change', handleConnectionChange);

      return () => {
        connection?.removeEventListener('change', handleConnectionChange);
      };
    }

    // Fallback: Check if user has enabled data saver in browser
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection?.saveData) {
        setSaveData(true);
      }
    }
  }, []);

  return {
    connectionType,
    saveData
  };
}