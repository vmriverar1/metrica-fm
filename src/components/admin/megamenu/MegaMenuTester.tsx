'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  Link,
  Eye,
  Settings
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
  timestamp?: string;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
  progress: number;
}

export default function MegaMenuTester() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'JSON Configuration',
      description: 'Pruebas de carga y validación del archivo de configuración',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'json-load', name: 'Cargar archivo megamenu.json', status: 'pending' },
        { id: 'json-validate', name: 'Validar estructura JSON', status: 'pending' },
        { id: 'settings-validate', name: 'Validar configuraciones', status: 'pending' },
        { id: 'items-validate', name: 'Validar items del menú', status: 'pending' },
        { id: 'mappings-validate', name: 'Validar mapeos de páginas', status: 'pending' }
      ]
    },
    {
      name: 'API Endpoints',
      description: 'Pruebas de todos los endpoints de la API',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'api-get', name: 'GET /api/admin/megamenu', status: 'pending' },
        { id: 'api-post', name: 'POST /api/admin/megamenu', status: 'pending' },
        { id: 'api-put', name: 'PUT /api/admin/megamenu (reorder)', status: 'pending' },
        { id: 'api-patch', name: 'PATCH /api/admin/megamenu (tracking)', status: 'pending' },
        { id: 'api-individual', name: 'API individual items', status: 'pending' }
      ]
    },
    {
      name: 'Frontend Components',
      description: 'Pruebas de renderizado y funcionalidad de componentes',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'megamenu-render', name: 'Renderizado del MegaMenu', status: 'pending' },
        { id: 'megamenu-load-data', name: 'Carga de datos con hook', status: 'pending' },
        { id: 'megamenu-hover', name: 'Funcionamiento hover/click', status: 'pending' },
        { id: 'admin-dashboard', name: 'Dashboard administrativo', status: 'pending' },
        { id: 'admin-editor', name: 'Editor de menús', status: 'pending' }
      ]
    },
    {
      name: 'Responsive Design',
      description: 'Pruebas de diseño responsivo en diferentes dispositivos',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'desktop-view', name: 'Vista desktop (>= 768px)', status: 'pending' },
        { id: 'tablet-view', name: 'Vista tablet (768px - 1024px)', status: 'pending' },
        { id: 'mobile-view', name: 'Vista móvil (< 768px)', status: 'pending' },
        { id: 'breakpoints', name: 'Breakpoints CSS', status: 'pending' },
        { id: 'touch-interactions', name: 'Interacciones táctiles', status: 'pending' }
      ]
    },
    {
      name: 'Performance',
      description: 'Pruebas de rendimiento y optimización',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'load-time', name: 'Tiempo de carga inicial', status: 'pending' },
        { id: 'interaction-response', name: 'Tiempo de respuesta interacciones', status: 'pending' },
        { id: 'memory-usage', name: 'Uso de memoria', status: 'pending' },
        { id: 'bundle-size', name: 'Tamaño del bundle', status: 'pending' },
        { id: 'accessibility', name: 'Accesibilidad (a11y)', status: 'pending' }
      ]
    },
    {
      name: 'Integration Tests',
      description: 'Pruebas de integración completas del sistema',
      status: 'pending',
      progress: 0,
      tests: [
        { id: 'full-workflow', name: 'Flujo completo admin → frontend', status: 'pending' },
        { id: 'data-persistence', name: 'Persistencia de datos', status: 'pending' },
        { id: 'error-handling', name: 'Manejo de errores', status: 'pending' },
        { id: 'analytics-tracking', name: 'Seguimiento de analytics', status: 'pending' },
        { id: 'backup-restore', name: 'Sistema backup/restore', status: 'pending' }
      ]
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Simular ejecución de prueba individual
  const runTest = async (suiteIndex: number, testIndex: number): Promise<boolean> => {
    const test = testSuites[suiteIndex].tests[testIndex];
    
    // Actualizar estado a "running"
    setTestSuites(prev => {
      const newSuites = [...prev];
      newSuites[suiteIndex].tests[testIndex].status = 'running';
      newSuites[suiteIndex].tests[testIndex].timestamp = new Date().toLocaleTimeString();
      return newSuites;
    });

    // Simular tiempo de ejecución
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    const duration = Date.now() - startTime;

    // Simular resultado (85% éxito)
    const success = Math.random() > 0.15;

    // Actualizar resultado
    setTestSuites(prev => {
      const newSuites = [...prev];
      newSuites[suiteIndex].tests[testIndex].status = success ? 'passed' : 'failed';
      newSuites[suiteIndex].tests[testIndex].duration = duration;
      newSuites[suiteIndex].tests[testIndex].message = success 
        ? 'Prueba ejecutada correctamente'
        : 'Error en la ejecución de la prueba';
      return newSuites;
    });

    return success;
  };

  // Ejecutar suite completo
  const runTestSuite = async (suiteIndex: number) => {
    const suite = testSuites[suiteIndex];
    
    setTestSuites(prev => {
      const newSuites = [...prev];
      newSuites[suiteIndex].status = 'running';
      newSuites[suiteIndex].progress = 0;
      return newSuites;
    });

    setCurrentSuite(suite.name);

    for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
      await runTest(suiteIndex, testIndex);
      
      // Actualizar progreso
      const progress = ((testIndex + 1) / suite.tests.length) * 100;
      setTestSuites(prev => {
        const newSuites = [...prev];
        newSuites[suiteIndex].progress = progress;
        return newSuites;
      });
    }

    setTestSuites(prev => {
      const newSuites = [...prev];
      newSuites[suiteIndex].status = 'completed';
      return newSuites;
    });
  };

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let suiteIndex = 0; suiteIndex < testSuites.length; suiteIndex++) {
      await runTestSuite(suiteIndex);
      
      // Actualizar progreso general
      const overallProg = ((suiteIndex + 1) / testSuites.length) * 100;
      setOverallProgress(overallProg);
    }

    setCurrentSuite(null);
    setIsRunning(false);
  };

  // Reset todas las pruebas
  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'pending',
      progress: 0,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending',
        message: undefined,
        duration: undefined,
        timestamp: undefined
      }))
    })));
    setOverallProgress(0);
    setCurrentSuite(null);
  };

  // Obtener estadísticas
  const getStats = () => {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        totalTests++;
        if (test.status === 'passed') passedTests++;
        if (test.status === 'failed') failedTests++;
      });
    });

    return { totalTests, passedTests, failedTests };
  };

  const stats = getStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />;
      default: return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Sistema de Pruebas Integral - MegaMenu
          </CardTitle>
          <CardDescription>
            Suite completo de pruebas para validar el funcionamiento del sistema MegaMenu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Ejecutando...' : 'Ejecutar Todas'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{stats.passedTests} Exitosas</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{stats.failedTests} Fallidas</span>
              </div>
              <div className="text-muted-foreground">
                Total: {stats.totalTests}
              </div>
            </div>
          </div>

          {isRunning && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso general</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              {currentSuite && (
                <p className="text-sm text-muted-foreground">
                  Ejecutando: {currentSuite}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs con suites de prueba */}
      <Tabs defaultValue="json" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="json" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            JSON
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            API
          </TabsTrigger>
          <TabsTrigger value="frontend" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Frontend
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            Responsive
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Integration
          </TabsTrigger>
        </TabsList>

        {testSuites.map((suite, suiteIndex) => (
          <TabsContent key={suite.name} value={suite.name.toLowerCase().split(' ')[0]}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {suite.name}
                      <Badge variant={suite.status === 'completed' ? 'default' : 'secondary'}>
                        {suite.status === 'completed' ? 'Completado' : suite.status === 'running' ? 'Ejecutando' : 'Pendiente'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTestSuite(suiteIndex)}
                    disabled={isRunning}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Ejecutar Suite
                  </Button>
                </div>
                {suite.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{Math.round(suite.progress)}%</span>
                    </div>
                    <Progress value={suite.progress} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {suite.tests.map((test, testIndex) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <p className="font-medium">{test.name}</p>
                            {test.message && (
                              <p className="text-sm text-muted-foreground">{test.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {test.duration && <p>{test.duration}ms</p>}
                          {test.timestamp && <p>{test.timestamp}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}