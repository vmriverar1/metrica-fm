'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  Users, 
  Heart, 
  Star, 
  Award,
  Target,
  Lightbulb,
  Clock,
  MapPin,
  Trophy,
  Image,
  FileText,
  BarChart3,
  TrendingUp,
  Layers,
  Cpu,
  Smartphone,
  Cloud,
  Zap,
  Info
} from 'lucide-react';
import { SEOAdvancedEditor } from '@/components/admin/shared';

// Interfaces que coinciden exactamente con el JSON
export interface CulturaPageData {
  page: {
    title: string;
    description: string;
    keywords?: string[];
    url?: string;
    openGraph?: {
      title: string;
      description: string;
      type: string;
      locale: string;
      siteName: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback: string;
    team_gallery: {
      columns: string[][];
    };
  };
  values: {
    section: {
      title: string;
      subtitle: string;
    };
    values_list: ValueItem[];
  };
  culture_stats: {
    section: {
      title: string;
      subtitle: string;
    };
    categories: {
      [key: string]: CultureStatsCategory;
    };
  };
  team: {
    section: {
      title: string;
      subtitle: string;
    };
    members: TeamMember[];
    moments: {
      title: string;
      subtitle: string;
      gallery: MomentItem[];
    };
  };
  technologies: {
    section: {
      title: string;
      subtitle: string;
    };
    tech_list: TechItem[];
  };
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  size: string;
  images: string[];
  image_descriptions: string[];
}

export interface CultureStatsCategory {
  title: string;
  icon: string;
  color: string;
  stats: StatItem[];
}

export interface StatItem {
  label: string;
  value: string;
  description: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  image_fallback: string;
}

export interface MomentItem {
  id: number;
  title: string;
  description: string;
  image: string;
  image_fallback: string;
}

export interface TechItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  image: string;
  image_fallback: string;
  case_study: {
    project: string;
    result: string;
    savings: string;
  };
}

interface CulturaPageEditorNewProps {
  slug: string;
  initialData?: Partial<CulturaPageData>;
  onSave: (data: CulturaPageData) => Promise<void>;
  onPreview?: (data: CulturaPageData) => void;
  readOnly?: boolean;
}

const CulturaPageEditorNew: React.FC<CulturaPageEditorNewProps> = ({
  slug,
  initialData = {},
  onSave,
  onPreview,
  readOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basico');

  // Estado principal que coincide exactamente con el JSON
  const [config, setConfig] = useState<CulturaPageData>({
    page: {
      title: 'Cultura y Personas - Métrica DIP',
      description: 'Conoce nuestra cultura empresarial, valores, equipo multidisciplinario y tecnologías innovadoras que nos distinguen en la industria.',
      keywords: ['cultura', 'equipo', 'valores', 'innovación', 'métrica dip'],
      url: '/about/cultura',
      openGraph: {
        title: 'Cultura y Personas - Métrica DIP',
        description: 'Conoce nuestra cultura empresarial, valores, equipo multidisciplinario y tecnologías innovadoras que nos distinguen en la industria.',
        type: 'website',
        locale: 'es_PE',
        siteName: 'Métrica DIP'
      }
    },
    hero: {
      title: 'Cultura y Personas',
      subtitle: 'Un equipo multidisciplinario comprometido con la excelencia, innovación y desarrollo continuo',
      background_image: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
      background_image_fallback: '/img/cultura/hero-background.jpg',
      team_gallery: {
        columns: [
          [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop&crop=face'
          ],
          [
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=700&fit=crop&crop=face'
          ],
          [
            'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=700&fit=crop&crop=face'
          ]
        ]
      }
    },
    values: {
      section: {
        title: 'Nuestros Valores',
        subtitle: 'Los principios que guían nuestro trabajo y definen nuestra identidad como empresa'
      },
      values_list: []
    },
    culture_stats: {
      section: {
        title: 'Cultura en Números',
        subtitle: 'Datos que reflejan nuestro compromiso con la excelencia y el crecimiento'
      },
      categories: {
        historia: {
          title: 'Nuestra Historia',
          icon: 'Clock',
          color: '#E84E0F',
          stats: []
        },
        equipo: {
          title: 'Nuestro Equipo',
          icon: 'Users',
          color: '#003F6F',
          stats: []
        },
        alcance: {
          title: 'Alcance Nacional',
          icon: 'MapPin',
          color: '#E84E0F',
          stats: []
        },
        logros: {
          title: 'Reconocimientos',
          icon: 'Trophy',
          color: '#003F6F',
          stats: []
        }
      }
    },
    team: {
      section: {
        title: 'Nuestro Equipo',
        subtitle: 'Profesionales altamente calificados comprometidos con la excelencia'
      },
      members: [],
      moments: {
        title: 'Momentos Destacados',
        subtitle: 'Celebraciones, logros y experiencias que fortalecen nuestro equipo',
        gallery: []
      }
    },
    technologies: {
      section: {
        title: 'Centro de Innovación Tecnológica',
        subtitle: 'Implementamos las tecnologías más avanzadas para revolucionar la gestión de proyectos'
      },
      tech_list: []
    },
    ...initialData
  });

  // Effect para cargar datos iniciales
  useEffect(() => {
    console.log('CulturaPageEditorNew - initialData:', initialData);
    if (initialData && Object.keys(initialData).length > 0) {
      setConfig(prevConfig => {
        // Merge profundo recursivo
        const deepMerge = (target: any, source: any): any => {
          if (Array.isArray(source)) {
            return source;
          }
          
          if (source && typeof source === 'object' && !Array.isArray(source)) {
            const result = { ...target };
            Object.keys(source).forEach(key => {
              if (source[key] !== undefined) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                  result[key] = deepMerge(result[key] || {}, source[key]);
                } else {
                  result[key] = source[key];
                }
              }
            });
            return result;
          }
          
          return source !== undefined ? source : target;
        };
        
        return deepMerge(prevConfig, initialData);
      });
    }
  }, [initialData]);

  // Handlers principales
  const handleConfigChange = useCallback((section: keyof CulturaPageData, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleNestedChange = useCallback((section: keyof CulturaPageData, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      await onSave(config);
    } catch (error) {
      setErrors({ general: 'Error al guardar la configuración' });
    } finally {
      setIsLoading(false);
    }
  }, [config, onSave]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(config);
    }
  }, [config, onPreview]);

  // Value Management
  const addValue = useCallback(() => {
    const newValue: ValueItem = {
      id: `value-${Date.now()}`,
      title: '',
      description: '',
      icon: 'Target',
      color: '#E84E0F',
      size: 'medium',
      images: [],
      image_descriptions: []
    };
    
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        values_list: [...prev.values.values_list, newValue]
      }
    }));
  }, []);

  const updateValue = useCallback((id: string, updates: Partial<ValueItem>) => {
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        values_list: prev.values.values_list.map(value =>
          value.id === id ? { ...value, ...updates } : value
        )
      }
    }));
  }, []);

  const removeValue = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        values_list: prev.values.values_list.filter(value => value.id !== id)
      }
    }));
  }, []);

  // Team Member Management
  const addTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: Date.now(),
      name: '',
      role: '',
      description: '',
      image: '',
      image_fallback: ''
    };
    
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: [...prev.team.members, newMember]
      }
    }));
  }, []);

  const updateTeamMember = useCallback((id: number, updates: Partial<TeamMember>) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(member =>
          member.id === id ? { ...member, ...updates } : member
        )
      }
    }));
  }, []);

  const removeTeamMember = useCallback((id: number) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter(member => member.id !== id)
      }
    }));
  }, []);

  // Moment Management
  const addMoment = useCallback(() => {
    const newMoment: MomentItem = {
      id: Date.now(),
      title: '',
      description: '',
      image: '',
      image_fallback: ''
    };
    
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        moments: {
          ...prev.team.moments,
          gallery: [...prev.team.moments.gallery, newMoment]
        }
      }
    }));
  }, []);

  const updateMoment = useCallback((id: number, updates: Partial<MomentItem>) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        moments: {
          ...prev.team.moments,
          gallery: prev.team.moments.gallery.map(moment =>
            moment.id === id ? { ...moment, ...updates } : moment
          )
        }
      }
    }));
  }, []);

  const removeMoment = useCallback((id: number) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        moments: {
          ...prev.team.moments,
          gallery: prev.team.moments.gallery.filter(moment => moment.id !== id)
        }
      }
    }));
  }, []);

  // Technology Management
  const addTechnology = useCallback(() => {
    const newTech: TechItem = {
      id: `tech-${Date.now()}`,
      title: '',
      subtitle: '',
      icon: 'Layers',
      color: '#E84E0F',
      description: '',
      features: [],
      image: '',
      image_fallback: '',
      case_study: {
        project: '',
        result: '',
        savings: ''
      }
    };
    
    setConfig(prev => ({
      ...prev,
      technologies: {
        ...prev.technologies,
        tech_list: [...prev.technologies.tech_list, newTech]
      }
    }));
  }, []);

  const updateTechnology = useCallback((id: string, updates: Partial<TechItem>) => {
    setConfig(prev => ({
      ...prev,
      technologies: {
        ...prev.technologies,
        tech_list: prev.technologies.tech_list.map(tech =>
          tech.id === id ? { ...tech, ...updates } : tech
        )
      }
    }));
  }, []);

  const removeTechnology = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      technologies: {
        ...prev.technologies,
        tech_list: prev.technologies.tech_list.filter(tech => tech.id !== id)
      }
    }));
  }, []);

  // Stats Management
  const updateStats = useCallback((category: keyof typeof config.culture_stats.categories, stats: StatItem[]) => {
    setConfig(prev => ({
      ...prev,
      culture_stats: {
        ...prev.culture_stats,
        categories: {
          ...prev.culture_stats.categories,
          [category]: {
            ...prev.culture_stats.categories[category],
            stats
          }
        }
      }
    }));
  }, []);

  const addStat = useCallback((category: keyof typeof config.culture_stats.categories) => {
    const newStat: StatItem = {
      label: '',
      value: '',
      description: ''
    };
    
    const currentStats = config.culture_stats.categories[category].stats;
    updateStats(category, [...currentStats, newStat]);
  }, [config.culture_stats.categories, updateStats]);

  const updateStat = useCallback((category: keyof typeof config.culture_stats.categories, index: number, updates: Partial<StatItem>) => {
    const currentStats = config.culture_stats.categories[category].stats;
    const updatedStats = currentStats.map((stat, i) => 
      i === index ? { ...stat, ...updates } : stat
    );
    updateStats(category, updatedStats);
  }, [config.culture_stats.categories, updateStats]);

  const removeStat = useCallback((category: keyof typeof config.culture_stats.categories, index: number) => {
    const currentStats = config.culture_stats.categories[category].stats;
    const updatedStats = currentStats.filter((_, i) => i !== index);
    updateStats(category, updatedStats);
  }, [config.culture_stats.categories, updateStats]);

  const iconOptions = [
    { value: 'Target', label: '🎯 Objetivo' },
    { value: 'Users', label: '👥 Usuarios' },
    { value: 'Lightbulb', label: '💡 Bombilla' },
    { value: 'Shield', label: '🛡️ Escudo' },
    { value: 'TrendingUp', label: '📈 Crecimiento' },
    { value: 'Heart', label: '❤️ Corazón' },
    { value: 'Award', label: '🏆 Premio' },
    { value: 'Star', label: '⭐ Estrella' },
    { value: 'Clock', label: '🕒 Reloj' },
    { value: 'MapPin', label: '📍 Ubicación' },
    { value: 'Trophy', label: '🏆 Trofeo' },
    { value: 'Layers', label: '📚 Capas' },
    { value: 'Eye', label: '👁️ Ojo' },
    { value: 'Cpu', label: '💻 CPU' },
    { value: 'Zap', label: '⚡ Rayo' },
    { value: 'Smartphone', label: '📱 Móvil' },
    { value: 'Cloud', label: '☁️ Nube' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editor de Cultura - Estructura Completa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona el contenido completo de la página de cultura organizacional
          </p>
        </div>
        
        <div className="flex gap-3">
          {onPreview && (
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={readOnly}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isLoading || readOnly}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="valores">Valores</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
          <TabsTrigger value="tecnologias">Tecnologías</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Básico Tab */}
        <TabsContent value="basico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información de la Página
              </CardTitle>
              <CardDescription>
                Configuración básica de metadatos de la página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageTitle">Título de la página</Label>
                <Input
                  id="pageTitle"
                  value={config.page.title}
                  onChange={(e) => handleConfigChange('page', 'title', e.target.value)}
                  placeholder="Cultura y Personas - Métrica DIP"
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageDescription">Descripción de la página</Label>
                <Textarea
                  id="pageDescription"
                  value={config.page.description}
                  onChange={(e) => handleConfigChange('page', 'description', e.target.value)}
                  placeholder="Descripción de la página..."
                  rows={3}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageUrl">URL de la página</Label>
                <Input
                  id="pageUrl"
                  value={config.page.url}
                  onChange={(e) => handleConfigChange('page', 'url', e.target.value)}
                  placeholder="/about/cultura"
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageKeywords">Keywords (separadas por coma)</Label>
                <Input
                  id="pageKeywords"
                  value={config.page.keywords?.join(', ') || ''}
                  onChange={(e) => handleConfigChange('page', 'keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  placeholder="cultura, equipo, valores, innovación"
                  disabled={readOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Sección Hero
              </CardTitle>
              <CardDescription>
                Configuración del hero principal con galería del equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título principal</Label>
                  <Input
                    id="heroTitle"
                    value={config.hero.title}
                    onChange={(e) => handleConfigChange('hero', 'title', e.target.value)}
                    placeholder="Cultura y Personas"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Input
                    id="heroSubtitle"
                    value={config.hero.subtitle}
                    onChange={(e) => handleConfigChange('hero', 'subtitle', e.target.value)}
                    placeholder="Un equipo multidisciplinario..."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroBackground">Imagen de fondo</Label>
                  <Input
                    id="heroBackground"
                    value={config.hero.background_image}
                    onChange={(e) => handleConfigChange('hero', 'background_image', e.target.value)}
                    placeholder="https://..."
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroBackgroundFallback">Imagen de respaldo</Label>
                  <Input
                    id="heroBackgroundFallback"
                    value={config.hero.background_image_fallback}
                    onChange={(e) => handleConfigChange('hero', 'background_image_fallback', e.target.value)}
                    placeholder="/img/cultura/hero-background.jpg"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Galería del Equipo</h3>
                
                {config.hero.team_gallery.columns.map((column, columnIndex) => (
                  <Card key={columnIndex}>
                    <CardHeader>
                      <CardTitle className="text-base">Columna {columnIndex + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {column.map((image, imageIndex) => (
                        <div key={imageIndex} className="flex gap-2 items-center">
                          <Input
                            value={image}
                            onChange={(e) => {
                              const newColumns = [...config.hero.team_gallery.columns];
                              newColumns[columnIndex][imageIndex] = e.target.value;
                              handleConfigChange('hero', 'team_gallery', { columns: newColumns });
                            }}
                            placeholder="URL de la imagen"
                            disabled={readOnly}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newColumns = [...config.hero.team_gallery.columns];
                              newColumns[columnIndex].splice(imageIndex, 1);
                              handleConfigChange('hero', 'team_gallery', { columns: newColumns });
                            }}
                            disabled={readOnly}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newColumns = [...config.hero.team_gallery.columns];
                          newColumns[columnIndex].push('');
                          handleConfigChange('hero', 'team_gallery', { columns: newColumns });
                        }}
                        disabled={readOnly}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Imagen
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    const newColumns = [...config.hero.team_gallery.columns, ['']];
                    handleConfigChange('hero', 'team_gallery', { columns: newColumns });
                  }}
                  disabled={readOnly}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Columna
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valores Tab */}
        <TabsContent value="valores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Sección de Valores
              </CardTitle>
              <CardDescription>
                Gestión de valores corporativos con imágenes múltiples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    value={config.values.section.title}
                    onChange={(e) => handleNestedChange('values', 'section', 'title', e.target.value)}
                    placeholder="Nuestros Valores"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={config.values.section.subtitle}
                    onChange={(e) => handleNestedChange('values', 'section', 'subtitle', e.target.value)}
                    placeholder="Los principios que guían..."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista de Valores</h3>
                <Button onClick={addValue} disabled={readOnly} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Valor
                </Button>
              </div>

              <div className="space-y-4">
                {config.values.values_list.map((value, index) => (
                  <Card key={value.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <CardTitle className="text-base">
                            {value.title || `Valor ${index + 1}`}
                          </CardTitle>
                          <Badge variant={value.size === 'large' ? 'default' : 'secondary'}>
                            {value.size}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeValue(value.id)}
                          disabled={readOnly}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={value.title}
                            onChange={(e) => updateValue(value.id, { title: e.target.value })}
                            placeholder="Excelencia"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            value={value.color}
                            onChange={(e) => updateValue(value.id, { color: e.target.value })}
                            placeholder="#E84E0F"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tamaño</Label>
                          <Select
                            value={value.size}
                            onValueChange={(val: 'large' | 'medium') => updateValue(value.id, { size: val })}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="large">Grande</SelectItem>
                              <SelectItem value="medium">Mediano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={value.description}
                          onChange={(e) => updateValue(value.id, { description: e.target.value })}
                          placeholder="Descripción del valor..."
                          rows={3}
                          disabled={readOnly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Icono</Label>
                        <Select
                          value={value.icon}
                          onValueChange={(val) => updateValue(value.id, { icon: val })}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Imágenes del Valor</Label>
                        {value.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              value={image}
                              onChange={(e) => {
                                const newImages = [...value.images];
                                newImages[imgIndex] = e.target.value;
                                updateValue(value.id, { images: newImages });
                              }}
                              placeholder="URL de la imagen"
                              disabled={readOnly}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={value.image_descriptions[imgIndex] || ''}
                                onChange={(e) => {
                                  const newDescriptions = [...value.image_descriptions];
                                  newDescriptions[imgIndex] = e.target.value;
                                  updateValue(value.id, { image_descriptions: newDescriptions });
                                }}
                                placeholder="Descripción de la imagen"
                                disabled={readOnly}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newImages = value.images.filter((_, i) => i !== imgIndex);
                                  const newDescriptions = value.image_descriptions.filter((_, i) => i !== imgIndex);
                                  updateValue(value.id, { images: newImages, image_descriptions: newDescriptions });
                                }}
                                disabled={readOnly}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newImages = [...value.images, ''];
                            const newDescriptions = [...value.image_descriptions, ''];
                            updateValue(value.id, { images: newImages, image_descriptions: newDescriptions });
                          }}
                          disabled={readOnly}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Imagen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {config.values.values_list.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay valores configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Cultura en Números
              </CardTitle>
              <CardDescription>
                Estadísticas organizadas por categorías
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    value={config.culture_stats.section.title}
                    onChange={(e) => handleNestedChange('culture_stats', 'section', 'title', e.target.value)}
                    placeholder="Cultura en Números"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={config.culture_stats.section.subtitle}
                    onChange={(e) => handleNestedChange('culture_stats', 'section', 'subtitle', e.target.value)}
                    placeholder="Datos que reflejan..."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                {Object.entries(config.culture_stats.categories).map(([categoryKey, category]) => (
                  <Card key={categoryKey}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span style={{ color: category.color }}>●</span>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={category.title}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                culture_stats: {
                                  ...prev.culture_stats,
                                  categories: {
                                    ...prev.culture_stats.categories,
                                    [categoryKey]: {
                                      ...category,
                                      title: e.target.value
                                    }
                                  }
                                }
                              }));
                            }}
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Icono</Label>
                          <Select
                            value={category.icon}
                            onValueChange={(val) => {
                              setConfig(prev => ({
                                ...prev,
                                culture_stats: {
                                  ...prev.culture_stats,
                                  categories: {
                                    ...prev.culture_stats.categories,
                                    [categoryKey]: {
                                      ...category,
                                      icon: val
                                    }
                                  }
                                }
                              }));
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            value={category.color}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                culture_stats: {
                                  ...prev.culture_stats,
                                  categories: {
                                    ...prev.culture_stats.categories,
                                    [categoryKey]: {
                                      ...category,
                                      color: e.target.value
                                    }
                                  }
                                }
                              }));
                            }}
                            placeholder="#E84E0F"
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Estadísticas</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addStat(categoryKey as keyof typeof config.culture_stats.categories)}
                            disabled={readOnly}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar
                          </Button>
                        </div>

                        {category.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded">
                            <Input
                              value={stat.label}
                              onChange={(e) => updateStat(categoryKey as keyof typeof config.culture_stats.categories, statIndex, { label: e.target.value })}
                              placeholder="Años en el mercado"
                              disabled={readOnly}
                            />
                            <Input
                              value={stat.value}
                              onChange={(e) => updateStat(categoryKey as keyof typeof config.culture_stats.categories, statIndex, { value: e.target.value })}
                              placeholder="15+"
                              disabled={readOnly}
                            />
                            <Input
                              value={stat.description}
                              onChange={(e) => updateStat(categoryKey as keyof typeof config.culture_stats.categories, statIndex, { description: e.target.value })}
                              placeholder="Experiencia consolidada"
                              disabled={readOnly}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStat(categoryKey as keyof typeof config.culture_stats.categories, statIndex)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        {category.stats.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No hay estadísticas configuradas
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipo Tab */}
        <TabsContent value="equipo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Nuestro Equipo
              </CardTitle>
              <CardDescription>
                Gestión del equipo y momentos destacados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    value={config.team.section.title}
                    onChange={(e) => handleNestedChange('team', 'section', 'title', e.target.value)}
                    placeholder="Nuestro Equipo"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={config.team.section.subtitle}
                    onChange={(e) => handleNestedChange('team', 'section', 'subtitle', e.target.value)}
                    placeholder="Profesionales altamente calificados..."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Miembros del Equipo</h3>
                  <Button onClick={addTeamMember} disabled={readOnly} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Miembro
                  </Button>
                </div>

                {config.team.members.map((member) => (
                  <Card key={member.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {member.name || 'Nuevo Miembro'}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          disabled={readOnly}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                            placeholder="Carlos Mendoza"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Cargo</Label>
                          <Input
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, { role: e.target.value })}
                            placeholder="Director Ejecutivo"
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={member.description}
                          onChange={(e) => updateTeamMember(member.id, { description: e.target.value })}
                          placeholder="Descripción del miembro del equipo..."
                          rows={2}
                          disabled={readOnly}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Imagen</Label>
                          <Input
                            value={member.image}
                            onChange={(e) => updateTeamMember(member.id, { image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Imagen de respaldo</Label>
                          <Input
                            value={member.image_fallback}
                            onChange={(e) => updateTeamMember(member.id, { image_fallback: e.target.value })}
                            placeholder="/img/team/carlos-mendoza.jpg"
                            disabled={readOnly}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {config.team.members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay miembros del equipo configurados
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título de momentos</Label>
                    <Input
                      value={config.team.moments.title}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        team: {
                          ...prev.team,
                          moments: {
                            ...prev.team.moments,
                            title: e.target.value
                          }
                        }
                      }))}
                      placeholder="Momentos Destacados"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo de momentos</Label>
                    <Input
                      value={config.team.moments.subtitle}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        team: {
                          ...prev.team,
                          moments: {
                            ...prev.team.moments,
                            subtitle: e.target.value
                          }
                        }
                      }))}
                      placeholder="Celebraciones, logros y experiencias..."
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Galería de Momentos</h3>
                  <Button onClick={addMoment} disabled={readOnly} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Momento
                  </Button>
                </div>

                {config.team.moments.gallery.map((moment) => (
                  <Card key={moment.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {moment.title || 'Nuevo Momento'}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMoment(moment.id)}
                          disabled={readOnly}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={moment.title}
                            onChange={(e) => updateMoment(moment.id, { title: e.target.value })}
                            placeholder="Celebración ISO 9001"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Input
                            value={moment.description}
                            onChange={(e) => updateMoment(moment.id, { description: e.target.value })}
                            placeholder="Renovación exitosa de..."
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Imagen</Label>
                          <Input
                            value={moment.image}
                            onChange={(e) => updateMoment(moment.id, { image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Imagen de respaldo</Label>
                          <Input
                            value={moment.image_fallback}
                            onChange={(e) => updateMoment(moment.id, { image_fallback: e.target.value })}
                            placeholder="/img/moments/iso-celebration.jpg"
                            disabled={readOnly}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {config.team.moments.gallery.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay momentos configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tecnologías Tab */}
        <TabsContent value="tecnologias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Centro de Innovación Tecnológica
              </CardTitle>
              <CardDescription>
                Gestión de tecnologías con casos de estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    value={config.technologies.section.title}
                    onChange={(e) => handleNestedChange('technologies', 'section', 'title', e.target.value)}
                    placeholder="Centro de Innovación Tecnológica"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={config.technologies.section.subtitle}
                    onChange={(e) => handleNestedChange('technologies', 'section', 'subtitle', e.target.value)}
                    placeholder="Implementamos las tecnologías..."
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista de Tecnologías</h3>
                <Button onClick={addTechnology} disabled={readOnly} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Tecnología
                </Button>
              </div>

              <div className="space-y-4">
                {config.technologies.tech_list.map((tech) => (
                  <Card key={tech.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {tech.title || 'Nueva Tecnología'}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTechnology(tech.id)}
                          disabled={readOnly}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={tech.title}
                            onChange={(e) => updateTechnology(tech.id, { title: e.target.value })}
                            placeholder="Modelado BIM"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={tech.subtitle}
                            onChange={(e) => updateTechnology(tech.id, { subtitle: e.target.value })}
                            placeholder="Building Information Modeling"
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            value={tech.color}
                            onChange={(e) => updateTechnology(tech.id, { color: e.target.value })}
                            placeholder="#E84E0F"
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={tech.description}
                          onChange={(e) => updateTechnology(tech.id, { description: e.target.value })}
                          placeholder="Descripción de la tecnología..."
                          rows={2}
                          disabled={readOnly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Icono</Label>
                        <Select
                          value={tech.icon}
                          onValueChange={(val) => updateTechnology(tech.id, { icon: val })}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Características</Label>
                        {tech.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...tech.features];
                                newFeatures[featureIndex] = e.target.value;
                                updateTechnology(tech.id, { features: newFeatures });
                              }}
                              placeholder="Coordinación 3D"
                              disabled={readOnly}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFeatures = tech.features.filter((_, i) => i !== featureIndex);
                                updateTechnology(tech.id, { features: newFeatures });
                              }}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = [...tech.features, ''];
                            updateTechnology(tech.id, { features: newFeatures });
                          }}
                          disabled={readOnly}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Característica
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Imagen</Label>
                          <Input
                            value={tech.image}
                            onChange={(e) => updateTechnology(tech.id, { image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Imagen de respaldo</Label>
                          <Input
                            value={tech.image_fallback}
                            onChange={(e) => updateTechnology(tech.id, { image_fallback: e.target.value })}
                            placeholder="/img/tech/bim-modeling.jpg"
                            disabled={readOnly}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Caso de Estudio</Label>
                        <div className="grid grid-cols-1 gap-3 p-4 border rounded">
                          <div className="space-y-2">
                            <Label className="text-sm">Proyecto</Label>
                            <Input
                              value={tech.case_study.project}
                              onChange={(e) => updateTechnology(tech.id, { 
                                case_study: { ...tech.case_study, project: e.target.value }
                              })}
                              placeholder="Centro Comercial Plaza Norte"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Resultado</Label>
                            <Input
                              value={tech.case_study.result}
                              onChange={(e) => updateTechnology(tech.id, { 
                                case_study: { ...tech.case_study, result: e.target.value }
                              })}
                              placeholder="35% reducción en tiempos"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Ahorros</Label>
                            <Input
                              value={tech.case_study.savings}
                              onChange={(e) => updateTechnology(tech.id, { 
                                case_study: { ...tech.case_study, savings: e.target.value }
                              })}
                              placeholder="S/. 2.3M en ahorro de costos"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {config.technologies.tech_list.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay tecnologías configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO y Metadatos</CardTitle>
              <CardDescription>
                Configuración de SEO para la página de cultura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Los metadatos básicos se configuran en la sección "Básico". 
                    Aquí puedes configurar metadatos específicos de OpenGraph.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 mt-6">
                  <h4 className="font-medium">Open Graph</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">Open Graph Title</Label>
                    <Input
                      id="ogTitle"
                      value={config.page.openGraph?.title || ''}
                      onChange={(e) => handleConfigChange('page', 'openGraph', { ...config.page.openGraph, title: e.target.value })}
                      placeholder="Cultura y Personas - Métrica DIP"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogDescription">Open Graph Description</Label>
                    <Textarea
                      id="ogDescription"
                      value={config.page.openGraph?.description || ''}
                      onChange={(e) => handleConfigChange('page', 'openGraph', { ...config.page.openGraph, description: e.target.value })}
                      placeholder="Descripción para redes sociales..."
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogType">Open Graph Type</Label>
                    <Input
                      id="ogType"
                      value={config.page.openGraph?.type || 'website'}
                      onChange={(e) => handleConfigChange('page', 'openGraph', { ...config.page.openGraph, type: e.target.value })}
                      placeholder="website"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogLocale">Locale</Label>
                    <Input
                      id="ogLocale"
                      value={config.page.openGraph?.locale || 'es_PE'}
                      onChange={(e) => handleConfigChange('page', 'openGraph', { ...config.page.openGraph, locale: e.target.value })}
                      placeholder="es_PE"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogSiteName">Site Name</Label>
                    <Input
                      id="ogSiteName"
                      value={config.page.openGraph?.siteName || 'Métrica DIP'}
                      onChange={(e) => handleConfigChange('page', 'openGraph', { ...config.page.openGraph, siteName: e.target.value })}
                      placeholder="Métrica DIP"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CulturaPageEditorNew;