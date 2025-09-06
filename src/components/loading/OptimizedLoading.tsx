'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Briefcase, 
  Users, 
  Search, 
  Clock,
  TrendingUp,
  BookOpen,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResourceOptimization } from '@/hooks/useResourceOptimization';

interface OptimizedLoadingProps {
  type: 'blog' | 'careers' | 'article' | 'job' | 'search';
  message?: string;
  showProgress?: boolean;
  estimatedTime?: number;
  className?: string;
}

interface LoadingVariant {
  icon: React.ReactNode;
  primaryColor: string;
  messages: string[];
  tips: string[];
}

const LOADING_VARIANTS: Record<string, LoadingVariant> = {
  blog: {
    icon: <BookOpen className="w-8 h-8" />,
    primaryColor: 'text-blue-600',
    messages: [
      'Cargando los últimos insights del sector...',
      'Preparando contenido de expertos...',
      'Actualizando tendencias de la industria...',
      'Organizando casos de estudio...'
    ],
    tips: [
      '💡 Tip: Usa los filtros para encontrar contenido específico',
      '📖 Tip: Suscríbete para recibir nuevos artículos',
      '🔍 Tip: Explora diferentes categorías de contenido',
      '⭐ Tip: Guarda tus artículos favoritos'
    ]
  },
  careers: {
    icon: <Briefcase className="w-8 h-8" />,
    primaryColor: 'text-green-600',
    messages: [
      'Buscando las mejores oportunidades...',
      'Analizando posiciones disponibles...',
      'Preparando ofertas de trabajo...',
      'Cargando beneficios y detalles...'
    ],
    tips: [
      '💼 Tip: Completa tu perfil para mejores matches',
      '🎯 Tip: Usa filtros avanzados de búsqueda',
      '📄 Tip: Mantén tu CV actualizado',
      '🔔 Tip: Activa notificaciones de nuevas ofertas'
    ]
  },
  article: {
    icon: <FileText className="w-8 h-8" />,
    primaryColor: 'text-purple-600',
    messages: [
      'Cargando contenido del artículo...',
      'Preparando comentarios y discusión...',
      'Configurando herramientas de lectura...'
    ],
    tips: [
      '📊 Tip: Observa la barra de progreso de lectura',
      '💬 Tip: Participa en los comentarios',
      '📤 Tip: Comparte contenido valioso'
    ]
  },
  job: {
    icon: <Building2 className="w-8 h-8" />,
    primaryColor: 'text-orange-600',
    messages: [
      'Cargando detalles de la posición...',
      'Preparando formulario de aplicación...',
      'Analizando compatibilidad de perfil...'
    ],
    tips: [
      '✅ Tip: Revisa todos los requisitos cuidadosamente',
      '📎 Tip: Ten tu CV listo para aplicar',
      '🎯 Tip: Personaliza tu carta de presentación'
    ]
  },
  search: {
    icon: <Search className="w-8 h-8" />,
    primaryColor: 'text-indigo-600',
    messages: [
      'Buscando contenido relevante...',
      'Procesando filtros avanzados...',
      'Analizando resultados...',
      'Ordenando por relevancia...'
    ],
    tips: [
      '🔍 Tip: Usa palabras clave específicas',
      '📊 Tip: Aplica filtros para refinar resultados',
      '⏱️ Tip: Guarda búsquedas frecuentes'
    ]
  }
};

export default function OptimizedLoading({ 
  type, 
  message, 
  showProgress = true,
  estimatedTime = 2000,
  className 
}: OptimizedLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const { connectionType, saveData } = useResourceOptimization();
  
  const variant = LOADING_VARIANTS[type] || LOADING_VARIANTS.blog;
  
  // Adjust loading behavior based on connection
  const shouldShowAnimations = !saveData && !['slow-2g', '2g'].includes(connectionType);
  const adjustedTime = ['slow-2g', '2g'].includes(connectionType) ? estimatedTime * 1.5 : estimatedTime;

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (adjustedTime / 50); // Update every 50ms
        return Math.min(prev + increment, 95);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [showProgress, adjustedTime]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % variant.messages.length);
    }, 1500);

    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % variant.tips.length);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(tipInterval);
    };
  }, [variant]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] p-8 space-y-6",
      className
    )}>
      {/* Main Loading Icon */}
      <div className="relative">
        <motion.div
          className={cn("p-4 rounded-full bg-muted/50", variant.primaryColor)}
          animate={shouldShowAnimations ? {
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {variant.icon}
        </motion.div>
        
        {/* Spinning border */}
        {shouldShowAnimations && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-t-transparent border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.h3
            key={currentMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg font-semibold text-foreground"
          >
            {message || variant.messages[currentMessage]}
          </motion.h3>
        </AnimatePresence>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~{Math.ceil((adjustedTime * (100 - progress)) / 100 / 1000)}s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Tip */}
      <div className="max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTip}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3"
          >
            {variant.tips[currentTip]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Connection Status (for slow connections) */}
      {['slow-2g', '2g', '3g'].includes(connectionType) && (
        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-yellow-50 text-yellow-700 rounded-lg px-3 py-1">
          <TrendingUp className="w-3 h-3" />
          <span>
            Detectamos una conexión lenta ({connectionType.toUpperCase()}). 
            Optimizando la carga...
          </span>
        </div>
      )}

      {/* Skeleton Content Preview */}
      {type === 'blog' && (
        <div className="w-full max-w-md space-y-3 opacity-50">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      )}

      {type === 'careers' && (
        <div className="w-full max-w-md space-y-3 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
      )}
    </div>
  );
}

// Specialized loading components
export function BlogLoadingState({ className }: { className?: string }) {
  return (
    <OptimizedLoading 
      type="blog" 
      className={className}
      estimatedTime={1500}
    />
  );
}

export function CareersLoadingState({ className }: { className?: string }) {
  return (
    <OptimizedLoading 
      type="careers" 
      className={className}
      estimatedTime={2000}
    />
  );
}

export function ArticleLoadingState({ className }: { className?: string }) {
  return (
    <OptimizedLoading 
      type="article" 
      className={className}
      estimatedTime={1000}
      message="Cargando artículo completo..."
    />
  );
}

export function JobLoadingState({ className }: { className?: string }) {
  return (
    <OptimizedLoading 
      type="job" 
      className={className}
      estimatedTime={1200}
      message="Cargando detalles de la posición..."
    />
  );
}

export function SearchLoadingState({ 
  query, 
  className 
}: { 
  query?: string;
  className?: string;
}) {
  const message = query ? `Buscando: "${query}"...` : undefined;
  
  return (
    <OptimizedLoading 
      type="search" 
      message={message}
      className={className}
      estimatedTime={800}
    />
  );
}

// Loading wrapper with error boundary
export function LoadingWrapper({ 
  children, 
  loading, 
  error, 
  type,
  fallback
}: {
  children: React.ReactNode;
  loading: boolean;
  error?: string | null;
  type: 'blog' | 'careers' | 'article' | 'job' | 'search';
  fallback?: React.ReactNode;
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
        <div className="text-red-500 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-foreground">Error al cargar contenido</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (loading) {
    return fallback || <OptimizedLoading type={type} />;
  }

  return <>{children}</>;
}