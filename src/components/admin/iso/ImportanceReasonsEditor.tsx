'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  GripVertical,
  Shield,
  Target,
  Users,
  Globe,
  Building2,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImportanceReason {
  index: number;
  icon: string;
  title: string;
  description: string;
  stat: string;
}

interface ImportanceReasonsEditorProps {
  value: ImportanceReason[];
  onChange: (reasons: ImportanceReason[]) => void;
  disabled?: boolean;
  maxReasons?: number;
  title?: string;
  description?: string;
}

const iconOptions = [
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Target', label: 'Objetivo', icon: Target },
  { value: 'Users', label: 'Usuarios', icon: Users },
  { value: 'Globe', label: 'Globo', icon: Globe },
  { value: 'Building2', label: 'Edificio', icon: Building2 },
  { value: 'Award', label: 'Premio', icon: Award },
  { value: 'TrendingUp', label: 'Tendencia', icon: TrendingUp },
];

export default function ImportanceReasonsEditor({
  value = [],
  onChange,
  disabled = false,
  maxReasons = 6,
  title = 'Razones de Importancia',
  description = 'Gestiona las razones por las cuales ISO 9001 es importante'
}: ImportanceReasonsEditorProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateReasons = (reasons: ImportanceReason[]): string[] => {
    const newErrors: string[] = [];

    reasons.forEach((reason, index) => {
      if (!reason.title?.trim()) {
        newErrors.push(`Razón ${index + 1}: El título es requerido`);
      }
      if (!reason.description?.trim()) {
        newErrors.push(`Razón ${index + 1}: La descripción es requerida`);
      }
      if (!reason.icon) {
        newErrors.push(`Razón ${index + 1}: El ícono es requerido`);
      }
      if (!reason.stat?.trim()) {
        newErrors.push(`Razón ${index + 1}: La estadística es requerida`);
      }
    });

    return newErrors;
  };

  const handleChange = (newReasons: ImportanceReason[]) => {
    const validationErrors = validateReasons(newReasons);
    setErrors(validationErrors);
    onChange(newReasons);
  };

  const addReason = () => {
    if (value.length >= maxReasons) return;

    const newReason: ImportanceReason = {
      index: value.length,
      icon: 'Shield',
      title: '',
      description: '',
      stat: ''
    };

    handleChange([...value, newReason]);
  };

  const removeReason = (index: number) => {
    const newReasons = value.filter((_, i) => i !== index)
      .map((reason, i) => ({ ...reason, index: i }));
    handleChange(newReasons);
  };

  const updateReason = (index: number, field: keyof ImportanceReason, newValue: any) => {
    const newReasons = value.map((reason, i) =>
      i === index ? { ...reason, [field]: newValue } : reason
    );
    handleChange(newReasons);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Shield;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update indices to match new order
    const reorderedItems = items.map((item, index) => ({
      ...item,
      index
    }));

    handleChange(reorderedItems);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-2">
              Hay {errors.length} error(es). Revisa los campos marcados:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasons List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="reasons-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {value.map((reason, index) => (
                  <Draggable
                    key={`reason-${index}`}
                    draggableId={`reason-${index}`}
                    index={index}
                    isDragDisabled={disabled}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border border-gray-200 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50' : ''
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <Badge variant="outline">Razón {index + 1}</Badge>
                              {snapshot.isDragging && (
                                <Badge variant="secondary" className="text-xs">
                                  Arrastrando...
                                </Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeReason(index)}
                              disabled={disabled}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Icon and Title Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`icon-${index}`} className="text-sm font-medium">
                                Ícono
                              </Label>
                              <Select
                                value={reason.icon}
                                onValueChange={(value) => updateReason(index, 'icon', value)}
                                disabled={disabled}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    <div className="flex items-center gap-2">
                                      {React.createElement(getIconComponent(reason.icon), {
                                        className: "w-4 h-4"
                                      })}
                                      {iconOptions.find(opt => opt.value === reason.icon)?.label}
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <option.icon className="w-4 h-4" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor={`title-${index}`} className="text-sm font-medium">
                                Título *
                              </Label>
                              <Input
                                id={`title-${index}`}
                                value={reason.title}
                                onChange={(e) => updateReason(index, 'title', e.target.value)}
                                disabled={disabled}
                                placeholder="ej. Sector Construcción"
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                              Descripción *
                            </Label>
                            <Textarea
                              id={`description-${index}`}
                              value={reason.description}
                              onChange={(e) => updateReason(index, 'description', e.target.value)}
                              disabled={disabled}
                              placeholder="Describe por qué es importante..."
                              rows={3}
                              className="w-full"
                            />
                          </div>

                          {/* Statistic */}
                          <div>
                            <Label htmlFor={`stat-${index}`} className="text-sm font-medium">
                              Estadística *
                            </Label>
                            <Input
                              id={`stat-${index}`}
                              value={reason.stat}
                              onChange={(e) => updateReason(index, 'stat', e.target.value)}
                              disabled={disabled}
                              placeholder="ej. 85% de clientes prefieren empresas certificadas"
                              className="w-full"
                            />
                          </div>

                          {/* Preview */}
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                {React.createElement(getIconComponent(reason.icon), {
                                  className: "w-5 h-5 text-primary"
                                })}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">
                                  {reason.title || 'Título de la razón'}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reason.description || 'Descripción de la razón...'}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {reason.stat || 'Estadística'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Button */}
        {value.length < maxReasons && (
          <Button
            type="button"
            variant="outline"
            onClick={addReason}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Razón ({value.length}/{maxReasons})
          </Button>
        )}

        {/* Summary */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Total:</strong> {value.length} razón(es) configurada(s)
            {errors.length > 0 && (
              <span className="text-red-600 ml-2">
                • {errors.length} error(es) pendiente(s)
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}