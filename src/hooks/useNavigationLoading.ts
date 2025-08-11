'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoading } from './useGlobalLoading';
import { useEffect, useRef } from 'react';

export function useNavigationLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const { showLoading, hideLoading } = useGlobalLoading();
  const currentPath = useRef(pathname);
  const isNavigatingRef = useRef(false);

  // Detectar cambios de ruta y ocultar loading
  useEffect(() => {
    if (isNavigatingRef.current && currentPath.current !== pathname) {
      // La ruta ha cambiado y estábamos navegando
      const timer = setTimeout(() => {
        hideLoading();
        isNavigatingRef.current = false;
      }, 800); // Pequeño delay para que la página termine de cargar
      
      currentPath.current = pathname;
      return () => clearTimeout(timer);
    }
    currentPath.current = pathname;
  }, [pathname, hideLoading]);

  const navigateWithLoading = async (href: string, message: string = 'Cargando página...') => {
    // Marcar que estamos navegando
    isNavigatingRef.current = true;
    
    // Mostrar loading inmediatamente
    showLoading(message);
    
    // Navegar
    router.push(href);
    
    // Backup: ocultar después de tiempo máximo si algo falla
    setTimeout(() => {
      if (isNavigatingRef.current) {
        hideLoading();
        isNavigatingRef.current = false;
      }
    }, 5000); // 5 segundos máximo
  };

  const handleLinkClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    message?: string
  ) => {
    // Solo manejar clicks izquierdos normales (no Ctrl+click, etc.)
    if (
      event.button === 0 && 
      !event.ctrlKey && 
      !event.metaKey && 
      !event.shiftKey && 
      !event.altKey &&
      href.startsWith('/') && // Solo para rutas internas
      !href.includes('#') // No para anchors
    ) {
      event.preventDefault();
      await navigateWithLoading(href, message);
    }
  };

  return {
    navigateWithLoading,
    handleLinkClick,
    showLoading,
    hideLoading
  };
}