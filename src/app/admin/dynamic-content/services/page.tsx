'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, ExternalLink, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import ServicesManager from '@/components/admin/dynamic-content/ServicesManager';

export default function ServicesManagementPage() {
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
              <Briefcase className="h-8 w-8 text-primary" />
              Gestión de Servicios
            </h1>
            <p className="text-muted-foreground">
              Administra los servicios secundarios y especializados
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Ver en Sitio
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

      {/* Información sobre servicios */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Servicios Secundarios y Especializados</CardTitle>
          <CardDescription>
            Los servicios secundarios complementan la oferta principal de Métrica FM, 
            mostrando capacidades adicionales en consultoría, supervisión, auditoría y capacitación. 
            Se presentan en una sección dedicada para destacar la amplitud de expertise de la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Star className="h-4 w-4" />
                Servicios Premium
              </h4>
              <p className="text-muted-foreground">
                Servicios especializados que complementan la oferta principal, 
                dirigidos a clientes que requieren expertise adicional y consultoría avanzada.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">🎨 Presentación Visual</h4>
              <p className="text-muted-foreground">
                Cards organizadas en grilla responsive con imágenes representativas, 
                títulos claros y descripciones que destacan el valor diferencial.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">📈 Objetivos Comerciales</h4>
              <p className="text-muted-foreground">
                Ampliar la percepción de capacidades de la empresa y generar 
                oportunidades de negocio en áreas de alta especialización.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de servicios */}
      <ServicesManager />

      {/* Estrategia de servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Estrategia de Posicionamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 text-primary">Diferenciación Competitiva</h4>
                <p className="text-muted-foreground">
                  Los servicios secundarios posicionan a Métrica FM como un socio integral 
                  capaz de acompañar proyectos desde la concepción hasta la operación.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Áreas Estratégicas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Consultoría Pre-Inversión:</strong> Estudios de factibilidad y diseño</li>
                  <li>• <strong>Supervisión Integral:</strong> Control total del ciclo de proyecto</li>
                  <li>• <strong>Auditoría Especializada:</strong> Evaluación técnica y de cumplimiento</li>
                  <li>• <strong>Desarrollo de Capacidades:</strong> Formación y transferencia de conocimiento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💼 Información Técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-3">📂 Almacenamiento</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Archivo:</strong> public/json/pages/home.json</p>
                  <p><strong>Ruta:</strong> services.secondary_services[]</p>
                  <p><strong>Componente:</strong> services-section.tsx</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔄 APIs Disponibles</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Listar:</strong> GET /api/.../services</p>
                  <p><strong>Crear:</strong> POST /api/.../services</p>
                  <p><strong>Editar:</strong> PATCH /api/.../services/[id]</p>
                  <p><strong>Eliminar:</strong> DELETE /api/.../services/[id]</p>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">✅ Estado</h4>
                <p className="text-green-800">
                  Sistema completamente funcional con gestión CRUD, 
                  reordenamiento y validación de datos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas y KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Métricas y Objetivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">4-8</div>
              <p className="text-sm text-muted-foreground">Servicios recomendados</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-sm text-muted-foreground">Con imagen de calidad</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">3s</div>
              <p className="text-sm text-muted-foreground">Tiempo de carga objetivo</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <p className="text-sm text-muted-foreground">Satisfacción visual</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">📈 Objetivos de Conversión</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-1 text-muted-foreground">
                <li>• Incrementar consultas por servicios especializados</li>
                <li>• Posicionar a Métrica FM como consultor integral</li>
                <li>• Generar leads calificados en nichos específicos</li>
              </ul>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Diferenciarse de competidores tradicionales</li>
                <li>• Comunicar amplitud de capacidades técnicas</li>
                <li>• Establecer credibilidad en múltiples sectores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de estructura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Estructura de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "id": "consulting-services",
  "icon": "Lightbulb",
  "title": "Consultoría Especializada",
  "description": "Brindamos asesoría técnica especializada en todas las fases del proyecto, desde estudios de factibilidad hasta optimización de procesos constructivos.",
  "image": "https://example.com/consulting.jpg",
  "image_fallback": "/img/services/consulting.jpg",
  "order": 1,
  "enabled": true,
  "created_at": "2025-01-27T12:00:00Z",
  "updated_at": "2025-01-27T12:00:00Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}