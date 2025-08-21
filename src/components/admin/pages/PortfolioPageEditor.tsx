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
  CategoryManager,
  SEOAdvancedEditor,
  ContentSectionsManager,
  TestimonialsManager,
  PaginationConfig
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
  Image,
  Loader2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Star,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';

// Interfaces específicas para Portfolio
export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  client: string;
  location: string;
  status: 'completed' | 'in_progress' | 'planned' | 'cancelled';
  featured: boolean;
  order: number;
  category_ids: string[];
  start_date: string;
  end_date?: string;
  budget?: string;
  area?: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
    is_main: boolean;
    order: number;
  }>;
  gallery?: Array<{
    type: 'image' | 'video' | 'document';
    url: string;
    title: string;
    description?: string;
    order: number;
  }>;
  technologies?: string[];
  team_size?: number;
  challenges?: string[];
  solutions?: string[];
  results?: Array<{
    metric: string;
    value: string;
    description?: string;
  }>;
  testimonials?: string[];
  awards?: Array<{
    name: string;
    organization: string;
    year: number;
    description?: string;
  }>;
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    tags?: string[];
    seo_title?: string;
    seo_description?: string;
  };
}

export interface PortfolioHeroSection {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_stats: boolean;
  show_featured_projects: boolean;
  featured_projects_count: number;
  show_categories_filter: boolean;
  show_search: boolean;
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
    description?: string;
  }>;
}

export interface PortfolioDisplayConfig {
  layout: 'grid' | 'masonry' | 'list' | 'timeline';
  projects_per_page: number;
  show_categories_filter: boolean;
  show_status_filter: boolean;
  show_date_filter: boolean;
  show_search: boolean;
  grid_columns: number;
  card_style: 'minimal' | 'detailed' | 'magazine' | 'modern';
  show_project_images: boolean;
  show_project_meta: boolean;
  show_client_info: boolean;
  show_status_badges: boolean;
  show_category_tags: boolean;
  image_aspect_ratio: '16:9' | '4:3' | '1:1' | 'auto';
}

export interface PortfolioProjectConfig {
  show_breadcrumbs: boolean;
  show_project_navigation: boolean;
  show_project_meta: boolean;
  show_client_testimonial: boolean;
  show_related_projects: boolean;
  related_projects_count: number;
  show_gallery: boolean;
  gallery_layout: 'grid' | 'carousel' | 'masonry';
  show_project_timeline: boolean;
  show_team_info: boolean;
  show_results_metrics: boolean;
  show_technologies_used: boolean;
  show_awards: boolean;
  show_download_links: boolean;
}

export interface PortfolioConfiguration {
  basic: {
    title: string;
    subtitle: string;
    description: string;
    slug: string;
    status: 'active' | 'inactive' | 'maintenance';
    language: 'es' | 'en';
    show_on_menu: boolean;
  };
  hero: PortfolioHeroSection;
  display: PortfolioDisplayConfig;
  project: PortfolioProjectConfig;
  projects: PortfolioProject[];
  categories: any[];
  sections: any[];
  testimonials: any[];
  pagination: any;
  seo: any;
  metadata: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
  };
}

interface PortfolioPageEditorProps {
  slug: string;
  onSave: (data: PortfolioConfiguration) => Promise<void>;
  onPreview: (data: PortfolioConfiguration) => void;
  initialData?: Partial<PortfolioConfiguration>;
  readOnly?: boolean;
}

export const PortfolioPageEditor: React.FC<PortfolioPageEditorProps> = ({
  slug,
  onSave,
  onPreview,
  initialData,
  readOnly = false
}) => {
  const [config, setConfig] = useState<PortfolioConfiguration>({
    basic: {
      title: 'Nuestro Portfolio',
      subtitle: 'Proyectos de Excelencia',
      description: 'Descubre nuestros proyectos más destacados en infraestructura y gestión integral de proyectos.',
      slug: 'portfolio',
      status: 'active',
      language: 'es',
      show_on_menu: true
    },
    hero: {
      title: 'Portfolio de Proyectos',
      subtitle: 'Transformando Ideas en Realidad',
      description: 'Más de una década creando infraestructura que transforma comunidades y genera valor sostenible.',
      show_stats: true,
      show_featured_projects: true,
      featured_projects_count: 6,
      show_categories_filter: true,
      show_search: true,
      stats: [
        {
          label: 'Proyectos Completados',
          value: '150',
          unit: '+',
          description: 'Proyectos exitosamente entregados'
        },
        {
          label: 'Clientes Satisfechos',
          value: '85',
          unit: '+',
          description: 'Clientes que confían en nosotros'
        },
        {
          label: 'Años de Experiencia',
          value: '15',
          unit: '+',
          description: 'Años construyendo el futuro'
        },
        {
          label: 'Millones Gestionados',
          value: '500',
          unit: 'M$',
          description: 'En proyectos de infraestructura'
        }
      ]
    },
    display: {
      layout: 'masonry',
      projects_per_page: 12,
      show_categories_filter: true,
      show_status_filter: true,
      show_date_filter: true,
      show_search: true,
      grid_columns: 3,
      card_style: 'modern',
      show_project_images: true,
      show_project_meta: true,
      show_client_info: true,
      show_status_badges: true,
      show_category_tags: true,
      image_aspect_ratio: '16:9'
    },
    project: {
      show_breadcrumbs: true,
      show_project_navigation: true,
      show_project_meta: true,
      show_client_testimonial: true,
      show_related_projects: true,
      related_projects_count: 3,
      show_gallery: true,
      gallery_layout: 'carousel',
      show_project_timeline: true,
      show_team_info: false,
      show_results_metrics: true,
      show_technologies_used: true,
      show_awards: true,
      show_download_links: false
    },
    projects: [],
    categories: [],
    sections: [],
    testimonials: [],
    pagination: {},
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
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);

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

    if (config.display.projects_per_page < 1 || config.display.projects_per_page > 50) {
      errors.projects_per_page = 'Proyectos por página debe estar entre 1 y 50';
    }

    if (config.display.grid_columns < 1 || config.display.grid_columns > 6) {
      errors.grid_columns = 'Columnas debe estar entre 1 y 6';
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
      console.error('Error saving portfolio config:', error);
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

  // Gestión de proyectos
  const addProject = (projectData: Partial<PortfolioProject>) => {
    const newProject: PortfolioProject = {
      id: Date.now().toString(),
      title: projectData.title || '',
      slug: projectData.slug || '',
      description: projectData.description || '',
      short_description: projectData.short_description || '',
      client: projectData.client || '',
      location: projectData.location || '',
      status: 'completed',
      featured: false,
      order: config.projects.length,
      category_ids: [],
      start_date: new Date().toISOString().split('T')[0],
      images: [],
      technologies: [],
      challenges: [],
      solutions: [],
      results: [],
      testimonials: [],
      awards: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin',
        tags: []
      },
      ...projectData
    };

    updateConfig('projects', [...config.projects, newProject]);
    setShowAddProjectForm(false);
  };

  const updateProject = (projectId: string, updates: Partial<PortfolioProject>) => {
    const updatedProjects = config.projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            ...updates,
            metadata: {
              ...project.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : project
    );
    updateConfig('projects', updatedProjects);
    setEditingProject(null);
  };

  const deleteProject = (projectId: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      const updatedProjects = config.projects.filter(project => project.id !== projectId);
      updateConfig('projects', updatedProjects);
    }
  };

  const toggleProjectFeatured = (projectId: string) => {
    const project = config.projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { featured: !project.featured });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'planned': return 'Planificado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Gestiona proyectos, categorías y configuración del portfolio
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Visualización
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Secciones
          </TabsTrigger>
          <TabsTrigger value="pagination" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Paginación
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
              <CardTitle>Configuración Básica del Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={config.basic.title}
                    onChange={(e) => updateConfig('basic.title', e.target.value)}
                    placeholder="Nuestro Portfolio"
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
                    placeholder="portfolio"
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
                  placeholder="Proyectos de Excelencia"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={config.basic.description}
                  onChange={(e) => updateConfig('basic.description', e.target.value)}
                  placeholder="Descripción del portfolio"
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
              <CardTitle>Sección Hero del Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Título Hero</label>
                <Input
                  value={config.hero.title}
                  onChange={(e) => updateConfig('hero.title', e.target.value)}
                  placeholder="Portfolio de Proyectos"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo Hero</label>
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                  placeholder="Transformando Ideas en Realidad"
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
                    <label className="text-sm">Proyectos Destacados</label>
                    <Switch
                      checked={config.hero.show_featured_projects}
                      onCheckedChange={(checked) => updateConfig('hero.show_featured_projects', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Filtro de Categorías</label>
                    <Switch
                      checked={config.hero.show_categories_filter}
                      onCheckedChange={(checked) => updateConfig('hero.show_categories_filter', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Buscador</label>
                    <Switch
                      checked={config.hero.show_search}
                      onCheckedChange={(checked) => updateConfig('hero.show_search', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {config.hero.show_featured_projects && (
                  <div>
                    <label className="text-sm font-medium">Cantidad Proyectos Destacados</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={config.hero.featured_projects_count}
                      onChange={(e) => updateConfig('hero.featured_projects_count', Number(e.target.value))}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </div>

              {/* Estadísticas configurables */}
              {config.hero.show_stats && (
                <div className="space-y-4">
                  <h4 className="font-medium">Estadísticas del Portfolio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.hero.stats.map((stat, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Etiqueta</label>
                            <Input
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...config.hero.stats];
                                newStats[index] = { ...stat, label: e.target.value };
                                updateConfig('hero.stats', newStats);
                              }}
                              disabled={readOnly}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-sm font-medium">Valor</label>
                              <Input
                                value={stat.value}
                                onChange={(e) => {
                                  const newStats = [...config.hero.stats];
                                  newStats[index] = { ...stat, value: e.target.value };
                                  updateConfig('hero.stats', newStats);
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Unidad</label>
                              <Input
                                value={stat.unit || ''}
                                onChange={(e) => {
                                  const newStats = [...config.hero.stats];
                                  newStats[index] = { ...stat, unit: e.target.value };
                                  updateConfig('hero.stats', newStats);
                                }}
                                placeholder="+, %, M$"
                                disabled={readOnly}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gestión de Proyectos */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Gestión de Proyectos
                  <Badge variant="secondary">{config.projects.length}</Badge>
                </CardTitle>
                <Button
                  onClick={() => setShowAddProjectForm(true)}
                  size="sm"
                  disabled={readOnly}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No hay proyectos configurados</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddProjectForm(true)}
                    className="mt-2"
                    disabled={readOnly}
                  >
                    Crear primer proyecto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.projects.map((project) => (
                    <Card key={project.id} className={project.featured ? 'ring-2 ring-yellow-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {project.images.length > 0 ? (
                                <img
                                  src={project.images.find(img => img.is_main)?.url || project.images[0]?.url}
                                  alt={project.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <Image className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{project.title}</h4>
                                <Badge className={getStatusColor(project.status)}>
                                  {getStatusLabel(project.status)}
                                </Badge>
                                {project.featured && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Star className="w-3 h-3 mr-1" />
                                    Destacado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{project.short_description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {project.client}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {project.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(project.start_date).getFullYear()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProjectFeatured(project.id)}
                              title={project.featured ? "Quitar destacado" : "Destacar"}
                              disabled={readOnly}
                            >
                              <Star className={`w-4 h-4 ${project.featured ? 'text-yellow-500 fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProject(project.id)}
                              title="Editar"
                              disabled={readOnly}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Eliminar"
                              disabled={readOnly}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración de Visualización */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Layout Principal</label>
                  <select
                    value={config.display.layout}
                    onChange={(e) => updateConfig('display.layout', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="grid">Grid</option>
                    <option value="masonry">Masonry</option>
                    <option value="list">Lista</option>
                    <option value="timeline">Timeline</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Estilo de Tarjeta</label>
                  <select
                    value={config.display.card_style}
                    onChange={(e) => updateConfig('display.card_style', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="minimal">Minimal</option>
                    <option value="detailed">Detallado</option>
                    <option value="magazine">Magazine</option>
                    <option value="modern">Moderno</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Proyectos por Página</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={config.display.projects_per_page}
                    onChange={(e) => updateConfig('display.projects_per_page', Number(e.target.value))}
                    className={validationErrors.projects_per_page ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Columnas (Grid)</label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={config.display.grid_columns}
                    onChange={(e) => updateConfig('display.grid_columns', Number(e.target.value))}
                    className={validationErrors.grid_columns ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Aspecto de Imagen</label>
                  <select
                    value={config.display.image_aspect_ratio}
                    onChange={(e) => updateConfig('display.image_aspect_ratio', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="1:1">1:1</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Filtros y Búsqueda</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Filtro de Categorías</label>
                    <Switch
                      checked={config.display.show_categories_filter}
                      onCheckedChange={(checked) => updateConfig('display.show_categories_filter', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Filtro de Estado</label>
                    <Switch
                      checked={config.display.show_status_filter}
                      onCheckedChange={(checked) => updateConfig('display.show_status_filter', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Filtro de Fecha</label>
                    <Switch
                      checked={config.display.show_date_filter}
                      onCheckedChange={(checked) => updateConfig('display.show_date_filter', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Buscador</label>
                    <Switch
                      checked={config.display.show_search}
                      onCheckedChange={(checked) => updateConfig('display.show_search', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Elementos de la Tarjeta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Imágenes del Proyecto</label>
                    <Switch
                      checked={config.display.show_project_images}
                      onCheckedChange={(checked) => updateConfig('display.show_project_images', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Metadatos</label>
                    <Switch
                      checked={config.display.show_project_meta}
                      onCheckedChange={(checked) => updateConfig('display.show_project_meta', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Info del Cliente</label>
                    <Switch
                      checked={config.display.show_client_info}
                      onCheckedChange={(checked) => updateConfig('display.show_client_info', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Badges de Estado</label>
                    <Switch
                      checked={config.display.show_status_badges}
                      onCheckedChange={(checked) => updateConfig('display.show_status_badges', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Tags de Categoría</label>
                    <Switch
                      checked={config.display.show_category_tags}
                      onCheckedChange={(checked) => updateConfig('display.show_category_tags', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categories">
          <CategoryManager
            categories={config.categories}
            onChange={(categories) => updateConfig('categories', categories)}
            allowReordering={!readOnly}
            contextType="portfolio"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Secciones */}
        <TabsContent value="sections">
          <ContentSectionsManager
            sections={config.sections}
            onChange={(sections) => updateConfig('sections', sections)}
            allowReordering={!readOnly}
            contextType="portfolio"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Paginación */}
        <TabsContent value="pagination">
          <PaginationConfig
            config={config.pagination}
            onChange={(pagination) => updateConfig('pagination', pagination)}
            contextType="portfolio"
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <SEOAdvancedEditor
            data={config.seo}
            onChange={(seo) => updateConfig('seo', seo)}
            contextType="portfolio"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};