'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  BarChart3,
  Copy,
  Edit2,
  MoreHorizontal,
  Briefcase,
  Users,
  UserCheck,
  Award,
  Building,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import BulkOperations from '../BulkOperations';

interface StatisticItem {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

interface EnhancedStatisticsManagerProps {
  statistics: StatisticItem[];
  onChange: (statistics: StatisticItem[]) => void;
  onSave?: () => Promise<void>;
  loading?: boolean;
  title?: string;
  description?: string;
  config?: Record<string, any>;
  className?: string;
}

interface StatisticValidationErrors {
  [key: string]: string[];
}

export default function EnhancedStatisticsManager({
  statistics,
  onChange,
  onSave,
  loading = false,
  className = ''
}: EnhancedStatisticsManagerProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<StatisticValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);

  // Iconos disponibles con sus nombres
  const availableIcons = {
    'Briefcase': { icon: Briefcase, label: 'Maletín (Proyectos)' },
    'Users': { icon: Users, label: 'Usuarios (Clientes)' },
    'UserCheck': { icon: UserCheck, label: 'Usuario Check (Profesionales)' },
    'Award': { icon: Award, label: 'Premio (Años/Logros)' },
    'Building': { icon: Building, label: 'Edificio' },
    'Target': { icon: Target, label: 'Objetivo' },
    'TrendingUp': { icon: TrendingUp, label: 'Tendencia' },
    'Zap': { icon: Zap, label: 'Energía' }
  };

  // Validar estadística individual
  const validateStatistic = (stat: StatisticItem): string[] => {
    const errors: string[] = [];
    
    if (!stat.label.trim()) {
      errors.push('La etiqueta es requerida');
    }
    
    if (!stat.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (stat.value < 0) {
      errors.push('El valor debe ser positivo');
    }
    
    if (stat.value > 999999) {
      errors.push('El valor es demasiado grande');
    }
    
    if (!stat.icon || !availableIcons[stat.icon as keyof typeof availableIcons]) {
      errors.push(`Ícono "${stat.icon}" no es válido`);
    }
    
    return errors;
  };

  // Renderizar icono
  const renderIcon = (iconName: string, className = "h-8 w-8") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Briefcase;
    return <IconComponent className={className} />;
  };

  // Obtener color de la estadística
  const getStatisticColor = (index: number) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];
    return colors[index] || 'text-gray-600';
  };

  // Validar todas las estadísticas
  useEffect(() => {
    const newErrors: StatisticValidationErrors = {};
    statistics.forEach(stat => {
      const statErrors = validateStatistic(stat);
      if (statErrors.length > 0) {
        newErrors[stat.id] = statErrors;
      }
    });
    setErrors(newErrors);
  }, [statistics]);

  // Manejar reordenamiento
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(statistics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  // Agregar nueva estadística
  const addStatistic = () => {
    const newStat: StatisticItem = {
      id: `stat-${Date.now()}`,
      icon: 'Award',
      value: 0,
      suffix: '+',
      label: 'Nueva Estadística',
      description: 'Descripción de la estadística'
    };
    onChange([...statistics, newStat]);
    setEditingId(newStat.id);
  };

  // Eliminar estadística
  const removeStatistic = (id: string) => {
    onChange(statistics.filter(stat => stat.id !== id));
  };

  // Duplicar estadística
  const duplicateStatistic = (stat: StatisticItem) => {
    const duplicated: StatisticItem = {
      ...stat,
      id: `stat-${Date.now()}`,
      label: `${stat.label} (Copia)`
    };
    const index = statistics.findIndex(s => s.id === stat.id);
    const newStats = [...statistics];
    newStats.splice(index + 1, 0, duplicated);
    onChange(newStats);
  };

  // Actualizar estadística
  const updateStatistic = (id: string, field: keyof StatisticItem, value: any) => {
    onChange(statistics.map(stat => 
      stat.id === id 
        ? { ...stat, [field]: field === 'value' ? Number(value) || 0 : value }
        : stat
    ));
  };

  // Formatear número para display
  const formatNumber = (num: number): string => {
    // Validar que num es un número válido
    if (num == null || isNaN(num)) {
      return '0';
    }
    
    const numValue = Number(num);
    
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    }
    if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    // Para números menores a 1000, mostrar decimales si los tiene, sino entero
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1);
  };

  // Renderizar preview de estadística
  const renderStatisticPreview = (stat: StatisticItem) => {
    const hasErrors = errors[stat.id]?.length > 0;

    return (
      <div className={`
        relative p-6 rounded-lg border text-center transition-all duration-200
        ${hasErrors ? 'border-red-200 bg-red-50' : 'border-primary/20 bg-primary/5'}
        hover:shadow-md
      `}>
        {/* Ícono */}
        <div className="mb-4 text-primary">
          {renderIcon(stat.icon, "h-12 w-12 mx-auto")}
        </div>

        {/* Valor y sufijo */}
        <div className="mb-2">
          <span className="text-4xl font-bold text-primary">
            {formatNumber(stat.value)}
          </span>
          <span className="text-2xl font-semibold text-primary/80 ml-1">
            {stat.suffix}
          </span>
        </div>

        {/* Etiqueta */}
        <div className="text-lg font-semibold text-foreground mb-1">
          {stat.label}
        </div>

        {/* Descripción */}
        <div className="text-sm text-muted-foreground line-clamp-2">
          {stat.description}
        </div>

        {/* Indicador de errores */}
        {hasErrors && (
          <div className="absolute top-2 right-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
    );
  };

  // Renderizar formulario de edición
  const renderStatisticForm = (stat: StatisticItem, index: number) => {
    const statErrors = errors[stat.id] || [];
    const isEditing = editingId === stat.id;

    return (
      <Draggable draggableId={stat.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              transition-all duration-200
              ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
              ${statErrors.length > 0 ? 'border-red-200' : ''}
              ${isEditing ? 'border-primary shadow-md' : ''}
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>
                  <Badge variant={statErrors.length > 0 ? 'destructive' : 'secondary'}>
                    Estadística #{index + 1}
                  </Badge>
                  {statErrors.length === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : stat.id)}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateStatistic(stat)}
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStatistic(stat.id)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Errores */}
              {statErrors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {statErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview en modo compacto */}
              {!isEditing && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-primary">
                      {renderIcon(stat.icon, "h-8 w-8 flex-shrink-0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">
                          {formatNumber(stat.value)}
                        </span>
                        <span className="text-lg font-semibold text-primary/80">
                          {stat.suffix}
                        </span>
                      </div>
                      <div className="font-medium text-sm truncate">{stat.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{stat.description}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de edición */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ID único</Label>
                    <Input
                      value={stat.id}
                      onChange={(e) => updateStatistic(stat.id, 'id', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label>Ícono *</Label>
                    <Select
                      value={stat.icon}
                      onValueChange={(value) => updateStatistic(stat.id, 'icon', value)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {renderIcon(stat.icon, "h-4 w-4")}
                            {availableIcons[stat.icon as keyof typeof availableIcons]?.label || stat.icon}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availableIcons).map(([key, iconData]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <iconData.icon className="h-4 w-4" />
                              {iconData.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Valor numérico</Label>
                    <Input
                      type="number"
                      min="0"
                      max="999999"
                      step="0.1"
                      value={stat.value}
                      onChange={(e) => updateStatistic(stat.id, 'value', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Sufijo</Label>
                    <Input
                      value={stat.suffix}
                      onChange={(e) => updateStatistic(stat.id, 'suffix', e.target.value)}
                      placeholder="+, %, K, M, etc."
                      maxLength={3}
                    />
                  </div>

                  <div>
                    <Label>Etiqueta *</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStatistic(stat.id, 'label', e.target.value)}
                      placeholder="Ej: Proyectos Completados"
                      required
                    />
                  </div>

                  <div>
                    <Label>Descripción *</Label>
                    <Input
                      value={stat.description}
                      onChange={(e) => updateStatistic(stat.id, 'description', e.target.value)}
                      placeholder="Descripción detallada..."
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas ({statistics.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Arrastra para reordenar, haz clic en editar para modificar
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
          
          <Button type="button" onClick={addStatistic}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Estadística
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
            Hay {Object.keys(errors).length} estadísticas con errores. 
            Revisa los campos marcados antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode */}
      {previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map(stat => (
            <div key={stat.id}>
              {renderStatisticPreview(stat)}
            </div>
          ))}
        </div>
      ) : (
        /* Edit Mode con Drag & Drop */
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="statistics-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  space-y-4 min-h-24 p-2 rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/20' : ''}
                `}
              >
                {statistics.map((stat, index) => {
                  const statErrors = errors[stat.id] || [];
                  const isEditing = editingId === stat.id;

                  return (
                    <Draggable key={stat.id} draggableId={stat.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            transition-all duration-200
                            ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : ''}
                            ${statErrors.length > 0 ? 'border-red-200' : ''}
                            ${isEditing ? 'border-primary shadow-md' : ''}
                          `}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                </div>
                                <Badge variant={statErrors.length > 0 ? 'destructive' : 'secondary'}>
                                  #{index + 1}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{stat.label || 'Nueva estadística'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant={isEditing ? 'secondary' : 'ghost'}
                                  size="sm"
                                  onClick={() => setEditingId(isEditing ? null : stat.id)}
                                >
                                  {isEditing ? (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      Colapsar
                                    </>
                                  ) : (
                                    <>
                                      <Edit2 className="h-4 w-4 mr-1" />
                                      Editar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteStatistic(stat.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            {/* Preview compacto */}
                            {!isEditing && (
                              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                                  <div className="text-lg font-bold text-primary">
                                    {formatNumber(parseFloat(stat.number) || 0)}
                                  </div>
                                </div>
                                <div className="text-xs text-right text-muted-foreground max-w-xs">
                                  {stat.description || 'Sin descripción'}
                                </div>
                              </div>
                            )}

                            {/* Formulario de edición */}
                            {isEditing && (
                              <div className="space-y-4">
                                {/* Número */}
                                <div>
                                  <Label htmlFor={`number-${stat.id}`}>Número *</Label>
                                  <Input
                                    id={`number-${stat.id}`}
                                    type="text"
                                    value={stat.number}
                                    onChange={(e) => updateStatistic(stat.id, 'number', e.target.value)}
                                    placeholder="100, 1.2K, 5.5M, etc."
                                    className={statErrors.some(err => err.includes('número')) ? 'border-red-300' : ''}
                                  />
                                </div>

                                {/* Etiqueta */}
                                <div>
                                  <Label htmlFor={`label-${stat.id}`}>Etiqueta *</Label>
                                  <Input
                                    id={`label-${stat.id}`}
                                    value={stat.label}
                                    onChange={(e) => updateStatistic(stat.id, 'label', e.target.value)}
                                    placeholder="Proyectos Completados"
                                    className={statErrors.some(err => err.includes('etiqueta')) ? 'border-red-300' : ''}
                                  />
                                </div>

                                {/* Descripción */}
                                <div>
                                  <Label htmlFor={`description-${stat.id}`}>Descripción</Label>
                                  <Textarea
                                    id={`description-${stat.id}`}
                                    value={stat.description}
                                    onChange={(e) => updateStatistic(stat.id, 'description', e.target.value)}
                                    placeholder="Descripción detallada de la estadística"
                                    rows={2}
                                  />
                                </div>

                                {/* Errores */}
                                {statErrors.length > 0 && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                                        <ul className="text-sm text-red-700 mt-1 space-y-1">
                                          {statErrors.map((error, errorIndex) => (
                                            <li key={errorIndex}>• {error}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                
                {/* Mensaje cuando no hay estadísticas */}
                {statistics.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay estadísticas</p>
                    <p className="text-sm">Haz clic en "Agregar Estadística" para comenzar</p>
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
          items={statistics}
          itemType="statistics"
          onUpdate={onChange}
          maxItems={6}
        />
      )}

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
        <p><strong>💡 Consejos:</strong></p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Usa números realistas y verificables</li>
          <li>Los sufijos más comunes son: +, %, K (miles), M (millones)</li>
          <li>Arrastra las estadísticas para cambiar el orden de aparición</li>
          <li>Los iconos recomendados aparecen marcados con ⭐</li>
        </ul>
      </div>
    </div>
  );
}