'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function InitialPageLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    // Solo mostrar en la primera carga o cuando cambia la ruta
    const shouldShow = !hasShownOnce || window.performance?.navigation?.type === 1;
    
    if (shouldShow) {
      setIsVisible(true);
      setHasShownOnce(true);

      // Ocultar después de 2 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasShownOnce]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <div className="relative">
            {/* Logo central */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <Image
                src="/img/logo-color.webp"
                alt="Métrica FM"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Spinner circular alrededor del logo */}
            <motion.div
              className="absolute inset-0 -m-8"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#007bc4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#007bc4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#003F6F" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#spinner-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="75"
                />
              </svg>
            </motion.div>

            {/* Segundo spinner más pequeño */}
            <motion.div
              className="absolute inset-0 -m-4"
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#003F6F"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset="55"
                  opacity="0.3"
                />
              </svg>
            </motion.div>

            {/* Puntos orbitando */}
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px',
                }}
                animate={{
                  x: [0, 60 * Math.cos((index * 90) * Math.PI / 180), 0],
                  y: [0, 60 * Math.sin((index * 90) * Math.PI / 180), 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Texto de carga opcional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute bottom-20 text-center"
          >
            <p className="text-sm text-gray-600 font-medium">
              Cargando experiencia...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}