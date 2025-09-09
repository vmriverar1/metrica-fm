'use client';

/**
 * PWA utilities for Métrica FM
 * Provides service worker management, offline capabilities, and app install features
 */

import React, { useEffect, useState, useCallback } from 'react';

// PWA installation management
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private installListeners: Set<(canInstall: boolean) => void> = new Set();
  private updateListeners: Set<(updateAvailable: boolean) => void> = new Set();

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.notifyInstallListeners(true);
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
    });

    // Check for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.notifyUpdateListeners(true);
      });

      // Register service worker
      this.registerServiceWorker();
    }

    // Check display mode
    this.checkDisplayMode();
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateListeners(true);
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private checkDisplayMode(): void {
    const displayMode = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone;
    
    this.isInstalled = displayMode;
  }

  async promptInstall(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string } | null> {
    if (!this.deferredPrompt) {
      return null;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        this.isInstalled = true;
      }
      
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
      
      return choice;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return null;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  onInstallAvailable(callback: (canInstall: boolean) => void): () => void {
    this.installListeners.add(callback);
    // Immediately call with current state
    callback(this.canInstall());
    
    return () => {
      this.installListeners.delete(callback);
    };
  }

  onUpdateAvailable(callback: (updateAvailable: boolean) => void): () => void {
    this.updateListeners.add(callback);
    
    return () => {
      this.updateListeners.delete(callback);
    };
  }

  private notifyInstallListeners(canInstall: boolean): void {
    this.installListeners.forEach(callback => callback(canInstall));
  }

  private notifyUpdateListeners(updateAvailable: boolean): void {
    this.updateListeners.forEach(callback => callback(updateAvailable));
  }

  async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }
}

// React hooks for PWA functionality
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const pwaManager = PWAManager.getInstance();
    setIsInstalled(pwaManager.isAppInstalled());
    
    const unsubscribe = pwaManager.onInstallAvailable(setCanInstall);
    return unsubscribe;
  }, []);

  const promptInstall = useCallback(async () => {
    const pwaManager = PWAManager.getInstance();
    return await pwaManager.promptInstall();
  }, []);

  return {
    canInstall,
    isInstalled,
    promptInstall
  };
}

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const pwaManager = PWAManager.getInstance();
    const unsubscribe = pwaManager.onUpdateAvailable(setUpdateAvailable);
    return unsubscribe;
  }, []);

  const updateApp = useCallback(async () => {
    const pwaManager = PWAManager.getInstance();
    await pwaManager.updateApp();
  }, []);

  return {
    updateAvailable,
    updateApp
  };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    setIsOnline(navigator.onLine);

    // Get connection info if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      setConnectionType(connection.effectiveType || connection.type || 'unknown');

      const updateConnectionInfo = () => {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      };

      connection.addEventListener('change', updateConnectionInfo);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', () => {});
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  };
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  
  if (isOnline) return null;

  return React.createElement('div', {
    className: 'fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-2 z-50',
    role: 'alert',
    'aria-live': 'assertive'
  }, React.createElement('span', {
    className: 'text-sm font-medium'
  }, 'Sin conexión a internet. Algunas funciones pueden no estar disponibles.'));
}

// PWA install prompt component
export function PWAInstallPrompt() {
  const { canInstall, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result) {
      setDismissed(true);
    }
  };

  return React.createElement('div', {
    className: 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-card border rounded-lg shadow-lg p-4 z-50'
  }, React.createElement('div', {
    className: 'flex items-start gap-3'
  }, [
    React.createElement('div', {
      key: 'icon',
      className: 'flex-shrink-0'
    }, React.createElement('div', {
      className: 'w-10 h-10 bg-primary rounded-lg flex items-center justify-center'
    }, React.createElement('span', {
      className: 'text-primary-foreground font-bold text-sm'
    }, 'M'))),
    React.createElement('div', {
      key: 'content',
      className: 'flex-1 min-w-0'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-sm font-semibold text-card-foreground'
      }, 'Instalar Métrica FM'),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm text-muted-foreground mt-1'
      }, 'Accede más rápido a nuestros servicios instalando la app'),
      React.createElement('div', {
        key: 'buttons',
        className: 'flex gap-2 mt-3'
      }, [
        React.createElement('button', {
          key: 'install',
          onClick: handleInstall,
          className: 'bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors'
        }, 'Instalar'),
        React.createElement('button', {
          key: 'dismiss',
          onClick: () => setDismissed(true),
          className: 'text-muted-foreground px-3 py-1 rounded text-sm hover:text-foreground transition-colors'
        }, 'Ahora no')
      ])
    ])
  ]));
}

// PWA update prompt component
export function PWAUpdatePrompt() {
  const { updateAvailable, updateApp } = usePWAUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  const handleUpdate = async () => {
    await updateApp();
    setDismissed(true);
  };

  return React.createElement('div', {
    className: 'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-primary text-primary-foreground rounded-lg shadow-lg p-4 z-50'
  }, React.createElement('div', {
    className: 'flex items-start gap-3'
  }, [
    React.createElement('div', {
      key: 'indicator',
      className: 'flex-shrink-0 mt-0.5'
    }, React.createElement('div', {
      className: 'w-2 h-2 bg-green-400 rounded-full animate-pulse'
    })),
    React.createElement('div', {
      key: 'content',
      className: 'flex-1'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-sm font-semibold'
      }, 'Actualización disponible'),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm opacity-90 mt-1'
      }, 'Nueva versión de Métrica FM lista para instalar'),
      React.createElement('div', {
        key: 'buttons',
        className: 'flex gap-2 mt-3'
      }, [
        React.createElement('button', {
          key: 'update',
          onClick: handleUpdate,
          className: 'bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-white/90 transition-colors'
        }, 'Actualizar'),
        React.createElement('button', {
          key: 'dismiss',
          onClick: () => setDismissed(true),
          className: 'text-white/80 px-3 py-1 rounded text-sm hover:text-white transition-colors'
        }, 'Después')
      ])
    ])
  ]));
}

// Initialize PWA features
export function initializePWA(): void {
  if (typeof window === 'undefined') return;

  // Initialize PWA manager
  PWAManager.getInstance();

  // Add manifest link if not exists
  if (!document.querySelector('link[rel="manifest"]')) {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);
  }

  // Add theme color meta if not exists
  if (!document.querySelector('meta[name="theme-color"]')) {
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#007bc4';
    document.head.appendChild(themeColorMeta);
  }

  // Add apple touch icon if not exists
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/icons/icon-192x192.png';
    document.head.appendChild(appleTouchIcon);
  }
}

export default {
  PWAManager,
  usePWAInstall,
  usePWAUpdate,
  useNetworkStatus,
  OfflineIndicator,
  PWAInstallPrompt,
  PWAUpdatePrompt,
  initializePWA
};