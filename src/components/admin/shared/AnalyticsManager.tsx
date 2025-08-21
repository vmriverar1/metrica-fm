'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Filter,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Activity,
  MapPin,
  Settings,
  Plus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// Interfaces principales
export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: 'number' | 'percentage' | 'currency' | 'time' | 'bytes';
  format?: string;
  category: 'traffic' | 'engagement' | 'conversion' | 'performance' | 'content' | 'social';
  description?: string;
  target?: number;
  isKPI: boolean;
  lastUpdated: string;
}

export interface AnalyticsChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'gauge';
  data: any[];
  metrics: string[];
  timeframe: string;
  filters?: Record<string, any>;
  config: {
    width?: number;
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
    colors?: string[];
    animation?: boolean;
  };
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  charts: string[];
  filters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: number;
    time?: string;
    recipients?: string[];
  };
  format: 'pdf' | 'excel' | 'csv' | 'html';
  isActive: boolean;
  lastGenerated?: string;
  nextGeneration?: string;
}

export interface AnalyticsGoal {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  current: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'on-track' | 'at-risk' | 'behind' | 'achieved' | 'failed';
  owner: string;
  progress: number;
  milestones: {
    date: string;
    value: number;
    description: string;
    achieved: boolean;
  }[];
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  realTimeEnabled: boolean;
  retentionDays: number;
  samplingRate: number;
  anonymizeIP: boolean;
  cookieConsent: boolean;
  dataExportEnabled: boolean;
  customDimensions: {
    name: string;
    value: string;
    scope: 'hit' | 'session' | 'user';
  }[];
  integrations: {
    googleAnalytics: { enabled: boolean; trackingId?: string };
    googleTagManager: { enabled: boolean; containerId?: string };
    facebookPixel: { enabled: boolean; pixelId?: string };
    hotjar: { enabled: boolean; siteId?: string };
    linkedInInsight: { enabled: boolean; partnerId?: string };
  };
}

interface AnalyticsManagerProps {
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  reports: AnalyticsReport[];
  goals: AnalyticsGoal[];
  config: AnalyticsConfig;
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
  onMetricsChange: (metrics: AnalyticsMetric[]) => void;
  onChartsChange: (charts: AnalyticsChart[]) => void;
  onReportsChange: (reports: AnalyticsReport[]) => void;
  onGoalsChange: (goals: AnalyticsGoal[]) => void;
  onConfigChange: (config: AnalyticsConfig) => void;
  onRefresh?: () => Promise<void>;
  onExport?: (type: 'pdf' | 'excel' | 'csv') => Promise<void>;
  readOnly?: boolean;
}

const AnalyticsManager: React.FC<AnalyticsManagerProps> = ({
  metrics,
  charts,
  reports,
  goals,
  config,
  timeframe = '30d',
  onMetricsChange,
  onChartsChange,
  onReportsChange,
  onGoalsChange,
  onConfigChange,
  onRefresh,
  onExport,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // KPIs calculados
  const kpiMetrics = useMemo(() => {
    return metrics.filter(metric => metric.isKPI);
  }, [metrics]);

  const categorizedMetrics = useMemo(() => {
    if (selectedCategory === 'all') return metrics;
    return metrics.filter(metric => metric.category === selectedCategory);
  }, [metrics, selectedCategory]);

  // Goals statistics
  const goalsStats = useMemo(() => {
    const total = goals.length;
    const achieved = goals.filter(g => g.status === 'achieved').length;
    const onTrack = goals.filter(g => g.status === 'on-track').length;
    const atRisk = goals.filter(g => g.status === 'at-risk').length;
    const behind = goals.filter(g => g.status === 'behind').length;
    
    return {
      total,
      achieved,
      onTrack,
      atRisk,
      behind,
      achievementRate: total > 0 ? Math.round((achieved / total) * 100) : 0
    };
  }, [goals]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || readOnly) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, readOnly]);

  const handleExport = useCallback(async (type: 'pdf' | 'excel' | 'csv') => {
    if (!onExport) return;
    
    try {
      await onExport(type);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  }, [onExport]);

  const formatMetricValue = (metric: AnalyticsMetric) => {
    const { value, unit, format } = metric;
    
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN'
        }).format(value);
      case 'time':
        return `${Math.round(value)}s`;
      case 'bytes':
        return formatBytes(value);
      default:
        return format ? value.toLocaleString() : value.toString();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800';
      case 'on-track':
        return 'bg-blue-100 text-blue-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock chart data render (in production, use recharts or similar)
  const renderChart = (chart: AnalyticsChart) => {
    return (
      <Card key={chart.id}>
        <CardHeader>
          <CardTitle className="text-base">{chart.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              {chart.type === 'line' && <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
              {chart.type === 'bar' && <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
              {chart.type === 'pie' && <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
              <p className="text-sm text-gray-500">Gráfico {chart.type}</p>
              <p className="text-xs text-gray-400">Datos: {chart.timeframe}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">
            Análisis de rendimiento y métricas del sitio web
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="settings">Config</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {metric.category === 'traffic' && <Users className="w-4 h-4 text-blue-500" />}
                      {metric.category === 'engagement' && <Eye className="w-4 h-4 text-green-500" />}
                      {metric.category === 'conversion' && <Target className="w-4 h-4 text-orange-500" />}
                      {metric.category === 'performance' && <Zap className="w-4 h-4 text-purple-500" />}
                      <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                    </div>
                    {getChangeIcon(metric.changeType)}
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">{formatMetricValue(metric)}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${
                        metric.changeType === 'increase' ? 'text-green-600' :
                        metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {Math.abs(metric.change).toFixed(1)}% vs período anterior
                      </span>
                    </div>
                    {metric.target && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progreso</span>
                          <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Resumen de Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{goalsStats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{goalsStats.achieved}</p>
                  <p className="text-sm text-gray-600">Logrados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{goalsStats.onTrack}</p>
                  <p className="text-sm text-gray-600">En progreso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{goalsStats.atRisk}</p>
                  <p className="text-sm text-gray-600">En riesgo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{goalsStats.behind}</p>
                  <p className="text-sm text-gray-600">Retrasados</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tasa de logro</span>
                  <span>{goalsStats.achievementRate}%</span>
                </div>
                <Progress value={goalsStats.achievementRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Charts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Gráficos Principales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charts.slice(0, 4).map(renderChart)}
            </div>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="traffic">Tráfico</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="conversion">Conversión</SelectItem>
                  <SelectItem value="performance">Rendimiento</SelectItem>
                  <SelectItem value="content">Contenido</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {categorizedMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{metric.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {metric.category}
                        </Badge>
                        {metric.isKPI && (
                          <Badge className="bg-orange-100 text-orange-800">KPI</Badge>
                        )}
                      </div>
                      {metric.description && (
                        <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Actualizado: {new Date(metric.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatMetricValue(metric)}</p>
                        <div className="flex items-center gap-1">
                          {getChangeIcon(metric.changeType)}
                          <span className={`text-sm ${
                            metric.changeType === 'increase' ? 'text-green-600' :
                            metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {Math.abs(metric.change).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {metric.target && (
                        <div className="w-24">
                          <p className="text-xs text-gray-500 mb-1">
                            Meta: {formatMetricValue({...metric, value: metric.target})}
                          </p>
                          <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gráficos Personalizados</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Gráfico
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {charts.map(renderChart)}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Objetivos y Metas</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Objetivo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getGoalStatusColor(goal.status)}>
                        {goal.status === 'achieved' ? 'Logrado' :
                         goal.status === 'on-track' ? 'En progreso' :
                         goal.status === 'at-risk' ? 'En riesgo' :
                         goal.status === 'behind' ? 'Retrasado' : 'Fallido'}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {goal.priority === 'critical' ? 'Crítico' :
                         goal.priority === 'high' ? 'Alto' :
                         goal.priority === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Actual:</span>
                      <p className="font-medium">{goal.current.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Meta:</span>
                      <p className="font-medium">{goal.target.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Responsable:</span>
                      <p className="font-medium">{goal.owner}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha límite:</span>
                      <p className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {goal.milestones.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Hitos</h5>
                      <div className="space-y-2">
                        {goal.milestones.slice(0, 3).map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {milestone.achieved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                            )}
                            <span className={milestone.achieved ? 'line-through text-gray-500' : ''}>
                              {milestone.description}
                            </span>
                            <span className="text-gray-400 ml-auto">
                              {new Date(milestone.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {goal.milestones.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{goal.milestones.length - 3} hitos más
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reportes Programados</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{report.metrics.length} métricas</span>
                        <span>{report.charts.length} gráficos</span>
                        {report.schedule && (
                          <span>Frecuencia: {
                            report.schedule.frequency === 'daily' ? 'Diaria' :
                            report.schedule.frequency === 'weekly' ? 'Semanal' : 'Mensual'
                          }</span>
                        )}
                        {report.lastGenerated && (
                          <span>Último: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.isActive ? 'default' : 'secondary'}>
                        {report.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline" className="uppercase">
                        {report.format}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Analytics</CardTitle>
              <CardDescription>
                Configuración general del sistema de analíticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Configuración General</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tracking">Tracking habilitado</Label>
                    <Switch 
                      id="tracking" 
                      checked={config.trackingEnabled}
                      onCheckedChange={(checked) => 
                        onConfigChange({...config, trackingEnabled: checked})
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime">Tiempo real habilitado</Label>
                    <Switch 
                      id="realtime" 
                      checked={config.realTimeEnabled}
                      onCheckedChange={(checked) => 
                        onConfigChange({...config, realTimeEnabled: checked})
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonymize">Anonimizar IP</Label>
                    <Switch 
                      id="anonymize" 
                      checked={config.anonymizeIP}
                      onCheckedChange={(checked) => 
                        onConfigChange({...config, anonymizeIP: checked})
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label htmlFor="retention">Días de retención</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={config.retentionDays}
                      onChange={(e) => 
                        onConfigChange({...config, retentionDays: parseInt(e.target.value)})
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sampling">Tasa de muestreo (%)</Label>
                    <Input
                      id="sampling"
                      type="number"
                      min="0"
                      max="100"
                      value={config.samplingRate}
                      onChange={(e) => 
                        onConfigChange({...config, samplingRate: parseInt(e.target.value)})
                      }
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Integraciones</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Google Analytics</Label>
                      <Switch 
                        checked={config.integrations.googleAnalytics.enabled}
                        onCheckedChange={(checked) => 
                          onConfigChange({
                            ...config, 
                            integrations: {
                              ...config.integrations,
                              googleAnalytics: {...config.integrations.googleAnalytics, enabled: checked}
                            }
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Google Tag Manager</Label>
                      <Switch 
                        checked={config.integrations.googleTagManager.enabled}
                        onCheckedChange={(checked) => 
                          onConfigChange({
                            ...config, 
                            integrations: {
                              ...config.integrations,
                              googleTagManager: {...config.integrations.googleTagManager, enabled: checked}
                            }
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Facebook Pixel</Label>
                      <Switch 
                        checked={config.integrations.facebookPixel.enabled}
                        onCheckedChange={(checked) => 
                          onConfigChange({
                            ...config, 
                            integrations: {
                              ...config.integrations,
                              facebookPixel: {...config.integrations.facebookPixel, enabled: checked}
                            }
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Hotjar</Label>
                      <Switch 
                        checked={config.integrations.hotjar.enabled}
                        onCheckedChange={(checked) => 
                          onConfigChange({
                            ...config, 
                            integrations: {
                              ...config.integrations,
                              hotjar: {...config.integrations.hotjar, enabled: checked}
                            }
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>LinkedIn Insight</Label>
                      <Switch 
                        checked={config.integrations.linkedInInsight.enabled}
                        onCheckedChange={(checked) => 
                          onConfigChange({
                            ...config, 
                            integrations: {
                              ...config.integrations,
                              linkedInInsight: {...config.integrations.linkedInInsight, enabled: checked}
                            }
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Controls */}
              <Separator />
              <div>
                <h4 className="font-medium mb-4">Exportar Datos</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('excel')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsManager;