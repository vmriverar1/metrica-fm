'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Shield, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle,
  Building,
  Globe,
  Heart,
  Zap,
  Eye,
  Settings
} from 'lucide-react';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface BenefitsEditorProps {
  value: Benefit[];
  onChange: (value: Benefit[]) => void;
  disabled?: boolean;
  maxBenefits?: number;
}

// Iconos disponibles con sus nombres
const availableIcons = [
  { name: 'Shield', icon: Shield, color: 'text-blue-600' },
  { name: 'Target', icon: Target, color: 'text-green-600' },
  { name: 'TrendingUp', icon: TrendingUp, color: 'text-purple-600' },
  { name: 'Users', icon: Users, color: 'text-orange-600' },
  { name: 'Award', icon: Award, color: 'text-yellow-600' },
  { name: 'CheckCircle', icon: CheckCircle, color: 'text-emerald-600' },
  { name: 'Building', icon: Building, color: 'text-indigo-600' },
  { name: 'Globe', icon: Globe, color: 'text-cyan-600' },
  { name: 'Heart', icon: Heart, color: 'text-pink-600' },
  { name: 'Zap', icon: Zap, color: 'text-amber-600' },
  { name: 'Eye', icon: Eye, color: 'text-slate-600' },
  { name: 'Settings', icon: Settings, color: 'text-gray-600' }
];

// Colores disponibles
const availableColors = [
  { name: 'Azul', value: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { name: 'Verde', value: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { name: 'Púrpura', value: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'Naranja', value: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { name: 'Amarillo', value: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { name: 'Esmeralda', value: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { name: 'Índigo', value: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { name: 'Cian', value: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' }
];

export default function BenefitsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxBenefits = 8
}: BenefitsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addBenefit = () => {
    if (value.length >= maxBenefits) return;
    
    const newBenefit: Benefit = {
      icon: 'Shield',
      title: '',
      description: '',
      color: 'text-blue-600'
    };
    
    onChange([...value, newBenefit]);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = value.filter((_, i) => i !== index);
    onChange(newBenefits);
  };

  const updateBenefit = (index: number, field: keyof Benefit, newValue: string) => {
    const newBenefits = value.map((benefit, i) => 
      i === index ? { ...benefit, [field]: newValue } : benefit
    );
    onChange(newBenefits);
  };

  const moveBenefit = (fromIndex: number, toIndex: number) => {
    const newBenefits = [...value];
    const [movedBenefit] = newBenefits.splice(fromIndex, 1);
    newBenefits.splice(toIndex, 0, movedBenefit);
    onChange(newBenefits);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveBenefit(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = availableIcons.find(icon => icon.name === iconName);
    return iconObj ? iconObj.icon : Shield;
  };

  const getColorInfo = (colorValue: string) => {
    return availableColors.find(color => color.value === colorValue) || availableColors[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Beneficios ISO 9001</h3>
          <p className="text-sm text-gray-600">
            Gestiona los beneficios clave de la certificación ISO 9001
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxBenefits}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={addBenefit}
            disabled={disabled || value.length >= maxBenefits}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Beneficio
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay beneficios</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega beneficios clave de la certificación ISO 9001 para mostrar a los visitantes
            </p>
            <Button
              type="button"
              size="sm"
              onClick={addBenefit}
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Primer Beneficio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {value.map((benefit, index) => {
            const IconComponent = getIconComponent(benefit.icon);
            const colorInfo = getColorInfo(benefit.color);

            return (
              <Card
                key={index}
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
                    <div className="flex items-center space-x-3">
                      <div className="cursor-move p-1 rounded hover:bg-gray-100">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className={`p-2 rounded-lg ${colorInfo.bg}`}>
                        <IconComponent className={`w-5 h-5 ${benefit.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Beneficio {index + 1}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {benefit.title || 'Sin título'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Selector de Icono */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Icono
                      </label>
                      <Select
                        value={benefit.icon}
                        onValueChange={(value) => updateBenefit(index, 'icon', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <IconComponent className={`w-4 h-4 ${benefit.color}`} />
                              <span>{benefit.icon}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map(({ name, icon: Icon }) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-600" />
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de Color */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Color
                      </label>
                      <Select
                        value={benefit.color}
                        onValueChange={(value) => updateBenefit(index, 'color', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${benefit.color.replace('text-', 'bg-')}`}></div>
                              <span>{colorInfo.name}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map(({ name, value, bg }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${value.replace('text-', 'bg-')}`}></div>
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Título del Beneficio
                    </label>
                    <Input
                      value={benefit.title}
                      onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                      placeholder="ej. Garantía de Calidad"
                      disabled={disabled}
                      className="w-full"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción
                    </label>
                    <Textarea
                      value={benefit.description}
                      onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                      placeholder="Describe el beneficio y su impacto para los clientes..."
                      rows={3}
                      disabled={disabled}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-xs font-medium text-gray-500 mb-2">VISTA PREVIA</h5>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${colorInfo.bg} ${colorInfo.border} border`}>
                        <IconComponent className={`w-5 h-5 ${benefit.color}`} />
                      </div>
                      <div className="flex-1">
                        <h6 className="font-semibold text-gray-900 mb-1">
                          {benefit.title || 'Título del beneficio'}
                        </h6>
                        <p className="text-sm text-gray-600">
                          {benefit.description || 'Descripción del beneficio...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}