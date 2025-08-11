'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Mostrar loader en la carga inicial
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // Solo en el montaje inicial

  useEffect(() => {
    // Mostrar loader cuando cambia la ruta
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]); // Cuando cambia la ruta

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white"
        >
          <div className="relative">
            {/* Logo central con animación de pulso */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: 1 
              }}
              transition={{ 
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 0.5
                }
              }}
              className="relative z-10 flex items-center justify-center"
            >
              <Image
                src="/img/logo-color.png"
                alt="Métrica DIP"
                width={140}
                height={140}
                className="object-contain drop-shadow-lg"
                priority
              />
            </motion.div>

            {/* Spinner principal */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg
                width="220"
                height="220"
                viewBox="0 0 220 220"
                className="absolute"
              >
                <defs>
                  <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  stroke="url(#loading-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="628"
                  strokeDashoffset="157"
                />
              </svg>
            </motion.div>

            {/* Spinner secundario inverso */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                className="absolute"
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
            </motion.div>

            {/* Anillo de puntos */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-accent rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-90px)`
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Barra de progreso inferior */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </motion.div>

          {/* Texto animado */}
          <motion.div
            className="absolute bottom-24 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.p
              className="text-sm font-medium text-gray-700"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Transformando la infraestructura del Perú
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}