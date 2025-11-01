'use client';

import React, { useState, useCallback } from 'react';
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
  Coffee,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Image,
  FileText,
  BarChart3,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import {
  TestimonialsManager,
  SEOAdvancedEditor,
  ContentSectionsManager
} from '@/components/admin/shared';

// Interfaces principales
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  bio: string;
  image: string;
  email: string;
  phone?: string;
  linkedin?: string;
  yearsExperience: number;
  skills: string[];
  achievements: string[];
  isLeadership: boolean;
  startDate: string;
  location: string;
  languages: string[];
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
  metrics: {
    adherenceScore: number;
    implementationLevel: string;
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'financial' | 'development' | 'lifestyle' | 'family';
  icon: string;
  isPopular: boolean;
  eligibility: string[];
  value?: string;
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'environmental' | 'community' | 'education';
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  impact: string;
  participants: number;
  image: string;
}

export interface CultureMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  category: 'satisfaction' | 'retention' | 'growth' | 'diversity' | 'wellness';
}

export interface CulturaHeroSection {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  overlayOpacity: number;
  ctaText: string;
  ctaLink: string;
  showStats: boolean;
  stats: {
    employees: number;
    yearsExperience: number;
    satisfaction: number;
    retention: number;
  };
}

export interface CulturaConfiguration {
  // Básico
  isEnabled: boolean;
  title: string;
  description: string;
  lastUpdated: string;
  
  // Hero
  hero: CulturaHeroSection;
  
  // Equipo
  team: {
    showTeam: boolean;
    teamTitle: string;
    teamDescription: string;
    teamMembers: TeamMember[];
    departmentFilter: boolean;
    showLeadershipFirst: boolean;
    maxMembersDisplay: number;
    teamLayout: 'grid' | 'list' | 'carousel';
  };
  
  // Valores
  values: {
    showValues: boolean;
    valuesTitle: string;
    valuesDescription: string;
    coreValues: CoreValue[];
    showMetrics: boolean;
    valuesLayout: 'grid' | 'carousel' | 'timeline';
  };
  
  // Beneficios
  benefits: {
    showBenefits: boolean;
    benefitsTitle: string;
    benefitsDescription: string;
    benefitsList: Benefit[];
    groupByCategory: boolean;
    showPopularFirst: boolean;
    benefitsLayout: 'grid' | 'list' | 'cards';
  };
  
  // Iniciativas
  initiatives: {
    showInitiatives: boolean;
    initiativesTitle: string;
    initiativesDescription: string;
    initiativesList: Initiative[];
    filterByCategory: boolean;
    filterByStatus: boolean;
    initiativesLayout: 'grid' | 'timeline' | 'masonry';
  };
  
  // Métricas
  metrics: {
    showMetrics: boolean;
    metricsTitle: string;
    metricsDescription: string;
    cultureMetrics: CultureMetric[];
    showTrends: boolean;
    showTargets: boolean;
    metricsLayout: 'dashboard' | 'cards' | 'charts';
  };
  
  // Secciones dinámicas
  sections: any[];
  
  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    canonical: string;
  };
}

interface CulturaPageEditorProps {
  slug: string;
  initialData?: Partial<CulturaConfiguration>;
  onSave: (data: CulturaConfiguration) => Promise<void>;
  onPreview?: (data: CulturaConfiguration) => void;
  readOnly?: boolean;
}

const CulturaPageEditor: React.FC<CulturaPageEditorProps> = ({
  slug,
  initialData = {},
  onSave,
  onPreview,
  readOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basico');

  // Estado principal
  const [config, setConfig] = useState<CulturaConfiguration>({
    isEnabled: true,
    title: 'Nuestra Cultura',
    description: 'Descubre nuestra cultura organizacional, valores y el ambiente de trabajo en Métrica FM.',
    lastUpdated: new Date().toISOString(),
    hero: {
      title: 'Nuestra Cultura',
      subtitle: 'Un lugar donde crecer profesional y personalmente',
      description: 'En Métrica FM creamos un ambiente de trabajo colaborativo, innovador y orientado al crecimiento de nuestro equipo.',
      backgroundImage: '/images/cultura/hero-bg.jpg',
      overlayOpacity: 0.6,
      ctaText: 'Únete a nuestro equipo',
      ctaLink: '/careers',
      showStats: true,
      stats: {
        employees: 150,
        yearsExperience: 15,
        satisfaction: 92,
        retention: 88
      }
    },
    team: {
      showTeam: true,
      teamTitle: 'Nuestro Equipo',
      teamDescription: 'Conoce a los profesionales que hacen posible nuestros proyectos.',
      teamMembers: [],
      departmentFilter: true,
      showLeadershipFirst: true,
      maxMembersDisplay: 20,
      teamLayout: 'grid'
    },
    values: {
      showValues: true,
      valuesTitle: 'Nuestros Valores',
      valuesDescription: 'Los principios que guían nuestro trabajo y relaciones.',
      coreValues: [],
      showMetrics: true,
      valuesLayout: 'grid'
    },
    benefits: {
      showBenefits: true,
      benefitsTitle: 'Beneficios',
      benefitsDescription: 'Cuidamos de nuestro equipo con beneficios integrales.',
      benefitsList: [],
      groupByCategory: true,
      showPopularFirst: true,
      benefitsLayout: 'grid'
    },
    initiatives: {
      showInitiatives: true,
      initiativesTitle: 'Iniciativas Sociales',
      initiativesDescription: 'Nuestro compromiso con la comunidad y el medio ambiente.',
      initiativesList: [],
      filterByCategory: true,
      filterByStatus: true,
      initiativesLayout: 'grid'
    },
    metrics: {
      showMetrics: true,
      metricsTitle: 'Métricas Culturales',
      metricsDescription: 'Indicadores que reflejan nuestra cultura organizacional.',
      cultureMetrics: [],
      showTrends: true,
      showTargets: true,
      metricsLayout: 'dashboard'
    },
    sections: [],
    seo: {
      title: 'Cultura Organizacional - Métrica FM',
      description: 'Descubre la cultura, valores y ambiente de trabajo en Métrica FM. Únete a nuestro equipo de profesionales.',
      keywords: ['cultura organizacional', 'valores empresariales', 'ambiente de trabajo', 'equipo', 'beneficios laborales'],
      ogImage: '/images/cultura/og-cultura.jpg',
      canonical: `/cultura`
    },
    ...initialData
  });

  // Handlers principales
  const handleConfigChange = useCallback((field: keyof CulturaConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleNestedChange = useCallback((section: keyof CulturaConfiguration, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
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

  // Team Member Management
  const addTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: '',
      position: '',
      department: '',
      bio: '',
      image: '',
      email: '',
      yearsExperience: 0,
      skills: [],
      achievements: [],
      isLeadership: false,
      startDate: new Date().toISOString().split('T')[0],
      location: '',
      languages: ['Español']
    };
    
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamMembers: [...prev.team.teamMembers, newMember]
      }
    }));
  }, []);

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamMembers: prev.team.teamMembers.map(member =>
          member.id === id ? { ...member, ...updates } : member
        )
      }
    }));
  }, []);

  const removeTeamMember = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamMembers: prev.team.teamMembers.filter(member => member.id !== id)
      }
    }));
  }, []);

  // Core Values Management
  const addCoreValue = useCallback(() => {
    const newValue: CoreValue = {
      id: `value-${Date.now()}`,
      title: '',
      description: '',
      icon: 'heart',
      color: '#00A8E8',
      examples: [],
      metrics: {
        adherenceScore: 85,
        implementationLevel: 'high'
      }
    };
    
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        coreValues: [...prev.values.coreValues, newValue]
      }
    }));
  }, []);

  const updateCoreValue = useCallback((id: string, updates: Partial<CoreValue>) => {
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        coreValues: prev.values.coreValues.map(value =>
          value.id === id ? { ...value, ...updates } : value
        )
      }
    }));
  }, []);

  const removeCoreValue = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      values: {
        ...prev.values,
        coreValues: prev.values.coreValues.filter(value => value.id !== id)
      }
    }));
  }, []);

  // Benefits Management
  const addBenefit = useCallback(() => {
    const newBenefit: Benefit = {
      id: `benefit-${Date.now()}`,
      title: '',
      description: '',
      category: 'health',
      icon: 'heart',
      isPopular: false,
      eligibility: ['Todos los empleados']
    };
    
    setConfig(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        benefitsList: [...prev.benefits.benefitsList, newBenefit]
      }
    }));
  }, []);

  const updateBenefit = useCallback((id: string, updates: Partial<Benefit>) => {
    setConfig(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        benefitsList: prev.benefits.benefitsList.map(benefit =>
          benefit.id === id ? { ...benefit, ...updates } : benefit
        )
      }
    }));
  }, []);

  const removeBenefit = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        benefitsList: prev.benefits.benefitsList.filter(benefit => benefit.id !== id)
      }
    }));
  }, []);

  // Initiatives Management
  const addInitiative = useCallback(() => {
    const newInitiative: Initiative = {
      id: `initiative-${Date.now()}`,
      title: '',
      description: '',
      category: 'social',
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      impact: '',
      participants: 0,
      image: ''
    };
    
    setConfig(prev => ({
      ...prev,
      initiatives: {
        ...prev.initiatives,
        initiativesList: [...prev.initiatives.initiativesList, newInitiative]
      }
    }));
  }, []);

  const updateInitiative = useCallback((id: string, updates: Partial<Initiative>) => {
    setConfig(prev => ({
      ...prev,
      initiatives: {
        ...prev.initiatives,
        initiativesList: prev.initiatives.initiativesList.map(initiative =>
          initiative.id === id ? { ...initiative, ...updates } : initiative
        )
      }
    }));
  }, []);

  const removeInitiative = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      initiatives: {
        ...prev.initiatives,
        initiativesList: prev.initiatives.initiativesList.filter(initiative => initiative.id !== id)
      }
    }));
  }, []);

  // Culture Metrics Management
  const addCultureMetric = useCallback(() => {
    const newMetric: CultureMetric = {
      id: `metric-${Date.now()}`,
      name: '',
      value: 0,
      target: 100,
      unit: '%',
      trend: 'stable',
      description: '',
      category: 'satisfaction'
    };
    
    setConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cultureMetrics: [...prev.metrics.cultureMetrics, newMetric]
      }
    }));
  }, []);

  const updateCultureMetric = useCallback((id: string, updates: Partial<CultureMetric>) => {
    setConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cultureMetrics: prev.metrics.cultureMetrics.map(metric =>
          metric.id === id ? { ...metric, ...updates } : metric
        )
      }
    }));
  }, []);

  const removeCultureMetric = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cultureMetrics: prev.metrics.cultureMetrics.filter(metric => metric.id !== id)
      }
    }));
  }, []);

  const departmentOptions = [
    'Dirección General',
    'Arquitectura y Diseño',
    'Ingeniería',
    'Gestión de Proyectos',
    'Administración',
    'Recursos Humanos',
    'Finanzas',
    'Marketing',
    'Tecnología',
    'Calidad'
  ];

  const benefitCategoryOptions = {
    health: 'Salud y Bienestar',
    financial: 'Financieros',
    development: 'Desarrollo Profesional',
    lifestyle: 'Estilo de Vida',
    family: 'Familia'
  };

  const initiativeCategoryOptions = {
    social: 'Social',
    environmental: 'Ambiental',
    community: 'Comunidad',
    education: 'Educación'
  };

  const initiativeStatusOptions = {
    planning: 'En Planificación',
    active: 'Activa',
    completed: 'Completada',
    paused: 'Pausada'
  };

  const metricCategoryOptions = {
    satisfaction: 'Satisfacción',
    retention: 'Retención',
    growth: 'Crecimiento',
    diversity: 'Diversidad',
    wellness: 'Bienestar'
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editor de Cultura Organizacional
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona el contenido de la página de cultura organizacional
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
          <TabsTrigger value="valores">Valores</TabsTrigger>
          <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
          <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Básico Tab */}
        <TabsContent value="basico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configuración Básica
              </CardTitle>
              <CardDescription>
                Configuración general de la página de cultura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isEnabled"
                  checked={config.isEnabled}
                  onCheckedChange={(value) => handleConfigChange('isEnabled', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="isEnabled">Página habilitada</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la página</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="Ej: Nuestra Cultura"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastUpdated">Última actualización</Label>
                  <Input
                    id="lastUpdated"
                    type="datetime-local"
                    value={config.lastUpdated.slice(0, 16)}
                    onChange={(e) => handleConfigChange('lastUpdated', e.target.value + ':00.000Z')}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  placeholder="Descripción de la página de cultura..."
                  rows={3}
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
                Configuración de la sección principal de la página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título principal</Label>
                  <Input
                    id="heroTitle"
                    value={config.hero.title}
                    onChange={(e) => handleNestedChange('hero', 'title', e.target.value)}
                    placeholder="Ej: Nuestra Cultura"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Input
                    id="heroSubtitle"
                    value={config.hero.subtitle}
                    onChange={(e) => handleNestedChange('hero', 'subtitle', e.target.value)}
                    placeholder="Ej: Un lugar donde crecer"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroDescription">Descripción</Label>
                <Textarea
                  id="heroDescription"
                  value={config.hero.description}
                  onChange={(e) => handleNestedChange('hero', 'description', e.target.value)}
                  placeholder="Descripción del hero..."
                  rows={3}
                  disabled={readOnly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroBackground">Imagen de fondo</Label>
                  <Input
                    id="heroBackground"
                    value={config.hero.backgroundImage}
                    onChange={(e) => handleNestedChange('hero', 'backgroundImage', e.target.value)}
                    placeholder="/images/cultura/hero-bg.jpg"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroOverlay">Opacidad del overlay (0-1)</Label>
                  <Input
                    id="heroOverlay"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.hero.overlayOpacity}
                    onChange={(e) => handleNestedChange('hero', 'overlayOpacity', parseFloat(e.target.value))}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroCta">Texto del botón CTA</Label>
                  <Input
                    id="heroCta"
                    value={config.hero.ctaText}
                    onChange={(e) => handleNestedChange('hero', 'ctaText', e.target.value)}
                    placeholder="Ej: Únete a nuestro equipo"
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroCtaLink">Enlace del CTA</Label>
                  <Input
                    id="heroCtaLink"
                    value={config.hero.ctaLink}
                    onChange={(e) => handleNestedChange('hero', 'ctaLink', e.target.value)}
                    placeholder="/careers"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showStats"
                    checked={config.hero.showStats}
                    onCheckedChange={(value) => handleNestedChange('hero', 'showStats', value)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="showStats">Mostrar estadísticas en el hero</Label>
                </div>

                {config.hero.showStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Empleados</Label>
                      <Input
                        type="number"
                        value={config.hero.stats.employees}
                        onChange={(e) => handleNestedChange('hero', 'stats', {
                          ...config.hero.stats,
                          employees: parseInt(e.target.value) || 0
                        })}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Años de experiencia</Label>
                      <Input
                        type="number"
                        value={config.hero.stats.yearsExperience}
                        onChange={(e) => handleNestedChange('hero', 'stats', {
                          ...config.hero.stats,
                          yearsExperience: parseInt(e.target.value) || 0
                        })}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Satisfacción (%)</Label>
                      <Input
                        type="number"
                        max="100"
                        value={config.hero.stats.satisfaction}
                        onChange={(e) => handleNestedChange('hero', 'stats', {
                          ...config.hero.stats,
                          satisfaction: parseInt(e.target.value) || 0
                        })}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Retención (%)</Label>
                      <Input
                        type="number"
                        max="100"
                        value={config.hero.stats.retention}
                        onChange={(e) => handleNestedChange('hero', 'stats', {
                          ...config.hero.stats,
                          retention: parseInt(e.target.value) || 0
                        })}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="equipo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Configuración del Equipo
              </CardTitle>
              <CardDescription>
                Gestión del equipo y miembros de la organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showTeam"
                  checked={config.team.showTeam}
                  onCheckedChange={(value) => handleNestedChange('team', 'showTeam', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="showTeam">Mostrar sección de equipo</Label>
              </div>

              {config.team.showTeam && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        value={config.team.teamTitle}
                        onChange={(e) => handleNestedChange('team', 'teamTitle', e.target.value)}
                        placeholder="Ej: Nuestro Equipo"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout del equipo</Label>
                      <Select
                        value={config.team.teamLayout}
                        onValueChange={(value) => handleNestedChange('team', 'teamLayout', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="list">Lista</SelectItem>
                          <SelectItem value="carousel">Carrusel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={config.team.teamDescription}
                      onChange={(e) => handleNestedChange('team', 'teamDescription', e.target.value)}
                      placeholder="Descripción del equipo..."
                      rows={2}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.team.departmentFilter}
                        onCheckedChange={(value) => handleNestedChange('team', 'departmentFilter', value)}
                        disabled={readOnly}
                      />
                      <Label>Filtro por departamento</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.team.showLeadershipFirst}
                        onCheckedChange={(value) => handleNestedChange('team', 'showLeadershipFirst', value)}
                        disabled={readOnly}
                      />
                      <Label>Mostrar liderazgo primero</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Máximo miembros mostrados</Label>
                      <Input
                        type="number"
                        value={config.team.maxMembersDisplay}
                        onChange={(e) => handleNestedChange('team', 'maxMembersDisplay', parseInt(e.target.value) || 20)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Miembros del Equipo</h3>
                    <Button
                      onClick={addTeamMember}
                      disabled={readOnly}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Miembro
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {config.team.teamMembers.map((member, index) => (
                      <Card key={member.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <CardTitle className="text-base">
                                {member.name || `Miembro ${index + 1}`}
                              </CardTitle>
                              {member.isLeadership && (
                                <Badge variant="secondary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Liderazgo
                                </Badge>
                              )}
                            </div>
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Nombre completo</Label>
                              <Input
                                value={member.name}
                                onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                                placeholder="Nombre del miembro"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Cargo</Label>
                              <Input
                                value={member.position}
                                onChange={(e) => updateTeamMember(member.id, { position: e.target.value })}
                                placeholder="Ej: Arquitecto Senior"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Departamento</Label>
                              <Select
                                value={member.department}
                                onValueChange={(value) => updateTeamMember(member.id, { department: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departmentOptions.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Biografía</Label>
                            <Textarea
                              value={member.bio}
                              onChange={(e) => updateTeamMember(member.id, { bio: e.target.value })}
                              placeholder="Breve descripción del miembro del equipo..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={member.email}
                                onChange={(e) => updateTeamMember(member.id, { email: e.target.value })}
                                placeholder="email@metrica.pe"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Teléfono</Label>
                              <Input
                                value={member.phone || ''}
                                onChange={(e) => updateTeamMember(member.id, { phone: e.target.value })}
                                placeholder="+51 999 999 999"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>LinkedIn</Label>
                              <Input
                                value={member.linkedin || ''}
                                onChange={(e) => updateTeamMember(member.id, { linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/usuario"
                                disabled={readOnly}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Foto</Label>
                              <Input
                                value={member.image}
                                onChange={(e) => updateTeamMember(member.id, { image: e.target.value })}
                                placeholder="/images/team/member.jpg"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Años de experiencia</Label>
                              <Input
                                type="number"
                                value={member.yearsExperience}
                                onChange={(e) => updateTeamMember(member.id, { yearsExperience: parseInt(e.target.value) || 0 })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Fecha de inicio</Label>
                              <Input
                                type="date"
                                value={member.startDate}
                                onChange={(e) => updateTeamMember(member.id, { startDate: e.target.value })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ubicación</Label>
                              <Input
                                value={member.location}
                                onChange={(e) => updateTeamMember(member.id, { location: e.target.value })}
                                placeholder="Lima, Perú"
                                disabled={readOnly}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={member.isLeadership}
                              onCheckedChange={(value) => updateTeamMember(member.id, { isLeadership: value })}
                              disabled={readOnly}
                            />
                            <Label>Es parte del liderazgo</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {config.team.teamMembers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay miembros del equipo configurados
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="valores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Valores Corporativos
              </CardTitle>
              <CardDescription>
                Gestión de los valores fundamentales de la organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showValues"
                  checked={config.values.showValues}
                  onCheckedChange={(value) => handleNestedChange('values', 'showValues', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="showValues">Mostrar sección de valores</Label>
              </div>

              {config.values.showValues && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        value={config.values.valuesTitle}
                        onChange={(e) => handleNestedChange('values', 'valuesTitle', e.target.value)}
                        placeholder="Ej: Nuestros Valores"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout de valores</Label>
                      <Select
                        value={config.values.valuesLayout}
                        onValueChange={(value) => handleNestedChange('values', 'valuesLayout', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="carousel">Carrusel</SelectItem>
                          <SelectItem value="timeline">Timeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={config.values.valuesDescription}
                      onChange={(e) => handleNestedChange('values', 'valuesDescription', e.target.value)}
                      placeholder="Descripción de los valores corporativos..."
                      rows={2}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.values.showMetrics}
                      onCheckedChange={(value) => handleNestedChange('values', 'showMetrics', value)}
                      disabled={readOnly}
                    />
                    <Label>Mostrar métricas de adherencia</Label>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Valores Fundamentales</h3>
                    <Button
                      onClick={addCoreValue}
                      disabled={readOnly}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Valor
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {config.values.coreValues.map((value, index) => (
                      <Card key={value.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <CardTitle className="text-base">
                                {value.title || `Valor ${index + 1}`}
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCoreValue(value.id)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Título del valor</Label>
                              <Input
                                value={value.title}
                                onChange={(e) => updateCoreValue(value.id, { title: e.target.value })}
                                placeholder="Ej: Excelencia"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Color (hex)</Label>
                              <Input
                                value={value.color}
                                onChange={(e) => updateCoreValue(value.id, { color: e.target.value })}
                                placeholder="#00A8E8"
                                disabled={readOnly}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={value.description}
                              onChange={(e) => updateCoreValue(value.id, { description: e.target.value })}
                              placeholder="Descripción del valor corporativo..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Icono</Label>
                              <Select
                                value={value.icon}
                                onValueChange={(val) => updateCoreValue(value.id, { icon: val })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="heart">❤️ Corazón</SelectItem>
                                  <SelectItem value="star">⭐ Estrella</SelectItem>
                                  <SelectItem value="target">🎯 Objetivo</SelectItem>
                                  <SelectItem value="lightbulb">💡 Bombilla</SelectItem>
                                  <SelectItem value="award">🏆 Premio</SelectItem>
                                  <SelectItem value="users">👥 Usuarios</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Nivel de implementación</Label>
                              <Select
                                value={value.metrics.implementationLevel}
                                onValueChange={(val) => updateCoreValue(value.id, { 
                                  metrics: { ...value.metrics, implementationLevel: val }
                                })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">Alto</SelectItem>
                                  <SelectItem value="medium">Medio</SelectItem>
                                  <SelectItem value="low">Bajo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {config.values.showMetrics && (
                            <div className="space-y-2">
                              <Label>Puntuación de adherencia (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={value.metrics.adherenceScore}
                                onChange={(e) => updateCoreValue(value.id, {
                                  metrics: { 
                                    ...value.metrics, 
                                    adherenceScore: parseInt(e.target.value) || 0 
                                  }
                                })}
                                disabled={readOnly}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {config.values.coreValues.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay valores configurados
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="beneficios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Beneficios Laborales
              </CardTitle>
              <CardDescription>
                Gestión de beneficios y ventajas para empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showBenefits"
                  checked={config.benefits.showBenefits}
                  onCheckedChange={(value) => handleNestedChange('benefits', 'showBenefits', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="showBenefits">Mostrar sección de beneficios</Label>
              </div>

              {config.benefits.showBenefits && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        value={config.benefits.benefitsTitle}
                        onChange={(e) => handleNestedChange('benefits', 'benefitsTitle', e.target.value)}
                        placeholder="Ej: Nuestros Beneficios"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout de beneficios</Label>
                      <Select
                        value={config.benefits.benefitsLayout}
                        onValueChange={(value) => handleNestedChange('benefits', 'benefitsLayout', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="list">Lista</SelectItem>
                          <SelectItem value="cards">Tarjetas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={config.benefits.benefitsDescription}
                      onChange={(e) => handleNestedChange('benefits', 'benefitsDescription', e.target.value)}
                      placeholder="Descripción de los beneficios..."
                      rows={2}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.benefits.groupByCategory}
                        onCheckedChange={(value) => handleNestedChange('benefits', 'groupByCategory', value)}
                        disabled={readOnly}
                      />
                      <Label>Agrupar por categoría</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.benefits.showPopularFirst}
                        onCheckedChange={(value) => handleNestedChange('benefits', 'showPopularFirst', value)}
                        disabled={readOnly}
                      />
                      <Label>Mostrar populares primero</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Lista de Beneficios</h3>
                    <Button
                      onClick={addBenefit}
                      disabled={readOnly}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Beneficio
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {config.benefits.benefitsList.map((benefit, index) => (
                      <Card key={benefit.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <CardTitle className="text-base">
                                {benefit.title || `Beneficio ${index + 1}`}
                              </CardTitle>
                              {benefit.isPopular && (
                                <Badge variant="secondary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                              <Badge>{benefitCategoryOptions[benefit.category]}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBenefit(benefit.id)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Título del beneficio</Label>
                              <Input
                                value={benefit.title}
                                onChange={(e) => updateBenefit(benefit.id, { title: e.target.value })}
                                placeholder="Ej: Seguro de salud"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Select
                                value={benefit.category}
                                onValueChange={(value: any) => updateBenefit(benefit.id, { category: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(benefitCategoryOptions).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={benefit.description}
                              onChange={(e) => updateBenefit(benefit.id, { description: e.target.value })}
                              placeholder="Descripción del beneficio..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor (opcional)</Label>
                              <Input
                                value={benefit.value || ''}
                                onChange={(e) => updateBenefit(benefit.id, { value: e.target.value })}
                                placeholder="Ej: S/ 1,500 mensual"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                              <Switch
                                checked={benefit.isPopular}
                                onCheckedChange={(value) => updateBenefit(benefit.id, { isPopular: value })}
                                disabled={readOnly}
                              />
                              <Label>Beneficio popular</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {config.benefits.benefitsList.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay beneficios configurados
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initiatives Tab */}
        <TabsContent value="iniciativas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Iniciativas Sociales
              </CardTitle>
              <CardDescription>
                Gestión de iniciativas de responsabilidad social y comunitaria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showInitiatives"
                  checked={config.initiatives.showInitiatives}
                  onCheckedChange={(value) => handleNestedChange('initiatives', 'showInitiatives', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="showInitiatives">Mostrar sección de iniciativas</Label>
              </div>

              {config.initiatives.showInitiatives && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        value={config.initiatives.initiativesTitle}
                        onChange={(e) => handleNestedChange('initiatives', 'initiativesTitle', e.target.value)}
                        placeholder="Ej: Iniciativas Sociales"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout de iniciativas</Label>
                      <Select
                        value={config.initiatives.initiativesLayout}
                        onValueChange={(value) => handleNestedChange('initiatives', 'initiativesLayout', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="timeline">Timeline</SelectItem>
                          <SelectItem value="masonry">Masonry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={config.initiatives.initiativesDescription}
                      onChange={(e) => handleNestedChange('initiatives', 'initiativesDescription', e.target.value)}
                      placeholder="Descripción de las iniciativas sociales..."
                      rows={2}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.initiatives.filterByCategory}
                        onCheckedChange={(value) => handleNestedChange('initiatives', 'filterByCategory', value)}
                        disabled={readOnly}
                      />
                      <Label>Filtro por categoría</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.initiatives.filterByStatus}
                        onCheckedChange={(value) => handleNestedChange('initiatives', 'filterByStatus', value)}
                        disabled={readOnly}
                      />
                      <Label>Filtro por estado</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Lista de Iniciativas</h3>
                    <Button
                      onClick={addInitiative}
                      disabled={readOnly}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Iniciativa
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {config.initiatives.initiativesList.map((initiative, index) => (
                      <Card key={initiative.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <CardTitle className="text-base">
                                {initiative.title || `Iniciativa ${index + 1}`}
                              </CardTitle>
                              <Badge>{initiativeCategoryOptions[initiative.category]}</Badge>
                              <Badge variant={
                                initiative.status === 'completed' ? 'default' :
                                initiative.status === 'active' ? 'secondary' :
                                initiative.status === 'paused' ? 'destructive' : 'outline'
                              }>
                                {initiativeStatusOptions[initiative.status]}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInitiative(initiative.id)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Título de la iniciativa</Label>
                              <Input
                                value={initiative.title}
                                onChange={(e) => updateInitiative(initiative.id, { title: e.target.value })}
                                placeholder="Ej: Programa de Becas"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Imagen</Label>
                              <Input
                                value={initiative.image}
                                onChange={(e) => updateInitiative(initiative.id, { image: e.target.value })}
                                placeholder="/images/initiatives/programa-becas.jpg"
                                disabled={readOnly}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={initiative.description}
                              onChange={(e) => updateInitiative(initiative.id, { description: e.target.value })}
                              placeholder="Descripción de la iniciativa..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Select
                                value={initiative.category}
                                onValueChange={(value: any) => updateInitiative(initiative.id, { category: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(initiativeCategoryOptions).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Estado</Label>
                              <Select
                                value={initiative.status}
                                onValueChange={(value: any) => updateInitiative(initiative.id, { status: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(initiativeStatusOptions).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha de inicio</Label>
                              <Input
                                type="date"
                                value={initiative.startDate}
                                onChange={(e) => updateInitiative(initiative.id, { startDate: e.target.value })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Fecha de fin (opcional)</Label>
                              <Input
                                type="date"
                                value={initiative.endDate || ''}
                                onChange={(e) => updateInitiative(initiative.id, { endDate: e.target.value || undefined })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Participantes</Label>
                              <Input
                                type="number"
                                value={initiative.participants}
                                onChange={(e) => updateInitiative(initiative.id, { participants: parseInt(e.target.value) || 0 })}
                                disabled={readOnly}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Impacto generado</Label>
                            <Textarea
                              value={initiative.impact}
                              onChange={(e) => updateInitiative(initiative.id, { impact: e.target.value })}
                              placeholder="Describe el impacto de esta iniciativa..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {config.initiatives.initiativesList.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay iniciativas configuradas
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metricas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas Culturales
              </CardTitle>
              <CardDescription>
                Indicadores y KPIs de cultura organizacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showMetrics"
                  checked={config.metrics.showMetrics}
                  onCheckedChange={(value) => handleNestedChange('metrics', 'showMetrics', value)}
                  disabled={readOnly}
                />
                <Label htmlFor="showMetrics">Mostrar sección de métricas</Label>
              </div>

              {config.metrics.showMetrics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        value={config.metrics.metricsTitle}
                        onChange={(e) => handleNestedChange('metrics', 'metricsTitle', e.target.value)}
                        placeholder="Ej: Métricas Culturales"
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout de métricas</Label>
                      <Select
                        value={config.metrics.metricsLayout}
                        onValueChange={(value) => handleNestedChange('metrics', 'metricsLayout', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="cards">Tarjetas</SelectItem>
                          <SelectItem value="charts">Gráficos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={config.metrics.metricsDescription}
                      onChange={(e) => handleNestedChange('metrics', 'metricsDescription', e.target.value)}
                      placeholder="Descripción de las métricas culturales..."
                      rows={2}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.metrics.showTrends}
                        onCheckedChange={(value) => handleNestedChange('metrics', 'showTrends', value)}
                        disabled={readOnly}
                      />
                      <Label>Mostrar tendencias</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.metrics.showTargets}
                        onCheckedChange={(value) => handleNestedChange('metrics', 'showTargets', value)}
                        disabled={readOnly}
                      />
                      <Label>Mostrar objetivos</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Métricas de Cultura</h3>
                    <Button
                      onClick={addCultureMetric}
                      disabled={readOnly}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Métrica
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {config.metrics.cultureMetrics.map((metric, index) => (
                      <Card key={metric.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <CardTitle className="text-base">
                                {metric.name || `Métrica ${index + 1}`}
                              </CardTitle>
                              <Badge>{metricCategoryOptions[metric.category]}</Badge>
                              <Badge variant={
                                metric.trend === 'up' ? 'default' :
                                metric.trend === 'down' ? 'destructive' : 'secondary'
                              }>
                                {metric.trend === 'up' ? '📈 Subiendo' : 
                                 metric.trend === 'down' ? '📉 Bajando' : '➡️ Estable'}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCultureMetric(metric.id)}
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nombre de la métrica</Label>
                              <Input
                                value={metric.name}
                                onChange={(e) => updateCultureMetric(metric.id, { name: e.target.value })}
                                placeholder="Ej: Satisfacción Laboral"
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Select
                                value={metric.category}
                                onValueChange={(value: any) => updateCultureMetric(metric.id, { category: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(metricCategoryOptions).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={metric.description}
                              onChange={(e) => updateCultureMetric(metric.id, { description: e.target.value })}
                              placeholder="Descripción de la métrica..."
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Valor actual</Label>
                              <Input
                                type="number"
                                value={metric.value}
                                onChange={(e) => updateCultureMetric(metric.id, { value: parseFloat(e.target.value) || 0 })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Objetivo</Label>
                              <Input
                                type="number"
                                value={metric.target}
                                onChange={(e) => updateCultureMetric(metric.id, { target: parseFloat(e.target.value) || 0 })}
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Unidad</Label>
                              <Input
                                value={metric.unit}
                                onChange={(e) => updateCultureMetric(metric.id, { unit: e.target.value })}
                                placeholder="%, puntos, días..."
                                disabled={readOnly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tendencia</Label>
                              <Select
                                value={metric.trend}
                                onValueChange={(value: any) => updateCultureMetric(metric.id, { trend: value })}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="up">Subiendo</SelectItem>
                                  <SelectItem value="stable">Estable</SelectItem>
                                  <SelectItem value="down">Bajando</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {config.metrics.cultureMetrics.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay métricas configuradas
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <SEOAdvancedEditor
            seoData={config.seo}
            onChange={(seoData) => handleConfigChange('seo', seoData)}
            pageType="cultura"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CulturaPageEditor;