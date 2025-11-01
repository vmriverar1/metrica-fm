'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after 30 seconds, only if not previously dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 30000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      } else {
        // User dismissed, don't show again for 7 days
        const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString());
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    const dismissedUntil = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 md:max-w-sm z-30 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Instalar Métrica FM
            </h3>
            <p className="text-gray-600 text-xs mb-3">
              Accede más rápido y recibe notificaciones de actualizaciones
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="flex-1 text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="px-2 h-8"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to detect PWA install status
export function usePWAInstallStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const installed = standalone || (navigator as any).standalone === true;

      setIsStandalone(standalone);
      setIsInstalled(installed);
    };

    checkPWAStatus();
    window.addEventListener('resize', checkPWAStatus);

    return () => window.removeEventListener('resize', checkPWAStatus);
  }, []);

  return { isInstalled, isStandalone };
}