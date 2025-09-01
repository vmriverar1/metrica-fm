'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { useNetworkDetection } from './useNetworkDetection';

interface NavigationState {
  isNavigating: boolean;
  currentNavigation: {
    target: string;
    startTime: number;
    attempts: number;
    maxAttempts: number;
    timeout: number;
  } | null;
  navigationQueue: string[];
  setNavigating: (navigating: boolean) => void;
  setCurrentNavigation: (navigation: NavigationState['currentNavigation']) => void;
  addToQueue: (href: string) => void;
  removeFromQueue: (href: string) => void;
  clearQueue: () => void;
}

// Store global para el estado de navegación
const useNavigationStore = create<NavigationState>((set, get) => ({
  isNavigating: false,
  currentNavigation: null,
  navigationQueue: [],
  setNavigating: (navigating: boolean) => set({ isNavigating: navigating }),
  setCurrentNavigation: (navigation) => set({ currentNavigation: navigation }),
  addToQueue: (href: string) => {
    const state = get();
    if (!state.navigationQueue.includes(href)) {
      set({ navigationQueue: [...state.navigationQueue, href] });
    }
  },
  removeFromQueue: (href: string) => {
    const state = get();
    set({ navigationQueue: state.navigationQueue.filter(q => q !== href) });
  },
  clearQueue: () => set({ navigationQueue: [] })
}));

interface LoadingCallbacks {
  onStart?: (message: string) => void;
  onProgress?: (progress: number, message: string) => void;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const useRobustNavigation = (callbacks?: LoadingCallbacks) => {
  const router = useRouter();
  const pathname = usePathname();
  const networkConditions = useNetworkDetection();
  
  const {
    isNavigating,
    currentNavigation,
    navigationQueue,
    setNavigating,
    setCurrentNavigation,
    addToQueue,
    removeFromQueue,
    clearQueue
  } = useNavigationStore();

  // Refs para evitar efectos secundarios
  const lastPathnameRef = useRef(pathname);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timers
  const clearTimers = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Detectar cambios de ruta exitosos
  useEffect(() => {
    if (lastPathnameRef.current !== pathname && isNavigating && currentNavigation) {
      // Navegación exitosa
      clearTimers();
      setNavigating(false);
      setCurrentNavigation(null);
      removeFromQueue(currentNavigation.target);
      
      callbacks?.onSuccess?.('Página cargada correctamente');
      callbacks?.onComplete?.();
      
      // Procesar siguiente en la cola si existe
      const remainingQueue = navigationQueue.filter(q => q !== currentNavigation.target);
      if (remainingQueue.length > 0) {
        setTimeout(() => {
          navigateWithRetry(remainingQueue[0], `Cargando ${remainingQueue[0]}...`);
        }, 100);
      }
    }
    lastPathnameRef.current = pathname;
  }, [pathname, isNavigating, currentNavigation, navigationQueue, callbacks, clearTimers]);

  // Función de progreso simulado inteligente
  const simulateProgress = useCallback((duration: number, startProgress: number = 0) => {
    let progress = startProgress;
    const steps = networkConditions.isSlowConnection ? 15 : 25; // Menos pasos en conexión lenta
    const interval = duration / steps;
    
    const messages = networkConditions.isSlowConnection ? [
      'Conectando...',
      'Carga lenta detectada...',
      'Optimizando contenido...',
      'Preparando página...',
      'Casi listo...'
    ] : [
      'Cargando...',
      'Preparando contenido...',
      'Optimizando recursos...',
      'Finalizando...'
    ];

    progressIntervalRef.current = setInterval(() => {
      progress += (100 - startProgress) / steps;
      progress = Math.min(progress, 95); // No llegar al 100% hasta que termine realmente
      
      const messageIndex = Math.floor((progress / 100) * messages.length);
      const message = messages[Math.min(messageIndex, messages.length - 1)];
      
      callbacks?.onProgress?.(progress, message);
    }, interval);
  }, [networkConditions.isSlowConnection, callbacks]);

  // Función principal de navegación con retry
  const navigateWithRetry = useCallback(async (
    href: string,
    loadingMessage: string = 'Navegando...',
    retryAttempt: number = 0
  ): Promise<boolean> => {
    // Si ya estamos navegando a la misma URL, no hacer nada
    if (isNavigating && currentNavigation?.target === href) {
      return false;
    }

    // Si estamos navegando a otra URL, agregarla a la cola
    if (isNavigating && currentNavigation?.target !== href) {
      addToQueue(href);
      return false;
    }

    // Limpiar timers previos
    clearTimers();

    const maxAttempts = networkConditions.recommendedRetryCount;
    const timeout = networkConditions.recommendedTimeout;

    // Configurar estado de navegación
    const navigationConfig = {
      target: href,
      startTime: Date.now(),
      attempts: retryAttempt + 1,
      maxAttempts,
      timeout
    };

    setNavigating(true);
    setCurrentNavigation(navigationConfig);

    callbacks?.onStart?.(
      networkConditions.isSlowConnection 
        ? `${loadingMessage} (Conexión lenta detectada)` 
        : loadingMessage
    );

    // Simular progreso basado en velocidad de red
    simulateProgress(timeout * 0.8); // 80% del tiempo timeout

    try {
      // Intentar navegación
      router.push(href);
      
      // Timeout basado en condiciones de red
      navigationTimeoutRef.current = setTimeout(async () => {
        // Si llegamos aquí, la navegación no se completó en tiempo esperado
        callbacks?.onProgress?.(50, 'Tiempo de espera agotado...');
        
        if (retryAttempt < maxAttempts) {
          // Reintentar
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000); // Backoff exponencial
          callbacks?.onProgress?.(60, `Reintentando en ${Math.ceil(delay/1000)}s...`);
          
          retryTimeoutRef.current = setTimeout(() => {
            navigateWithRetry(href, loadingMessage, retryAttempt + 1);
          }, delay);
        } else {
          // Máximo de intentos alcanzado
          clearTimers();
          setNavigating(false);
          setCurrentNavigation(null);
          removeFromQueue(href);
          
          callbacks?.onError?.('No se pudo cargar la página. Verifica tu conexión.');
          callbacks?.onComplete?.();
        }
      }, timeout);

      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      
      clearTimers();
      setNavigating(false);
      setCurrentNavigation(null);
      removeFromQueue(href);
      
      callbacks?.onError?.('Error de navegación. Inténtalo nuevamente.');
      callbacks?.onComplete?.();
      
      return false;
    }
  }, [
    isNavigating,
    currentNavigation,
    networkConditions,
    router,
    callbacks,
    clearTimers,
    simulateProgress,
    setNavigating,
    setCurrentNavigation,
    addToQueue,
    removeFromQueue
  ]);

  // Cancelar navegación actual
  const cancelNavigation = useCallback(() => {
    clearTimers();
    setNavigating(false);
    setCurrentNavigation(null);
    clearQueue();
    callbacks?.onComplete?.();
  }, [clearTimers, setNavigating, setCurrentNavigation, clearQueue, callbacks]);

  // Handler para clicks en enlaces
  const handleLinkClick = useCallback((
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    message?: string
  ) => {
    // Solo para clicks normales en rutas internas
    if (
      event.button === 0 && 
      !event.ctrlKey && 
      !event.metaKey && 
      !event.shiftKey && 
      !event.altKey &&
      href.startsWith('/') &&
      !href.includes('#') &&
      href !== pathname // No navegar a la misma página
    ) {
      event.preventDefault();
      navigateWithRetry(href, message || `Navegando a ${href}...`);
    }
  }, [navigateWithRetry, pathname]);

  // Prefetch inteligente basado en condiciones de red
  const smartPrefetch = useCallback((href: string) => {
    if (networkConditions.speed === 'fast' && !networkConditions.isSlowConnection) {
      router.prefetch(href);
    }
  }, [router, networkConditions]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    // Estado
    isNavigating,
    currentNavigation,
    navigationQueue,
    networkConditions,
    
    // Acciones
    navigateWithRetry,
    cancelNavigation,
    handleLinkClick,
    smartPrefetch,
    
    // Utilidades
    clearQueue,
    canNavigate: !isNavigating || (navigationQueue.length === 0)
  };
};