'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  FolderOpen, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import UniversalCardManager from './UniversalCardManager';
import { ProjectElement } from '@/types/dynamic-elements';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface ProjectsManagerProps {
  className?: string;
}

export default function ProjectsManager({ className = '' }: ProjectsManagerProps) {
  const {
    elements: projects,
    loading,
    error,
    create,
    update,
    delete: deleteProject,
    reorder
  } = useDynamicElements<ProjectElement>('projects');

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);

  // Tipos de proyecto disponibles (según el plan)
  const projectTypes = ['Comercial', 'Residencial', 'Industrial', 'Infraestructura', 'Educativo', 'Salud'];

  // Filtrar proyectos según búsqueda y tipo
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Estadísticas
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.enabled !== false).length,
    inactive: projects.filter(p => p.enabled === false).length,
    withImages: projects.filter(p => p.image || p.image_fallback).length,
    byType: projectTypes.reduce((acc, type) => {
      acc[type] = projects.filter(p => p.type === type).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Gestión de Proyectos
          </h2>
          <p className="text-muted-foreground">
            Administra el portafolio de proyectos destacados
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Proyectos en portafolio
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
                  Visibles en portafolio
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
                  Con imagen de portada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas por tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Tipo de Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {projectTypes.map(type => (
                  <div key={type} className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-primary">{stats.byType[type] || 0}</div>
                    <p className="text-xs text-muted-foreground">{type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos por título, descripción o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {projectTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(searchTerm || typeFilter !== 'all') && (
          <Badge variant="secondary">
            {filteredProjects.length} de {projects.length} proyectos
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
          <span>Cargando proyectos...</span>
        </div>
      )}

      {/* Manager universal para proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>Portafolio de Proyectos</CardTitle>
          <CardDescription>
            Gestiona los proyectos destacados que se muestran en el portafolio de la página principal.
            Categoriza por tipo y mantén actualizada la información de cada proyecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalCardManager
            elements={filteredProjects}
            elementType="projects"
            onAdd={create}
            onEdit={update}
            onDelete={deleteProject}
            onReorder={reorder}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Información específica sobre proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Información sobre Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Campos Requeridos:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Título:</strong> Nombre para mostrar públicamente</li>
                  <li>• <strong>Descripción:</strong> Descripción técnica del proyecto</li>
                  <li>• <strong>Nombre:</strong> Nombre comercial del proyecto</li>
                  <li>• <strong>Tipo:</strong> Categoría del proyecto</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Campos Opcionales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Ícono:</strong> Ícono representativo</li>
                  <li>• <strong>Imagen:</strong> Foto principal del proyecto</li>
                  <li>• <strong>Imagen Fallback:</strong> Imagen de respaldo</li>
                  <li>• <strong>Estado:</strong> Activo/Inactivo en portafolio</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🏗️ Tipos de Proyecto:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• <strong>Comercial:</strong> Centros comerciales, oficinas</li>
                  <li>• <strong>Residencial:</strong> Edificios, condominios</li>
                  <li>• <strong>Industrial:</strong> Plantas, almacenes</li>
                </ul>
                <ul className="space-y-1">
                  <li>• <strong>Infraestructura:</strong> Carreteras, puentes</li>
                  <li>• <strong>Educativo:</strong> Colegios, universidades</li>
                  <li>• <strong>Salud:</strong> Hospitales, clínicas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Presentación en Portafolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">📍 Sección de Portafolio</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Los proyectos se muestran en una galería visual con información 
                básica y enlaces para ver más detalles de cada proyecto.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Layout:</strong> Grilla masonry responsive</li>
                <li>• <strong>Filtrado:</strong> Por tipo de proyecto</li>
                <li>• <strong>Interacción:</strong> Hover con información adicional</li>
                <li>• <strong>Modal:</strong> Vista detallada del proyecto</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">💡 Mejores Prácticas:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Mantén 8-12 proyectos para navegación óptima</li>
                <li>• Usa imágenes de alta calidad (min. 800x600px)</li>
                <li>• Equilibra los tipos de proyecto mostrados</li>
                <li>• Actualiza regularmente con proyectos recientes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guía de gestión de portafolio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Guía de Gestión de Portafolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Proyectos Actuales
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Proyectos en ejecución (0-50% avance)</li>
                <li>• Máximo 3-4 proyectos activos</li>
                <li>• Actualizaciones mensuales de progreso</li>
                <li>• Imágenes de obra en progreso</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Proyectos Completados
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Proyectos finalizados destacados</li>
                <li>• 4-6 proyectos representativos</li>
                <li>• Fotos finales de alta calidad</li>
                <li>• Casos de éxito comprobados</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Criterios de Selección
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Diversidad geográfica</li>
                <li>• Variedad de tipos y escalas</li>
                <li>• Calidad técnica destacada</li>
                <li>• Valor referencial para nuevos clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}