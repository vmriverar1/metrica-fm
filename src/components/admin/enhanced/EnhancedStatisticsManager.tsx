'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Zap,
  X,
  Factory,
  DollarSign
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import BulkOperations from '../BulkOperations';

interface StatisticItem {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

interface EnhancedStatisticsManagerProps {
  statistics: StatisticItem[];
  onChange: (statistics: StatisticItem[]) => void;
  onSave?: () => Promise<void>;
  loading?: boolean;
  title?: string;
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
  console.log('🔄 [ENHANCED STATS] Recibiendo statistics:', statistics);
  console.log('🔄 [ENHANCED STATS] Tipo y longitud:', typeof statistics, Array.isArray(statistics) ? statistics.length : 'no es array');

  // Debugging específico de cada item
  if (Array.isArray(statistics)) {
    statistics.forEach((stat, index) => {
      console.log(`🔍 [ENHANCED STATS] Item ${index}:`, {
        raw: stat,
        hasId: !!stat?.id,
        idValue: stat?.id,
        idType: typeof stat?.id,
        hasLabel: !!stat?.label,
        hasValue: !!stat?.value,
      });
    });
  }

  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<StatisticValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkOps, setShowBulkOps] = useState(false);

  // Procesar estadísticas sin memoización compleja para evitar problemas
  const cleanedStatistics = useMemo(() => {
    // Asegurar que siempre tenemos un array
    const safeStatistics = Array.isArray(statistics) ? statistics : [];
    console.log('🔄 [STATS CLEAN] Procesando:', safeStatistics.length, 'estadísticas');
    console.log('🔄 [STATS CLEAN] Datos de entrada:', safeStatistics);

    const cleaned = safeStatistics.filter((stat, index) => {
      const hasStatObject = !!stat;
      const hasId = !!stat?.id;
      const isStringId = typeof stat?.id === 'string';
      const isNotEmpty = stat?.id?.trim() !== '';

      const isValid = hasStatObject && hasId && isStringId && isNotEmpty;

      console.log(`🔍 [STATS CLEAN] Filtro item ${index}:`, {
        stat,
        hasStatObject,
        hasId,
        isStringId,
        isNotEmpty,
        idValue: stat?.id,
        isValid,
        willPass: isValid ? '✅ PASS' : '❌ FILTERED OUT'
      });

      return isValid;
    }).map((stat, index) => ({
      ...stat,
      id: stat.id || `stat-fallback-${index}-${Date.now()}`
    }));

    console.log('🔄 [STATS CLEAN] Resultado:', cleaned.length, 'estadísticas limpias de', safeStatistics.length, 'originales');
    console.log('🔄 [STATS CLEAN] Estadísticas limpias:', cleaned);

    return cleaned;
  }, [statistics]);

  // Iconos disponibles con sus nombres
  const availableIcons = {
    'Briefcase': { icon: Briefcase, label: 'Maletín (Proyectos)' },
    'Users': { icon: Users, label: 'Usuarios (Clientes)' },
    'UserCheck': { icon: UserCheck, label: 'Usuario Check (Profesionales)' },
    'Award': { icon: Award, label: 'Premio (Años/Logros)' },
    'Building': { icon: Building, label: 'Edificio' },
    'Target': { icon: Target, label: 'Objetivo' },
    'TrendingUp': { icon: TrendingUp, label: 'Tendencia' },
    'Zap': { icon: Zap, label: 'Energía' },
    'Factory': { icon: Factory, label: 'Fábrica (Industria)' },
    'DollarSign': { icon: DollarSign, label: 'Dinero (Ingresos)' }
  };

  // Validar estadística individual (memoizada)
  const validateStatistic = useMemo(() => {
    return (stat: StatisticItem): string[] => {
      const errors: string[] = [];

      if (!stat.label.trim()) {
        errors.push('La etiqueta es requerida');
      }

      if (stat.prefix && stat.prefix.length > 10) {
        errors.push('El prefijo no puede exceder 10 caracteres');
      }

      if (stat.suffix && stat.suffix.length > 10) {
        errors.push('El sufijo no puede exceder 10 caracteres');
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
  }, [availableIcons]);

  // Renderizar icono
  const renderIcon = (iconName: string, className = "h-8 w-8") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Briefcase;
    return <IconComponent className={className} />;
  };

  // Obtener color de la estadística
  const getStatisticColor = (index: number) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-cyan-600'];
    return colors[index] || 'text-gray-600';
  };

  // Validar todas las estadísticas con memoización
  const validationErrors = useMemo(() => {
    const newErrors: StatisticValidationErrors = {};
    cleanedStatistics.forEach(stat => {
      const statErrors = validateStatistic(stat);
      if (statErrors.length > 0) {
        newErrors[stat.id] = statErrors;
      }
    });
    return newErrors;
  }, [cleanedStatistics]);

  // Actualizar errores solo cuando cambien
  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  // Manejar reordenamiento
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(cleanedStatistics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  // Agregar nueva estadística
  const addStatistic = () => {
    const newStat: StatisticItem = {
      id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon: 'Award',
      value: 0,
      suffix: '',
      prefix: '',
      label: 'Nueva Estadística'
    };
    onChange([...cleanedStatistics, newStat]);
    setEditingId(newStat.id);
  };

  // Eliminar estadística
  const removeStatistic = (id: string) => {
    onChange(cleanedStatistics.filter(stat => stat.id !== id));
  };

  // Duplicar estadística
  const duplicateStatistic = (stat: StatisticItem) => {
    const duplicated: StatisticItem = {
      ...stat,
      id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${stat.label} (Copia)`
    };
    const index = cleanedStatistics.findIndex(s => s.id === stat.id);
    const newStats = [...cleanedStatistics];
    newStats.splice(index + 1, 0, duplicated);
    onChange(newStats);
  };

  // Actualizar estadística
  const updateStatistic = (id: string, field: keyof StatisticItem, value: any) => {
    console.log('🔧 updateStatistic called:', {
      id,
      field,
      value,
      currentStats: cleanedStatistics.find(s => s.id === id)
    });

    const updatedStats = cleanedStatistics.map(stat => {
      if (stat.id === id) {
        const updated = {
          ...stat,
          [field]: field === 'value' ? Number(value) || 0 : value
        };
        console.log('🔧 Updated stat:', updated);
        return updated;
      }
      return stat;
    });

    console.log('🔧 All updated statistics:', updatedStats);
    onChange(updatedStats);
  };

  // Formatear número para display
  const formatNumber = (num: number | undefined | null): string => {
    // Validar que num es un número válido
    if (num == null || isNaN(Number(num))) {
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

        {/* Valor con prefijo y sufijo */}
        <div className="mb-2">
          {stat.prefix && (
            <span className="text-2xl font-semibold text-primary/80 mr-1">
              {stat.prefix}
            </span>
          )}
          <span className="text-4xl font-bold text-primary">
            {formatNumber(stat.value)}
          </span>
          {stat.suffix && (
            <span className="text-2xl font-semibold text-primary/80 ml-1">
              {stat.suffix}
            </span>
          )}
        </div>

        {/* Etiqueta */}
        <div className="text-lg font-semibold text-foreground mb-1">
          {stat.label}
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

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas ({cleanedStatistics.length})
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
          {cleanedStatistics.map(stat => (
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
                {(() => {
                  console.log('🎯 [RENDER START] cleanedStatistics.length:', cleanedStatistics.length);
                  console.log('🎯 [RENDER START] cleanedStatistics:', cleanedStatistics);
                  return null;
                })()}
                {cleanedStatistics.map((stat, index) => {
                  console.log(`🔍 [RENDER] Procesando stat ${index}:`, {
                    stat,
                    hasStat: !!stat,
                    hasId: !!stat?.id,
                    idType: typeof stat?.id,
                    idValue: stat?.id
                  });

                  // Asegurar que stat.id existe y es válido
                  if (!stat || !stat.id || typeof stat.id !== 'string') {
                    console.error('🚨 [DRAG ERROR] Estadística sin ID válido, skipping render:', stat);
                    return null;
                  }

                  console.log(`✅ [RENDER] Stat ${index} pasó validación, renderizando:`, stat);

                  const statErrors = errors[stat.id] || [];
                  const isEditing = editingId === stat.id;
                  const uniqueId = `stat-${stat.id}-${index}`;

                  return (
                    <Draggable key={uniqueId} draggableId={uniqueId} index={index}>
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
                                  type="button"
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
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeStatistic(stat.id)}
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
                                    {formatNumber(stat.value || 0)}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Formulario de edición */}
                            {isEditing && (
                              <div className="space-y-4">
                                {/* Valor */}
                                <div>
                                  <Label htmlFor={`value-${stat.id}`}>Valor *</Label>
                                  <Input
                                    id={`value-${stat.id}`}
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={stat.value || 0}
                                    onChange={(e) => updateStatistic(stat.id, 'value', e.target.value)}
                                    placeholder="100"
                                    className={statErrors.some(err => err.includes('valor')) ? 'border-red-300' : ''}
                                  />
                                </div>

                                {/* Prefijo */}
                                <div key={`prefix-container-${stat.id}-${stat.prefix}`}>
                                  <Label>Prefijo</Label>
                                  <input
                                    type="text"
                                    id={`stat-prefix-${stat.id}`}
                                    name={`prefix-${stat.id}`}
                                    defaultValue={stat.prefix || ''}
                                    onBlur={(e) => {
                                      console.log('🔍 Prefix onBlur:', { id: stat.id, value: e.target.value, field: 'prefix' });
                                      updateStatistic(stat.id, 'prefix', e.target.value);
                                    }}
                                    placeholder="$, €, +, -, etc."
                                    maxLength={10}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {(stat.prefix || '').length}/10 caracteres
                                  </p>
                                </div>

                                {/* Sufijo */}
                                <div key={`suffix-container-${stat.id}-${stat.suffix}`}>
                                  <Label>Sufijo</Label>
                                  <input
                                    type="text"
                                    id={`stat-suffix-${stat.id}`}
                                    name={`suffix-${stat.id}`}
                                    defaultValue={stat.suffix || ''}
                                    onBlur={(e) => {
                                      console.log('🔍 Suffix onBlur:', { id: stat.id, value: e.target.value, field: 'suffix' });
                                      updateStatistic(stat.id, 'suffix', e.target.value);
                                    }}
                                    placeholder="+, %, K, M, años, proyectos, etc."
                                    maxLength={10}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {(stat.suffix || '').length}/10 caracteres
                                  </p>
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

                                {/* Selector de Icono */}
                                <div>
                                  <Label htmlFor={`icon-${stat.id}`}>Icono</Label>
                                  <Select
                                    key={`icon-select-${stat.id}-${stat.icon}`}
                                    value={stat.icon || 'Award'}
                                    onValueChange={(value) => {
                                      console.log('🎨 Cambiando icono de', stat.icon, 'a', value, 'para stat.id:', stat.id);
                                      updateStatistic(stat.id, 'icon', value);
                                    }}
                                  >
                                    <SelectTrigger id={`icon-${stat.id}`}>
                                      <SelectValue placeholder="Seleccionar icono">
                                        <div className="flex items-center gap-2">
                                          {renderIcon(stat.icon || 'Award', "h-4 w-4")}
                                          <span>{availableIcons[stat.icon as keyof typeof availableIcons]?.label || 'Seleccionar icono'}</span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(availableIcons).map(([key, iconData]) => (
                                        <SelectItem key={key} value={key}>
                                          <div className="flex items-center gap-2">
                                            <iconData.icon className="h-4 w-4" />
                                            <span>{iconData.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Icono actual: {stat.icon || 'Award'}
                                  </p>
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
                {cleanedStatistics.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay estadísticas configuradas</p>
                    <p className="text-sm mb-4">Haz clic en "Agregar Estadística" para comenzar a crear tus métricas</p>
                    <Button
                      onClick={addStatistic}
                      variant="outline"
                      className="mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primera Estadística
                    </Button>
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
          items={cleanedStatistics}
          itemType="statistics"
          onUpdate={onChange}
          maxItems={6}
        />
      )}

    </div>
  );
}