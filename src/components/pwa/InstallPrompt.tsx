'use client';

// FASE 4C: PWA Install Prompt Component
// Componente para mostrar prompt de instalación de PWA

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay, only if not dismissed before
      const dismissedBefore = localStorage.getItem('pwa-install-dismissed');
      const installCount = localStorage.getItem('pwa-install-shown-count') || '0';

      if (!dismissedBefore && parseInt(installCount) < 3) {
        setTimeout(() => {
          setShowInstallPrompt(true);
          localStorage.setItem('pwa-install-shown-count', (parseInt(installCount) + 1).toString());
        }, 10000); // Show after 10 seconds
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS or other platforms
      setShowInstallPrompt(false);
      setShowManualInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const renderIOSInstructions = () => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Instalar Métrica FM</h3>
        <button
          onClick={() => setShowManualInstructions(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
            1
          </div>
          <div>
            Toca el botón <strong>Compartir</strong> en la parte inferior de Safari
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
            2
          </div>
          <div>
            Busca y toca <strong>"Agregar a pantalla de inicio"</strong>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
            3
          </div>
          <div>
            Confirma tocando <strong>"Agregar"</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Don't show if already installed
  if (isInstalled) return null;

  // Manual instructions for iOS
  if (showManualInstructions && platform === 'ios') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {renderIOSInstructions()}
      </div>
    );
  }

  // Main install prompt
  if (!showInstallPrompt) return null;

  const getIcon = () => {
    switch (platform) {
      case 'ios':
        return <Smartphone className="w-6 h-6" />;
      case 'android':
        return <Smartphone className="w-6 h-6" />;
      case 'desktop':
        return <Monitor className="w-6 h-6" />;
      default:
        return <Download className="w-6 h-6" />;
    }
  };

  const getInstallText = () => {
    switch (platform) {
      case 'ios':
        return 'Agregar a pantalla de inicio';
      case 'android':
        return 'Instalar aplicación';
      case 'desktop':
        return 'Instalar en escritorio';
      default:
        return 'Instalar aplicación';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              Instala Métrica FM
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Accede más rápido a nuestros servicios de ingeniería y construcción
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                {getInstallText()}
              </button>

              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to check PWA installation status
export function usePWAInstallStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return { isInstalled, canInstall };
}

// Utility to trigger install programmatically
export function triggerPWAInstall() {
  const event = new CustomEvent('show-pwa-install');
  window.dispatchEvent(event);
}