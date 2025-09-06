'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Cargando...');

  const loadingMessages = [
    'Cargando...',
    'Preparando contenido...',
    'Optimizando experiencia...',
    'Casi listo...'
  ];

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prevProgress + increment, 95);
        
        // Change loading text based on progress
        if (newProgress >= 75) {
          setLoadingText(loadingMessages[3]);
        } else if (newProgress >= 50) {
          setLoadingText(loadingMessages[2]);
        } else if (newProgress >= 25) {
          setLoadingText(loadingMessages[1]);
        } else {
          setLoadingText(loadingMessages[0]);
        }
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #003F6F 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #007bc4 0%, transparent 50%)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo Container with Spinner */}
        <div className="relative">
          {/* Outer Spinner Ring */}
          <motion.div
            className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              borderWidth: '3px',
              borderTopColor: '#003F6F',
              borderRightColor: 'rgba(0, 63, 111, 0.3)',
              borderBottomColor: 'rgba(0, 63, 111, 0.1)',
              borderLeftColor: 'rgba(0, 63, 111, 0.3)'
            }}
          />

          {/* Middle Spinner Ring */}
          <motion.div
            className="absolute inset-2 w-28 h-28 border-4 border-transparent border-b-accent rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              borderWidth: '2px',
              borderBottomColor: '#007bc4',
              borderLeftColor: 'rgba(0, 123, 196, 0.3)',
              borderTopColor: 'rgba(0, 123, 196, 0.1)',
              borderRightColor: 'rgba(0, 123, 196, 0.3)'
            }}
          />

          {/* Inner Glow Ring */}
          <motion.div
            className="absolute inset-4 w-24 h-24 border border-primary/20 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Logo */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Logo Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/img/logo-color.webp"
                  alt="Métrica FM"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Logo Pulse Effect */}
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.3, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center space-y-4">
          <AnimatePresence mode="wait">
            <motion.h2
              key={loadingText}
              className="text-xl font-semibold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingText}
            </motion.h2>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Progress Percentage */}
          <motion.div
            className="text-sm text-muted-foreground font-medium"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>


        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}