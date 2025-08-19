/**
 * FASE 7: Sistema Context Provider Unificado
 * 
 * Context Provider que unifica y orquesta todos los sistemas:
 * - Portfolio, Blog, Careers, Applications
 * - Auth, Performance, Monitoring
 * - System Integration y Event Bus
 * 
 * Proporciona acceso global al estado del sistema integrado.
 */

'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  useSystemIntegration, 
  useUnifiedData, 
  useSystemMetrics,
  useSystemEvents,
  SystemIntegrationHookResult
} from '@/hooks/useSystemIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { useBlogService } from '@/hooks/useBlogService';
import { useCareersService } from '@/hooks/useCareersService';
import { useApplicationsService } from '@/hooks/useApplicationsService';
import { usePortfolioService } from '@/hooks/usePortfolioService';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceService';

// Tipos para el contexto del sistema
export interface SystemContextType {
  // Sistema integrado principal
  system: SystemIntegrationHookResult;
  
  // Servicios individuales
  services: {
    portfolio: ReturnType<typeof usePortfolioService>;
    blog: ReturnType<typeof useBlogService>;
    careers: ReturnType<typeof useCareersService>;
    applications: ReturnType<typeof useApplicationsService>;
    auth: ReturnType<typeof useAuth>;
    performance: ReturnType<typeof usePerformanceMonitoring>;
  };

  // Datos unificados
  unifiedData: ReturnType<typeof useUnifiedData>;
  
  // Métricas globales
  metrics: ReturnType<typeof useSystemMetrics>;
  
  // Eventos del sistema
  events: ReturnType<typeof useSystemEvents>;

  // Estado global
  globalState: {
    isInitialized: boolean;
    isHealthy: boolean;
    hasErrors: boolean;
    lastUpdate: Date;
  };

  // Acciones globales
  actions: {
    refreshAll: () => Promise<void>;
    initializeSystem: () => Promise<void>;
    synchronizeServices: () => Promise<void>;
    generateReport: () => Promise<any>;
    clearCache: () => void;
    clearEvents: () => void;
  };
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface SystemProviderProps {
  children: ReactNode;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

export function SystemProvider({ 
  children, 
  enableAutoRefresh = true,
  refreshInterval = 30000
}: SystemProviderProps) {
  // Sistema de integración principal
  const system = useSystemIntegration({
    autoRefresh: enableAutoRefresh,
    refreshInterval,
    subscribeToEvents: ['error', 'system', 'auth', 'service', 'performance']
  });

  // Servicios individuales
  const portfolioService = usePortfolioService({
    autoRefresh: enableAutoRefresh,
    refreshInterval: refreshInterval * 2 // Menos frecuente para datos estáticos
  });

  const blogService = useBlogService({
    autoRefresh: enableAutoRefresh,
    refreshInterval: refreshInterval * 2
  });

  const careersService = useCareersService({
    autoRefresh: enableAutoRefresh,
    refreshInterval: refreshInterval * 2
  });

  const applicationsService = useApplicationsService({
    autoRefresh: enableAutoRefresh,
    refreshInterval: refreshInterval / 2 // Más frecuente para datos dinámicos
  });

  const authService = useAuth();

  const performanceService = usePerformanceMonitoring({
    enableMonitoring: true,
    refreshInterval: refreshInterval / 2
  });

  // Datos unificados
  const unifiedData = useUnifiedData({
    includePortfolio: true,
    includeBlog: true,
    includeCareers: true,
    includeApplications: true,
    limit: 20
  });

  // Métricas globales
  const metrics = useSystemMetrics();

  // Eventos del sistema
  const events = useSystemEvents(['error', 'system', 'auth', 'service'], 100);

  // Estado global computado
  const globalState = useMemo(() => {
    const isInitialized = system.isInitialized && 
      portfolioService.systemInfo.isDirectusAvailable !== null &&
      blogService.systemInfo.isDirectusAvailable !== null &&
      careersService.systemInfo.isDirectusAvailable !== null &&
      applicationsService.systemInfo.isDirectusAvailable !== null;

    const isHealthy = system.status.overall === 'healthy' && 
      !system.error &&
      !unifiedData.errors.portfolio &&
      !unifiedData.errors.blog &&
      !unifiedData.errors.careers &&
      !unifiedData.errors.applications;

    const hasErrors = system.error !== null ||
      unifiedData.errors.portfolio !== null ||
      unifiedData.errors.blog !== null ||
      unifiedData.errors.careers !== null ||
      unifiedData.errors.applications !== null ||
      performanceService.score < 70;

    const lastUpdate = new Date(Math.max(
      system.metrics.timestamp.getTime(),
      portfolioService.systemInfo.lastUpdate.getTime(),
      blogService.systemInfo.lastUpdate.getTime(),
      careersService.systemInfo.lastUpdate.getTime(),
      applicationsService.systemInfo.lastUpdate.getTime()
    ));

    return {
      isInitialized,
      isHealthy,
      hasErrors,
      lastUpdate
    };
  }, [
    system,
    portfolioService.systemInfo,
    blogService.systemInfo,
    careersService.systemInfo,
    applicationsService.systemInfo,
    unifiedData.errors,
    performanceService.score
  ]);

  // Acciones globales
  const actions = useMemo(() => ({
    refreshAll: async () => {
      console.log('🔄 Refreshing all services...');
      
      await Promise.allSettled([
        system.actions.refreshStatus(),
        portfolioService.actions.refresh(),
        blogService.actions.refresh(),
        careersService.actions.refresh(),
        applicationsService.actions.refresh(),
        unifiedData.refresh(),
        metrics.refresh(),
        events.refresh()
      ]);

      console.log('✅ All services refreshed');
    },

    initializeSystem: async () => {
      console.log('🚀 Initializing integrated system...');
      
      await system.actions.initialize();
      
      // Trigger initial load for all services
      await Promise.allSettled([
        portfolioService.actions.refresh(),
        blogService.actions.refresh(),
        careersService.actions.refresh(),
        applicationsService.actions.refresh()
      ]);

      console.log('✅ System initialization completed');
    },

    synchronizeServices: async () => {
      console.log('🔄 Synchronizing all services...');
      
      await system.actions.synchronize();
      
      // Refresh all data after synchronization
      await Promise.allSettled([
        portfolioService.actions.refresh(),
        blogService.actions.refresh(),
        careersService.actions.refresh(),
        applicationsService.actions.refresh(),
        unifiedData.refresh()
      ]);

      console.log('✅ Service synchronization completed');
    },

    generateReport: async () => {
      console.log('📊 Generating system report...');
      
      const systemReport = await system.actions.generateReport();
      const performanceReport = performanceService.generatePerformanceReport?.();
      
      return {
        system: systemReport,
        performance: performanceReport,
        services: {
          portfolio: {
            systemInfo: portfolioService.systemInfo,
            projects: portfolioService.projects.slice(0, 5)
          },
          blog: {
            systemInfo: blogService.systemInfo,
            posts: blogService.posts.slice(0, 5)
          },
          careers: {
            systemInfo: careersService.systemInfo,
            jobs: careersService.jobs.slice(0, 5)
          },
          applications: {
            systemInfo: applicationsService.systemInfo,
            applications: applicationsService.applications.slice(0, 5)
          }
        },
        unifiedData: {
          totals: unifiedData.totals,
          loading: unifiedData.loading,
          errors: unifiedData.errors
        },
        globalState,
        generatedAt: new Date()
      };
    },

    clearCache: () => {
      console.log('🗑️ Clearing all caches...');
      
      // Clear individual service caches
      portfolioService.actions.clearCache?.();
      blogService.actions.clearCache?.();
      careersService.actions.clearCache?.();
      applicationsService.actions.clearCache?.();
      
      // Clear performance cache
      performanceService.clearCaches();
      
      console.log('✅ All caches cleared');
    },

    clearEvents: () => {
      console.log('🗑️ Clearing system events...');
      
      system.actions.clearEvents();
      events.clear();
      
      console.log('✅ Events cleared');
    }
  }), [
    system.actions,
    portfolioService.actions,
    blogService.actions,
    careersService.actions,
    applicationsService.actions,
    unifiedData,
    metrics,
    events,
    performanceService,
    globalState
  ]);

  // Context value
  const contextValue: SystemContextType = useMemo(() => ({
    system,
    services: {
      portfolio: portfolioService,
      blog: blogService,
      careers: careersService,
      applications: applicationsService,
      auth: authService,
      performance: performanceService
    },
    unifiedData,
    metrics,
    events,
    globalState,
    actions
  }), [
    system,
    portfolioService,
    blogService,
    careersService,
    applicationsService,
    authService,
    performanceService,
    unifiedData,
    metrics,
    events,
    globalState,
    actions
  ]);

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
}

// Hook para usar el contexto del sistema
export function useSystem(): SystemContextType {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}

// HOC para componentes que requieren el sistema
export function withSystem<P extends object>(
  Component: React.ComponentType<P & { system: SystemContextType }>
): React.ComponentType<P> {
  return function WithSystemComponent(props: P) {
    const system = useSystem();
    return <Component {...props} system={system} />;
  };
}

// HOC para componentes que requieren sistema inicializado
export function withInitializedSystem<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType
): React.ComponentType<P> {
  return function WithInitializedSystemComponent(props: P) {
    const { globalState, actions } = useSystem();

    React.useEffect(() => {
      if (!globalState.isInitialized) {
        actions.initializeSystem();
      }
    }, [globalState.isInitialized, actions]);

    if (!globalState.isInitialized) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Inicializando Sistema
            </h2>
            <p className="text-gray-600">
              Configurando servicios integrados...
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// HOC para componentes que requieren sistema saludable
export function withHealthySystem<P extends object>(
  Component: React.ComponentType<P>,
  ErrorComponent?: React.ComponentType<{ error: any; retry: () => void }>
): React.ComponentType<P> {
  return function WithHealthySystemComponent(props: P) {
    const { globalState, system, actions } = useSystem();

    if (!globalState.isHealthy || system.error) {
      if (ErrorComponent) {
        return <ErrorComponent error={system.error} retry={actions.refreshAll} />;
      }
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sistema con Problemas
            </h2>
            <p className="text-gray-600 mb-4">
              {system.error?.message || 'Algunos servicios no están funcionando correctamente.'}
            </p>
            <button
              onClick={actions.refreshAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default SystemProvider;