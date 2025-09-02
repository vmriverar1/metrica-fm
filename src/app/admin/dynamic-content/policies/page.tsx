'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';
import PoliciesManager from '@/components/admin/dynamic-content/PoliciesManager';

export default function PoliciesManagementPage() {
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
              <Shield className="h-8 w-8 text-primary" />
              Gestión de Políticas
            </h1>
            <p className="text-muted-foreground">
              Administra las políticas empresariales y de calidad
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

      {/* Información sobre políticas */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Políticas Empresariales</CardTitle>
          <CardDescription>
            Las políticas representan los compromisos y estándares de calidad de Métrica DIP. 
            Se presentan a los visitantes a través de un carousel interactivo en la página principal, 
            comunicando los valores institucionales y los marcos de trabajo de la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">🎠 Presentación Carousel</h4>
              <p className="text-muted-foreground">
                Las políticas se muestran en un carousel rotativo con navegación automática 
                y manual, permitiendo destacar múltiples aspectos de calidad.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">🎨 Diseño Visual</h4>
              <p className="text-muted-foreground">
                Cada política se presenta con imagen de fondo, título prominente 
                y descripción explicativa, manteniendo coherencia visual.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">💼 Impacto Empresarial</h4>
              <p className="text-muted-foreground">
                Las políticas comunican credibilidad y profesionalismo, 
                generando confianza en clientes y stakeholders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de políticas */}
      <PoliciesManager />

      {/* Configuración técnica del carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚙️ Configuración del Carousel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Parámetros Actuales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Intervalo:</strong> 5 segundos</li>
                  <li>• <strong>Transición:</strong> Fade suave</li>
                  <li>• <strong>Auto-play:</strong> Habilitado</li>
                  <li>• <strong>Pausa en hover:</strong> Sí</li>
                  <li>• <strong>Loop infinito:</strong> Sí</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Responsive Breakpoints:</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• <strong>Desktop:</strong> 3 políticas visibles</li>
                  <li>• <strong>Tablet:</strong> 2 políticas visibles</li>
                  <li>• <strong>Mobile:</strong> 1 política visible</li>
                </ul>
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
                <h4 className="font-semibold mb-3">📂 Almacenamiento</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Archivo:</strong> public/json/pages/home.json</p>
                  <p><strong>Ruta:</strong> policies.policies[]</p>
                  <p><strong>Componente:</strong> policies-carousel.tsx</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔄 APIs</h4>
                <div className="space-y-1 text-muted-foreground font-mono">
                  <p><strong>Listar:</strong> GET /api/.../policies</p>
                  <p><strong>Crear:</strong> POST /api/.../policies</p>
                  <p><strong>Editar:</strong> PATCH /api/.../policies/[id]</p>
                  <p><strong>Eliminar:</strong> DELETE /api/.../policies/[id]</p>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">✅ Estado del Sistema</h4>
                <p className="text-green-800">
                  Sistema completamente operativo con gestión CRUD, 
                  drag & drop para reordenamiento y preview en tiempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplo de estructura de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Estructura de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "id": "quality-policy",
  "icon": "Shield",
  "title": "Política de Calidad",
  "description": "Comprometidos con los más altos estándares de calidad en todos nuestros proyectos de infraestructura, garantizando excelencia en cada etapa del proceso.",
  "image": "https://example.com/quality-policy.jpg",
  "image_fallback": "/img/policies/quality.jpg",
  "order": 1,
  "enabled": true,
  "created_at": "2025-01-27T10:00:00Z",
  "updated_at": "2025-01-27T10:00:00Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}