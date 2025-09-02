'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Compass, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import UniversalCardManager from './UniversalCardManager';
import { PillarElement } from '@/types/dynamic-elements';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface PillarsManagerProps {
  className?: string;
}

export default function PillarsManager({ className = '' }: PillarsManagerProps) {
  const {
    elements: pillars,
    loading,
    error,
    create,
    update,
    delete: deletePillar,
    reorder
  } = useDynamicElements<PillarElement>('pillars');

  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Filtrar pilares según búsqueda
  const filteredPillars = pillars.filter(pillar =>
    pillar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pillar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const stats = {
    total: pillars.length,
    active: pillars.filter(p => p.enabled !== false).length,
    inactive: pillars.filter(p => p.enabled === false).length,
    withImages: pillars.filter(p => p.image || p.image_fallback).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            Gestión de Pilares
          </h2>
          <p className="text-muted-foreground">
            Administra los pilares fundamentales de la empresa
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
              <CardTitle className="text-sm font-medium">Total Pilares</CardTitle>
              <Compass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Pilares registrados
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
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.withImages}</div>
              <p className="text-xs text-muted-foreground">
                Incluyen imagen/ícono
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
            placeholder="Buscar pilares por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Badge variant="secondary">
            {filteredPillars.length} de {pillars.length} pilares
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
          <span>Cargando pilares...</span>
        </div>
      )}

      {/* Manager universal para pilares */}
      <Card>
        <CardHeader>
          <CardTitle>Pilares Registrados</CardTitle>
          <CardDescription>
            Gestiona los pilares fundamentales que representan la base estratégica de la empresa.
            Utiliza drag & drop para reordenar y los botones para editar o eliminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalCardManager
            elements={searchTerm ? filteredPillars : pillars}
            elementType="pillars"
            onAdd={create}
            onEdit={update}
            onDelete={deletePillar}
            onReorder={reorder}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Información adicional sobre pilares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información sobre Pilares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Campos Requeridos:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Título:</strong> Nombre del pilar</li>
                <li>• <strong>Descripción:</strong> Explicación detallada</li>
                <li>• <strong>Ícono:</strong> Ícono representativo (Lucide)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Campos Opcionales:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Imagen:</strong> URL de imagen principal</li>
                <li>• <strong>Imagen Fallback:</strong> URL de respaldo</li>
                <li>• <strong>Estado:</strong> Activo/Inactivo</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">💡 Consejos de Uso:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Los pilares aparecen en la sección principal del sitio web</li>
              <li>• El orden se puede cambiar arrastrando las cards</li>
              <li>• Las imágenes deben ser de alta calidad para mejor impacto visual</li>
              <li>• Los íconos ayudan a identificar rápidamente cada pilar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}