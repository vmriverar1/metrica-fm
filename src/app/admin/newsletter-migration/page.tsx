'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Tag,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

import { migrateNewsletterFromJSON, MigrationResult } from '@/scripts/migrate-newsletter';

const NewsletterMigrationPage = () => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      id: 'prepare',
      name: 'Preparar Migración',
      description: 'Validar configuración de Firestore',
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'migrate-authors',
      name: 'Migrar Autores',
      description: '5 autores del equipo con especialidades',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'migrate-categories',
      name: 'Migrar Categorías',
      description: '4 categorías según estrategia de blog',
      icon: <Tag className="h-5 w-5" />
    },
    {
      id: 'migrate-articles',
      name: 'Migrar Artículos',
      description: '3 artículos completos con contenido',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleMigration = async () => {
    setMigrationStatus('running');
    setMigrationResult(null);
    setCurrentStep(0);

    try {
      console.log('🚀 Iniciando migración Newsletter → Firestore...');
      
      // Simular progreso por pasos
      const stepDuration = 2000; // 2 segundos por paso
      
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i + 1);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      // Ejecutar migración via API
      const response = await fetch('/api/admin/migrate-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const apiResult = await response.json();
      
      // Convertir respuesta API al formato MigrationResult esperado
      const result: MigrationResult = {
        success: apiResult.success,
        message: apiResult.message,
        totalDocuments: apiResult.data?.totalDocuments || 0,
        collections: apiResult.data?.collections || {},
        errors: apiResult.data?.errors || [apiResult.error].filter(Boolean),
        idMapping: { authors: {}, categories: {}, articles: {} }
      };
      
      setMigrationResult(result);
      setMigrationStatus(result.success ? 'completed' : 'error');
      
      console.log('✅ Migración completada:', result);

    } catch (error) {
      console.error('❌ Error en migración:', error);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        totalDocuments: 0,
        collections: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        idMapping: { authors: {}, categories: {}, articles: {} }
      });
      setMigrationStatus('error');
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (migrationStatus === 'idle') return 'pending';
    if (migrationStatus === 'running') {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'running';
      return 'pending';
    }
    if (migrationStatus === 'completed') return 'completed';
    if (migrationStatus === 'error') {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'error';
      return 'pending';
    }
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';  
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    if (migrationStatus === 'idle') return 0;
    if (migrationStatus === 'running') return (currentStep / steps.length) * 100;
    if (migrationStatus === 'completed') return 100;
    if (migrationStatus === 'error') return (currentStep / steps.length) * 100;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Migración Newsletter a Firestore</h1>
          <p className="text-gray-600 mt-1">
            Migra el sistema de blog desde JSON a Firestore con datos reales del equipo
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Database className="h-4 w-4 mr-2" />
          Fase 3
        </Badge>
      </div>

      {/* Progress Overview */}
      {migrationStatus !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Progreso de Migración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Estado: {migrationStatus === 'running' && 'Ejecutando...'}
                         {migrationStatus === 'completed' && 'Completado'}
                         {migrationStatus === 'error' && 'Error'}
                </span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Alert */}
      {migrationStatus === 'completed' && migrationResult && migrationResult.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <div>✅ {migrationResult.message}</div>
              <div className="text-sm">
                <strong>Migrados:</strong> {migrationResult.totalDocuments} documentos en total
              </div>
              {migrationResult.collections && (
                <div className="text-sm space-y-1">
                  <div>• Autores: {migrationResult.collections.authors?.migrated || 0}</div>
                  <div>• Categorías: {migrationResult.collections.categories?.migrated || 0}</div>
                  <div>• Artículos: {migrationResult.collections.articles?.migrated || 0}</div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {(migrationStatus === 'error' || (migrationResult && !migrationResult.success)) && migrationResult && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div><strong>Error en migración:</strong> {migrationResult.message}</div>
              {migrationResult.errors.length > 0 && (
                <div className="text-sm">
                  <strong>Errores detallados:</strong>
                  <ul className="list-disc ml-4 mt-1">
                    {migrationResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {migrationResult.errors.length > 5 && (
                      <li>... y {migrationResult.errors.length - 5} errores más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Pre-migration Stats */}
      {migrationStatus === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-[#003F6F] mb-3" />
              <div className="text-2xl font-bold text-[#003F6F]">5</div>
              <div className="text-sm text-gray-600">Autores</div>
              <div className="text-xs text-gray-500 mt-1">Con especialidades y métricas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Tag className="h-12 w-12 mx-auto text-[#00A8E8] mb-3" />
              <div className="text-2xl font-bold text-[#00A8E8]">4</div>
              <div className="text-sm text-gray-600">Categorías</div>
              <div className="text-xs text-gray-500 mt-1">Según estrategia de blog</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Artículos</div>
              <div className="text-xs text-gray-500 mt-1">Con contenido markdown completo</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Migration Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos de Migración</CardTitle>
          <CardDescription>
            El proceso migrará los datos JSON existentes a las colecciones Firestore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      {getStatusIcon(status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{step.name}</h3>
                        <Badge className={getStatusColor(status)}>
                          {status === 'pending' && 'Pendiente'}
                          {status === 'running' && 'Ejecutando'}
                          {status === 'completed' && 'Completado'}
                          {status === 'error' && 'Error'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {migrationStatus === 'idle' ? (
          <Button 
            onClick={handleMigration}
            className="bg-[#003F6F] hover:bg-[#002A4E]"
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Iniciar Migración a Firestore
          </Button>
        ) : migrationStatus === 'completed' ? (
          <div className="flex gap-4">
            <Button 
              onClick={() => window.open('/admin/json-crud/newsletter', '_blank')}
              className="bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Panel Admin Newsletter
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nueva Migración
            </Button>
          </div>
        ) : migrationStatus === 'running' ? (
          <Button disabled className="cursor-not-allowed">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Migrando datos...
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button 
              onClick={handleMigration}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Migración
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Esta migración transferirá los datos JSON del newsletter a las colecciones 
          Firestore (blog_authors, blog_categories, blog_articles). Los datos originales en JSON se mantendrán intactos.
          {migrationResult?.data?.demoMode && (
            <div className="mt-2 text-amber-600">
              <strong>⚠️ MODO DEMO:</strong> Las credenciales Firebase son de ejemplo. La migración es simulada para demostración.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NewsletterMigrationPage;