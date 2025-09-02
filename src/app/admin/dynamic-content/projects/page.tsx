'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen, ExternalLink, Eye, Trophy, Building, MapPin } from 'lucide-react';
import Link from 'next/link';
import ProjectsManager from '@/components/admin/dynamic-content/ProjectsManager';

export default function ProjectsManagementPage() {
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
              <FolderOpen className="h-8 w-8 text-primary" />
              Gestión de Proyectos
            </h1>
            <p className="text-muted-foreground">
              Administra el portafolio de proyectos destacados
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Ver Portafolio
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

      {/* Información sobre el portafolio */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Portafolio de Proyectos Destacados</CardTitle>
          <CardDescription>
            El portafolio representa la experiencia y capacidades de Métrica DIP a través de proyectos 
            emblemáticos y casos de éxito. Se presenta de forma visual e interactiva para generar 
            confianza y demostrar la calidad técnica de los servicios ofrecidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Casos de Éxito
              </h4>
              <p className="text-muted-foreground">
                Proyectos que demuestran expertise técnico, capacidad de ejecución 
                y resultados exitosos en diferentes sectores y escalas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Building className="h-4 w-4" />
                Diversidad Sectorial
              </h4>
              <p className="text-muted-foreground">
                Proyectos en múltiples sectores: comercial, residencial, industrial, 
                infraestructura, educativo y salud, mostrando versatilidad.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alcance Geográfico
              </h4>
              <p className="text-muted-foreground">
                Proyectos distribuidos geográficamente que evidencian 
                la capacidad de trabajo en diferentes regiones del país.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de proyectos */}
      <ProjectsManager />

      {/* Estrategia de portafolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Estrategia de Portafolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 text-primary">Objetivos Comerciales</h4>
                <p className="text-muted-foreground">
                  El portafolio debe generar confianza, demostrar capacidades técnicas 
                  y posicionar a Métrica DIP como líder en gestión integral de proyectos.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Criterios de Selección:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Impacto Visual:</strong> Proyectos fotogénicos y representativos</li>
                  <li>• <strong>Diversidad Técnica:</strong> Diferentes complejidades y soluciones</li>
                  <li>• <strong>Relevancia Sectorial:</strong> Proyectos en mercados objetivo</li>
                  <li>• <strong>Calidad Referencial:</strong> Casos que generen nuevas oportunidades</li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">💡 Estrategia de Rotación</h4>
                <p className="text-green-800 text-sm">
                  Mantener un balance entre proyectos actuales (30%), recientes (50%) 
                  y emblemáticos históricos (20%) para mostrar continuidad y crecimiento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Información Técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-3">📂 Almacenamiento de Datos</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Archivo:</strong> public/json/pages/home.json</p>
                  <p><strong>Ruta:</strong> portfolio.featured_projects[]</p>
                  <p><strong>Componente:</strong> portfolio-section.tsx</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔄 APIs de Gestión</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Listar:</strong> GET /api/.../projects</p>
                  <p><strong>Crear:</strong> POST /api/.../projects</p>
                  <p><strong>Editar:</strong> PATCH /api/.../projects/[id]</p>
                  <p><strong>Eliminar:</strong> DELETE /api/.../projects/[id]</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🎨 Características de Presentación</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Grid Masonry:</strong> Layout adaptativo</li>
                  <li>• <strong>Filtros:</strong> Por tipo de proyecto</li>
                  <li>• <strong>Modal:</strong> Vista detallada ampliada</li>
                  <li>• <strong>Lazy Loading:</strong> Carga progresiva de imágenes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas y objetivos de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Métricas y Objetivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">🎯 KPIs del Portafolio</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-primary">8-12</div>
                  <p className="text-xs text-muted-foreground">Proyectos activos</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">6</div>
                  <p className="text-xs text-muted-foreground">Tipos diferentes</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">100%</div>
                  <p className="text-xs text-muted-foreground">Con imagen HD</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-orange-600">30%</div>
                  <p className="text-xs text-muted-foreground">Rotación anual</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">🚀 Objetivos de Impacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Tiempo de Visualización:</strong> Incrementar tiempo promedio en portafolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Generación de Leads:</strong> Aumentar consultas por proyectos específicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Credibilidad:</strong> Posicionar expertise en sectores estratégicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Diferenciación:</strong> Destacar calidad técnica vs competencia</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de estructura de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Estructura de Datos de Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "id": "hotel-hilton-balta",
  "icon": "Building",
  "title": "Gestión Integral Hotel Hilton",
  "description": "Supervisión y gestión integral de la construcción del Hotel Hilton Balta, incluyendo coordinación multidisciplinaria y control de calidad en todas las fases del proyecto.",
  "name": "Hotel Hilton Balta",
  "type": "Comercial",
  "image": "https://example.com/hilton-balta.jpg",
  "image_fallback": "/img/projects/hilton-balta.jpg",
  "order": 1,
  "enabled": true,
  "created_at": "2025-01-27T14:00:00Z",
  "updated_at": "2025-01-27T14:00:00Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}