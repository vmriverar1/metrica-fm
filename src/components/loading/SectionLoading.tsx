'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SectionLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export default function SectionLoading({ 
  message = 'Cargando contenido...', 
  size = 'medium',
  showProgress = false,
  progress = 0,
  className = ''
}: SectionLoadingProps) {
  const sizeClasses = {
    small: {
      container: 'w-16 h-16',
      logo: 'w-8 h-8',
      text: 'text-sm',
      spacing: 'space-y-3'
    },
    medium: {
      container: 'w-24 h-24',
      logo: 'w-12 h-12',
      text: 'text-base',
      spacing: 'space-y-4'
    },
    large: {
      container: 'w-32 h-32',
      logo: 'w-16 h-16',
      text: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${currentSize.spacing} ${className}`}>
      {/* Logo Container with Spinner */}
      <div className="relative">
        {/* Spinner Ring */}
        <motion.div
          className={`absolute inset-0 ${currentSize.container} border-2 border-transparent border-t-primary rounded-full`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            borderTopColor: '#003F6F',
            borderRightColor: 'rgba(0, 63, 111, 0.2)',
          }}
        />

        {/* Counter Spinner */}
        <motion.div
          className={`absolute inset-1 border border-transparent border-b-accent rounded-full`}
          style={{
            width: `calc(100% - 8px)`,
            height: `calc(100% - 8px)`,
            borderBottomColor: '#00A8E8',
            borderLeftColor: 'rgba(0, 168, 232, 0.2)',
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Logo */}
        <div className={`relative ${currentSize.container} flex items-center justify-center`}>
          <motion.div
            className={`${currentSize.logo} relative`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/img/logo-color.webp"
              alt="Métrica FM"
              width={size === 'large' ? 48 : size === 'medium' ? 32 : 24}
              height={size === 'large' ? 48 : size === 'medium' ? 32 : 24}
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Loading Text */}
      <motion.p
        className={`${currentSize.text} text-muted-foreground text-center font-medium`}
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>

      {/* Progress Bar (optional) */}
      {showProgress && (
        <div className="w-full max-w-xs space-y-2">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
}

// Specific loading components for different sections
export function ServiceLoading() {
  return (
    <SectionLoading 
      message="Cargando servicios..." 
      size="medium"
      className="min-h-[400px]"
    />
  );
}

export function ProjectLoading() {
  return (
    <SectionLoading 
      message="Cargando proyectos..." 
      size="medium"
      className="min-h-[300px]"
    />
  );
}

export function BlogLoading() {
  return (
    <SectionLoading 
      message="Cargando artículos..." 
      size="medium"
      className="min-h-[350px]"
    />
  );
}

export function CareerLoading() {
  return (
    <SectionLoading 
      message="Cargando oportunidades..." 
      size="medium"
      className="min-h-[400px]"
    />
  );
}

// Inline loading spinner for buttons or small components
export function InlineLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <motion.div
        className="w-4 h-4 border-2 border-transparent border-t-current rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}