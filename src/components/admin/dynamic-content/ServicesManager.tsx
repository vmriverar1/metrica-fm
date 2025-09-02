'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Briefcase, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Image as ImageIcon,
  Star
} from 'lucide-react';
import UniversalCardManager from './UniversalCardManager';
import { ServiceElement } from '@/types/dynamic-elements';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface ServicesManagerProps {
  className?: string;
}

export default function ServicesManager({ className = '' }: ServicesManagerProps) {
  const {
    elements: services,
    loading,
    error,
    create,
    update,
    delete: deleteService,
    reorder
  } = useDynamicElements<ServiceElement>('services');

  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: services.length,
    active: services.filter(s => s.enabled !== false).length,
    inactive: services.filter(s => s.enabled === false).length,
    withImages: services.filter(s => s.image || s.image_fallback).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Gestión de Servicios
          </h2>
          <p className="text-muted-foreground">
            Administra los servicios secundarios y especializados
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

      {/* Panel de estadísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Servicios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
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
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Ocultos temporalmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.withImages}</div>
              <p className="text-xs text-muted-foreground">
                Con imagen promocional
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Badge variant="secondary">
            {filteredServices.length} de {services.length} servicios
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
          <span>Cargando servicios...</span>
        </div>
      )}

      {/* Manager universal para servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios Secundarios</CardTitle>
          <CardDescription>
            Gestiona los servicios complementarios y especializados que ofrece Métrica DIP.
            Estos servicios se muestran en una sección dedicada de la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalCardManager
            elements={searchTerm ? filteredServices : services}
            elementType="services"
            onAdd={create}
            onEdit={update}
            onDelete={deleteService}
            onReorder={reorder}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Información específica sobre servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información sobre Servicios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Campos Requeridos:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Título:</strong> Nombre del servicio</li>
                  <li>• <strong>Descripción:</strong> Explicación detallada del servicio</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Campos Opcionales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Ícono:</strong> Ícono representativo</li>
                  <li>• <strong>Imagen:</strong> URL de imagen promocional</li>
                  <li>• <strong>Imagen Fallback:</strong> URL de respaldo</li>
                  <li>• <strong>Estado:</strong> Activo/Inactivo</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Tipos de Servicios:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Consultoría:</strong> Servicios de asesoría especializada</li>
                <li>• <strong>Supervisión:</strong> Control y seguimiento de proyectos</li>
                <li>• <strong>Auditoría:</strong> Evaluación de calidad y cumplimiento</li>
                <li>• <strong>Capacitación:</strong> Formación técnica y profesional</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Presentación en el Sitio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">📍 Ubicación Visual</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Los servicios se muestran en una grilla responsive después 
                de la sección principal de servicios, destacando las capacidades adicionales.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Layout:</strong> Grilla de 2-3 columnas</li>
                <li>• <strong>Estilo:</strong> Cards con imagen y texto</li>
                <li>• <strong>Interacción:</strong> Hover effects suaves</li>
                <li>• <strong>Responsive:</strong> Se adapta a móviles</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">💡 Mejores Prácticas:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Mantén entre 4-8 servicios para equilibrio visual</li>
                <li>• Usa imágenes de alta calidad y consistentes</li>
                <li>• Títulos claros y concisos (2-4 palabras)</li>
                <li>• Descripciones que destaquen el valor único</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}