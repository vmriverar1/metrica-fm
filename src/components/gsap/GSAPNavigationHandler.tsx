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
 * inconsistentes.
 *
 * Solución: Detectar navegación popstate y forzar recarga completa de la página
 * para asegurar que todas las animaciones se inicialicen correctamente.
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

      // Forzar recarga completa para reiniciar todas las animaciones
      // Esto es necesario porque GSAP/ScrollTrigger no se reinicia correctamente
      // con la navegación del cliente de Next.js
      window.location.reload();
    };

    // Escuchar evento popstate (back/forward del navegador)
    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
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
