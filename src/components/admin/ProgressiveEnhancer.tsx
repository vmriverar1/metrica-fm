'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  Layers, 
  Zap, 
  CheckCircle, 
  Clock, 
  Settings, 
  Gauge,
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Niveles de enhancement
export type EnhancementLevel = 'core' | 'enhanced' | 'advanced';

// Configuración de features por nivel
interface FeatureConfig {
  level: EnhancementLevel;
  name: string;
  description: string;
  enabled: boolean;
  loading: boolean;
  error?: string;
  dependencies?: string[];
  performance: {
    priority: number; // 1-10, 10 = crítico
    loadTime: number; // tiempo estimado de carga en ms
    memoryImpact: 'low' | 'medium' | 'high';
  };
}

interface ProgressiveEnhancementConfig {
  features: Record<string, FeatureConfig>;
  maxConcurrentLoads: number;
  enableAutoUpgrade: boolean;
  performanceThresholds: {
    cpu: number;
    memory: number;
    network: 'fast' | 'slow' | 'unknown';
  };
}

// Context para Progressive Enhancement
interface ProgressiveContextType {
  config: ProgressiveEnhancementConfig;
  updateFeature: (featureId: string, updates: Partial<FeatureConfig>) => void;
  isFeatureEnabled: (featureId: string) => boolean;
  isFeatureLoaded: (featureId: string) => boolean;
  loadFeature: (featureId: string) => Promise<void>;
  unloadFeature: (featureId: string) => void;
  getActiveLevel: () => EnhancementLevel;
}

const ProgressiveContext = createContext<ProgressiveContextType | null>(null);

// Configuración por defecto de features para home.json
const DEFAULT_FEATURES: Record<string, FeatureConfig> = {
  // CORE: Funcionalidad básica esencial
  'basic-editing': {
    level: 'core',
    name: 'Edición Básica',
    description: 'Campos de texto simples y controles básicos',
    enabled: true,
    loading: false,
    performance: {
      priority: 10,
      loadTime: 0,
      memoryImpact: 'low'
    }
  },
  'form-validation': {
    level: 'core',
    name: 'Validación de Formularios',
    description: 'Validación básica de campos requeridos',
    enabled: true,
    loading: false,
    performance: {
      priority: 9,
      loadTime: 100,
      memoryImpact: 'low'
    }
  },
  'data-persistence': {
    level: 'core',
    name: 'Persistencia de Datos',
    description: 'Guardado básico de cambios',
    enabled: true,
    loading: false,
    performance: {
      priority: 10,
      loadTime: 50,
      memoryImpact: 'low'
    }
  },

  // ENHANCED: Mejoras de experiencia de usuario
  'smart-validation': {
    level: 'enhanced',
    name: 'Validación Inteligente',
    description: 'Validación en tiempo real con sugerencias',
    enabled: false,
    loading: false,
    dependencies: ['form-validation'],
    performance: {
      priority: 7,
      loadTime: 500,
      memoryImpact: 'medium'
    }
  },
  'preview-system': {
    level: 'enhanced',
    name: 'Sistema de Preview',
    description: 'Vista previa en tiempo real de cambios',
    enabled: false,
    loading: false,
    performance: {
      priority: 6,
      loadTime: 800,
      memoryImpact: 'medium'
    }
  },
  'auto-save': {
    level: 'enhanced',
    name: 'Guardado Automático',
    description: 'Guardado automático cada 30 segundos',
    enabled: false,
    loading: false,
    dependencies: ['data-persistence'],
    performance: {
      priority: 5,
      loadTime: 200,
      memoryImpact: 'low'
    }
  },
  'specialized-editors': {
    level: 'enhanced',
    name: 'Editores Especializados',
    description: 'Componentes especializados para secciones complejas',
    enabled: false,
    loading: false,
    performance: {
      priority: 8,
      loadTime: 1200,
      memoryImpact: 'high'
    }
  },

  // ADVANCED: Herramientas profesionales
  'bulk-operations': {
    level: 'advanced',
    name: 'Operaciones en Lote',
    description: 'Edición masiva de múltiples elementos',
    enabled: false,
    loading: false,
    dependencies: ['specialized-editors'],
    performance: {
      priority: 4,
      loadTime: 600,
      memoryImpact: 'medium'
    }
  },
  'version-control': {
    level: 'advanced',
    name: 'Control de Versiones',
    description: 'Historial y rollback de cambios',
    enabled: false,
    loading: false,
    dependencies: ['data-persistence'],
    performance: {
      priority: 3,
      loadTime: 1000,
      memoryImpact: 'high'
    }
  },
  'backup-system': {
    level: 'advanced',
    name: 'Sistema de Backup',
    description: 'Backups automáticos y restauración',
    enabled: false,
    loading: false,
    dependencies: ['version-control'],
    performance: {
      priority: 2,
      loadTime: 800,
      memoryImpact: 'medium'
    }
  },
  'performance-monitoring': {
    level: 'advanced',
    name: 'Monitoreo de Performance',
    description: 'Métricas en tiempo real y optimización',
    enabled: false,
    loading: false,
    performance: {
      priority: 1,
      loadTime: 1500,
      memoryImpact: 'high'
    }
  },
  'intelligent-caching': {
    level: 'advanced',
    name: 'Cache Inteligente',
    description: 'Sistema de cache con TTL y prioridades',
    enabled: false,
    loading: false,
    performance: {
      priority: 3,
      loadTime: 400,
      memoryImpact: 'medium'
    }
  }
};

// Provider del contexto
export const ProgressiveEnhancementProvider: React.FC<{ 
  children: React.ReactNode;
  initialConfig?: Partial<ProgressiveEnhancementConfig>;
}> = ({ children, initialConfig }) => {
  const [config, setConfig] = useState<ProgressiveEnhancementConfig>({
    features: { ...DEFAULT_FEATURES },
    maxConcurrentLoads: 3,
    enableAutoUpgrade: true,
    performanceThresholds: {
      cpu: 70, // % CPU usage
      memory: 80, // % memory usage
      network: 'fast'
    },
    ...initialConfig
  });

  // Detectar capacidades del dispositivo
  const detectDeviceCapabilities = useCallback(() => {
    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;
    
    return {
      network: connection?.effectiveType === '4g' || connection?.downlink > 10 ? 'fast' : 'slow',
      memory: memory?.jsHeapSizeLimit || 1073741824, // 1GB default
      cores: navigator.hardwareConcurrency || 4
    };
  }, []);

  // Auto-upgrade basado en capacidades del dispositivo
  useEffect(() => {
    if (!config.enableAutoUpgrade) return;

    const capabilities = detectDeviceCapabilities();
    const upgrades: string[] = [];

    // Auto-enable enhanced features on capable devices
    if (capabilities.network === 'fast' && capabilities.cores >= 4) {
      upgrades.push('smart-validation', 'preview-system', 'auto-save', 'specialized-editors');
    }

    // Auto-enable advanced features on high-end devices
    if (capabilities.memory > 4 * 1024 * 1024 * 1024 && capabilities.cores >= 8) { // 4GB+
      upgrades.push('intelligent-caching', 'bulk-operations');
    }

    if (upgrades.length > 0) {
      setTimeout(() => {
        upgrades.forEach(featureId => {
          loadFeature(featureId);
        });
      }, 2000); // Delay para no impactar la carga inicial
    }
  }, [config.enableAutoUpgrade]);

  const updateFeature = useCallback((featureId: string, updates: Partial<FeatureConfig>) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureId]: {
          ...prev.features[featureId],
          ...updates
        }
      }
    }));
  }, []);

  const isFeatureEnabled = useCallback((featureId: string): boolean => {
    return config.features[featureId]?.enabled || false;
  }, [config.features]);

  const isFeatureLoaded = useCallback((featureId: string): boolean => {
    const feature = config.features[featureId];
    return feature?.enabled && !feature?.loading;
  }, [config.features]);

  const loadFeature = useCallback(async (featureId: string): Promise<void> => {
    const feature = config.features[featureId];
    if (!feature || feature.enabled) return;

    // Verificar dependencias
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        if (!isFeatureLoaded(depId)) {
          await loadFeature(depId);
        }
      }
    }

    updateFeature(featureId, { loading: true, error: undefined });

    try {
      // Simular carga de feature
      await new Promise(resolve => setTimeout(resolve, feature.performance.loadTime));
      
      updateFeature(featureId, { enabled: true, loading: false });
      
      console.log(`✅ Feature loaded: ${feature.name}`);
    } catch (error) {
      updateFeature(featureId, { 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      console.error(`❌ Failed to load feature: ${feature.name}`, error);
    }
  }, [config.features, isFeatureLoaded, updateFeature]);

  const unloadFeature = useCallback((featureId: string): void => {
    updateFeature(featureId, { enabled: false, loading: false });
    console.log(`🔻 Feature unloaded: ${config.features[featureId]?.name}`);
  }, [config.features, updateFeature]);

  const getActiveLevel = useCallback((): EnhancementLevel => {
    const enabledFeatures = Object.values(config.features).filter(f => f.enabled);
    
    if (enabledFeatures.some(f => f.level === 'advanced')) return 'advanced';
    if (enabledFeatures.some(f => f.level === 'enhanced')) return 'enhanced';
    return 'core';
  }, [config.features]);

  const contextValue: ProgressiveContextType = {
    config,
    updateFeature,
    isFeatureEnabled,
    isFeatureLoaded,
    loadFeature,
    unloadFeature,
    getActiveLevel
  };

  return (
    <ProgressiveContext.Provider value={contextValue}>
      {children}
    </ProgressiveContext.Provider>
  );
};

// Hook para usar Progressive Enhancement
export const useProgressiveEnhancement = () => {
  const context = useContext(ProgressiveContext);
  if (!context) {
    throw new Error('useProgressiveEnhancement must be used within ProgressiveEnhancementProvider');
  }
  return context;
};

// Componente HOC para cargar features bajo demanda
export const withProgressiveEnhancement = <T extends object>(
  Component: React.ComponentType<T>,
  requiredFeatures: string[] = []
) => {
  return (props: T) => {
    const { isFeatureLoaded, loadFeature } = useProgressiveEnhancement();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const checkFeatures = async () => {
        const loadPromises = requiredFeatures
          .filter(featureId => !isFeatureLoaded(featureId))
          .map(featureId => loadFeature(featureId));
        
        if (loadPromises.length > 0) {
          await Promise.all(loadPromises);
        }
        
        setIsReady(true);
      };

      checkFeatures();
    }, [requiredFeatures.join(',')]);

    if (!isReady) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-600">Cargando características...</span>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Panel de control de Progressive Enhancement
interface ProgressiveControlPanelProps {
  className?: string;
}

export const ProgressiveControlPanel: React.FC<ProgressiveControlPanelProps> = ({
  className = ''
}) => {
  const { 
    config, 
    updateFeature, 
    loadFeature, 
    unloadFeature, 
    getActiveLevel 
  } = useProgressiveEnhancement();

  const [showSettings, setShowSettings] = useState(false);

  const activeLevel = getActiveLevel();
  const featuresByLevel = {
    core: Object.entries(config.features).filter(([, f]) => f.level === 'core'),
    enhanced: Object.entries(config.features).filter(([, f]) => f.level === 'enhanced'),
    advanced: Object.entries(config.features).filter(([, f]) => f.level === 'advanced')
  };

  const getMemoryImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: EnhancementLevel) => {
    switch (level) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'enhanced': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    if (enabled) {
      await loadFeature(featureId);
    } else {
      unloadFeature(featureId);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Progressive Enhancement</h3>
          <p className="text-sm text-gray-600">
            Gestión inteligente de características basada en capacidades del dispositivo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getLevelColor(activeLevel)}>
            Nivel: {activeLevel}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Core</span>
            </div>
            <p className="text-2xl font-bold">
              {featuresByLevel.core.filter(([, f]) => f.enabled).length}/{featuresByLevel.core.length}
            </p>
            <p className="text-xs text-gray-500">Funcionalidad esencial</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">Enhanced</span>
            </div>
            <p className="text-2xl font-bold">
              {featuresByLevel.enhanced.filter(([, f]) => f.enabled).length}/{featuresByLevel.enhanced.length}
            </p>
            <p className="text-xs text-gray-500">Mejoras UX</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-900">Advanced</span>
            </div>
            <p className="text-2xl font-bold">
              {featuresByLevel.advanced.filter(([, f]) => f.enabled).length}/{featuresByLevel.advanced.length}
            </p>
            <p className="text-xs text-gray-500">Herramientas pro</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Management */}
      {Object.entries(featuresByLevel).map(([level, features]) => (
        <Card key={level}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {level === 'core' && <Layers className="w-5 h-5" />}
              {level === 'enhanced' && <Zap className="w-5 h-5" />}
              {level === 'advanced' && <Gauge className="w-5 h-5" />}
              {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map(([featureId, feature]) => (
                <div key={featureId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{feature.name}</span>
                      <Badge className={getMemoryImpactColor(feature.performance.memoryImpact)}>
                        {feature.performance.memoryImpact}
                      </Badge>
                      {feature.dependencies && (
                        <Badge variant="outline" className="text-xs">
                          Deps: {feature.dependencies.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    {feature.error && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">{feature.error}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {feature.loading && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    
                    <Switch
                      checked={feature.enabled}
                      disabled={feature.loading || feature.level === 'core'}
                      onCheckedChange={(enabled) => handleToggleFeature(featureId, enabled)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración Avanzada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Auto-upgrade</span>
                <p className="text-sm text-gray-600">
                  Habilitar automáticamente características según capacidades del dispositivo
                </p>
              </div>
              <Switch
                checked={config.enableAutoUpgrade}
                onCheckedChange={(enabled) => {
                  // Update config
                  console.log('Auto-upgrade:', enabled);
                }}
              />
            </div>

            <div>
              <span className="font-medium block mb-2">Cargas Concurrentes Máximas</span>
              <input
                type="range"
                min="1"
                max="10"
                value={config.maxConcurrentLoads}
                className="w-full"
                onChange={(e) => {
                  console.log('Max concurrent loads:', e.target.value);
                }}
              />
              <span className="text-sm text-gray-600">{config.maxConcurrentLoads}</span>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Progressive Enhancement</p>
                  <p className="text-sm text-blue-700 mt-1">
                    El sistema detecta automáticamente las capacidades del dispositivo y 
                    habilita características avanzadas cuando es posible, asegurando una 
                    experiencia óptima para todos los usuarios.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressiveControlPanel;