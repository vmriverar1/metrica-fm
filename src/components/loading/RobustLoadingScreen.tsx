'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface RobustLoadingScreenProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
  showCancelButton?: boolean;
  currentNavigation?: {
    target: string;
    startTime: number;
    attempts: number;
    maxAttempts: number;
  } | null;
}

export default function RobustLoadingScreen({
  isVisible,
  message = 'Cargando...',
  progress = 0,
  onCancel,
  showCancelButton = false,
  currentNavigation
}: RobustLoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto p-6">
          {/* Simple Spinner */}
          <motion.div
            className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Clean Message */}
          <motion.h2
            className="text-lg font-medium text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.h2>

          {/* Simple Progress Bar (only if progress > 0) */}
          {progress > 0 && (
            <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 95)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Cancel Button (solo si se necesita) */}
          {showCancelButton && onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}