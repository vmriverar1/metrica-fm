'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useNetworkDetection } from '@/hooks/useNetworkDetection';

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
  const networkConditions = useNetworkDetection();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Calcular tiempo transcurrido
  useEffect(() => {
    if (!isVisible || !currentNavigation) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - currentNavigation.startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, currentNavigation]);

  // Mostrar detalles automáticamente si toma mucho tiempo
  useEffect(() => {
    if (elapsedTime > 3000) { // Después de 3 segundos
      setShowDetails(true);
    }
  }, [elapsedTime]);

  if (!isVisible) return null;

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getNetworkIcon = () => {
    if (!networkConditions.isOnline) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    if (networkConditions.isSlowConnection) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    return <Wifi className="h-5 w-5 text-green-500" />;
  };

  const getNetworkStatusText = () => {
    if (!networkConditions.isOnline) {
      return 'Sin conexión a Internet';
    }
    if (networkConditions.isSlowConnection) {
      return `Conexión lenta (${networkConditions.effectiveType.toUpperCase()})`;
    }
    return `Conexión ${networkConditions.speed} (${networkConditions.effectiveType.toUpperCase()})`;
  };

  const getProgressColor = () => {
    if (elapsedTime > networkConditions.recommendedTimeout) {
      return 'from-red-500 to-orange-500';
    }
    if (networkConditions.isSlowConnection) {
      return 'from-orange-500 to-yellow-500';
    }
    return 'from-primary to-accent';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #003F6F 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #E84E0F 0%, transparent 50%)`,
              backgroundSize: '100px 100px'
            }}
          />
        </div>

        {/* Main Loading Container */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto p-6">
          {/* Logo Container with Spinner */}
          <div className="relative">
            {/* Adaptive Spinner based on network speed */}
            <motion.div
              className="absolute inset-0 w-32 h-32 border-4 border-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: networkConditions.isSlowConnection ? 3 : 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                borderWidth: '3px',
                borderTopColor: elapsedTime > networkConditions.recommendedTimeout ? '#EF4444' : '#003F6F',
                borderRightColor: 'rgba(0, 63, 111, 0.3)',
                borderBottomColor: 'rgba(0, 63, 111, 0.1)',
                borderLeftColor: 'rgba(0, 63, 111, 0.3)'
              }}
            />

            {/* Logo */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <motion.div
                className="w-20 h-20 relative"
                animate={{ 
                  scale: networkConditions.isSlowConnection ? [1, 0.95, 1] : [1, 1.05, 1],
                  opacity: elapsedTime > networkConditions.recommendedTimeout ? [1, 0.7, 1] : 1
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/img/logo-color.png"
                  alt="Métrica DIP"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="flex flex-col items-center space-y-4 w-full">
            <AnimatePresence mode="wait">
              <motion.h2
                key={message}
                className={`text-xl font-semibold text-center ${
                  elapsedTime > networkConditions.recommendedTimeout 
                    ? 'text-orange-600' 
                    : 'text-foreground'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {message}
              </motion.h2>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="w-80 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 95)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Progress Info */}
            <div className="flex items-center justify-between w-80 text-sm">
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
              <span className="text-muted-foreground">
                {formatTime(elapsedTime)}
              </span>
            </div>

            {/* Network Status */}
            <motion.div
              className="flex items-center space-x-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {getNetworkIcon()}
              <span>{getNetworkStatusText()}</span>
            </motion.div>

            {/* Retry Information */}
            {currentNavigation && currentNavigation.attempts > 1 && (
              <motion.div
                className="text-sm text-orange-600 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Intento {currentNavigation.attempts} de {currentNavigation.maxAttempts}
              </motion.div>
            )}

            {/* Slow Connection Warning */}
            {networkConditions.isSlowConnection && (
              <motion.div
                className="text-sm text-orange-600 text-center max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                ⚠️ Conexión lenta detectada. La carga puede tomar más tiempo.
              </motion.div>
            )}

            {/* Details Toggle */}
            {showDetails && (
              <motion.button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-muted-foreground underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {showDetails ? 'Ocultar detalles' : 'Ver detalles técnicos'}
              </motion.button>
            )}

            {/* Technical Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg w-full"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div>Velocidad: {networkConditions.downlink.toFixed(1)} Mbps</div>
                  <div>Latencia: {networkConditions.rtt}ms</div>
                  <div>Tipo: {networkConditions.effectiveType.toUpperCase()}</div>
                  {currentNavigation && (
                    <div>Destino: {currentNavigation.target}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cancel Button */}
            {showCancelButton && onCancel && (
              <motion.button
                onClick={onCancel}
                className="mt-4 px-4 py-2 text-sm border border-muted-foreground rounded-lg hover:bg-muted transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Cancelar
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}