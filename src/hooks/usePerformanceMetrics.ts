'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SystemMetrics {
  responseTime: number;
  previousResponseTime: number;
  responseTimeTrend: number;
  throughput: number;
  throughputTrend: number;
  memoryUsage: number;
  errorRate: number;
  errorRateTrend: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
}

interface UserMetrics {
  activeUsers: number;
  activeUsersTrend: number;
  pageViews: number;
  pageViewsTrend: number;
  avgSessionDuration: number;
  bounceRate: number;
  newUsers: number;
  returningUsers: number;
  topPages: Array<{ path: string; views: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: 'online' | 'degraded' | 'offline';
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
  load: number;
  processes: number;
}

interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function usePerformanceMetrics(
  resource: string,
  realTime: boolean = true
) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(realTime);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertsRef = useRef<PerformanceAlert[]>([]);

  // Simular métricas realistas
  const generateMetrics = useCallback((): SystemMetrics => {
    const baseResponseTime = 150 + Math.random() * 100;
    const baseThroughput = 800 + Math.random() * 400;
    const baseMemoryUsage = 45 + Math.random() * 30;
    const baseErrorRate = Math.random() * 2;

    return {
      responseTime: baseResponseTime,
      previousResponseTime: baseResponseTime + (Math.random() - 0.5) * 50,
      responseTimeTrend: (Math.random() - 0.5) * 20,
      throughput: baseThroughput,
      throughputTrend: (Math.random() - 0.3) * 15,
      memoryUsage: baseMemoryUsage,
      errorRate: baseErrorRate,
      errorRateTrend: (Math.random() - 0.7) * 5,
      cpuUsage: 30 + Math.random() * 40,
      diskUsage: 60 + Math.random() * 20,
      activeConnections: Math.floor(50 + Math.random() * 200)
    };
  }, []);

  const generateUserMetrics = useCallback((): UserMetrics => {
    return {
      activeUsers: Math.floor(120 + Math.random() * 80),
      activeUsersTrend: (Math.random() - 0.3) * 25,
      pageViews: Math.floor(2500 + Math.random() * 1000),
      pageViewsTrend: (Math.random() - 0.2) * 30,
      avgSessionDuration: 180000 + Math.random() * 300000, // 3-8 minutes
      bounceRate: 25 + Math.random() * 30,
      newUsers: Math.floor(80 + Math.random() * 40),
      returningUsers: Math.floor(40 + Math.random() * 60),
      topPages: [
        { path: '/', views: Math.floor(800 + Math.random() * 200) },
        { path: '/services', views: Math.floor(400 + Math.random() * 100) },
        { path: '/portfolio', views: Math.floor(350 + Math.random() * 150) },
        { path: '/about', views: Math.floor(250 + Math.random() * 100) },
        { path: '/contact', views: Math.floor(180 + Math.random() * 80) }
      ],
      userFlow: [
        { from: '/', to: '/services', count: Math.floor(150 + Math.random() * 50) },
        { from: '/services', to: '/portfolio', count: Math.floor(100 + Math.random() * 30) },
        { from: '/portfolio', to: '/contact', count: Math.floor(80 + Math.random() * 40) }
      ]
    };
  }, []);

  const generateSystemHealth = useCallback((): SystemHealth => {
    const cpu = Math.floor(30 + Math.random() * 50);
    const memory = Math.floor(45 + Math.random() * 35);
    const disk = Math.floor(55 + Math.random() * 25);
    
    const overallScore = (cpu + memory + disk) / 3;
    const overall = overallScore < 60 ? 'healthy' : 
                   overallScore < 80 ? 'warning' : 'critical';

    return {
      cpu,
      memory,
      disk,
      network: Math.random() > 0.95 ? 'degraded' : 'online',
      overall,
      uptime: 99.5 + Math.random() * 0.5,
      load: 0.5 + Math.random() * 1,
      processes: Math.floor(150 + Math.random() * 50)
    };
  }, []);

  // Generar alertas basadas en métricas
  const checkForAlerts = useCallback((
    currentMetrics: SystemMetrics,
    currentHealth: SystemHealth
  ): PerformanceAlert[] => {
    const newAlerts: PerformanceAlert[] = [];

    // Alert por tiempo de respuesta alto
    if (currentMetrics.responseTime > 1000) {
      newAlerts.push({
        id: `response_time_${Date.now()}`,
        type: 'critical',
        metric: 'response_time',
        message: `Tiempo de respuesta muy alto: ${currentMetrics.responseTime.toFixed(0)}ms`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alert por uso de memoria alto
    if (currentMetrics.memoryUsage > 90) {
      newAlerts.push({
        id: `memory_${Date.now()}`,
        type: 'critical',
        metric: 'memory',
        message: `Uso de memoria crítico: ${currentMetrics.memoryUsage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    } else if (currentMetrics.memoryUsage > 80) {
      newAlerts.push({
        id: `memory_${Date.now()}`,
        type: 'warning',
        metric: 'memory',
        message: `Uso de memoria alto: ${currentMetrics.memoryUsage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alert por tasa de error alta
    if (currentMetrics.errorRate > 5) {
      newAlerts.push({
        id: `error_rate_${Date.now()}`,
        type: 'critical',
        metric: 'error_rate',
        message: `Tasa de errores muy alta: ${currentMetrics.errorRate.toFixed(2)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alert por CPU alto
    if (currentHealth.cpu > 90) {
      newAlerts.push({
        id: `cpu_${Date.now()}`,
        type: 'critical',
        metric: 'cpu',
        message: `Uso de CPU crítico: ${currentHealth.cpu}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alert por disco lleno
    if (currentHealth.disk > 90) {
      newAlerts.push({
        id: `disk_${Date.now()}`,
        type: 'warning',
        metric: 'disk',
        message: `Espacio en disco bajo: ${currentHealth.disk}% usado`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alert por red degradada
    if (currentHealth.network === 'degraded') {
      newAlerts.push({
        id: `network_${Date.now()}`,
        type: 'warning',
        metric: 'network',
        message: 'Conectividad de red degradada',
        timestamp: new Date(),
        resolved: false
      });
    } else if (currentHealth.network === 'offline') {
      newAlerts.push({
        id: `network_${Date.now()}`,
        type: 'critical',
        metric: 'network',
        message: 'Conectividad de red perdida',
        timestamp: new Date(),
        resolved: false
      });
    }

    return newAlerts;
  }, []);

  // Función principal para actualizar métricas
  const updateMetrics = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simular latencia de API
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

      const newMetrics = generateMetrics();
      const newUserMetrics = generateUserMetrics();
      const newSystemHealth = generateSystemHealth();

      setMetrics(newMetrics);
      setUserMetrics(newUserMetrics);
      setSystemHealth(newSystemHealth);
      setLastUpdate(new Date());

      // Verificar alertas
      const newAlerts = checkForAlerts(newMetrics, newSystemHealth);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Mantener solo las últimas 50 alertas
        alertsRef.current = [...newAlerts, ...alertsRef.current];
      }

      // Log para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Metrics Updated:', {
          responseTime: newMetrics.responseTime.toFixed(0),
          memory: newMetrics.memoryUsage.toFixed(1),
          throughput: newMetrics.throughput.toFixed(0),
          errorRate: newMetrics.errorRate.toFixed(2),
          systemHealth: newSystemHealth.overall,
          alerts: newAlerts.length
        });
      }

    } catch (error) {
      console.error('Error updating performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMetrics, generateUserMetrics, generateSystemHealth, checkForAlerts]);

  // Refrescar métricas manualmente
  const refreshMetrics = useCallback(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      // Actualización inmediata
      updateMetrics();

      // Configurar intervalo
      intervalRef.current = setInterval(updateMetrics, 30000); // Cada 30 segundos

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Una sola actualización si no es automático
      if (!metrics) {
        updateMetrics();
      }
    }
  }, [autoRefresh, updateMetrics]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Exportar métricas
  const exportMetrics = useCallback(async () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        resource,
        timeRange,
        metrics,
        userMetrics,
        systemHealth,
        alerts: alerts.slice(0, 20), // Últimas 20 alertas
        metadata: {
          exportedBy: 'Performance Monitor',
          version: '1.0.0',
          autoRefresh,
          lastUpdate: lastUpdate?.toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance_metrics_${resource}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('📊 Performance metrics exported successfully');
    } catch (error) {
      console.error('Error exporting performance metrics:', error);
    }
  }, [resource, timeRange, metrics, userMetrics, systemHealth, alerts, autoRefresh, lastUpdate]);

  // Obtener estadísticas de rendimiento histórico
  const getHistoricalStats = useCallback(() => {
    // En una implementación real, esto vendría de una API
    return {
      avgResponseTime: metrics?.responseTime || 0,
      peakThroughput: Math.max(metrics?.throughput || 0, 1200),
      uptimePercentage: systemHealth?.uptime || 99.9,
      totalAlerts: alerts.length,
      resolvedAlerts: alerts.filter(a => a.resolved).length,
      criticalAlerts: alerts.filter(a => a.type === 'critical').length
    };
  }, [metrics, systemHealth, alerts]);

  // Resolver alerta
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  // Limpiar alertas resueltas
  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  }, []);

  return {
    // Estado
    metrics,
    userMetrics,
    systemHealth,
    alerts,
    isLoading,
    autoRefresh,
    timeRange,
    lastUpdate,
    
    // Acciones
    refreshMetrics,
    setAutoRefresh,
    setTimeRange,
    exportMetrics,
    getHistoricalStats,
    resolveAlert,
    clearResolvedAlerts
  };
}