'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, ExternalLink, Eye, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import StatisticsManager from '@/components/admin/dynamic-content/StatisticsManager';

export default function StatisticsManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb y navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dynamic-content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          <div className="h-6 border-l border-muted-foreground/20" />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Gestión de Estadísticas
            </h1>
            <p className="text-muted-foreground">
              Administra las métricas y logros destacados de la empresa
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Ver Estadísticas
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dynamic-content" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Información sobre estadísticas */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Estadísticas de Logros y Métricas</CardTitle>
          <CardDescription>
            Las estadísticas comunican los logros más importantes de Métrica DIP de forma visual e impactante. 
            Se presentan con animaciones de conteo y efectos visuales que captan la atención de los visitantes, 
            generando credibilidad y confianza en los servicios de la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Award className="h-4 w-4" />
                Impacto Comercial
              </h4>
              <p className="text-muted-foreground">
                Las estadísticas son el primer elemento que ven los visitantes, 
                estableciendo inmediatamente la credibilidad y experiencia de la empresa.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">🎨 Presentación Visual</h4>
              <p className="text-muted-foreground">
                Números grandes y prominentes con animaciones de conteo ascendente, 
                iconos descriptivos y colores que transmiten profesionalismo.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Métricas Clave
              </h4>
              <p className="text-muted-foreground">
                Proyectos ejecutados, metros cuadrados construidos, años de experiencia 
                y satisfacción del cliente son las métricas más impactantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de estadísticas */}
      <StatisticsManager />

      {/* Estrategia de métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📈 Estrategia de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 text-primary">Psicología de Números</h4>
                <p className="text-muted-foreground">
                  Los números grandes generan credibilidad inmediata. Usar métricas como 
                  "150+ Proyectos" o "2M M2" crea una percepción de experiencia sólida.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Jerarquía de Impacto:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Experiencia Temporal:</strong> Años en el mercado (15+)</li>
                  <li>• <strong>Volumen de Trabajo:</strong> Proyectos ejecutados (150+)</li>
                  <li>• <strong>Escala de Construcción:</strong> M2 construidos (2M+)</li>
                  <li>• <strong>Satisfacción:</strong> Porcentaje de clientes satisfechos (98%)</li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">🎯 Objetivos de Conversión</h4>
                <p className="text-green-800 text-sm">
                  Las estadísticas deben generar confianza inmediata y motivar 
                  a los visitantes a explorar más sobre los servicios de la empresa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚡ Sistema de Animaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-3">🎭 Efectos Implementados</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Counter Up:</strong> Conteo desde 0 hasta el valor final</li>
                  <li>• <strong>Intersection Observer:</strong> Animación al entrar en vista</li>
                  <li>• <strong>Easing:</strong> Curvas de animación suaves</li>
                  <li>• <strong>Stagger:</strong> Aparición secuencial de estadísticas</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">⚙️ Configuración Técnica</h4>
                <div className="space-y-1 text-muted-foreground font-mono text-xs">
                  <p><strong>Duración:</strong> 2.5 segundos por estadística</p>
                  <p><strong>Delay:</strong> 0.3s entre cada una</p>
                  <p><strong>Trigger:</strong> 50% visible en viewport</p>
                  <p><strong>Librería:</strong> GSAP + React Intersection Observer</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">🚀 Rendimiento</h4>
                <p className="text-blue-800 text-sm">
                  Animaciones optimizadas con hardware acceleration y 
                  debounce para evitar problemas de rendimiento en dispositivos móviles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información técnica actualizada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">📂 Almacenamiento y APIs</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="font-mono">
                  <p><strong>Archivo:</strong> public/json/pages/home.json</p>
                  <p><strong>Ruta:</strong> stats.statistics[]</p>
                  <p><strong>Componente:</strong> src/components/landing/stats.tsx</p>
                </div>
                <div className="pt-2 border-t">
                  <p><strong>APIs Disponibles:</strong></p>
                  <div className="font-mono text-xs">
                    <p>GET /api/admin/dynamic-elements/statistics</p>
                    <p>POST /api/admin/dynamic-elements/statistics</p>
                    <p>PATCH /api/admin/dynamic-elements/statistics/[id]</p>
                    <p>DELETE /api/admin/dynamic-elements/statistics/[id]</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">✨ Características Avanzadas</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Validación de Iconos:</strong> Verificación con Lucide React</li>
                <li>• <strong>Formateo de Números:</strong> Separadores de miles automáticos</li>
                <li>• <strong>Responsive Design:</strong> Adaptación a todos los dispositivos</li>
                <li>• <strong>Accessibility:</strong> ARIA labels para lectores de pantalla</li>
                <li>• <strong>Performance:</strong> Lazy loading y optimizaciones</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">🔄 Migración desde HomePageEditor</h4>
            <p className="text-sm text-muted-foreground mb-3">
              El sistema anterior en HomePageEditor.tsx ha sido reemplazado por esta implementación 
              más robusta con las siguientes mejoras:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Drag & drop para reordenamiento</li>
                <li>✅ Validación avanzada de campos</li>
                <li>✅ Preview en tiempo real</li>
                <li>✅ Gestión de errores mejorada</li>
              </ul>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Interface más intuitiva</li>
                <li>✅ APIs RESTful completas</li>
                <li>✅ Componentes reutilizables</li>
                <li>✅ Mejor experiencia de usuario</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de estructura de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Estructura de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "id": "projects-completed",
  "icon": "Building",
  "title": "Proyectos Completados",
  "description": "Número total de proyectos de infraestructura exitosamente ejecutados por nuestro equipo de profesionales especializados.",
  "value": 150,
  "suffix": "+",
  "label": "Proyectos Ejecutados",
  "order": 1,
  "enabled": true,
  "created_at": "2025-01-27T15:00:00Z",
  "updated_at": "2025-01-27T15:00:00Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}