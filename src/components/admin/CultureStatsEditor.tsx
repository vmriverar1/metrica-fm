'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Plus, Trash2, Edit3, Save, X, Clock, Users, MapPin, Trophy, TrendingUp } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  description: string;
}

interface StatCategory {
  title: string;
  icon: string;
  color: string;
  stats: StatItem[];
}

interface CultureStats {
  section: {
    title: string;
    subtitle: string;
  };
  categories: {
    [key: string]: StatCategory;
  };
}

interface CultureStatsEditorProps {
  value?: CultureStats;
  onChange: (value: CultureStats) => void;
  disabled?: boolean;
}

const availableIcons = [
  { value: 'Clock', label: 'Clock (Historia)', icon: Clock },
  { value: 'Users', label: 'Users (Equipo)', icon: Users },
  { value: 'MapPin', label: 'MapPin (Alcance)', icon: MapPin },
  { value: 'Trophy', label: 'Trophy (Logros)', icon: Trophy },
  { value: 'TrendingUp', label: 'TrendingUp (Crecimiento)', icon: TrendingUp },
  { value: 'BarChart3', label: 'BarChart3 (Estadísticas)', icon: BarChart3 },
];

const availableColors = [
  { value: '#007bc4', label: 'Naranja Principal', color: '#007bc4' },
  { value: '#003F6F', label: 'Azul Principal', color: '#003F6F' },
  { value: '#D0D0D0', label: 'Gris Claro', color: '#D0D0D0' },
  { value: '#9D9D9C', label: 'Gris Medio', color: '#9D9D9C' },
  { value: '#646363', label: 'Gris Oscuro', color: '#646363' },
  { value: '#1D1D1B', label: 'Negro', color: '#1D1D1B' },
];

const defaultSection = {
  title: 'Cultura en Números',
  subtitle: 'Datos que reflejan nuestro compromiso con la excelencia'
};

const defaultCategories = {
  historia: {
    title: 'Nuestra Historia',
    icon: 'Clock',
    color: '#007bc4',
    stats: []
  },
  equipo: {
    title: 'Nuestro Equipo',
    icon: 'Users',
    color: '#003F6F',
    stats: []
  }
};

export default function CultureStatsEditor({ 
  value = { section: defaultSection, categories: defaultCategories }, 
  onChange, 
  disabled = false 
}: CultureStatsEditorProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryData, setEditingCategoryData] = useState<StatCategory | null>(null);
  const [editingStat, setEditingStat] = useState<{ categoryKey: string; statIndex: number } | null>(null);
  const [editingStatData, setEditingStatData] = useState<StatItem | null>(null);

  const updateSection = (field: keyof typeof value.section, newValue: string) => {
    onChange({
      ...value,
      section: { ...value.section, [field]: newValue }
    });
  };

  const addCategory = () => {
    const newKey = `categoria-${Date.now()}`;
    const newCategory: StatCategory = {
      title: 'Nueva Categoría',
      icon: 'BarChart3',
      color: '#007bc4',
      stats: []
    };
    
    onChange({
      ...value,
      categories: {
        ...value.categories,
        [newKey]: newCategory
      }
    });
    
    setEditingCategory(newKey);
    setEditingCategoryData(newCategory);
  };

  const removeCategory = (categoryKey: string) => {
    const newCategories = { ...value.categories };
    delete newCategories[categoryKey];
    
    onChange({
      ...value,
      categories: newCategories
    });

    if (editingCategory === categoryKey) {
      setEditingCategory(null);
      setEditingCategoryData(null);
    }
  };

  const startEditCategory = (categoryKey: string, category: StatCategory) => {
    setEditingCategory(categoryKey);
    setEditingCategoryData({ ...category });
  };

  const saveCategory = () => {
    if (!editingCategory || !editingCategoryData) return;
    
    onChange({
      ...value,
      categories: {
        ...value.categories,
        [editingCategory]: editingCategoryData
      }
    });
    
    setEditingCategory(null);
    setEditingCategoryData(null);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditingCategoryData(null);
  };

  const updateCategoryData = (field: keyof StatCategory, newValue: string) => {
    if (!editingCategoryData) return;
    setEditingCategoryData({ ...editingCategoryData, [field]: newValue });
  };

  const addStat = (categoryKey: string) => {
    const newStat: StatItem = {
      label: 'Nueva estadística',
      value: '0',
      description: 'Descripción de la estadística'
    };

    const category = value.categories[categoryKey];
    const updatedCategory = {
      ...category,
      stats: [...category.stats, newStat]
    };

    onChange({
      ...value,
      categories: {
        ...value.categories,
        [categoryKey]: updatedCategory
      }
    });

    setEditingStat({ categoryKey, statIndex: category.stats.length });
    setEditingStatData(newStat);
  };

  const removeStat = (categoryKey: string, statIndex: number) => {
    const category = value.categories[categoryKey];
    const updatedStats = category.stats.filter((_, index) => index !== statIndex);
    
    const updatedCategory = {
      ...category,
      stats: updatedStats
    };

    onChange({
      ...value,
      categories: {
        ...value.categories,
        [categoryKey]: updatedCategory
      }
    });

    if (editingStat?.categoryKey === categoryKey && editingStat?.statIndex === statIndex) {
      setEditingStat(null);
      setEditingStatData(null);
    }
  };

  const startEditStat = (categoryKey: string, statIndex: number, stat: StatItem) => {
    setEditingStat({ categoryKey, statIndex });
    setEditingStatData({ ...stat });
  };

  const saveStat = () => {
    if (!editingStat || !editingStatData) return;
    
    const { categoryKey, statIndex } = editingStat;
    const category = value.categories[categoryKey];
    const updatedStats = [...category.stats];
    updatedStats[statIndex] = editingStatData;
    
    const updatedCategory = {
      ...category,
      stats: updatedStats
    };

    onChange({
      ...value,
      categories: {
        ...value.categories,
        [categoryKey]: updatedCategory
      }
    });
    
    setEditingStat(null);
    setEditingStatData(null);
  };

  const cancelStatEdit = () => {
    setEditingStat(null);
    setEditingStatData(null);
  };

  const updateStatData = (field: keyof StatItem, newValue: string) => {
    if (!editingStatData) return;
    setEditingStatData({ ...editingStatData, [field]: newValue });
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = availableIcons.find(i => i.value === iconName);
    return iconConfig ? iconConfig.icon : BarChart3;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas de Cultura
              <Badge variant="outline">{Object.keys(value.categories).length} categorías</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona las estadísticas organizadas por categorías que muestran el crecimiento y logros.
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
                  placeholder="Cultura en Números"
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={value.section.subtitle}
                  onChange={(e) => updateSection('subtitle', e.target.value)}
                  placeholder="Datos que reflejan nuestro compromiso"
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorías */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Categorías de Estadísticas</h3>
            {!disabled && (
              <Button onClick={addCategory} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Categoría
              </Button>
            )}
          </div>

          {Object.keys(value.categories).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay categorías definidas</h3>
              <p className="text-sm mb-4">Agrega la primera categoría de estadísticas</p>
              {!disabled && (
                <Button onClick={addCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Categoría
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(value.categories).map(([categoryKey, category]) => {
                const isEditingCategory = editingCategory === categoryKey;
                const IconComponent = getIconComponent(category.icon);

                if (isEditingCategory && editingCategoryData) {
                  return (
                    <Card key={categoryKey} className="border-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            Editando: {editingCategoryData.title}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveCategory}>
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelCategoryEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Título de la Categoría</Label>
                            <Input
                              value={editingCategoryData.title}
                              onChange={(e) => updateCategoryData('title', e.target.value)}
                              placeholder="Nuestra Historia"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>Ícono</Label>
                            <Select 
                              value={editingCategoryData.icon} 
                              onValueChange={(val) => updateCategoryData('icon', val)}
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
                            <Label>Color</Label>
                            <div className="flex gap-1 mt-1">
                              {availableColors.map(colorOption => (
                                <button
                                  key={colorOption.value}
                                  type="button"
                                  onClick={() => updateCategoryData('color', colorOption.value)}
                                  className={`w-8 h-8 rounded border-2 ${
                                    editingCategoryData.color === colorOption.value 
                                      ? 'border-primary' 
                                      : 'border-gray-200'
                                  }`}
                                  style={{ backgroundColor: colorOption.color }}
                                  title={colorOption.label}
                                >
                                  {editingCategoryData.color === colorOption.value && (
                                    <span className="text-white text-xs">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={categoryKey} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex-shrink-0 p-2 rounded-lg"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{category.title}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {category.stats.length} estadísticas
                            </Badge>
                          </div>
                        </div>
                        
                        {!disabled && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditCategory(categoryKey, category)}
                              className="px-2"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeCategory(categoryKey)}
                              className="px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Estadísticas de la categoría */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700">Estadísticas</h5>
                          {!disabled && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => addStat(categoryKey)}
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Agregar
                            </Button>
                          )}
                        </div>

                        {category.stats.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-2">No hay estadísticas</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {category.stats.map((stat, statIndex) => {
                              const isEditingStat = editingStat?.categoryKey === categoryKey && editingStat?.statIndex === statIndex;
                              
                              if (isEditingStat && editingStatData) {
                                return (
                                  <Card key={statIndex} className="border-primary p-3">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">Editando</span>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={saveStat} className="h-6 w-6 p-0">
                                            <Save className="w-3 h-3" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={cancelStatEdit} className="h-6 w-6 p-0">
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <Input
                                        value={editingStatData.label}
                                        onChange={(e) => updateStatData('label', e.target.value)}
                                        placeholder="Etiqueta"
                                        className="text-xs h-6"
                                      />
                                      <Input
                                        value={editingStatData.value}
                                        onChange={(e) => updateStatData('value', e.target.value)}
                                        placeholder="15+"
                                        className="text-xs h-6"
                                      />
                                      <Textarea
                                        value={editingStatData.description}
                                        onChange={(e) => updateStatData('description', e.target.value)}
                                        placeholder="Descripción"
                                        className="text-xs min-h-[40px] resize-none"
                                        rows={2}
                                      />
                                    </div>
                                  </Card>
                                );
                              }

                              return (
                                <Card key={statIndex} className="p-3 hover:bg-gray-50">
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs font-medium text-gray-700 truncate">{stat.label}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{stat.description}</p>
                                      </div>
                                      {!disabled && (
                                        <div className="flex gap-1 ml-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => startEditStat(categoryKey, statIndex, stat)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeStat(categoryKey, statIndex)}
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Categorías sugeridas:</h5>
              <ul className="space-y-1">
                <li>• Historia: Años en el mercado, proyectos completados</li>
                <li>• Equipo: Profesionales, especialidades, certificaciones</li>
                <li>• Alcance: Regiones, sectores, especialidades</li>
                <li>• Logros: Premios, certificaciones ISO, proyectos destacados</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">Formato de valores:</h5>
              <ul className="space-y-1">
                <li>• Usar símbolos: 15+, 200+, &gt;50, etc.</li>
                <li>• Mantener consistencia en el formato</li>
                <li>• Descripciones claras y específicas</li>
                <li>• Máximo 4 estadísticas por categoría</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}