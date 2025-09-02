'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  HardDrive, 
  Wifi, 
  CheckCircle, 
  AlertTriangle,
  Play,
  RotateCcw,
  Settings,
  Monitor
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  threshold: number;
  recommendation?: string;
}

interface OptimizationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  impact: 'low' | 'medium' | 'high';
  category: 'loading' | 'rendering' | 'memory' | 'network';
}

export default function MegaMenuPerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'load-time',
      name: 'Tiempo de Carga Inicial',
      value: 1.2,
      unit: 's',
      status: 'good',
      threshold: 2.0,
      recommendation: 'Excelente tiempo de carga'
    },
    {
      id: 'first-interaction',
      name: 'Tiempo Primer Interacción',
      value: 0.8,
      unit: 's',
      status: 'good',
      threshold: 1.0
    },
    {
      id: 'memory-usage',
      name: 'Uso de Memoria',
      value: 12.5,
      unit: 'MB',
      status: 'warning',
      threshold: 10.0,
      recommendation: 'Considera optimizar imágenes grandes'
    },
    {
      id: 'bundle-size',
      name: 'Tamaño del Bundle',
      value: 145,
      unit: 'KB',
      status: 'good',
      threshold: 200
    },
    {
      id: 'network-requests',
      name: 'Peticiones de Red',
      value: 8,
      unit: 'requests',
      status: 'good',
      threshold: 15
    },
    {
      id: 'dom-complexity',
      name: 'Complejidad DOM',
      value: 150,
      unit: 'nodes',
      status: 'warning',
      threshold: 100,
      recommendation: 'Reduce el número de elementos en megamenús complejos'
    }
  ]);

  const [optimizations, setOptimizations] = useState<OptimizationSetting[]>([
    {
      id: 'lazy-loading',
      name: 'Carga Perezosa de Imágenes',
      description: 'Carga las imágenes solo cuando son necesarias',
      enabled: true,
      impact: 'high',
      category: 'loading'
    },
    {
      id: 'component-memoization',
      name: 'Memoización de Componentes',
      description: 'Evita re-renders innecesarios usando React.memo',
      enabled: true,
      impact: 'medium',
      category: 'rendering'
    },
    {
      id: 'virtual-scrolling',
      name: 'Scroll Virtual',
      description: 'Renderiza solo elementos visibles en listas largas',
      enabled: false,
      impact: 'medium',
      category: 'memory'
    },
    {
      id: 'preload-critical',
      name: 'Precarga de Recursos Críticos',
      description: 'Precarga JSON y recursos esenciales',
      enabled: true,
      impact: 'high',
      category: 'network'
    },
    {
      id: 'debounce-interactions',
      name: 'Debounce en Interacciones',
      description: 'Reduce llamadas API en búsquedas y filtros',
      enabled: true,
      impact: 'medium',
      category: 'network'
    },
    {
      id: 'compress-json',
      name: 'Compresión de JSON',
      description: 'Comprime respuestas JSON del servidor',
      enabled: false,
      impact: 'low',
      category: 'network'
    },
    {
      id: 'css-optimization',
      name: 'Optimización CSS',
      description: 'Minimiza y purga CSS no utilizado',
      enabled: true,
      impact: 'low',
      category: 'loading'
    },
    {
      id: 'image-optimization',
      name: 'Optimización de Imágenes',
      description: 'WebP, compresión automática y responsive images',
      enabled: true,
      impact: 'high',
      category: 'loading'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  // Ejecutar análisis de rendimiento
  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simular análisis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Actualizar métricas con variaciones realistas
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * metric.value * 0.1,
      status: Math.random() > 0.7 ? 'warning' : 'good'
    })));
    
    setLastAnalysis(new Date().toLocaleString());
    setIsAnalyzing(false);
  };

  // Toggle optimización
  const toggleOptimization = (id: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  // Calcular score de performance
  const performanceScore = useMemo(() => {
    const goodMetrics = metrics.filter(m => m.status === 'good').length;
    const totalMetrics = metrics.length;
    return Math.round((goodMetrics / totalMetrics) * 100);
  }, [metrics]);

  // Obtener recomendaciones
  const recommendations = useMemo(() => {
    return metrics
      .filter(m => m.status !== 'good' && m.recommendation)
      .map(m => m.recommendation!);
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loading': return <Clock className="h-4 w-4" />;
      case 'rendering': return <Monitor className="h-4 w-4" />;
      case 'memory': return <HardDrive className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con score general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Optimizador de Rendimiento - MegaMenu
            <Badge variant={performanceScore >= 80 ? 'default' : performanceScore >= 60 ? 'secondary' : 'destructive'}>
              {performanceScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Análisis y optimización del rendimiento del sistema MegaMenu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">Score: {performanceScore}%</div>
              <p className="text-sm text-muted-foreground">
                {lastAnalysis ? `Último análisis: ${lastAnalysis}` : 'Ejecuta un análisis para comenzar'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={runPerformanceAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar Análisis
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rendimiento General</span>
              <span>{performanceScore}%</span>
            </div>
            <Progress value={performanceScore} className="h-2" />
          </div>

          {recommendations.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendaciones:</strong>
                <ul className="list-disc list-inside mt-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizaciones</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>

        {/* Tab de Métricas */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {metric.name}
                    {getStatusIcon(metric.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.unit === 's' ? 1 : 0)}
                    <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Límite: {metric.threshold}{metric.unit}</span>
                      <span className={getStatusColor(metric.status)}>
                        {metric.status === 'good' ? 'Bien' : metric.status === 'warning' ? 'Atención' : 'Error'}
                      </span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold) * 100} 
                      className="h-1"
                    />
                  </div>
                  {metric.recommendation && metric.status !== 'good' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {metric.recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Optimizaciones */}
        <TabsContent value="optimizations">
          <div className="space-y-4">
            {['loading', 'rendering', 'memory', 'network'].map(category => {
              const categoryOpts = optimizations.filter(opt => opt.category === category);
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getCategoryIcon(category)}
                      {category === 'loading' ? 'Carga' : 
                       category === 'rendering' ? 'Renderizado' :
                       category === 'memory' ? 'Memoria' : 'Red'}
                      <Badge variant="outline">{categoryOpts.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryOpts.map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Label htmlFor={opt.id} className="font-medium">
                                {opt.name}
                              </Label>
                              <Badge 
                                variant="outline" 
                                className={getImpactColor(opt.impact)}
                              >
                                {opt.impact === 'high' ? 'Alto' : opt.impact === 'medium' ? 'Medio' : 'Bajo'} impacto
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {opt.description}
                            </p>
                          </div>
                          <Switch
                            id={opt.id}
                            checked={opt.enabled}
                            onCheckedChange={() => toggleOptimization(opt.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab de Análisis */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencias simulado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                      <p>Gráfico de tendencias</p>
                      <p className="text-xs">(Disponible con datos históricos)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-500">+15%</div>
                      <div className="text-xs text-muted-foreground">Mejora semanal</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">-0.3s</div>
                      <div className="text-xs text-muted-foreground">Reducción tiempo carga</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparación con estándares */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación con Estándares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Google Core Web Vitals</span>
                    <Badge variant="default">Aprobado</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lighthouse Performance</span>
                    <Badge variant="default">92/100</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GTmetrix Grade</span>
                    <Badge variant="default">A</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">WebPageTest</span>
                    <Badge variant="secondary">B</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}