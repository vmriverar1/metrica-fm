'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  Award,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';

interface QualityObjective {
  id: string;
  title: string;
  target: string;
  current: string;
  description: string;
  status: 'achieved' | 'in_progress' | 'at_risk' | 'not_started';
}

interface QualityObjectivesEditorProps {
  value: QualityObjective[];
  onChange: (value: QualityObjective[]) => void;
  disabled?: boolean;
  maxObjectives?: number;
}

// Estados disponibles para objetivos
const objectiveStatuses = [
  { 
    value: 'achieved', 
    label: 'Logrado', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle 
  },
  { 
    value: 'in_progress', 
    label: 'En Progreso', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: Clock 
  },
  { 
    value: 'at_risk', 
    label: 'En Riesgo', 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    icon: AlertCircle 
  },
  { 
    value: 'not_started', 
    label: 'No Iniciado', 
    color: 'text-gray-600', 
    bg: 'bg-gray-50', 
    border: 'border-gray-200',
    icon: Target 
  }
];

// Plantillas de objetivos comunes ISO 9001
const objectiveTemplates = [
  {
    title: "Satisfacción del Cliente",
    target: "≥ 95%",
    current: "98.2%",
    description: "Mantener niveles excepcionales de satisfacción en todos nuestros proyectos",
    status: "achieved" as const
  },
  {
    title: "Cumplimiento de Cronogramas",
    target: "≥ 90%",
    current: "94.8%",
    description: "Entregar proyectos dentro de los plazos establecidos",
    status: "achieved" as const
  },
  {
    title: "Control Presupuestario",
    target: "≤ ±5%",
    current: "±2.1%",
    description: "Mantener desviaciones presupuestarias mínimas",
    status: "achieved" as const
  },
  {
    title: "Capacitación del Equipo",
    target: "≥ 40h/año",
    current: "48.5h/año",
    description: "Horas de formación promedio por colaborador",
    status: "achieved" as const
  },
  {
    title: "Mejoras Implementadas",
    target: "≥ 12/año",
    current: "16/año",
    description: "Número de mejoras de proceso implementadas anualmente",
    status: "achieved" as const
  }
];

export default function QualityObjectivesEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxObjectives = 10
}: QualityObjectivesEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);

  const addObjective = (template?: typeof objectiveTemplates[0]) => {
    if (value.length >= maxObjectives) return;
    
    const newObjective: QualityObjective = {
      id: `objective-${Date.now()}`,
      title: template?.title || '',
      target: template?.target || '',
      current: template?.current || '',
      description: template?.description || '',
      status: template?.status || 'not_started'
    };
    
    onChange([...value, newObjective]);
  };

  const removeObjective = (index: number) => {
    const newObjectives = value.filter((_, i) => i !== index);
    onChange(newObjectives);
  };

  const updateObjective = (index: number, field: keyof QualityObjective, newValue: any) => {
    const newObjectives = value.map((objective, i) => 
      i === index ? { ...objective, [field]: newValue } : objective
    );
    onChange(newObjectives);
  };

  const moveObjective = (fromIndex: number, toIndex: number) => {
    const newObjectives = [...value];
    const [movedObjective] = newObjectives.splice(fromIndex, 1);
    newObjectives.splice(toIndex, 0, movedObjective);
    onChange(newObjectives);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveObjective(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getStatusInfo = (status: string) => {
    return objectiveStatuses.find(s => s.value === status) || objectiveStatuses[0];
  };

  const calculateProgress = (current: string, target: string): number => {
    // Intentar extraer números para calcular progreso
    const currentNum = parseFloat(current.replace(/[^\d.-]/g, ''));
    const targetNum = parseFloat(target.replace(/[^\d.-]/g, ''));
    
    if (isNaN(currentNum) || isNaN(targetNum)) return 0;
    
    // Si el target contiene ≥ o >, es un objetivo de mínimo
    if (target.includes('≥') || target.includes('>')) {
      return Math.min(100, (currentNum / targetNum) * 100);
    }
    
    // Si el target contiene ≤ o <, es un objetivo de máximo
    if (target.includes('≤') || target.includes('<')) {
      return Math.max(0, 100 - ((currentNum - targetNum) / targetNum) * 100);
    }
    
    // Para objetivos exactos, calcular proximidad
    const diff = Math.abs(currentNum - targetNum);
    const range = targetNum * 0.1; // 10% de tolerancia
    return Math.max(0, 100 - (diff / range) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Objetivos de Calidad</h3>
          <p className="text-sm text-gray-600">
            Define y gestiona los objetivos medibles de la política de calidad ISO 9001
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxObjectives}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={() => addObjective()}
            disabled={disabled || value.length >= maxObjectives}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Objetivo
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay objetivos</h3>
            <p className="text-gray-500 text-center mb-4">
              Define objetivos medibles y específicos para tu política de calidad ISO 9001
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                size="sm"
                onClick={() => addObjective()}
                disabled={disabled}
              >
                <Plus className="w-4 h-4 mr-1" />
                Crear Objetivo
              </Button>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">o usar plantillas ISO 9001:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {objectiveTemplates.slice(0, 3).map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addObjective(template)}
                      disabled={disabled}
                      className="h-6 text-xs"
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {value.map((objective, index) => {
            const statusInfo = getStatusInfo(objective.status);
            const StatusIcon = statusInfo.icon;
            const progress = calculateProgress(objective.current, objective.target);
            const isExpanded = expandedObjective === index;

            return (
              <Card
                key={objective.id || index}
                className={`transition-all duration-200 ${
                  draggedIndex === index ? 'shadow-lg scale-105' : 'hover:shadow-md'
                }`}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="cursor-move p-1 rounded hover:bg-gray-100">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className={`p-2 rounded-lg ${statusInfo.bg} border ${statusInfo.border}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {objective.title || `Objetivo ${index + 1}`}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs ${statusInfo.color} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{objective.current || '0'}</span> / {objective.target || 'N/A'}
                          </p>
                          {progress > 0 && (
                            <div className="flex-1 max-w-32">
                              <Progress 
                                value={progress} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedObjective(isExpanded ? null : index)}
                        className="h-8"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeObjective(index)}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información básica */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Título del Objetivo
                    </label>
                    <Input
                      value={objective.title}
                      onChange={(e) => updateObjective(index, 'title', e.target.value)}
                      placeholder="ej. Satisfacción del Cliente"
                      disabled={disabled}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Meta/Target
                      </label>
                      <Input
                        value={objective.target}
                        onChange={(e) => updateObjective(index, 'target', e.target.value)}
                        placeholder="ej. ≥ 95%"
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Valor Actual
                      </label>
                      <Input
                        value={objective.current}
                        onChange={(e) => updateObjective(index, 'current', e.target.value)}
                        placeholder="ej. 98.2%"
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Estado
                      </label>
                      <Select
                        value={objective.status}
                        onValueChange={(value: any) => updateObjective(index, 'status', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                              <span>{statusInfo.label}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {objectiveStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center space-x-2">
                                <status.icon className={`w-4 h-4 ${status.color}`} />
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descripción expandible */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Descripción del Objetivo
                      </label>
                      <Textarea
                        value={objective.description}
                        onChange={(e) => updateObjective(index, 'description', e.target.value)}
                        placeholder="Describe en detalle este objetivo de calidad, cómo se mide y por qué es importante..."
                        rows={4}
                        disabled={disabled}
                        className="resize-none"
                      />
                    </div>
                  )}

                  {/* Progress visual */}
                  {!isExpanded && progress > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progreso</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {objective.description && objective.description.length > 100 
                          ? `${objective.description.substring(0, 100)}...`
                          : objective.description || ''
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Estadísticas resumen */}
      {value.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">📊 Resumen de Objetivos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {objectiveStatuses.map(status => {
                const count = value.filter(obj => obj.status === status.value).length;
                const percentage = value.length > 0 ? Math.round((count / value.length) * 100) : 0;
                return (
                  <div key={status.value} className="flex flex-col items-center">
                    <status.icon className={`w-6 h-6 ${status.color} mb-1`} />
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-600">{status.label}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plantillas disponibles */}
      {value.length < maxObjectives && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">💡 Plantillas ISO 9001</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {objectiveTemplates.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addObjective(template)}
                  disabled={disabled}
                  className="justify-start text-left h-auto p-3"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{template.title}</span>
                    <span className="text-xs text-gray-500">
                      {template.current} / {template.target}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}