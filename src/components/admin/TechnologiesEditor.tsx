'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Plus, Trash2, Edit3, Save, X, Layers, Eye, Cpu, Smartphone, Cloud, Palette, Image as ImageIcon, FileText, DollarSign, Target } from 'lucide-react';
import ImageField from './ImageField';

interface CaseStudy {
  project: string;
  result: string;
  savings: string;
}

interface Technology {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  image: string;
  image_fallback: string;
  case_study: CaseStudy;
}

interface TechnologiesData {
  section: {
    title: string;
    subtitle: string;
  };
  tech_list: Technology[];
}

interface TechnologiesEditorProps {
  value?: TechnologiesData;
  onChange: (value: TechnologiesData) => void;
  disabled?: boolean;
}

const availableIcons = [
  { value: 'Layers', label: 'Layers (BIM/Modelado)', icon: Layers },
  { value: 'Eye', label: 'Eye (Supervisión/Drones)', icon: Eye },
  { value: 'Cpu', label: 'Cpu (IoT/Sensores)', icon: Cpu },
  { value: 'Zap', label: 'Zap (IA/Análisis)', icon: Zap },
  { value: 'Smartphone', label: 'Smartphone (Apps Móviles)', icon: Smartphone },
  { value: 'Cloud', label: 'Cloud (Nube)', icon: Cloud },
];

const availableColors = [
  { value: '#E84E0F', label: 'Naranja Principal', color: '#E84E0F' },
  { value: '#003F6F', label: 'Azul Principal', color: '#003F6F' },
  { value: '#D0D0D0', label: 'Gris Claro', color: '#D0D0D0' },
  { value: '#9D9D9C', label: 'Gris Medio', color: '#9D9D9C' },
  { value: '#646363', label: 'Gris Oscuro', color: '#646363' },
  { value: '#1D1D1B', label: 'Negro', color: '#1D1D1B' },
];

const defaultSection = {
  title: 'Centro de Innovación Tecnológica',
  subtitle: 'Implementamos las tecnologías más avanzadas para revolucionar la gestión de proyectos'
};

const defaultTechnology: Omit<Technology, 'id'> = {
  title: '',
  subtitle: '',
  icon: 'Zap',
  color: '#E84E0F',
  description: '',
  features: ['Característica 1', 'Característica 2', 'Característica 3', 'Característica 4'],
  image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
  image_fallback: '/img/tech/technology.jpg',
  case_study: {
    project: 'Proyecto Ejemplo',
    result: 'Resultado del proyecto',
    savings: 'S/. 000K en ahorro'
  }
};

export default function TechnologiesEditor({ 
  value = { section: defaultSection, tech_list: [] }, 
  onChange, 
  disabled = false 
}: TechnologiesEditorProps) {
  const [editingTech, setEditingTech] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Technology | null>(null);

  const updateSection = (field: keyof typeof value.section, newValue: string) => {
    onChange({
      ...value,
      section: { ...value.section, [field]: newValue }
    });
  };

  const addTechnology = () => {
    const newId = `tech-${Date.now()}`;
    const newTechnology: Technology = {
      ...defaultTechnology,
      id: newId,
      title: 'Nueva Tecnología',
      subtitle: 'Descripción breve de la tecnología',
      description: 'Descripción detallada de la tecnología y sus beneficios'
    };
    
    onChange({
      ...value,
      tech_list: [...value.tech_list, newTechnology]
    });
    
    setEditingTech(newId);
    setEditForm(newTechnology);
  };

  const removeTechnology = (id: string) => {
    onChange({
      ...value,
      tech_list: value.tech_list.filter(tech => tech.id !== id)
    });
    
    if (editingTech === id) {
      setEditingTech(null);
      setEditForm(null);
    }
  };

  const startEdit = (tech: Technology) => {
    setEditingTech(tech.id);
    setEditForm({ ...tech });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    onChange({
      ...value,
      tech_list: value.tech_list.map(tech => 
        tech.id === editForm.id ? editForm : tech
      )
    });
    
    setEditingTech(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingTech(null);
    setEditForm(null);
  };

  const updateEditForm = (field: keyof Technology, newValue: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: newValue });
  };

  const updateFeature = (index: number, newValue: string) => {
    if (!editForm) return;
    const newFeatures = [...editForm.features];
    newFeatures[index] = newValue;
    setEditForm({ ...editForm, features: newFeatures });
  };

  const addFeature = () => {
    if (!editForm) return;
    setEditForm({ 
      ...editForm, 
      features: [...editForm.features, 'Nueva característica'] 
    });
  };

  const removeFeature = (index: number) => {
    if (!editForm || editForm.features.length <= 1) return;
    const newFeatures = editForm.features.filter((_, i) => i !== index);
    setEditForm({ ...editForm, features: newFeatures });
  };

  const updateCaseStudy = (field: keyof CaseStudy, newValue: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      case_study: { ...editForm.case_study, [field]: newValue }
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = availableIcons.find(i => i.value === iconName);
    return iconConfig ? iconConfig.icon : Zap;
  };

  const TechnologyCard = ({ tech }: { tech: Technology }) => {
    const isEditing = editingTech === tech.id;
    const IconComponent = getIconComponent(tech.icon);
    
    if (isEditing && editForm) {
      return (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editando: {editForm.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>
                  <Save className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => updateEditForm('title', e.target.value)}
                      placeholder="Modelado BIM"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Subtítulo</Label>
                    <Input
                      value={editForm.subtitle}
                      onChange={(e) => updateEditForm('subtitle', e.target.value)}
                      placeholder="Building Information Modeling"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="Descripción detallada de la tecnología..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ícono</Label>
                    <Select 
                      value={editForm.icon} 
                      onValueChange={(val) => updateEditForm('icon', val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map(icon => {
                          const Icon = icon.icon;
                          return (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Color
                    </Label>
                    <div className="flex gap-1 mt-1">
                      {availableColors.map(colorOption => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => updateEditForm('color', colorOption.value)}
                          className={`w-8 h-8 rounded border-2 ${
                            editForm.color === colorOption.value 
                              ? 'border-primary' 
                              : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: colorOption.color }}
                          title={colorOption.label}
                        >
                          {editForm.color === colorOption.value && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Imagen Fallback (local)</Label>
                  <Input
                    value={editForm.image_fallback}
                    onChange={(e) => updateEditForm('image_fallback', e.target.value)}
                    placeholder="/img/tech/bim-modeling.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Imagen y características */}
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Imagen Principal
                  </Label>
                  <ImageField
                    value={editForm.image}
                    onChange={(newValue) => updateEditForm('image', newValue)}
                    label=""
                    placeholder="URL de la imagen de la tecnología"
                    required={false}
                    disabled={false}
                    description="Preferir formato 16:10 (800x500px)"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Características (máximo 6)</Label>
                    {editForm.features.length < 6 && (
                      <Button size="sm" variant="outline" onClick={addFeature} className="h-6 px-2 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Agregar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {editForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={`Característica ${index + 1}`}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFeature(index)}
                          className="px-2 text-red-600 hover:text-red-700"
                          disabled={editForm.features.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Caso de estudio */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" />
                  <h4 className="font-medium">Caso de Estudio</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Proyecto
                    </Label>
                    <Input
                      value={editForm.case_study.project}
                      onChange={(e) => updateCaseStudy('project', e.target.value)}
                      placeholder="Centro Comercial Plaza Norte"
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label>Resultado</Label>
                    <Input
                      value={editForm.case_study.result}
                      onChange={(e) => updateCaseStudy('result', e.target.value)}
                      placeholder="35% reducción en tiempos"
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      Ahorro
                    </Label>
                    <Input
                      value={editForm.case_study.savings}
                      onChange={(e) => updateCaseStudy('savings', e.target.value)}
                      placeholder="S/. 2.3M en ahorro"
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex">
            {/* Imagen */}
            <div className="w-48 h-32 flex-shrink-0">
              <img
                src={tech.image}
                alt={tech.title}
                className="w-full h-full object-cover rounded-l-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = tech.image_fallback || '/img/placeholder-tech.jpg';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{ backgroundColor: `${tech.color}20`, color: tech.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{tech.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{tech.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {tech.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tech.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {tech.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tech.features.length - 3} más
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    <strong>{tech.case_study.project}:</strong> {tech.case_study.result}
                  </div>
                </div>

                {!disabled && (
                  <div className="flex gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(tech)}
                      className="px-2"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTechnology(tech.id)}
                      className="px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Centro de Innovación Tecnológica
              <Badge variant="outline">{value.tech_list.length} tecnologías</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona las tecnologías con sus características, imágenes y casos de estudio de éxito.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuración de sección */}
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título de la Sección</Label>
                <Input
                  value={value.section.title}
                  onChange={(e) => updateSection('title', e.target.value)}
                  placeholder="Centro de Innovación Tecnológica"
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={value.section.subtitle}
                  onChange={(e) => updateSection('subtitle', e.target.value)}
                  placeholder="Implementamos las tecnologías más avanzadas..."
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tecnologías */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tecnologías</h3>
            {!disabled && (
              <Button onClick={addTechnology}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Tecnología
              </Button>
            )}
          </div>

          {value.tech_list.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay tecnologías definidas</h3>
              <p className="text-sm mb-4">Agrega la primera tecnología para comenzar</p>
              {!disabled && (
                <Button onClick={addTechnology}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Tecnología
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {value.tech_list.map((tech) => (
                <TechnologyCard key={tech.id} tech={tech} />
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Contenido:</h5>
              <ul className="space-y-1">
                <li>• Títulos específicos y técnicos</li>
                <li>• Subtítulos descriptivos en inglés/español</li>
                <li>• Descripciones de 100-150 palabras</li>
                <li>• 3-6 características clave por tecnología</li>
                <li>• Casos de estudio con resultados medibles</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Formato:</h5>
              <ul className="space-y-1">
                <li>• Imágenes en formato 16:10 (800x500px)</li>
                <li>• Iconos representativos de la tecnología</li>
                <li>• Colores alternando naranja/azul</li>
                <li>• Ahorros en formato "S/. XM" o "S/. XK"</li>
                <li>• Resultados específicos con porcentajes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}