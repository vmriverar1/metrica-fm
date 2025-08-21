'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Database, 
  Users, 
  Eye, 
  MousePointer, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Gauge,
  Timer,
  Server,
  Wifi,
  HardDrive,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface PerformanceMonitorProps {
  resource?: string;
  realTime?: boolean;
  showSystemMetrics?: boolean;
  showUserMetrics?: boolean;
  className?: string;
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  unit?: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  icon: React.ComponentType<any>;
  description?: string;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  resource = 'system',
  realTime = true,
  showSystemMetrics = true,
  showUserMetrics = true,
  className = ''
}) => {
  const {
    metrics,
    systemHealth,
    userMetrics,
    isLoading,
    refreshMetrics,
    setAutoRefresh,
    autoRefresh,
    timeRange,
    setTimeRange,
    exportMetrics
  } = usePerformanceMetrics(resource, realTime);

  const [selectedMetricGroup, setSelectedMetricGroup] = useState<'overview' | 'system' | 'user' | 'performance'>('overview');

  // Formatear números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Formatear bytes
  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Formatear tiempo
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono de tendencia
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  // Métricas principales del sistema
  const systemMetricsCards: MetricCard[] = [
    {
      id: 'response_time',
      title: 'Tiempo de Respuesta',
      value: formatTime(metrics?.responseTime || 0),
      previousValue: metrics?.previousResponseTime,
      trend: metrics?.responseTime < (metrics?.previousResponseTime || 0) ? 'down' : 'up',
      trendPercentage: metrics?.responseTimeTrend,
      color: 'blue',
      icon: Timer,
      description: 'Tiempo promedio de respuesta del servidor',
      target: 200,
      status: (metrics?.responseTime || 0) < 200 ? 'excellent' : 
              (metrics?.responseTime || 0) < 500 ? 'good' : 
              (metrics?.responseTime || 0) < 1000 ? 'warning' : 'critical'
    },
    {
      id: 'throughput',
      title: 'Rendimiento',
      value: formatNumber(metrics?.throughput || 0),
      unit: 'req/min',
      trend: 'up',
      trendPercentage: metrics?.throughputTrend,
      color: 'green',
      icon: Zap,
      description: 'Requests procesados por minuto',
      target: 1000,
      status: (metrics?.throughput || 0) > 1000 ? 'excellent' : 
              (metrics?.throughput || 0) > 500 ? 'good' : 
              (metrics?.throughput || 0) > 100 ? 'warning' : 'critical'
    },
    {
      id: 'memory_usage',
      title: 'Uso de Memoria',
      value: `${metrics?.memoryUsage || 0}%`,
      trend: metrics?.memoryUsage > 80 ? 'up' : 'stable',
      color: metrics?.memoryUsage > 90 ? 'red' : metrics?.memoryUsage > 75 ? 'yellow' : 'green',
      icon: Cpu,
      description: 'Porcentaje de memoria utilizada',
      target: 75,
      status: (metrics?.memoryUsage || 0) < 60 ? 'excellent' : 
              (metrics?.memoryUsage || 0) < 75 ? 'good' : 
              (metrics?.memoryUsage || 0) < 90 ? 'warning' : 'critical'
    },
    {
      id: 'error_rate',
      title: 'Tasa de Errores',
      value: `${(metrics?.errorRate || 0).toFixed(2)}%`,
      trend: 'down',
      trendPercentage: metrics?.errorRateTrend,
      color: metrics?.errorRate > 5 ? 'red' : metrics?.errorRate > 1 ? 'yellow' : 'green',
      icon: AlertTriangle,
      description: 'Porcentaje de requests con error',
      target: 1,
      status: (metrics?.errorRate || 0) < 0.5 ? 'excellent' : 
              (metrics?.errorRate || 0) < 1 ? 'good' : 
              (metrics?.errorRate || 0) < 5 ? 'warning' : 'critical'
    }
  ];

  // Métricas de usuario
  const userMetricsCards: MetricCard[] = [
    {
      id: 'active_users',
      title: 'Usuarios Activos',
      value: formatNumber(userMetrics?.activeUsers || 0),
      trend: 'up',
      trendPercentage: userMetrics?.activeUsersTrend,
      color: 'purple',
      icon: Users,
      description: 'Usuarios activos en tiempo real',
      status: 'good'
    },
    {
      id: 'page_views',
      title: 'Vistas de Página',
      value: formatNumber(userMetrics?.pageViews || 0),
      unit: 'hoy',
      trend: 'up',
      trendPercentage: userMetrics?.pageViewsTrend,
      color: 'blue',
      icon: Eye,
      description: 'Total de páginas vistas hoy',
      status: 'good'
    },
    {
      id: 'avg_session',
      title: 'Sesión Promedio',
      value: formatTime(userMetrics?.avgSessionDuration || 0),
      trend: 'up',
      color: 'green',
      icon: Clock,
      description: 'Duración promedio de sesión',
      status: 'good'
    },
    {
      id: 'bounce_rate',
      title: 'Tasa de Rebote',
      value: `${(userMetrics?.bounceRate || 0).toFixed(1)}%`,
      trend: 'down',
      color: userMetrics?.bounceRate > 60 ? 'red' : userMetrics?.bounceRate > 40 ? 'yellow' : 'green',
      icon: RotateCcw,
      description: 'Porcentaje de usuarios que abandonan rápido',
      status: (userMetrics?.bounceRate || 0) < 30 ? 'excellent' : 
              (userMetrics?.bounceRate || 0) < 50 ? 'good' : 
              (userMetrics?.bounceRate || 0) < 70 ? 'warning' : 'critical'
    }
  ];

  const renderMetricCard = (metric: MetricCard) => (
    <Card key={metric.id}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              metric.color === 'green' ? 'bg-green-100' :
              metric.color === 'blue' ? 'bg-blue-100' :
              metric.color === 'yellow' ? 'bg-yellow-100' :
              metric.color === 'red' ? 'bg-red-100' :
              'bg-purple-100'
            }`}>
              <metric.icon className={`w-6 h-6 ${
                metric.color === 'green' ? 'text-green-600' :
                metric.color === 'blue' ? 'text-blue-600' :
                metric.color === 'yellow' ? 'text-yellow-600' :
                metric.color === 'red' ? 'text-red-600' :
                'text-purple-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                {metric.unit && (
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
            {metric.trendPercentage && (
              <div className="flex items-center mt-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm ml-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trendPercentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {metric.target && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Objetivo: {metric.target}{metric.unit || ''}</span>
              <span>{Math.min(100, ((typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value) / metric.target) * 100).toFixed(0)}%</span>
            </div>
            <Progress 
              value={Math.min(100, ((typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value) / metric.target) * 100)} 
              className="h-2"
            />
          </div>
        )}
        
        {metric.description && (
          <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );

  const renderSystemHealth = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* CPU */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={systemHealth?.cpu || 0} className="w-24 h-2" />
              <span className="text-sm text-gray-600 w-12">{systemHealth?.cpu || 0}%</span>
            </div>
          </div>
          
          {/* Memoria */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Memoria</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={systemHealth?.memory || 0} className="w-24 h-2" />
              <span className="text-sm text-gray-600 w-12">{systemHealth?.memory || 0}%</span>
            </div>
          </div>
          
          {/* Disco */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Disco</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={systemHealth?.disk || 0} className="w-24 h-2" />
              <span className="text-sm text-gray-600 w-12">{systemHealth?.disk || 0}%</span>
            </div>
          </div>
          
          {/* Red */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Red</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemHealth?.network === 'online' ? 'bg-green-500' :
                systemHealth?.network === 'degraded' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 capitalize">{systemHealth?.network || 'unknown'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Estado General</span>
            <div className="flex items-center gap-2">
              {systemHealth?.overall === 'healthy' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : systemHealth?.overall === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium capitalize ${
                systemHealth?.overall === 'healthy' ? 'text-green-600' :
                systemHealth?.overall === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {systemHealth?.overall || 'unknown'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Uptime</span>
        </div>
        <p className="text-2xl font-bold mt-2">99.9%</p>
        <p className="text-xs opacity-80">Últimos 30 días</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">SLA</span>
        </div>
        <p className="text-2xl font-bold mt-2">98.5%</p>
        <p className="text-xs opacity-80">Cumplimiento</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          <span className="text-sm font-medium">Score</span>
        </div>
        <p className="text-2xl font-bold mt-2">95</p>
        <p className="text-xs opacity-80">Performance</p>
      </div>
      
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Carga</span>
        </div>
        <p className="text-2xl font-bold mt-2">{systemHealth?.load || 0.8}</p>
        <p className="text-xs opacity-80">Load Average</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Performance Monitor</h3>
          <p className="text-sm text-gray-600">
            Métricas en tiempo real y monitoreo del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Parar' : 'Auto'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportMetrics}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Main Content */}
      <Tabs value={selectedMetricGroup} onValueChange={(value) => setSelectedMetricGroup(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="user">Usuarios</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSystemHealth()}
            
            {/* Key Metrics Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métricas Principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {systemMetricsCards.slice(0, 4).map(metric => (
                    <div key={metric.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">{metric.title}</p>
                        <p className="font-semibold">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          {showSystemMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemMetricsCards.map(renderMetricCard)}
            </div>
          )}
        </TabsContent>

        {/* User Tab */}
        <TabsContent value="user" className="space-y-6">
          {showUserMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userMetricsCards.map(renderMetricCard)}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Tendencia de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <LineChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Gráfico de rendimiento</p>
                    <p className="text-sm">Próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Uso de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Distribución de recursos</p>
                    <p className="text-sm">Próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Indicator */}
      {realTime && (
        <div className="fixed bottom-4 right-4">
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Tiempo real
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;