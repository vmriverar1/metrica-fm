/**
 * FASE 7: React Hooks para Sistema de Integración
 * 
 * Hooks especializados para trabajar con el sistema integrado.
 * Proporcionan acceso unificado a todos los servicios y estado global.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import SystemIntegration, { 
  SystemStatus, 
  SystemEvent, 
  IntegrationMetrics 
} from '@/lib/system-integration';

// Tipos para hooks
export interface UseSystemIntegrationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  subscribeToEvents?: string[];
}

export interface SystemIntegrationHookResult {
  status: SystemStatus;
  metrics: IntegrationMetrics;
  events: SystemEvent[];
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  actions: {
    initialize: () => Promise<void>;
    synchronize: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    generateReport: () => Promise<any>;
    clearEvents: () => void;
  };
}

export interface UseServiceIntegrationOptions {
  services: string[];
  includeMetrics?: boolean;
  includeEvents?: boolean;
}

export interface ServiceIntegrationResult {
  services: {
    [service: string]: {
      status: 'online' | 'offline' | 'degraded';
      metrics: any;
      lastCheck: Date;
    };
  };
  isHealthy: boolean;
  degradedServices: string[];
  offlineServices: string[];
  refresh: () => Promise<void>;
}

export interface UseUnifiedDataOptions {
  includePortfolio?: boolean;
  includeBlog?: boolean;
  includeCareers?: boolean;
  includeApplications?: boolean;
  limit?: number;
  filters?: any;
}

export interface UnifiedDataResult {
  data: {
    portfolio?: any[];
    blog?: any[];
    careers?: any[];
    applications?: any[];
  };
  totals: {
    portfolio: number;
    blog: number;
    careers: number;
    applications: number;
  };
  loading: {
    portfolio: boolean;
    blog: boolean;
    careers: boolean;
    applications: boolean;
  };
  errors: {
    portfolio: Error | null;
    blog: Error | null;
    careers: Error | null;
    applications: Error | null;
  };
  refresh: () => Promise<void>;
}

/**
 * Hook principal para el sistema de integración
 */
export function useSystemIntegration(
  options: UseSystemIntegrationOptions = {}
): SystemIntegrationHookResult {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    subscribeToEvents = ['error', 'system', 'auth']
  } = options;

  const [status, setStatus] = useState<SystemStatus>({
    overall: 'healthy',
    services: {},
    dependencies: {
      directus: 'unavailable',
      database: 'disconnected',
      redis: 'N/A',
      external: {}
    },
    performance: {
      avgResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0
    },
    resources: {
      memory: 0,
      cpu: 0,
      disk: 0
    }
  });

  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    timestamp: new Date(),
    totalRequests: 0,
    totalErrors: 0,
    avgResponseTime: 0,
    serviceMetrics: {},
    userActivity: {
      activeUsers: 0,
      newSessions: 0,
      authentication: {
        logins: 0,
        failures: 0,
        registrations: 0
      }
    }
  });

  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const systemIntegration = useMemo(() => SystemIntegration.getInstance(), []);

  // Initialize system
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await systemIntegration.initialize();
      setIsInitialized(true);
      
      // Load initial data
      await refreshStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Initialization failed'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, systemIntegration]);

  // Refresh system status and metrics
  const refreshStatus = useCallback(async () => {
    try {
      const newStatus = systemIntegration.getSystemStatus();
      const newMetrics = systemIntegration.getMetrics();
      const recentEvents = systemIntegration.getEventBus().getHistory({
        since: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }).slice(0, 50); // Limit to 50 most recent

      setStatus(newStatus);
      setMetrics(newMetrics);
      setEvents(recentEvents);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh status'));
    }
  }, [systemIntegration]);

  // Synchronize all services
  const synchronize = useCallback(async () => {
    try {
      await systemIntegration.synchronizeServices();
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Synchronization failed'));
    }
  }, [systemIntegration, refreshStatus]);

  // Generate system report
  const generateReport = useCallback(async () => {
    try {
      return await systemIntegration.generateSystemReport();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Report generation failed'));
      return null;
    }
  }, [systemIntegration]);

  // Clear events
  const clearEvents = useCallback(() => {
    systemIntegration.getEventBus().clearHistory();
    setEvents([]);
  }, [systemIntegration]);

  // Subscribe to events
  useEffect(() => {
    const eventBus = systemIntegration.getEventBus();
    const unsubscriptions: (() => void)[] = [];

    subscribeToEvents.forEach(eventType => {
      const unsubscribe = eventBus.subscribe(eventType, (event) => {
        setEvents(prev => [event, ...prev.slice(0, 49)]);
      });
      unsubscriptions.push(unsubscribe);
    });

    return () => {
      unsubscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [systemIntegration, subscribeToEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    const interval = setInterval(refreshStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isInitialized, refreshStatus]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    status,
    metrics,
    events,
    isInitialized,
    isLoading,
    error,
    actions: {
      initialize,
      synchronize,
      refreshStatus,
      generateReport,
      clearEvents
    }
  };
}

/**
 * Hook para integración específica de servicios
 */
export function useServiceIntegration(
  options: UseServiceIntegrationOptions
): ServiceIntegrationResult {
  const {
    services,
    includeMetrics = true,
    includeEvents = false
  } = options;

  const [serviceData, setServiceData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const systemIntegration = useMemo(() => SystemIntegration.getInstance(), []);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const status = systemIntegration.getSystemStatus();
      const report = await systemIntegration.generateSystemReport();

      const data: any = {
        services: {}
      };

      services.forEach(service => {
        data.services[service] = {
          status: status.services[service]?.status || 'unknown',
          metrics: includeMetrics ? report.services[service]?.metrics : null,
          lastCheck: status.services[service]?.lastCheck || new Date()
        };
      });

      setServiceData(data);
      
    } catch (error) {
      console.error('Failed to refresh service integration:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemIntegration, services, includeMetrics]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isHealthy = useMemo(() => {
    return Object.values(serviceData.services || {}).every(
      (service: any) => service.status === 'online'
    );
  }, [serviceData]);

  const degradedServices = useMemo(() => {
    return Object.entries(serviceData.services || {})
      .filter(([_, service]: [string, any]) => service.status === 'degraded')
      .map(([name]) => name);
  }, [serviceData]);

  const offlineServices = useMemo(() => {
    return Object.entries(serviceData.services || {})
      .filter(([_, service]: [string, any]) => service.status === 'offline')
      .map(([name]) => name);
  }, [serviceData]);

  return {
    services: serviceData.services || {},
    isHealthy,
    degradedServices,
    offlineServices,
    refresh
  };
}

/**
 * Hook para datos unificados de todos los servicios
 */
export function useUnifiedData(
  options: UseUnifiedDataOptions = {}
): UnifiedDataResult {
  const {
    includePortfolio = true,
    includeBlog = true,
    includeCareers = true,
    includeApplications = true,
    limit = 10,
    filters = {}
  } = options;

  const [data, setData] = useState<any>({});
  const [totals, setTotals] = useState({
    portfolio: 0,
    blog: 0,
    careers: 0,
    applications: 0
  });
  const [loading, setLoading] = useState({
    portfolio: false,
    blog: false,
    careers: false,
    applications: false
  });
  const [errors, setErrors] = useState({
    portfolio: null,
    blog: null,
    careers: null,
    applications: null
  });

  const systemIntegration = useMemo(() => SystemIntegration.getInstance(), []);

  const refresh = useCallback(async () => {
    const newData: any = {};
    const newTotals = { portfolio: 0, blog: 0, careers: 0, applications: 0 };
    const newLoading = { portfolio: false, blog: false, careers: false, applications: false };
    const newErrors = { portfolio: null, blog: null, careers: null, applications: null };

    setLoading(prev => ({ ...prev, ...newLoading }));

    try {
      await systemIntegration.executeWithAllSystems(async (systems) => {
        // Portfolio data
        if (includePortfolio) {
          setLoading(prev => ({ ...prev, portfolio: true }));
          try {
            const portfolioData = await systems.portfolio.getProjects({ 
              limit, 
              ...filters.portfolio 
            });
            newData.portfolio = portfolioData;
            newTotals.portfolio = portfolioData.length;
          } catch (error) {
            newErrors.portfolio = error as Error;
          } finally {
            setLoading(prev => ({ ...prev, portfolio: false }));
          }
        }

        // Blog data
        if (includeBlog) {
          setLoading(prev => ({ ...prev, blog: true }));
          try {
            const blogData = await systems.blog.getPosts({ 
              limit, 
              ...filters.blog 
            });
            newData.blog = blogData;
            newTotals.blog = blogData.length;
          } catch (error) {
            newErrors.blog = error as Error;
          } finally {
            setLoading(prev => ({ ...prev, blog: false }));
          }
        }

        // Careers data
        if (includeCareers) {
          setLoading(prev => ({ ...prev, careers: true }));
          try {
            const careersData = await systems.careers.getJobs({ 
              limit, 
              ...filters.careers 
            });
            newData.careers = careersData;
            newTotals.careers = careersData.length;
          } catch (error) {
            newErrors.careers = error as Error;
          } finally {
            setLoading(prev => ({ ...prev, careers: false }));
          }
        }

        // Applications data
        if (includeApplications) {
          setLoading(prev => ({ ...prev, applications: true }));
          try {
            const applicationsData = await systems.applications.getApplications({ 
              limit, 
              ...filters.applications 
            });
            newData.applications = applicationsData;
            newTotals.applications = applicationsData.length;
          } catch (error) {
            newErrors.applications = error as Error;
          } finally {
            setLoading(prev => ({ ...prev, applications: false }));
          }
        }
      });

      setData(newData);
      setTotals(newTotals);
      setErrors(newErrors);

    } catch (error) {
      console.error('Failed to load unified data:', error);
    }
  }, [
    systemIntegration,
    includePortfolio,
    includeBlog,
    includeCareers,
    includeApplications,
    limit,
    filters
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    totals,
    loading,
    errors,
    refresh
  };
}

/**
 * Hook para métricas globales del sistema
 */
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const systemIntegration = useMemo(() => SystemIntegration.getInstance(), []);

  const refresh = useCallback(async () => {
    try {
      const currentMetrics = systemIntegration.getMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemIntegration]);

  useEffect(() => {
    refresh();
    
    // Auto-refresh every minute
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    metrics,
    isLoading,
    refresh
  };
}

/**
 * Hook para eventos del sistema en tiempo real
 */
export function useSystemEvents(
  eventTypes: string[] = ['error', 'system', 'auth'],
  limit: number = 50
) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const systemIntegration = useMemo(() => SystemIntegration.getInstance(), []);

  const refresh = useCallback(() => {
    try {
      const eventBus = systemIntegration.getEventBus();
      const allEvents = eventBus.getHistory().slice(0, limit);
      
      const filteredEvents = eventTypes.length > 0
        ? allEvents.filter(event => eventTypes.includes(event.type))
        : allEvents;

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to load system events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemIntegration, eventTypes, limit]);

  const clear = useCallback(() => {
    systemIntegration.getEventBus().clearHistory();
    setEvents([]);
  }, [systemIntegration]);

  useEffect(() => {
    refresh();

    // Subscribe to new events
    const eventBus = systemIntegration.getEventBus();
    const unsubscriptions: (() => void)[] = [];

    eventTypes.forEach(eventType => {
      const unsubscribe = eventBus.subscribe(eventType, (event) => {
        setEvents(prev => [event, ...prev.slice(0, limit - 1)]);
      });
      unsubscriptions.push(unsubscribe);
    });

    return () => {
      unsubscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [systemIntegration, eventTypes, limit, refresh]);

  return {
    events,
    isLoading,
    refresh,
    clear
  };
}