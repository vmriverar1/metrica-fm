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
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users,
  Target,
  Award,
  CheckCircle,
  Building,
  Zap,
  Heart,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';

interface CaseStudy {
  project: string;
  result: string;
}

interface ClientBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  impact: string;
  color: string;
  details: string[];
  case_study: CaseStudy;
}

interface ClientBenefitsEditorProps {
  value: ClientBenefit[];
  onChange: (value: ClientBenefit[]) => void;
  disabled?: boolean;
  maxBenefits?: number;
}

// Iconos disponibles para beneficios
const availableIcons = [
  { name: 'Shield', icon: Shield, description: 'Protección/Calidad' },
  { name: 'Clock', icon: Clock, description: 'Tiempo/Plazos' },
  { name: 'DollarSign', icon: DollarSign, description: 'Costos/Presupuesto' },
  { name: 'TrendingUp', icon: TrendingUp, description: 'Mejora/Crecimiento' },
  { name: 'Users', icon: Users, description: 'Equipo/Colaboración' },
  { name: 'Target', icon: Target, description: 'Objetivos/Metas' },
  { name: 'Award', icon: Award, description: 'Reconocimiento/Premio' },
  { name: 'CheckCircle', icon: CheckCircle, description: 'Verificación/Aprobado' },
  { name: 'Building', icon: Building, description: 'Infraestructura' },
  { name: 'Zap', icon: Zap, description: 'Eficiencia/Rapidez' },
  { name: 'Heart', icon: Heart, description: 'Satisfacción/Cuidado' },
  { name: 'Eye', icon: Eye, description: 'Transparencia/Visibilidad' }
];

// Colores disponibles para beneficios
const availableColors = [
  { name: 'Azul', value: 'blue' },
  { name: 'Verde', value: 'green' },
  { name: 'Naranja', value: 'orange' },
  { name: 'Púrpura', value: 'purple' },
  { name: 'Rojo', value: 'red' },
  { name: 'Índigo', value: 'indigo' },
  { name: 'Amarillo', value: 'yellow' },
  { name: 'Rosa', value: 'pink' }
];

export default function ClientBenefitsEditor({ 
  value = [], 
  onChange, 
  disabled = false,
  maxBenefits = 8
}: ClientBenefitsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);

  const addBenefit = () => {
    if (value.length >= maxBenefits) return;
    
    const newBenefit: ClientBenefit = {
      id: `benefit-${Date.now()}`,
      icon: 'Shield',
      title: '',
      description: '',
      impact: '',
      color: 'blue',
      details: [],
      case_study: {
        project: '',
        result: ''
      }
    };
    
    onChange([...value, newBenefit]);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = value.filter((_, i) => i !== index);
    onChange(newBenefits);
  };

  const updateBenefit = (index: number, field: keyof ClientBenefit, newValue: any) => {
    const newBenefits = value.map((benefit, i) => 
      i === index ? { ...benefit, [field]: newValue } : benefit
    );
    onChange(newBenefits);
  };

  const addDetail = (benefitIndex: number) => {
    const newDetails = [...(value[benefitIndex].details || []), ''];
    updateBenefit(benefitIndex, 'details', newDetails);
  };

  const updateDetail = (benefitIndex: number, detailIndex: number, newValue: string) => {
    const newDetails = [...(value[benefitIndex].details || [])];
    newDetails[detailIndex] = newValue;
    updateBenefit(benefitIndex, 'details', newDetails);
  };

  const removeDetail = (benefitIndex: number, detailIndex: number) => {
    const newDetails = (value[benefitIndex].details || []).filter((_, i) => i !== detailIndex);
    updateBenefit(benefitIndex, 'details', newDetails);
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

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { text: string; bg: string; border: string }> = {
      blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
      red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
      indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
      yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      pink: { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Beneficios para Clientes</h3>
          <p className="text-sm text-gray-600">
            Gestiona los beneficios tangibles de la certificación ISO 9001 para los clientes
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
            <Shield className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay beneficios</h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega beneficios tangibles que los clientes obtienen con la certificación ISO 9001
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
            const colorClasses = getColorClasses(benefit.color);
            const isExpanded = expandedBenefit === index;

            return (
              <Card
                key={benefit.id || index}
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
                      <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                        <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {benefit.title || `Beneficio ${index + 1}`}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {benefit.impact || 'Sin impacto definido'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedBenefit(isExpanded ? null : index)}
                        className="h-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información básica */}
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
                              <IconComponent className={`w-4 h-4 ${colorClasses.text}`} />
                              <span>{benefit.icon}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map(({ name, icon: Icon, description }) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-600" />
                                <div className="flex flex-col">
                                  <span>{name}</span>
                                  <span className="text-xs text-gray-500">{description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                              <div className={`w-3 h-3 rounded-full bg-${benefit.color}-500`}></div>
                              <span>{availableColors.find(c => c.value === benefit.color)?.name}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map(({ name, value }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full bg-${value}-500`}></div>
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Título del Beneficio
                    </label>
                    <Input
                      value={benefit.title}
                      onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                      placeholder="ej. Garantía de Calidad Total"
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción
                    </label>
                    <Textarea
                      value={benefit.description}
                      onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                      placeholder="Describe el beneficio y su valor para el cliente..."
                      rows={3}
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Impacto Medible
                    </label>
                    <Input
                      value={benefit.impact}
                      onChange={(e) => updateBenefit(index, 'impact', e.target.value)}
                      placeholder="ej. 99.2% satisfacción cliente"
                      disabled={disabled}
                    />
                  </div>

                  {/* Sección expandible */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {/* Detalles */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Detalles del Beneficio
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addDetail(index)}
                            disabled={disabled}
                            className="h-6 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Agregar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(benefit.details || []).map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center space-x-2">
                              <Input
                                value={detail}
                                onChange={(e) => updateDetail(index, detailIndex, e.target.value)}
                                placeholder="Detalle específico del beneficio..."
                                disabled={disabled}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeDetail(index, detailIndex)}
                                disabled={disabled}
                                className="h-8 w-8 p-0 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Caso de estudio */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Proyecto (Caso de Estudio)
                          </label>
                          <Input
                            value={benefit.case_study?.project || ''}
                            onChange={(e) => updateBenefit(index, 'case_study', {
                              ...benefit.case_study,
                              project: e.target.value
                            })}
                            placeholder="ej. Torre Corporativa San Isidro"
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Resultado
                          </label>
                          <Input
                            value={benefit.case_study?.result || ''}
                            onChange={(e) => updateBenefit(index, 'case_study', {
                              ...benefit.case_study,
                              result: e.target.value
                            })}
                            placeholder="ej. Entregado con 0 defectos mayores"
                            disabled={disabled}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview compacto */}
                  {!isExpanded && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-xs font-medium text-gray-500 mb-2">VISTA PREVIA</h5>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                          <IconComponent className={`w-4 h-4 ${colorClasses.text}`} />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900 text-sm mb-1">
                            {benefit.title || 'Título del beneficio'}
                          </h6>
                          <p className="text-xs text-gray-600 mb-2">
                            {benefit.description || 'Descripción del beneficio...'}
                          </p>
                          {benefit.impact && (
                            <Badge variant="secondary" className="text-xs">
                              {benefit.impact}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Plantillas sugeridas */}
      {value.length === 0 && (
        <Card className="mt-6 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <h4 className="font-medium text-gray-900 mb-3">💡 Ejemplos de Beneficios</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Garantía de Calidad Total</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Cumplimiento de Plazos</span>
              </div>
              <div className="flex items-start space-x-2">
                <DollarSign className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Control Presupuestario</span>
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