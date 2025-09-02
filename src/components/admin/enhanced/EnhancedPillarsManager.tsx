'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Compass,
  Copy,
  Edit2,
  MoreHorizontal,
  Network,
  ScanSearch,
  ChartBar,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ImageField from '../ImageField';
import BulkOperations from '../BulkOperations';

interface PillarItem {
  id: number | string;
  icon: string;
  title: string;
  description: string;
  image: string;
  image_fallback: string;
}

interface EnhancedPillarsManagerProps {
  pillars: PillarItem[];
  onChange: (pillars: PillarItem[]) => void;
  maxPillars?: number;
  onSave?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

interface PillarValidationErrors {
  [key: string]: string[];
}

export default function EnhancedPillarsManager({
  pillars,
  onChange,
  maxPillars = 8,
  onSave,
  loading = false,
  className = ''
}: EnhancedPillarsManagerProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<PillarValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);

  // Iconos disponibles específicos para pilares DIP
  const availableIcons = {
    'Compass': { icon: Compass, label: 'Brújula (Planificación)', color: 'text-blue-600' },
    'Network': { icon: Network, label: 'Red (Coordinación)', color: 'text-green-600' },
    'ScanSearch': { icon: ScanSearch, label: 'Supervisión', color: 'text-purple-600' },
    'ChartBar': { icon: ChartBar, label: 'Control de Calidad', color: 'text-orange-600' },
    'AlertTriangle': { icon: AlertTriangle, label: 'Gestión de Riesgos', color: 'text-red-600' },
    'Building2': { icon: Building2, label: 'Representación', color: 'text-indigo-600' }
  };

  // Validar pilar individual
  const validatePillar = (pillar: PillarItem): string[] => {
    const errors: string[] = [];
    
    if (!pillar.title.trim()) {
      errors.push('El título del pilar es requerido');
    }
    
    if (pillar.title.length > 50) {
      errors.push('El título no puede exceder 50 caracteres');
    }
    
    if (!pillar.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (pillar.description.length > 200) {
      errors.push('La descripción no puede exceder 200 caracteres');
    }
    
    if (!pillar.icon || !availableIcons[pillar.icon as keyof typeof availableIcons]) {
      errors.push('Icono no válido o no seleccionado');
    }
    
    if (pillar.image && !isValidUrl(pillar.image)) {
      errors.push('URL de imagen principal no es válida');
    }
    
    if (pillar.image_fallback && !isValidUrl(pillar.image_fallback)) {
      errors.push('URL de imagen fallback no es válida');
    }
    
    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // URLs vacías son válidas (opcionales)
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.includes('public/');
    }
  };

  // Validar todos los pilares
  useEffect(() => {
    const newErrors: PillarValidationErrors = {};
    pillars.forEach(pillar => {
      const pillarErrors = validatePillar(pillar);
      if (pillarErrors.length > 0) {
        newErrors[pillar.id.toString()] = pillarErrors;
      }
    });
    setErrors(newErrors);
  }, [pillars]);

  // Manejar reordenamiento
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pillars);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  // Agregar nuevo pilar
  const addPillar = () => {
    if (pillars.length >= maxPillars) return;
    
    const newPillar: PillarItem = {
      id: Date.now(),
      icon: 'Compass',
      title: 'Nuevo Pilar DIP',
      description: 'Descripción del pilar metodológico',
      image: '',
      image_fallback: ''
    };
    onChange([...pillars, newPillar]);
    setEditingId(newPillar.id.toString());
  };

  // Eliminar pilar
  const removePillar = (id: number | string) => {
    onChange(pillars.filter(pillar => pillar.id !== id));
  };

  // Duplicar pilar
  const duplicatePillar = (pillar: PillarItem) => {
    if (pillars.length >= maxPillars) return;
    
    const newPillar: PillarItem = {
      ...pillar,
      id: Date.now(),
      title: `${pillar.title} (Copia)`
    };
    onChange([...pillars, newPillar]);
    setEditingId(newPillar.id.toString());
  };

  // Actualizar pilar
  const updatePillar = (id: number | string, field: keyof PillarItem, value: any) => {
    onChange(pillars.map(pillar => 
      pillar.id === id 
        ? { ...pillar, [field]: field === 'id' ? (isNaN(Number(value)) ? value : Number(value)) : value }
        : pillar
    ));
  };

  // Renderizar icono
  const renderIcon = (iconName: string, className = "h-6 w-6") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Compass;
    const color = availableIcons[iconName as keyof typeof availableIcons]?.color || 'text-blue-600';
    return <IconComponent className={`${className} ${color}`} />;
  };

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;

  // Renderizar preview del pilar
  const renderPillarPreview = (pillar: PillarItem) => {
    const hasErrors = errors[pillar.id.toString()]?.length > 0;

    return (
      <Card key={pillar.id} className={`transition-all duration-300 hover:shadow-lg ${hasErrors ? 'border-red-200' : ''}`}>
        <div className="relative">
          {/* Imagen */}
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            {pillar.image ? (
              <img
                src={pillar.image}
                alt={pillar.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (pillar.image_fallback) {
                    (e.target as HTMLImageElement).src = pillar.image_fallback;
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {renderIcon(pillar.icon, 'h-12 w-12')}
              </div>
            )}
          </div>

          {/* Contenido */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {renderIcon(pillar.icon, 'h-5 w-5')}
                <div className="text-lg font-semibold">{pillar.title}</div>
              </div>
              <Badge variant="outline">Pilar {pillar.id}</Badge>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3">
              {pillar.description}
            </div>
          </CardContent>

          {/* Indicador de errores */}
          {hasErrors && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Renderizar formulario de edición
  const renderPillarForm = (pillar: PillarItem, index: number) => {
    const pillarErrors = errors[pillar.id.toString()] || [];
    const isEditing = editingId === pillar.id.toString();

    return (
      <Draggable key={pillar.id.toString()} draggableId={pillar.id.toString()} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              transition-all duration-200
              ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
              ${pillarErrors.length > 0 ? 'border-red-200' : ''}
              ${isEditing ? 'border-primary shadow-md' : ''}
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>
                  <div className="flex items-center gap-2">
                    {renderIcon(pillar.icon, 'h-5 w-5')}
                    <Badge variant={pillarErrors.length > 0 ? 'destructive' : 'secondary'}>
                      Pilar #{index + 1}
                    </Badge>
                  </div>
                  {pillarErrors.length === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : pillar.id.toString())}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicatePillar(pillar)}
                    title="Duplicar"
                    disabled={pillars.length >= maxPillars}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removePillar(pillar.id)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Errores */}
              {pillarErrors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {pillarErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            {isEditing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div>
                      <Label>ID del pilar</Label>
                      <Input
                        type="number"
                        value={pillar.id}
                        onChange={(e) => updatePillar(pillar.id, 'id', e.target.value)}
                        className="bg-muted"
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Título del pilar *</Label>
                      <Input
                        value={pillar.title}
                        onChange={(e) => updatePillar(pillar.id, 'title', e.target.value)}
                        placeholder="Nombre del pilar metodológico"
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {pillar.title.length}/50 caracteres
                      </p>
                    </div>

                    <div>
                      <Label>Icono *</Label>
                      <Select
                        value={pillar.icon}
                        onValueChange={(value) => updatePillar(pillar.id, 'icon', value)}
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

                    <div>
                      <Label>Descripción *</Label>
                      <Textarea
                        value={pillar.description}
                        onChange={(e) => updatePillar(pillar.id, 'description', e.target.value)}
                        placeholder="Descripción detallada del pilar metodológico"
                        rows={4}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {pillar.description.length}/200 caracteres
                      </p>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-4">
                    <div>
                      <ImageField
                        value={pillar.image || ''}
                        onChange={(value) => updatePillar(pillar.id, 'image', value)}
                        label="Imagen principal"
                        placeholder="URL o ruta de la imagen del pilar"
                      />
                    </div>

                    <div>
                      <ImageField
                        value={pillar.image_fallback || ''}
                        onChange={(value) => updatePillar(pillar.id, 'image_fallback', value)}
                        label="Imagen de respaldo"
                        placeholder="URL o ruta de imagen alternativa"
                      />
                    </div>

                    {/* Vista previa */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
                      <div className="aspect-video w-full bg-background rounded overflow-hidden">
                        {pillar.image ? (
                          <img
                            src={pillar.image}
                            alt={pillar.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (pillar.image_fallback) {
                                (e.target as HTMLImageElement).src = pillar.image_fallback;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {renderIcon(pillar.icon, 'h-12 w-12')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </Draggable>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Pilares DIP ({pillars.length}/{maxPillars})
          </h3>
          <p className="text-sm text-muted-foreground">
            Metodología DIP - Arrastra para reordenar, haz clic en editar para modificar
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBulkOps(!showBulkOps)}
            className="flex items-center gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
            Bulk Ops
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            onClick={addPillar}
            disabled={pillars.length >= maxPillars}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Pilar
          </Button>
          
          {onSave && (
            <Button 
              type="button"
              onClick={onSave}
              disabled={loading || hasErrors}
              className="min-w-20"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de errores */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hay {Object.keys(errors).length} pilares con errores. 
            Revisa los campos marcados antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode */}
      {previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pillars.map(pillar => (
            <div key={pillar.id}>
              {renderPillarPreview(pillar)}
            </div>
          ))}
        </div>
      ) : (
        /* Edit Mode con Drag & Drop */
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pillars-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  space-y-4 min-h-24 p-2 rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/20' : ''}
                `}
              >
                {pillars.map((pillar, index) => renderPillarForm(pillar, index))}
                {provided.placeholder}
                
                {/* Mensaje cuando no hay pilares */}
                {pillars.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay pilares DIP</p>
                    <p className="text-sm">Haz clic en "Agregar Pilar" para comenzar</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Bulk Operations */}
      {showBulkOps && (
        <BulkOperations
          items={pillars}
          itemType="pillars"
          onUpdate={onChange}
          maxItems={maxPillars}
        />
      )}

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
        <p><strong>🏛️ Consejos para Pilares DIP:</strong></p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Los pilares representan la metodología DIP (Dirección Integral de Proyectos)</li>
          <li>Cada pilar debe tener un icono específico que represente su función</li>
          <li>Usa imágenes que refuercen el concepto de cada pilar</li>
          <li>Mantén las descripciones claras y técnicas</li>
          <li>El orden de los pilares refleja la secuencia metodológica</li>
        </ul>
      </div>
    </div>
  );
}