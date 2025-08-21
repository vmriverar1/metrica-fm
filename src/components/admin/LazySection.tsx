'use client';

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Skeleton Components
export const SectionSkeleton: React.FC<{ 
  lines?: number; 
  height?: 'sm' | 'md' | 'lg'; 
  title?: string;
}> = ({ 
  lines = 3, 
  height = 'md',
  title = 'Cargando sección...'
}) => {
  const heightClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
          <Badge variant="outline" className="animate-pulse">
            Cargando...
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`space-y-3 ${heightClasses[height]}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Lazy Section Wrapper
interface LazySectionProps {
  sectionKey: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  estimatedHeight?: 'sm' | 'md' | 'lg';
  fieldCount?: number;
  onVisibilityChange?: (visible: boolean) => void;
  className?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  sectionKey,
  title,
  description,
  priority,
  children,
  isCollapsible = false,
  defaultExpanded = true,
  estimatedHeight = 'md',
  fieldCount = 0,
  onVisibilityChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            onVisibilityChange?.(true);
          }
        });
      },
      {
        rootMargin: '100px', // Cargar 100px antes de entrar en viewport
        threshold: 0.1
      }
    );

    const element = document.getElementById(`lazy-section-${sectionKey}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [sectionKey, hasLoaded, onVisibilityChange]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !hasLoaded) {
      setIsVisible(true);
      setHasLoaded(true);
      onVisibilityChange?.(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div 
      id={`lazy-section-${sectionKey}`}
      className={`lazy-section ${className}`}
      data-section={sectionKey}
      data-priority={priority}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCollapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="w-6 h-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {title}
                  {fieldCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {fieldCount} campos
                    </Badge>
                  )}
                </CardTitle>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(priority)}>
                {getPriorityIcon(priority)} {priority}
              </Badge>
              
              {isCollapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="flex items-center gap-1 text-xs"
                >
                  {isExpanded ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      Mostrar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            {loadError ? (
              // Error State
              <div className="flex items-center justify-center h-32 text-center">
                <div>
                  <div className="text-red-500 text-lg mb-2">⚠️</div>
                  <p className="text-red-600 font-medium">Error cargando sección</p>
                  <p className="text-sm text-gray-500 mt-1">{loadError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setLoadError(null);
                      setIsVisible(true);
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : !isVisible ? (
              // Skeleton State
              <SectionSkeleton 
                height={estimatedHeight} 
                title={`Cargando ${title}...`}
                lines={Math.max(2, Math.ceil(fieldCount / 3))}
              />
            ) : (
              // Loaded Content
              <Suspense 
                fallback={
                  <SectionSkeleton 
                    height={estimatedHeight} 
                    title={`Cargando ${title}...`}
                    lines={Math.max(2, Math.ceil(fieldCount / 3))}
                  />
                }
              >
                <div className="section-content">
                  {children}
                </div>
              </Suspense>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Hook para gestionar secciones lazy
export function useLazySections(sections: string[] = []) {
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const [priorityQueue, setPriorityQueue] = useState<string[]>([]);
  
  const markSectionAsLoaded = (sectionKey: string) => {
    setLoadedSections(prev => new Set([...prev, sectionKey]));
  };
  
  const isLoaded = (sectionKey: string) => {
    return loadedSections.has(sectionKey);
  };
  
  const getLoadingStats = () => {
    return {
      total: sections.length,
      loaded: loadedSections.size,
      pending: sections.length - loadedSections.size,
      percentage: sections.length > 0 ? (loadedSections.size / sections.length) * 100 : 0
    };
  };
  
  const preloadSection = (sectionKey: string) => {
    if (!loadedSections.has(sectionKey)) {
      setPriorityQueue(prev => [sectionKey, ...prev]);
    }
  };
  
  const preloadHighPrioritySections = (highPrioritySections: string[]) => {
    const unloaded = highPrioritySections.filter(section => !loadedSections.has(section));
    setPriorityQueue(prev => [...unloaded, ...prev]);
  };
  
  return {
    loadedSections: Array.from(loadedSections),
    markSectionAsLoaded,
    isLoaded,
    getLoadingStats,
    preloadSection,
    preloadHighPrioritySections,
    priorityQueue
  };
}

// Performance Monitor para secciones lazy
export const LazyLoadingMonitor: React.FC<{ 
  sections: string[];
  onStatsUpdate?: (stats: any) => void;
}> = ({ sections, onStatsUpdate }) => {
  const { getLoadingStats, loadedSections } = useLazySections(sections);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const stats = getLoadingStats();
    onStatsUpdate?.(stats);
    
    // Log performance metrics
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Lazy Loading Stats:', {
        total: stats.total,
        loaded: stats.loaded,
        percentage: `${stats.percentage.toFixed(1)}%`,
        loadedSections
      });
    }
  }, [loadedSections, onStatsUpdate]);
  
  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        📊 Performance
      </Button>
    );
  }
  
  const stats = getLoadingStats();
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border rounded-lg shadow-lg p-3 min-w-48">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Lazy Loading</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="w-4 h-4 p-0"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Secciones cargadas:</span>
          <span className="font-medium">{stats.loaded}/{stats.total}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Progreso:</span>
          <span>{stats.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LazySection;