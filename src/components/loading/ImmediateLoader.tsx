'use client';

import React from 'react';
import Image from 'next/image';

export default function ImmediateLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        {/* Logo central */}
        <div 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <Image
            src="/img/logo-color.png"
            alt="Métrica DIP"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        {/* Spinner principal */}
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            animation: 'spin 3s linear infinite'
          }}
        >
          <defs>
            <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E84E0F" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#E84E0F" stopOpacity="1" />
              <stop offset="75%" stopColor="#003F6F" stopOpacity="1" />
              <stop offset="100%" stopColor="#003F6F" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="110"
            cy="110"
            r="100"
            fill="none"
            stroke="url(#loader-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="628"
            strokeDashoffset="157"
          />
        </svg>

        {/* Spinner secundario */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            animation: 'spin-reverse 2s linear infinite'
          }}
        >
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="#003F6F"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="502"
            strokeDashoffset="125"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}