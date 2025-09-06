'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PillarsManager from '@/components/admin/dynamic-content/PillarsManager';

export default function PillarsManagementPage() {
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
              <Compass className="h-8 w-8 text-primary" />
              Gestión de Pilares
            </h1>
            <p className="text-muted-foreground">
              Administra los pilares fundamentales de la empresa
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dynamic-content" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Información sobre la página */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pilares de la Empresa</CardTitle>
          <CardDescription>
            Los pilares representan los fundamentos estratégicos de Métrica FM. 
            Son elementos clave que se muestran en la página principal del sitio web, 
            comunicando los valores y enfoques principales de la empresa a los visitantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">📍 Ubicación en el Sitio</h4>
              <p className="text-muted-foreground">
                Los pilares se muestran en la sección principal de la página de inicio, 
                después de las estadísticas y antes del portafolio.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">🎨 Presentación Visual</h4>
              <p className="text-muted-foreground">
                Cada pilar se presenta como una card con ícono, título, descripción 
                e imagen de fondo, con efectos hover y animaciones suaves.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">⚡ Impacto en UX</h4>
              <p className="text-muted-foreground">
                Los pilares ayudan a los usuarios a entender rápidamente 
                la propuesta de valor y los enfoques metodológicos de la empresa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager de pilares */}
      <PillarsManager />

      {/* Información técnica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">📂 Almacenamiento de Datos</h4>
              <div className="space-y-1 text-muted-foreground font-mono">
                <p><strong>Archivo:</strong> public/json/pages/home.json</p>
                <p><strong>Ruta:</strong> pillars.pillars[]</p>
                <p><strong>Componente:</strong> src/components/landing/pillars.tsx</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">🔄 APIs Disponibles</h4>
              <div className="space-y-1 text-muted-foreground font-mono">
                <p><strong>GET:</strong> /api/admin/dynamic-elements/pillars</p>
                <p><strong>POST:</strong> /api/admin/dynamic-elements/pillars</p>
                <p><strong>PATCH:</strong> /api/admin/dynamic-elements/pillars/[id]</p>
                <p><strong>DELETE:</strong> /api/admin/dynamic-elements/pillars/[id]</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">🔧 Estructura de Datos</h4>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "id": "planning",
  "icon": "Compass",
  "title": "Planificación Estratégica",
  "description": "Desarrollamos planes integrales...",
  "image": "https://example.com/image.jpg",
  "image_fallback": "/img/pillars/planning.jpg",
  "order": 1,
  "enabled": true
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}