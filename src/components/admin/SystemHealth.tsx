'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ApiEndpoint {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'slow';
  responseTime: number;
  lastCheck: Date;
}

interface SystemHealthProps {
  className?: string;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      
      // Simulate system metrics (in real implementation, these would come from actual monitoring)
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.random() * 100,
          unit: '%',
          status: 'healthy',
          threshold: { warning: 70, critical: 90 },
          trend: 'stable',
          lastUpdated: new Date()
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 100,
          unit: '%',
          status: 'healthy',
          threshold: { warning: 80, critical: 95 },
          trend: 'up',
          lastUpdated: new Date()
        },
        {
          name: 'Disk Usage',
          value: Math.random() * 100,
          unit: '%',
          status: 'warning',
          threshold: { warning: 85, critical: 95 },
          trend: 'up',
          lastUpdated: new Date()
        },
        {
          name: 'Active Users',
          value: Math.floor(Math.random() * 50) + 10,
          unit: 'users',
          status: 'healthy',
          threshold: { warning: 100, critical: 150 },
          trend: 'stable',
          lastUpdated: new Date()
        }
      ];

      // Update status based on thresholds
      mockMetrics.forEach(metric => {
        if (metric.value >= metric.threshold.critical) {
          metric.status = 'critical';
        } else if (metric.value >= metric.threshold.warning) {
          metric.status = 'warning';
        } else {
          metric.status = 'healthy';
        }
      });

      setMetrics(mockMetrics);

      // Check API endpoints
      const endpointsToCheck = [
        { name: 'Portfolio API', url: '/api/admin/portfolio/projects' },
        { name: 'Careers API', url: '/api/admin/careers/jobs' },
        { name: 'Newsletter API', url: '/api/admin/newsletter/articles' },
        { name: 'Search API', url: '/api/admin/search' }
      ];

      const endpointResults = await Promise.all(
        endpointsToCheck.map(async (endpoint) => {
          const startTime = Date.now();
          try {
            // Get auth token (same logic as api-client.ts)
            const token = typeof window !== 'undefined' 
              ? localStorage.getItem('auth-token') || 'mock-token'
              : 'mock-token';
            
            const response = await fetch(endpoint.url, { 
              method: 'HEAD',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const responseTime = Date.now() - startTime;
            
            return {
              ...endpoint,
              status: response.ok ? (responseTime > 2000 ? 'slow' : 'online') : 'offline',
              responseTime,
              lastCheck: new Date()
            } as ApiEndpoint;
          } catch (error) {
            return {
              ...endpoint,
              status: 'offline' as const,
              responseTime: -1,
              lastCheck: new Date()
            };
          }
        })
      );

      setEndpoints(endpointResults);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'slow':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getOverallHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const offlineEndpoints = endpoints.filter(e => e.status === 'offline').length;

    if (criticalCount > 0 || offlineEndpoints > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Estado del Sistema</h3>
            <Badge className={getStatusColor(getOverallHealth())}>
              {getOverallHealth() === 'healthy' ? 'Saludable' : 
               getOverallHealth() === 'warning' ? 'Advertencia' : 'Crítico'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSystemHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* System Metrics */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Métricas del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold mb-1">
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'critical' ? 'bg-red-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Advertencia: {metric.threshold.warning}{metric.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Estado de APIs
            </h4>
            <div className="space-y-2">
              {endpoints.map((endpoint) => (
                <div key={endpoint.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(endpoint.status)}
                    <div>
                      <div className="font-medium text-sm">{endpoint.name}</div>
                      <div className="text-xs text-gray-500">{endpoint.url}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getStatusColor(endpoint.status)}>
                      {endpoint.status === 'online' ? 'En línea' :
                       endpoint.status === 'slow' ? 'Lento' : 'Fuera de línea'}
                    </Badge>
                    {endpoint.responseTime > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {endpoint.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Sistema monitoreado continuamente
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Logs del sistema
                </Button>
                <Button variant="outline" size="sm">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Métricas detalladas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};