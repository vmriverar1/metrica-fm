'use client';

import React, { useState } from 'react';
import { Compass, Network, ScanSearch, ChartBar, AlertTriangle, Building2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Pillar {
  id: number;
  icon: string;
  title: string;
  description: string;
  image: string;
  image_fallback: string;
}

interface PillarsEditorProps {
  pillars: Pillar[];
  onChange: (pillars: Pillar[]) => void;
  maxPillars?: number;
  iconLibrary?: boolean;
  imageUpload?: boolean;
}

const PillarsEditor: React.FC<PillarsEditorProps> = ({
  pillars,
  onChange,
  maxPillars = 8,
  iconLibrary = true,
  imageUpload = true
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);

  // Iconos disponibles específicos para pilares DIP
  const availableIcons = {
    'Compass': { icon: Compass, label: 'Brújula (Planificación)', color: 'text-blue-600' },
    'Network': { icon: Network, label: 'Red (Coordinación)', color: 'text-green-600' },
    'ScanSearch': { icon: ScanSearch, label: 'Supervisión', color: 'text-purple-600' },
    'ChartBar': { icon: ChartBar, label: 'Control de Calidad', color: 'text-cyan-600' },
    'AlertTriangle': { icon: AlertTriangle, label: 'Gestión de Riesgos', color: 'text-red-600' },
    'Building2': { icon: Building2, label: 'Representación', color: 'text-indigo-600' }
  };

  const handlePillarChange = (index: number, field: keyof Pillar, value: any) => {
    const updatedPillars = [...pillars];
    updatedPillars[index] = { ...updatedPillars[index], [field]: value };
    onChange(updatedPillars);
  };

  const renderIcon = (iconName: string, className = "h-8 w-8") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Compass;
    const color = availableIcons[iconName as keyof typeof availableIcons]?.color || 'text-gray-600';
    return <IconComponent className={`${className} ${color}`} />;
  };

  const PillarCard = ({ pillar, index }: { pillar: Pillar; index: number }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          {renderIcon(pillar.icon, "h-6 w-6")}
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="text-xs mb-1">
            Pilar {pillar.id}
          </Badge>
          <h4 className="font-semibold text-sm line-clamp-1">
            {pillar.title || 'Sin título'}
          </h4>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 line-clamp-3 mb-3 min-h-[3rem]">
        {pillar.description || ''}
      </p>
      
      {pillar.image && (
        <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded border overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-600">
              📸 {pillar.image.split('/').pop()?.substring(0, 15)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const PillarEditor = ({ pillar, index }: { pillar: Pillar; index: number }) => (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div>
            {renderIcon(pillar.icon, "h-5 w-5")}
          </div>
          <span>Pilar {pillar.id}: {pillar.title || 'Sin título'}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPillar(selectedPillar === index ? null : index)}
            className="ml-auto"
          >
            {selectedPillar === index ? 'Colapsar' : 'Expandir'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {selectedPillar === index && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna 1: Contenido */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Pilar *
                </label>
                <Input
                  value={pillar.title}
                  onChange={(e) => handlePillarChange(index, 'title', e.target.value)}
                  placeholder="ej: Planificación Estratégica"
                  maxLength={40}
                />
                <p className="text-xs text-gray-500 mt-1">{pillar.title?.length || 0}/40</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <Textarea
                  value={pillar.description}
                  onChange={(e) => handlePillarChange(index, 'description', e.target.value)}
                  placeholder="Describa el pilar y su importancia en DIP..."
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{pillar.description?.length || 0}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Pilar
                </label>
                <Input
                  value={pillar.id}
                  onChange={(e) => handlePillarChange(index, 'id', Number(e.target.value))}
                  type="number"
                  min={1}
                  max={maxPillars}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Columna 2: Visual */}
            <div className="space-y-4">
              {iconLibrary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono del Pilar
                  </label>
                  <Select
                    value={pillar.icon}
                    onValueChange={(value) => handlePillarChange(index, 'icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {renderIcon(pillar.icon, "h-4 w-4")}
                          {availableIcons[pillar.icon as keyof typeof availableIcons]?.label || pillar.icon}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableIcons).map(([key, iconData]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <iconData.icon className={`h-4 w-4 ${iconData.color}`} />
                            {iconData.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {imageUpload && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen Principal (URL)
                    </label>
                    <Input
                      value={pillar.image}
                      onChange={(e) => handlePillarChange(index, 'image', e.target.value)}
                      placeholder="https://metrica-dip.com/images/pilar.jpg"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagen Fallback (local)
                    </label>
                    <Input
                      value={pillar.image_fallback}
                      onChange={(e) => handlePillarChange(index, 'image_fallback', e.target.value)}
                      placeholder="/img/pillars/pilar.jpg"
                    />
                  </div>
                </>
              )}

              {/* Preview del pilar individual */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                <PillarCard pillar={pillar} index={index} />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Pillars DIP Editor
              <Badge variant="outline">{pillars.length} Pilares</Badge>
            </CardTitle>
            <CardDescription>
              Configure los {pillars.length} pilares fundamentales de la Dirección Integral de Proyectos.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Editar' : 'Preview'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Mode */}
        {showPreview && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">
              Vista Previa: Los {pillars.length} Pilares DIP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.map((pillar, index) => (
                <PillarCard key={pillar.id} pillar={pillar} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {!showPreview && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedPillar(selectedPillar === null ? 0 : null)}
              >
                {selectedPillar === null ? 'Expandir Primero' : 'Colapsar Todos'}
              </Button>
              <div className="flex gap-1">
                {pillars.map((_, index) => (
                  <Button
                    type="button"
                    key={index}
                    variant={selectedPillar === index ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPillar(index)}
                    className="w-8 h-8 p-0"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>

            {pillars.map((pillar, index) => (
              <PillarEditor key={pillar.id} pillar={pillar} index={index} />
            ))}
          </div>
        )}

        {/* Pillar Status */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Estado de los Pilares:</h4>
          <div className="grid grid-cols-3 gap-2">
            {pillars.map((pillar, index) => (
              <div key={pillar.id} className="flex items-center gap-2 text-xs">
                {renderIcon(pillar.icon, "h-3 w-3")}
                <span className={pillar.title && pillar.description ? 'text-green-600' : 'text-red-500'}>
                  Pilar {pillar.id}: {pillar.title && pillar.description ? '✓' : '⚠'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">{pillars.length}</p>
              <p className="text-xs text-gray-600">Total Pilares</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00A8E8]">
                {pillars.filter(p => p.title && p.description).length}
              </p>
              <p className="text-xs text-gray-600">Completos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {pillars.filter(p => p.image || p.image_fallback).length}
              </p>
              <p className="text-xs text-gray-600">Con Imagen</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(pillars.map(p => p.icon)).size}
              </p>
              <p className="text-xs text-gray-600">Iconos Únicos</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips para Pilares DIP Efectivos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Consistencia:</strong> Mantenga un estilo y tono similar en todos los pilares</li>
            <li>• <strong>Claridad:</strong> Use títulos concisos que comuniquen el valor inmediatamente</li>
            <li>• <strong>Beneficios:</strong> Enfoque en cómo cada pilar beneficia al cliente</li>
            <li>• <strong>Iconos:</strong> Cada pilar debe tener un icono único y representativo</li>
            <li>• <strong>Orden:</strong> Los pilares más importantes van primero</li>
            <li>• <strong>Imágenes:</strong> Use fotos reales de equipos trabajando cuando sea posible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PillarsEditor;