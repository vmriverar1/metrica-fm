'use client';

import React, { useState } from 'react';
import { Award, Shield, Leaf, Heart, Scale, AlertCircle, Lightbulb, Lock, Eye, EyeOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Policy {
  id: number;
  icon: string;
  title: string;
  description: string;
  image: string;
  image_fallback: string;
}

interface PoliciesManagerProps {
  policies: Policy[];
  onChange: (policies: Policy[]) => void;
  maxPolicies?: number;
  templates?: Record<string, Partial<Policy>>;
}

const PoliciesManager: React.FC<PoliciesManagerProps> = ({
  policies,
  onChange,
  maxPolicies = 12,
  templates
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<number | null>(null);

  // Iconos específicos para políticas empresariales
  const availableIcons = {
    'Award': { icon: Award, label: 'Premio (Calidad)', color: 'text-yellow-600' },
    'Shield': { icon: Shield, label: 'Escudo (Seguridad)', color: 'text-green-600' },
    'Leaf': { icon: Leaf, label: 'Hoja (Medio Ambiente)', color: 'text-green-500' },
    'Heart': { icon: Heart, label: 'Corazón (Responsabilidad Social)', color: 'text-red-500' },
    'Scale': { icon: Scale, label: 'Balanza (Ética)', color: 'text-purple-600' },
    'AlertCircle': { icon: AlertCircle, label: 'Alerta (Gestión de Riesgos)', color: 'text-orange-600' },
    'Lightbulb': { icon: Lightbulb, label: 'Bombilla (Innovación)', color: 'text-blue-500' },
    'Lock': { icon: Lock, label: 'Candado (Confidencialidad)', color: 'text-gray-600' }
  };

  // Templates predefinidos para políticas comunes
  const defaultTemplates = {
    'calidad': {
      title: 'Política de Calidad',
      description: 'Compromiso con la excelencia en cada proyecto, superando las expectativas de nuestros clientes.',
      icon: 'Award'
    },
    'seguridad': {
      title: 'Política de Seguridad y Salud en el Trabajo',
      description: 'Priorizamos la seguridad de nuestros trabajadores con protocolos estrictos y capacitación continua.',
      icon: 'Shield'
    },
    'ambiente': {
      title: 'Política de Medio Ambiente',
      description: 'Construimos de manera sostenible, minimizando el impacto ambiental en cada etapa del proyecto.',
      icon: 'Leaf'
    },
    'social': {
      title: 'Política de Responsabilidad Social',
      description: 'Contribuimos al desarrollo de las comunidades donde operamos, generando valor compartido.',
      icon: 'Heart'
    }
  };

  const allTemplates = { ...defaultTemplates, ...templates };

  const handlePolicyChange = (index: number, field: keyof Policy, value: any) => {
    const updatedPolicies = [...policies];
    updatedPolicies[index] = { ...updatedPolicies[index], [field]: value };
    onChange(updatedPolicies);
  };

  const applyTemplate = (index: number, templateKey: string) => {
    const template = allTemplates[templateKey];
    if (template) {
      Object.entries(template).forEach(([field, value]) => {
        handlePolicyChange(index, field as keyof Policy, value);
      });
    }
  };

  const renderIcon = (iconName: string, className = "h-8 w-8") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Award;
    const color = availableIcons[iconName as keyof typeof availableIcons]?.color || 'text-gray-600';
    return <IconComponent className={`${className} ${color}`} />;
  };

  const getPolicyPriority = (index: number) => {
    if (index < 3) return 'Alta';
    if (index < 6) return 'Media';
    return 'Baja';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PolicyCard = ({ policy, index }: { policy: Policy; index: number }) => {
    const priority = getPolicyPriority(index);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {renderIcon(policy.icon, "h-6 w-6")}
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="text-xs mb-1">
                Política {policy.id}
              </Badge>
              <Badge className={`text-xs ml-2 ${getPriorityColor(priority)}`}>
                {priority}
              </Badge>
            </div>
          </div>
        </div>
        
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {policy.title || 'Sin título'}
        </h4>
        
        <p className="text-xs text-gray-600 line-clamp-3 min-h-[3rem]">
          {policy.description || 'Sin descripción'}
        </p>
        
        {policy.image && (
          <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded border overflow-hidden mt-3">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-600">
                📸 {policy.image.split('/').pop()?.substring(0, 15)}...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PolicyEditor = ({ policy, index }: { policy: Policy; index: number }) => {
    const priority = getPolicyPriority(index);
    
    return (
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div>
              {renderIcon(policy.icon, "h-5 w-5")}
            </div>
            <span>Política {policy.id}: {policy.title || 'Sin título'}</span>
            <Badge className={getPriorityColor(priority)}>
              Prioridad {priority}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPolicy(selectedPolicy === index ? null : index)}
              className="ml-auto"
            >
              {selectedPolicy === index ? 'Colapsar' : 'Editar'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {selectedPolicy === index && (
          <CardContent className="space-y-4">
            {/* Templates */}
            {Object.keys(allTemplates).length > 0 && (
              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aplicar Template:
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(allTemplates).map(([key, template]) => (
                    <Button
                      type="button"
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(index, key)}
                      className="text-xs"
                    >
                      {template.title?.substring(0, 20) || key}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna 1: Contenido */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la Política *
                  </label>
                  <Input
                    value={policy.title}
                    onChange={(e) => handlePolicyChange(index, 'title', e.target.value)}
                    placeholder="ej: Política de Calidad"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{policy.title?.length || 0}/50</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <Textarea
                    value={policy.description}
                    onChange={(e) => handlePolicyChange(index, 'description', e.target.value)}
                    placeholder="Describa el compromiso y alcance de la política..."
                    rows={4}
                    maxLength={250}
                  />
                  <p className="text-xs text-gray-500 mt-1">{policy.description?.length || 0}/250</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de la Política
                  </label>
                  <Input
                    value={policy.id}
                    onChange={(e) => handlePolicyChange(index, 'id', Number(e.target.value))}
                    type="number"
                    min={1}
                    max={maxPolicies}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Columna 2: Visual */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono de la Política
                  </label>
                  <Select
                    value={policy.icon}
                    onValueChange={(value) => handlePolicyChange(index, 'icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {renderIcon(policy.icon, "h-4 w-4")}
                          {availableIcons[policy.icon as keyof typeof availableIcons]?.label || policy.icon}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Principal (URL)
                  </label>
                  <Input
                    value={policy.image}
                    onChange={(e) => handlePolicyChange(index, 'image', e.target.value)}
                    placeholder="https://metrica-dip.com/images/politica.jpg"
                    type="url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Fallback (local)
                  </label>
                  <Input
                    value={policy.image_fallback}
                    onChange={(e) => handlePolicyChange(index, 'image_fallback', e.target.value)}
                    placeholder="/img/policies/politica.jpg"
                  />
                </div>

                {/* Preview de la política individual */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                  <PolicyCard policy={policy} index={index} />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Policies Manager
              <Badge variant="outline">{policies.length} Políticas</Badge>
            </CardTitle>
            <CardDescription>
              Gestione las {policies.length} políticas empresariales de la organización. Las 3 primeras tienen alta prioridad.
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
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">
              Vista Previa: Políticas Empresariales
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {policies.map((policy, index) => (
                <PolicyCard key={policy.id} policy={policy} index={index} />
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
                onClick={() => setSelectedPolicy(selectedPolicy === null ? 0 : null)}
              >
                {selectedPolicy === null ? 'Editar Primera' : 'Ver Todas'}
              </Button>
              <div className="flex gap-1">
                {policies.map((_, index) => {
                  const priority = getPolicyPriority(index);
                  return (
                    <Button
                      type="button"
                      key={index}
                      variant={selectedPolicy === index ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedPolicy(index)}
                      className={`w-8 h-8 p-0 ${priority === 'Alta' ? 'border-red-300' : ''}`}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
            </div>

            {policies.map((policy, index) => (
              <PolicyEditor key={policy.id} policy={policy} index={index} />
            ))}
          </div>
        )}

        {/* Policy Distribution */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución por Prioridad:</h4>
          <div className="flex gap-4">
            <Badge className="bg-red-100 text-red-800">
              Alta Prioridad: {policies.slice(0, 3).filter(p => p.title && p.description).length}/3
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              Media Prioridad: {policies.slice(3, 6).filter(p => p.title && p.description).length}/3
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              Baja Prioridad: {policies.slice(6).filter(p => p.title && p.description).length}/{policies.length - 6}
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">{policies.length}</p>
              <p className="text-xs text-gray-600">Total Políticas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E84E0F]">
                {policies.filter(p => p.title && p.description).length}
              </p>
              <p className="text-xs text-gray-600">Completas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {policies.filter(p => p.image || p.image_fallback).length}
              </p>
              <p className="text-xs text-gray-600">Con Imagen</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(policies.map(p => p.icon)).size}
              </p>
              <p className="text-xs text-gray-600">Iconos Únicos</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips para Políticas Empresariales:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Prioridad:</strong> Las primeras 3 políticas son de alta prioridad (aparecen primero)</li>
            <li>• <strong>Consistencia:</strong> Use un tono profesional y comprometido en todas</li>
            <li>• <strong>Especificidad:</strong> Sea específico sobre el compromiso de la empresa</li>
            <li>• <strong>Templates:</strong> Use los templates para mantener consistencia</li>
            <li>• <strong>Iconos:</strong> Cada política debe tener un icono representativo único</li>
            <li>• <strong>Actualización:</strong> Revise y actualice las políticas regularmente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliciesManager;