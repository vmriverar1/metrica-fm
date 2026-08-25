'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

/**
 * Reinicia las animaciones GSAP al navegar con back/forward.
 * La navegación de cliente del App Router no desmonta los componentes y el
 * bfcache restaura la página sin ejecutar JS, dejando ScrollTrigger
 * inconsistente; se detecta popstate y bfcache y se fuerza recarga.
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
      isPopstateRef.current = true;
      window.location.reload();
    };

    // Handler para detectar restauración desde bfcache (back-forward cache)
    // Este evento se dispara cuando la página se muestra, incluyendo
    // cuando se restaura desde el caché del navegador
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true significa que la página fue restaurada desde bfcache
      if (event.persisted) {
        window.location.reload();
      }
    };

    // Handler para antes de que la página entre en bfcache
    // Limpiamos el estado para evitar problemas
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
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
