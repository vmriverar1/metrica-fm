'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  Award,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  PieChart,
  LineChart,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qualityMetrics } from '@/data/iso-sample';
import { QualityMetric, formatMetricValue } from '@/types/iso';
import { cn } from '@/lib/utils';

// Simulated real-time data updates
const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState(qualityMetrics);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        currentValue: metric.currentValue + (Math.random() - 0.5) * (metric.target * 0.02) // ±2% variation
      })));
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, lastUpdated };
};

// Chart component for metric visualization
interface MetricChartProps {
  metric: QualityMetric;
  showTrend?: boolean;
}

function MetricChart({ metric, showTrend = true }: MetricChartProps) {
  const percentage = Math.min((metric.currentValue / metric.target) * 100, 100);
  const isAboveTarget = metric.currentValue >= metric.target;
  const variance = ((metric.currentValue - metric.target) / metric.target) * 100;

  // Generate sample trend data
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const baseValue = metric.target * 0.8;
    const variation = Math.sin(i * 0.5) * (metric.target * 0.1);
    const growth = (i / 11) * (metric.currentValue - baseValue);
    return Math.max(0, baseValue + variation + growth);
  });

  return (
    <div className="space-y-4">
      {/* Main Metric Display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {formatMetricValue(metric.currentValue, metric.unit)}
          </div>
          <div className="text-sm text-muted-foreground">
            Meta: {formatMetricValue(metric.target, metric.unit)}
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            variance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {variance >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(variance).toFixed(1)}%
          </div>
          <Badge className={cn(
            "text-xs",
            isAboveTarget 
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-yellow-100 text-yellow-800 border-yellow-200"
          )}>
            {isAboveTarget ? 'En Meta' : 'Por Debajo'}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className={cn(
            "h-3",
            isAboveTarget ? "bg-green-100" : "bg-yellow-100"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{percentage.toFixed(1)}%</span>
          <span>Meta</span>
        </div>
      </div>

      {/* Trend Chart */}
      {showTrend && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Tendencia (12 meses)</span>
            <div className={cn(
              "text-xs font-medium",
              trendData[11] > trendData[0] ? "text-green-600" : "text-red-600"
            )}>
              {trendData[11] > trendData[0] ? "↗ Crecimiento" : "↘ Descenso"}
            </div>
          </div>
          
          {/* Simple SVG chart */}
          <div className="h-16 bg-muted/30 rounded-md p-2 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <polyline
                points={trendData.map((value, index) => 
                  `${(index / 11) * 100},${40 - (value / metric.target) * 30}`
                ).join(' ')}
                stroke="rgb(var(--primary))"
                strokeWidth="1.5"
                fill="none"
                className="opacity-80"
              />
              <defs>
                <linearGradient id={`gradient-${metric.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,40 ${trendData.map((value, index) => 
                  `${(index / 11) * 100},${40 - (value / metric.target) * 30}`
                ).join(' ')} 100,40`}
                fill={`url(#gradient-${metric.id})`}
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ISOMetrics() {
  const { metrics, lastUpdated } = useRealTimeMetrics();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'chart' | 'table'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate summary statistics
  const totalMetrics = metrics.length;
  const metricsOnTarget = metrics.filter(m => m.currentValue >= m.target).length;
  const averagePerformance = (metrics.reduce((sum, m) => sum + (m.currentValue / m.target), 0) / totalMetrics) * 100;
  const criticalMetrics = metrics.filter(m => m.currentValue < m.target * 0.8).length;

  // Filter metrics by category
  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(metrics.map(m => m.category)))];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'Todas las Métricas',
      customer_satisfaction: 'Satisfacción del Cliente',
      operational_efficiency: 'Eficiencia Operacional',
      quality_performance: 'Desempeño de Calidad',
      compliance: 'Cumplimiento Normativo'
    };
    return labels[category] || category;
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Dashboard de Métricas ISO
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Métricas de <span className="text-primary">Desempeño en Tiempo Real</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Monitoreo continuo de indicadores clave de rendimiento que demuestran 
            nuestro compromiso con la excelencia y mejora continua del sistema de gestión de calidad.
          </p>
        </motion.div>

        {/* Dashboard Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-between items-center gap-4 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Última actualización: {lastUpdated.toLocaleTimeString('es-PE')}
              </span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chart')}
                className="rounded-none"
              >
                <LineChart className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <PieChart className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {((metricsOnTarget / totalMetrics) * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{metricsOnTarget}</div>
              <div className="text-sm text-muted-foreground">Métricas en Meta</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Excelente
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{averagePerformance.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Rendimiento Promedio</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  criticalMetrics > 0 ? "bg-yellow-100" : "bg-green-100"
                )}>
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    criticalMetrics > 0 ? "text-yellow-600" : "text-green-600"
                  )} />
                </div>
                <Badge className={cn(
                  "text-xs",
                  criticalMetrics > 0 
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-green-100 text-green-800 border-green-200"
                )}>
                  {criticalMetrics > 0 ? 'Atención' : 'OK'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">{criticalMetrics}</div>
              <div className="text-sm text-muted-foreground">Métricas Críticas</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xs text-muted-foreground">
                  En tiempo real
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalMetrics}</div>
              <div className="text-sm text-muted-foreground">Total Métricas</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {filteredMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-base font-semibold">{metric.name}</div>
                          <div className="text-sm text-muted-foreground font-normal">
                            {getCategoryLabel(metric.category)}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MetricChart metric={metric} />
                      
                      {metric.description && (
                        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                          {metric.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Última medición
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'chart' && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Vista de Gráficos Consolidados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {filteredMetrics.slice(0, 4).map((metric) => (
                      <div key={metric.id} className="space-y-4">
                        <h4 className="font-semibold text-foreground">{metric.name}</h4>
                        <MetricChart metric={metric} showTrend={true} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tabla de Métricas Detallada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-semibold">Métrica</th>
                          <th className="text-left p-4 font-semibold">Categoría</th>
                          <th className="text-right p-4 font-semibold">Actual</th>
                          <th className="text-right p-4 font-semibold">Meta</th>
                          <th className="text-right p-4 font-semibold">% Cumplimiento</th>
                          <th className="text-center p-4 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMetrics.map((metric) => {
                          const compliance = (metric.currentValue / metric.target) * 100;
                          const isOnTarget = metric.currentValue >= metric.target;
                          
                          return (
                            <tr key={metric.id} className="border-b hover:bg-muted/30">
                              <td className="p-4 font-medium">{metric.name}</td>
                              <td className="p-4 text-muted-foreground">
                                {getCategoryLabel(metric.category)}
                              </td>
                              <td className="p-4 text-right font-medium">
                                {formatMetricValue(metric.currentValue, metric.unit)}
                              </td>
                              <td className="p-4 text-right">
                                {formatMetricValue(metric.target, metric.unit)}
                              </td>
                              <td className="p-4 text-right">
                                <span className={cn(
                                  "font-medium",
                                  compliance >= 100 ? "text-green-600" : "text-yellow-600"
                                )}>
                                  {compliance.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <Badge className={cn(
                                  "text-xs",
                                  isOnTarget 
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                )}>
                                  {isOnTarget ? (
                                    <><CheckCircle className="w-3 h-3 mr-1" />En Meta</>
                                  ) : (
                                    <><Clock className="w-3 h-3 mr-1" />Por Mejorar</>
                                  )}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights and Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Insights Automatizados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Excelente Rendimiento</span>
                </div>
                <p className="text-sm text-green-700">
                  {metricsOnTarget} de {totalMetrics} métricas están cumpliendo o superando sus objetivos.
                </p>
              </div>
              
              {criticalMetrics > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Atención Requerida</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {criticalMetrics} métricas requieren atención inmediata para mantener estándares de calidad.
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Tendencia Positiva</span>
                </div>
                <p className="text-sm text-blue-700">
                  El rendimiento promedio de {averagePerformance.toFixed(1)}% indica un sistema de gestión robusto y eficiente.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Acciones Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Generar Plan de Mejora
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Programar Revisión Trimestral
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte Ejecutivo
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Configurar Alertas
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold mb-4">
                ¿Necesitas acceso completo al dashboard de métricas?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  <Eye className="w-4 h-4 mr-2" />
                  Acceder al Dashboard Completo
                </Button>
                <Button variant="outline">
                  <Award className="w-4 h-4 mr-2" />
                  Ver Certificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}