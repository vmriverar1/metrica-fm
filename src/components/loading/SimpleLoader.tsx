'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SimpleLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-ocultar después de 2 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Image
          src="/img/logo-color.webp"
          alt="Métrica FM"
          width={120}
          height={120}
          priority
        />
        <div style={{ marginTop: '20px', color: '#003F6F' }}>
          Cargando...
        </div>
      </div>
    </div>
  );
}