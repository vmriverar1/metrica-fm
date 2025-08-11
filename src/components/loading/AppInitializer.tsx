'use client';

import React, { useState, useEffect } from 'react';
import ImmediateLoader from './ImmediateLoader';

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Asegurar que el loader se oculte después de 2 segundos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Fallback adicional por si algo falla
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
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