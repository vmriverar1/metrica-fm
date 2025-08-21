'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SEOAdvancedEditor,
  ContentSectionsManager,
  TestimonialsManager,
  FAQManager
} from '@/components/admin/shared';
import { 
  Save, 
  Eye, 
  FileText, 
  Settings, 
  Users, 
  Grid, 
  Search,
  MessageSquare,
  Heart,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Globe,
  Leaf,
  Building,
  Calendar
} from 'lucide-react';

// Interfaces específicas para Compromiso
export interface CompromisoValue {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  order: number;
  status: 'active' | 'inactive';
  category: 'social' | 'environmental' | 'economic' | 'governance';
  metrics?: Array<{
    name: string;
    value: string;
    unit?: string;
    description?: string;
  }>;
  initiatives?: Array<{
    name: string;
    description: string;
    status: 'active' | 'completed' | 'planned';
    start_date?: string;
    end_date?: string;
  }>;
}

export interface CompromisoHeroSection {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_stats: boolean;
  show_values_preview: boolean;
  values_preview_count: number;
  show_cta_button: boolean;
  cta_text?: string;
  cta_link?: string;
}

export interface CompromisoStatsConfig {
  show_stats_section: boolean;
  stats_layout: 'horizontal' | 'grid' | 'carousel';
  stats: Array<{
    id: string;
    label: string;
    value: string;
    unit?: string;
    description?: string;
    icon?: string;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    order: number;
  }>;
}

export interface CompromisoInitiativesConfig {
  show_initiatives_section: boolean;
  initiatives_layout: 'timeline' | 'grid' | 'list';
  show_progress: boolean;
  show_metrics: boolean;
  show_images: boolean;
  initiatives: Array<{
    id: string;
    title: string;
    description: string;
    category: 'education' | 'environment' | 'community' | 'health' | 'infrastructure';
    status: 'active' | 'completed' | 'planned' | 'paused';
    start_date?: string;
    end_date?: string;
    progress?: number;
    budget?: string;
    beneficiaries?: number;
    location?: string;
    images?: string[];
    metrics?: Array<{
      name: string;
      value: string;
      unit?: string;
    }>;
    order: number;
  }>;
}

export interface CompromisoReportsConfig {
  show_reports_section: boolean;
  reports: Array<{
    id: string;
    title: string;
    description: string;
    type: 'sustainability' | 'social_impact' | 'governance' | 'financial';
    year: number;
    file_url?: string;
    cover_image?: string;
    pages?: number;
    status: 'published' | 'draft';
    order: number;
  }>;
}

export interface CompromisoConfiguration {
  basic: {
    title: string;
    subtitle: string;
    description: string;
    slug: string;
    status: 'active' | 'inactive' | 'maintenance';
    language: 'es' | 'en';
    show_on_menu: boolean;
  };
  hero: CompromisoHeroSection;
  stats: CompromisoStatsConfig;
  values: CompromisoValue[];
  initiatives: CompromisoInitiativesConfig;
  reports: CompromisoReportsConfig;
  sections: any[];
  testimonials: any[];
  faqs: any[];
  seo: any;
  metadata: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
  };
}

interface CompromisoPageEditorProps {
  slug: string;
  onSave: (data: CompromisoConfiguration) => Promise<void>;
  onPreview: (data: CompromisoConfiguration) => void;
  initialData?: Partial<CompromisoConfiguration>;
  readOnly?: boolean;
}

export const CompromisoPageEditor: React.FC<CompromisoPageEditorProps> = ({
  slug,
  onSave,
  onPreview,
  initialData,
  readOnly = false
}) => {
  const [config, setConfig] = useState<CompromisoConfiguration>({
    basic: {
      title: 'Nuestro Compromiso',
      subtitle: 'Responsabilidad Social y Sostenibilidad',
      description: 'Comprometidos con el desarrollo sostenible y el bienestar de las comunidades donde operamos.',
      slug: 'compromiso',
      status: 'active',
      language: 'es',
      show_on_menu: true
    },
    hero: {
      title: 'Compromiso con el Futuro',
      subtitle: 'Responsabilidad Social y Desarrollo Sostenible',
      description: 'En Métrica DIP, entendemos que nuestro éxito está intrínsecamente ligado al bienestar de las comunidades y el cuidado del medio ambiente.',
      show_stats: true,
      show_values_preview: true,
      values_preview_count: 4,
      show_cta_button: true,
      cta_text: 'Conocer Iniciativas',
      cta_link: '#initiatives'
    },
    stats: {
      show_stats_section: true,
      stats_layout: 'grid',
      stats: [
        {
          id: '1',
          label: 'Proyectos con Impacto Social',
          value: '85',
          unit: '%',
          description: 'De nuestros proyectos incluyen componentes de responsabilidad social',
          icon: 'heart',
          color: '#E84E0F',
          trend: 'up',
          order: 0
        },
        {
          id: '2',
          label: 'Comunidades Beneficiadas',
          value: '120',
          unit: '+',
          description: 'Comunidades han sido beneficiadas por nuestras iniciativas',
          icon: 'users',
          color: '#003F6F',
          trend: 'up',
          order: 1
        }
      ]
    },
    values: [
      {
        id: '1',
        title: 'Responsabilidad Social',
        description: 'Contribuimos activamente al desarrollo de las comunidades locales a través de programas educativos y de capacitación.',
        icon: 'heart',
        order: 0,
        status: 'active',
        category: 'social',
        metrics: [
          { name: 'Beneficiarios directos', value: '5,000', unit: '+', description: 'Personas beneficiadas anualmente' }
        ],
        initiatives: [
          { name: 'Programa de Capacitación Técnica', description: 'Formación en oficios técnicos para jóvenes', status: 'active' }
        ]
      },
      {
        id: '2',
        title: 'Sostenibilidad Ambiental',
        description: 'Implementamos prácticas sostenibles que minimizan nuestro impacto ambiental y promueven la conservación.',
        icon: 'leaf',
        order: 1,
        status: 'active',
        category: 'environmental',
        metrics: [
          { name: 'Reducción de CO2', value: '30', unit: '%', description: 'Reducción en emisiones desde 2020' }
        ],
        initiatives: [
          { name: 'Programa de Reforestación', description: 'Plantación de árboles nativos', status: 'active' }
        ]
      }
    ],
    initiatives: {
      show_initiatives_section: true,
      initiatives_layout: 'timeline',
      show_progress: true,
      show_metrics: true,
      show_images: true,
      initiatives: []
    },
    reports: {
      show_reports_section: true,
      reports: []
    },
    sections: [],
    testimonials: [],
    faqs: [],
    seo: {},
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Admin',
      version: '1.0.0'
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setConfig(prev => ({
        ...prev,
        ...initialData,
        metadata: {
          ...prev.metadata,
          ...initialData.metadata
        }
      }));
    }
  }, [initialData]);

  // Validación
  const validateConfig = () => {
    const errors: Record<string, string> = {};

    if (!config.basic.title.trim()) {
      errors.title = 'El título es requerido';
    }

    if (!config.basic.slug.trim()) {
      errors.slug = 'El slug es requerido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar configuración
  const handleSave = async () => {
    if (!validateConfig()) {
      setActiveTab('basic');
      return;
    }

    setLoading(true);
    try {
      const updatedConfig = {
        ...config,
        metadata: {
          ...config.metadata,
          updated_at: new Date().toISOString()
        }
      };
      await onSave(updatedConfig);
      setLastSaved(new Date());
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error saving compromiso config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar configuración
  const updateConfig = (path: string, value: any) => {
    if (readOnly) return;

    setConfig(prev => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  // Gestión de valores
  const addValue = (valueData: Partial<CompromisoValue>) => {
    const newValue: CompromisoValue = {
      id: Date.now().toString(),
      title: valueData.title || '',
      description: valueData.description || '',
      order: config.values.length,
      status: 'active',
      category: 'social',
      metrics: [],
      initiatives: [],
      ...valueData
    };

    updateConfig('values', [...config.values, newValue]);
  };

  const updateValue = (valueId: string, updates: Partial<CompromisoValue>) => {
    const updatedValues = config.values.map(value =>
      value.id === valueId ? { ...value, ...updates } : value
    );
    updateConfig('values', updatedValues);
  };

  const deleteValue = (valueId: string) => {
    if (confirm('¿Estás seguro de eliminar este valor?')) {
      const updatedValues = config.values.filter(value => value.id !== valueId);
      updateConfig('values', updatedValues);
    }
  };

  // Gestión de estadísticas
  const addStat = (statData: any) => {
    const newStat = {
      id: Date.now().toString(),
      order: config.stats.stats.length,
      ...statData
    };

    updateConfig('stats.stats', [...config.stats.stats, newStat]);
  };

  const updateStat = (statId: string, updates: any) => {
    const updatedStats = config.stats.stats.map(stat =>
      stat.id === statId ? { ...stat, ...updates } : stat
    );
    updateConfig('stats.stats', updatedStats);
  };

  const deleteStat = (statId: string) => {
    if (confirm('¿Estás seguro de eliminar esta estadística?')) {
      const updatedStats = config.stats.stats.filter(stat => stat.id !== statId);
      updateConfig('stats.stats', updatedStats);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Compromiso</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el contenido de responsabilidad social y sostenibilidad
          </p>
        </div>
        
        <div className="flex gap-3">
          {lastSaved && (
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Guardado {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={() => onPreview(config)}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={loading || readOnly}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor corrige los errores de validación antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="values" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Valores
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Secciones
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Testimonios
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configuración Básica */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={config.basic.title}
                    onChange={(e) => updateConfig('basic.title', e.target.value)}
                    placeholder="Nuestro Compromiso"
                    className={validationErrors.title ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Slug *</label>
                  <Input
                    value={config.basic.slug}
                    onChange={(e) => updateConfig('basic.slug', e.target.value)}
                    placeholder="compromiso"
                    className={validationErrors.slug ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                  {validationErrors.slug && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.slug}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo</label>
                <Input
                  value={config.basic.subtitle}
                  onChange={(e) => updateConfig('basic.subtitle', e.target.value)}
                  placeholder="Responsabilidad Social y Sostenibilidad"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={config.basic.description}
                  onChange={(e) => updateConfig('basic.description', e.target.value)}
                  placeholder="Descripción de la página de compromiso"
                  rows={3}
                  disabled={readOnly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <select
                    value={config.basic.status}
                    onChange={(e) => updateConfig('basic.status', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Idioma</label>
                  <select
                    value={config.basic.language}
                    onChange={(e) => updateConfig('basic.language', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.basic.show_on_menu}
                      onCheckedChange={(checked) => updateConfig('basic.show_on_menu', checked)}
                      disabled={readOnly}
                    />
                    <label className="text-sm font-medium">Mostrar en menú</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración Hero */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Título Hero</label>
                <Input
                  value={config.hero.title}
                  onChange={(e) => updateConfig('hero.title', e.target.value)}
                  placeholder="Compromiso con el Futuro"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo Hero</label>
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                  placeholder="Responsabilidad Social y Desarrollo Sostenible"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción Hero</label>
                <Textarea
                  value={config.hero.description}
                  onChange={(e) => updateConfig('hero.description', e.target.value)}
                  placeholder="Descripción que aparece en la sección hero"
                  rows={3}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Elementos del Hero</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Estadísticas</label>
                    <Switch
                      checked={config.hero.show_stats}
                      onCheckedChange={(checked) => updateConfig('hero.show_stats', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Preview de Valores</label>
                    <Switch
                      checked={config.hero.show_values_preview}
                      onCheckedChange={(checked) => updateConfig('hero.show_values_preview', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Botón CTA</label>
                    <Switch
                      checked={config.hero.show_cta_button}
                      onCheckedChange={(checked) => updateConfig('hero.show_cta_button', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  {config.hero.show_values_preview && (
                    <div>
                      <label className="text-sm font-medium">Cantidad de Valores</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.hero.values_preview_count}
                        onChange={(e) => updateConfig('hero.values_preview_count', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Valores y Principios */}
        <TabsContent value="values">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Valores y Principios
                  <Badge variant="secondary">{config.values.length}</Badge>
                </CardTitle>
                <Button
                  onClick={() => addValue({ title: '', description: '' })}
                  size="sm"
                  disabled={readOnly}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Nuevo Valor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.values.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No hay valores configurados</p>
                  <Button
                    variant="outline"
                    onClick={() => addValue({ title: '', description: '' })}
                    className="mt-2"
                    disabled={readOnly}
                  >
                    Crear primer valor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.values.map((value) => (
                    <Card key={value.id} className={value.status === 'inactive' ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-[#E84E0F] text-white rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{value.title}</h4>
                              <p className="text-sm text-gray-600">{value.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="capitalize">
                                  {value.category}
                                </Badge>
                                <Badge variant={value.status === 'active' ? 'default' : 'secondary'}>
                                  {value.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteValue(value.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={readOnly}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                        
                        {value.metrics && value.metrics.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-medium mb-2">Métricas</h5>
                            <div className="flex flex-wrap gap-2">
                              {value.metrics.map((metric, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50">
                                  {metric.name}: {metric.value}{metric.unit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estadísticas */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Estadísticas de Impacto
                  <Badge variant="secondary">{config.stats.stats.length}</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Switch
                    checked={config.stats.show_stats_section}
                    onCheckedChange={(checked) => updateConfig('stats.show_stats_section', checked)}
                    disabled={readOnly}
                  />
                  <Button
                    onClick={() => addStat({ label: '', value: '', description: '' })}
                    size="sm"
                    disabled={readOnly}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Nueva Estadística
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.stats.show_stats_section && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Layout de Estadísticas</label>
                      <select
                        value={config.stats.stats_layout}
                        onChange={(e) => updateConfig('stats.stats_layout', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={readOnly}
                      >
                        <option value="grid">Grid</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="carousel">Carousel</option>
                      </select>
                    </div>
                  </div>

                  {config.stats.stats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No hay estadísticas configuradas</p>
                      <Button
                        variant="outline"
                        onClick={() => addStat({ label: '', value: '', description: '' })}
                        className="mt-2"
                        disabled={readOnly}
                      >
                        Crear primera estadística
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {config.stats.stats.map((stat) => (
                        <Card key={stat.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                  <div 
                                    className="w-8 h-8 rounded text-white flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: stat.color || '#003F6F' }}
                                  >
                                    {stat.value}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{stat.label}</h4>
                                    <p className="text-sm text-gray-600">{stat.description}</p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteStat(stat.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={readOnly}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Secciones */}
        <TabsContent value="sections">
          <ContentSectionsManager
            sections={config.sections}
            onChange={(sections) => updateConfig('sections', sections)}
            allowReordering={!readOnly}
            contextType="compromiso"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Testimonios */}
        <TabsContent value="testimonials">
          <TestimonialsManager
            testimonials={config.testimonials}
            onChange={(testimonials) => updateConfig('testimonials', testimonials)}
            allowReordering={!readOnly}
            contextType="compromiso"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <SEOAdvancedEditor
            data={config.seo}
            onChange={(seo) => updateConfig('seo', seo)}
            contextType="compromiso"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};