'use client';

import React, { useState, useEffect } from 'react';
import ImmediateLoader from './ImmediateLoader';

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Forzar que se oculte después de máximo 2 segundos
    const timer = setTimeout(() => {
      console.log('AppInitializer: Ocultando loading después de 2 segundos');
      setIsLoading(false);
    }, 2000);

    // Fallback de emergencia más agresivo
    const emergencyTimer = setTimeout(() => {
      console.log('AppInitializer: EMERGENCY - Forzando ocultar loading');
      setIsLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(emergencyTimer);
    };
  }, []);

  return (
    <>
      {/* Mostrar loader solo si isLoading es true */}
      {isLoading && <ImmediateLoader />}
      
      {/* Mostrar contenido solo si isLoading es false */}
      {!isLoading && children}
    </>
  );
}