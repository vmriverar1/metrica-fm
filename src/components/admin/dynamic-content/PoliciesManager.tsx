'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Shield, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import UniversalCardManager from './UniversalCardManager';
import { PolicyElement } from '@/types/dynamic-elements';
import { useDynamicElements } from '@/hooks/useDynamicElements';

interface PoliciesManagerProps {
  className?: string;
}

export default function PoliciesManager({ className = '' }: PoliciesManagerProps) {
  const {
    elements: policies,
    loading,
    error,
    create,
    update,
    delete: deletePolicy,
    reorder
  } = useDynamicElements<PolicyElement>('policies');

  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Filtrar políticas según búsqueda
  const filteredPolicies = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.enabled !== false).length,
    inactive: policies.filter(p => p.enabled === false).length,
    withImages: policies.filter(p => p.image || p.image_fallback).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gestión de Políticas
          </h2>
          <p className="text-muted-foreground">
            Administra las políticas empresariales y de calidad
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
              <CardTitle className="text-sm font-medium">Total Políticas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Políticas registradas
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
                Visibles en carousel
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
              <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.withImages}</div>
              <p className="text-xs text-muted-foreground">
                Incluyen imagen visual
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
            placeholder="Buscar políticas por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Badge variant="secondary">
            {filteredPolicies.length} de {policies.length} políticas
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
          <span>Cargando políticas...</span>
        </div>
      )}

      {/* Manager universal para políticas */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas Empresariales</CardTitle>
          <CardDescription>
            Gestiona las políticas empresariales que se muestran en el carousel de la página principal.
            Las políticas activas aparecen automáticamente en la rotación del carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalCardManager
            elements={searchTerm ? filteredPolicies : policies}
            elementType="policies"
            onAdd={create}
            onEdit={update}
            onDelete={deletePolicy}
            onReorder={reorder}
            loading={loading}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Información específica sobre políticas y carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información sobre Políticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Campos Requeridos:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Título:</strong> Nombre de la política</li>
                  <li>• <strong>Descripción:</strong> Explicación detallada</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Campos Opcionales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Ícono:</strong> Ícono representativo</li>
                  <li>• <strong>Imagen:</strong> URL de imagen principal</li>
                  <li>• <strong>Imagen Fallback:</strong> URL de respaldo</li>
                  <li>• <strong>Estado:</strong> Activo/Inactivo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Configuración del Carousel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🎠 Comportamiento del Carousel:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Las políticas activas se muestran automáticamente</li>
                <li>• El orden determina la secuencia de aparición</li>
                <li>• Se puede navegar manualmente o en modo automático</li>
                <li>• Responsive design para todos los dispositivos</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">💡 Mejores Prácticas:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Mantén entre 3-6 políticas activas para mejor UX</li>
                <li>• Las imágenes deben ser consistentes en tamaño</li>
                <li>• Títulos concisos pero descriptivos</li>
                <li>• Descripciones que expliquen el valor de cada política</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información técnica sobre el carousel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integración con el Carousel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">🔄 Comportamiento Automático</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Auto-rotación:</strong> Cada 5 segundos</li>
                <li>• <strong>Pausa en Hover:</strong> Se detiene al pasar el cursor</li>
                <li>• <strong>Navegación Manual:</strong> Botones prev/next disponibles</li>
                <li>• <strong>Indicadores:</strong> Dots que muestran la política activa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">📱 Adaptabilidad</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Desktop:</strong> Múltiples políticas visibles</li>
                <li>• <strong>Tablet:</strong> 2 políticas por vista</li>
                <li>• <strong>Mobile:</strong> 1 política por vista</li>
                <li>• <strong>Transiciones:</strong> Suaves y fluidas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}