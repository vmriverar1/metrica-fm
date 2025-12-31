'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

/**
 * Componente que maneja la limpieza y reinicio de animaciones GSAP
 * cuando el usuario navega usando back/forward del navegador.
 *
 * Problema: Next.js App Router usa navegación del cliente que no desmonta
 * completamente los componentes, causando que ScrollTrigger quede en estados
 * inconsistentes. Además, el bfcache (back-forward cache) del navegador
 * puede restaurar páginas sin ejecutar JavaScript.
 *
 * Solución: Detectar navegación popstate Y restauración desde bfcache,
 * forzando recarga completa para reiniciar todas las animaciones.
 */
export default function GSAPNavigationHandler() {
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);
  const isPopstateRef = useRef(false);

  useEffect(() => {
    // Registrar ScrollTrigger si no está registrado
    if (typeof window !== 'undefined' && !ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Handler para detectar navegación back/forward
    const handlePopstate = () => {
      console.log('[GSAP] Popstate detectado - navegación back/forward');
      isPopstateRef.current = true;
      window.location.reload();
    };

    // Handler para detectar restauración desde bfcache (back-forward cache)
    // Este evento se dispara cuando la página se muestra, incluyendo
    // cuando se restaura desde el caché del navegador
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true significa que la página fue restaurada desde bfcache
      if (event.persisted) {
        console.log('[GSAP] Página restaurada desde bfcache - forzando recarga');
        window.location.reload();
      }
    };

    // Handler para antes de que la página entre en bfcache
    // Limpiamos el estado para evitar problemas
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('[GSAP] Página entrando en bfcache - limpiando ScrollTrigger');
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };

    // Escuchar eventos
    window.addEventListener('popstate', handlePopstate);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Limpiar ScrollTrigger cuando cambia la ruta (navegación normal)
  useEffect(() => {
    if (lastPathRef.current !== pathname && !isPopstateRef.current) {
      console.log('[GSAP] Cambio de ruta detectado:', lastPathRef.current, '->', pathname);

      // Limpiar todas las instancias de ScrollTrigger de la página anterior
      ScrollTrigger.getAll().forEach(trigger => {
        trigger.kill();
      });

      // Refrescar ScrollTrigger para la nueva página
      ScrollTrigger.refresh();

      lastPathRef.current = pathname;
    }

    isPopstateRef.current = false;
  }, [pathname]);

  return null; // Este componente no renderiza nada
}
