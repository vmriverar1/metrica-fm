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
  Heart, 
  Globe,
  Award,
  CheckCircle,
  Building,
  Zap,
  Settings,
  FileText
} from 'lucide-react';

interface Commitment {
  icon: string;
  title: string;
  description: string;
  color: string;
  bg_color: string;
  border_color: string;
}

interface CommitmentsEditorProps {
  value: Commitment[];
  onChange: (value: Commitment[]) => void;
  disabled?: boolean;
  maxCommitments?: number;
}

// Iconos disponibles para compromisos
const availableIcons = [
  { name: 'Target', icon: Target },
  { name: 'Users', icon: Users },
  { name: 'Shield', icon: Shield },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Heart', icon: Heart },
  { name: 'Globe', icon: Globe },
  { name: 'Award', icon: Award },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Building', icon: Building },
  { name: 'Zap', icon: Zap },
  { name: 'Settings', icon: Settings },
  { name: 'FileText', icon: FileText }
];

// Esquemas de colores predefinidos
const colorSchemes = [
  {
    name: 'Azul',
    color: 'text-blue-600',
    bg_color: 'bg-blue-50',
    border_color: 'border-blue-200',
    preview: 'bg-blue-100'
  },
  {
    name: 'Verde',
    color: 'text-green-600',
    bg_color: 'bg-green-50',
    border_color: 'border-green-200',
    preview: 'bg-green-100'
  },
  {
    name: 'Naranja',
    color: 'text-orange-600',
    bg_color: 'bg-orange-50',
    border_color: 'border-orange-200',
    preview: 'bg-orange-100'
  },
  {
    name: 'Púrpura',
    color: 'text-purple-600',
    bg_color: 'bg-purple-50',
    border_color: 'border-purple-200',
    preview: 'bg-purple-100'
  },
  {
    name: 'Rosa',
    color: 'text-pink-600',
    bg_color: 'bg-pink-50',
    border_color: 'border-pink-200',
    preview: 'bg-pink-100'
  },
  {
    name: 'Esmeralda',
    color: 'text-emerald-600',
    bg_color: 'bg-emerald-50',
    border_color: 'border-emerald-200',
    preview: 'bg-emerald-100'
  },
  {
    name: 'Índigo',
    color: 'text-indigo-600',
    bg_color: 'bg-indigo-50',
    border_color: 'border-indigo-200',
    preview: 'bg-indigo-100'
  },
  {
    name: 'Amarillo',
    color: 'text-yellow-600',
    bg_color: 'bg-yellow-50',
    border_color: 'border-yellow-200',
    preview: 'bg-yellow-100'
  }
];

export default function CommitmentsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxCommitments = 8
}: CommitmentsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addCommitment = () => {
    if (value.length >= maxCommitments) return;
    
    const newCommitment: Commitment = {
      icon: 'Target',
      title: '',
      description: '',
      color: 'text-blue-600',
      bg_color: 'bg-blue-50',
      border_color: 'border-blue-200'
    };
    
    onChange([...value, newCommitment]);
  };

  const removeCommitment = (index: number) => {
    const newCommitments = value.filter((_, i) => i !== index);
    onChange(newCommitments);
  };

  const updateCommitment = (index: number, field: keyof Commitment, newValue: string) => {
    const newCommitments = value.map((commitment, i) => 
      i === index ? { ...commitment, [field]: newValue } : commitment
    );
    onChange(newCommitments);
  };

  const updateCommitmentColorScheme = (index: number, scheme: typeof colorSchemes[0]) => {
    const newCommitments = value.map((commitment, i) => 
      i === index ? { 
        ...commitment, 
        color: scheme.color,
        bg_color: scheme.bg_color,
        border_color: scheme.border_color
      } : commitment
    );
    onChange(newCommitments);
  };

  const moveCommitment = (fromIndex: number, toIndex: number) => {
    const newCommitments = [...value];
    const [movedCommitment] = newCommitments.splice(fromIndex, 1);
    newCommitments.splice(toIndex, 0, movedCommitment);
    onChange(newCommitments);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveCommitment(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = availableIcons.find(icon => icon.name === iconName);
    return iconObj ? iconObj.icon : Target;
  };

  const getCurrentScheme = (commitment: Commitment) => {
    return colorSchemes.find(scheme => scheme.color === commitment.color) || colorSchemes[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Compromisos de Calidad</h3>
          <p className="text-sm text-gray-600">
            Define los compromisos empresariales clave en la política de calidad ISO 9001
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {value.length} / {maxCommitments}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={addCommitment}
            disabled={disabled || value.length >= maxCommitments}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Compromiso
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compromisos</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega los compromisos clave de tu política de calidad ISO 9001
            </p>
            <Button
              type="button"
              size="sm"
              onClick={addCommitment}
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Primer Compromiso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {value.map((commitment, index) => {
            const IconComponent = getIconComponent(commitment.icon);
            const currentScheme = getCurrentScheme(commitment);

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
                      <div className={`p-2 rounded-lg ${commitment.bg_color} border ${commitment.border_color}`}>
                        <IconComponent className={`w-5 h-5 ${commitment.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Compromiso {index + 1}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {commitment.title || 'Sin título'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCommitment(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Selector de Icono y Esquema de Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Icono
                      </label>
                      <Select
                        value={commitment.icon}
                        onValueChange={(value) => updateCommitment(index, 'icon', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <IconComponent className={`w-4 h-4 ${commitment.color}`} />
                              <span>{commitment.icon}</span>
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

                    {/* Selector de Esquema de Color */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Esquema de Color
                      </label>
                      <Select
                        value={currentScheme.name}
                        onValueChange={(value) => {
                          const scheme = colorSchemes.find(s => s.name === value);
                          if (scheme) updateCommitmentColorScheme(index, scheme);
                        }}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${currentScheme.preview}`}></div>
                              <span>{currentScheme.name}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {colorSchemes.map((scheme) => (
                            <SelectItem key={scheme.name} value={scheme.name}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${scheme.preview}`}></div>
                                <span>{scheme.name}</span>
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
                      Título del Compromiso
                    </label>
                    <Input
                      value={commitment.title}
                      onChange={(e) => updateCommitment(index, 'title', e.target.value)}
                      placeholder="ej. Excelencia en la Entrega"
                      disabled={disabled}
                      className="w-full"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción del Compromiso
                    </label>
                    <Textarea
                      value={commitment.description}
                      onChange={(e) => updateCommitment(index, 'description', e.target.value)}
                      placeholder="Describe en detalle este compromiso de calidad..."
                      rows={4}
                      disabled={disabled}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-xs font-medium text-gray-500 mb-2">VISTA PREVIA</h5>
                    <div className={`p-4 rounded-lg border ${commitment.bg_color} ${commitment.border_color}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <IconComponent className={`w-6 h-6 ${commitment.color}`} />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900 mb-2">
                            {commitment.title || 'Título del compromiso'}
                          </h6>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {commitment.description || 'Descripción del compromiso de calidad...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Plantillas sugeridas */}
      {value.length === 0 && (
        <Card className="mt-6 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">💡 Sugerencias de Compromisos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Excelencia en la Entrega</span>
              </div>
              <div className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Desarrollo del Talento</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Cumplimiento Normativo</span>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Mejora Continua</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}