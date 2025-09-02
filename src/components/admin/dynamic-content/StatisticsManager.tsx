'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  BarChart3, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Hash,
  Target,
  Award
} from 'lucide-react';
import UniversalCardManager from './UniversalCardManager';
import { StatisticElement } from '@/types/dynamic-elements';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface StatisticsManagerProps {
  className?: string;
}

export default function StatisticsManager({ className = '' }: StatisticsManagerProps) {
  const {
    elements: statistics,
    loading,
    error,
    create,
    update,
    delete: deleteStatistic,
    reorder
  } = useDynamicElements<StatisticElement>('statistics');

  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Filtrar estadísticas según búsqueda
  const filteredStatistics = statistics.filter(stat =>
    stat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stat.label && stat.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Métricas del sistema
  const stats = {
    total: statistics.length,
    active: statistics.filter(s => s.enabled !== false).length,
    inactive: statistics.filter(s => s.enabled === false).length,
    highValue: statistics.filter(s => s.value && s.value > 100).length,
    totalValue: statistics.reduce((sum, s) => sum + (s.value || 0), 0)
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Gestión de Estadísticas
          </h2>
          <p className="text-muted-foreground">
            Administra las métricas y logros destacados de la empresa
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Ocultar Stats' : 'Mostrar Stats'}
        </Button>
      </div>

      {/* Panel de estadísticas mejorado */}
      {showStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stats</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Estadísticas registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Visibles en el sitio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  Ocultas temporalmente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alto Impacto</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.highValue}</div>
                <p className="text-xs text-muted-foreground">
                  Valor mayor a 100
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Suma de todos los valores
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por sufijos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Tipo de Métrica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...new Set(statistics.map(s => s.suffix).filter(Boolean))].map(suffix => {
                  const count = statistics.filter(s => s.suffix === suffix).length;
                  return (
                    <div key={suffix} className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold text-primary">{count}</div>
                      <p className="text-xs text-muted-foreground">Con sufijo "{suffix}"</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra de búsqueda mejorada */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar estadísticas por título, descripción o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Badge variant="secondary">
            {filteredStatistics.length} de {statistics.length} estadísticas
          </Badge>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando estadísticas...</span>
        </div>
      )}

      {/* Manager universal para estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Logros</CardTitle>
          <CardDescription>
            Gestiona las métricas clave que destacan los logros y capacidades de Métrica DIP.
            Estas estadísticas se muestran prominentemente en la página principal con animaciones atractivas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalCardManager
            elements={searchTerm ? filteredStatistics : statistics}
            elementType="statistics"
            onAdd={create}
            onEdit={update}
            onDelete={deleteStatistic}
            onReorder={reorder}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Información específica sobre estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Información sobre Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Campos Específicos de Estadísticas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Valor:</strong> Número principal a mostrar</li>
                  <li>• <strong>Sufijo:</strong> Unidad o indicador (M, K, %, +)</li>
                  <li>• <strong>Etiqueta:</strong> Texto descriptivo corto</li>
                  <li>• <strong>Título:</strong> Nombre de la estadística</li>
                  <li>• <strong>Descripción:</strong> Explicación detallada</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">📊 Tipos de Estadísticas:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Proyectos:</strong> Cantidad de proyectos ejecutados</li>
                  <li>• <strong>Experiencia:</strong> Años en el mercado</li>
                  <li>• <strong>Construcción:</strong> M2 construidos, proyectos</li>
                  <li>• <strong>Satisfacción:</strong> Porcentajes de satisfacción</li>
                  <li>• <strong>Equipo:</strong> Número de profesionales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Presentación y Animaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">🎨 Efectos Visuales</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Las estadísticas se presentan con animaciones de conteo ascendente 
                y efectos visuales que captan la atención del usuario.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Counter Animation:</strong> Conteo desde 0 hasta el valor</li>
                <li>• <strong>Slide In:</strong> Aparición progresiva al hacer scroll</li>
                <li>• <strong>Icon Animation:</strong> Iconos con efectos de hover</li>
                <li>• <strong>Color Coding:</strong> Colores que transmiten confianza</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">💡 Mejores Prácticas:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Mantén 4-6 estadísticas para impacto óptimo</li>
                <li>• Usa valores realistas y verificables</li>
                <li>• Sufijos claros y universalmente entendidos</li>
                <li>• Etiquetas concisas pero descriptivas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplos y sugerencias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Ejemplos y Sugerencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">💼 Estadísticas de Proyectos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>150+</strong> Proyectos Ejecutados</li>
                <li>• <strong>2M</strong> M2 Construidos</li>
                <li>• <strong>50+</strong> Clientes Satisfechos</li>
                <li>• <strong>15</strong> Años de Experiencia</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">👥 Estadísticas de Equipo</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>25+</strong> Profesionales Especializados</li>
                <li>• <strong>100%</strong> Ingenieros Colegiados</li>
                <li>• <strong>95%</strong> Retención de Personal</li>
                <li>• <strong>500+</strong> Horas de Capacitación Anual</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">⭐ Estadísticas de Calidad</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>99%</strong> Satisfacción del Cliente</li>
                <li>• <strong>100%</strong> Proyectos Entregados a Tiempo</li>
                <li>• <strong>0</strong> Accidentes Graves</li>
                <li>• <strong>ISO 9001</strong> Certificación de Calidad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validaciones y tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✅ Validaciones y Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">🔍 Validaciones Automáticas</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Valor Numérico:</strong> Solo se permiten números</li>
                <li>• <strong>Rango de Valores:</strong> Mínimo 0, máximo 999,999</li>
                <li>• <strong>Sufijos Válidos:</strong> Lista predefinida de opciones</li>
                <li>• <strong>Iconos:</strong> Validación con biblioteca Lucide React</li>
                <li>• <strong>Longitud de Texto:</strong> Límites para títulos y etiquetas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">💡 Recomendaciones de Uso</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Actualización:</strong> Revisa valores trimestralmente</li>
                <li>• <strong>Credibilidad:</strong> Usa solo datos verificables</li>
                <li>• <strong>Impacto:</strong> Prioriza métricas que generen confianza</li>
                <li>• <strong>Consistencia:</strong> Mantén formato uniforme en sufijos</li>
                <li>• <strong>Progresión:</strong> Muestra crecimiento en el tiempo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}