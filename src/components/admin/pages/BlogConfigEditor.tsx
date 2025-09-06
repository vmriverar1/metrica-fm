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
  PaginationConfig,
  ContentSectionsManager
} from '@/components/admin/shared';
import { 
  Save, 
  Eye, 
  FileText, 
  Settings, 
  Users, 
  Grid, 
  Search,
  Calendar,
  Tag,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Interfaces específicas para Blog
export interface BlogHeroSection {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_search: boolean;
  show_categories: boolean;
  show_latest_posts: boolean;
  latest_posts_count: number;
}

export interface BlogSidebarConfig {
  show_sidebar: boolean;
  position: 'left' | 'right';
  sticky: boolean;
  width: 'sm' | 'md' | 'lg';
  components: {
    search: boolean;
    categories: boolean;
    recent_posts: boolean;
    popular_posts: boolean;
    tags: boolean;
    archive: boolean;
    newsletter: boolean;
  };
  recent_posts_count: number;
  popular_posts_count: number;
  tags_limit: number;
}

export interface BlogPostConfig {
  show_author: boolean;
  show_date: boolean;
  show_reading_time: boolean;
  show_tags: boolean;
  show_categories: boolean;
  show_share_buttons: boolean;
  show_comments: boolean;
  show_related_posts: boolean;
  related_posts_count: number;
  excerpt_length: number;
  date_format: 'relative' | 'absolute' | 'both';
  image_aspect_ratio: '16:9' | '4:3' | '1:1' | 'auto';
}

export interface BlogListingConfig {
  layout: 'grid' | 'list' | 'masonry' | 'magazine';
  posts_per_page: number;
  show_featured_section: boolean;
  featured_posts_count: number;
  show_excerpt: boolean;
  show_read_more: boolean;
  show_post_meta: boolean;
  grid_columns: number;
  card_style: 'simple' | 'elevated' | 'bordered' | 'gradient';
}

export interface BlogConfiguration {
  basic: {
    title: string;
    subtitle: string;
    description: string;
    slug: string;
    status: 'active' | 'inactive' | 'maintenance';
    language: 'es' | 'en';
    timezone: string;
  };
  hero: BlogHeroSection;
  listing: BlogListingConfig;
  post: BlogPostConfig;
  sidebar: BlogSidebarConfig;
  categories: any[];
  sections: any[];
  pagination: any;
  seo: any;
  metadata: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
  };
}

interface BlogConfigEditorProps {
  slug: string;
  onSave: (data: BlogConfiguration) => Promise<void>;
  onPreview: (data: BlogConfiguration) => void;
  initialData?: Partial<BlogConfiguration>;
  readOnly?: boolean;
}

export const BlogConfigEditor: React.FC<BlogConfigEditorProps> = ({
  slug,
  onSave,
  onPreview,
  initialData,
  readOnly = false
}) => {
  const [config, setConfig] = useState<BlogConfiguration>({
    basic: {
      title: 'Blog Métrica FM',
      subtitle: 'Noticias, insights y actualizaciones',
      description: 'Mantente informado sobre las últimas tendencias en infraestructura y gestión de proyectos.',
      slug: 'blog',
      status: 'active',
      language: 'es',
      timezone: 'America/Lima'
    },
    hero: {
      title: 'Blog Métrica FM',
      subtitle: 'Insights y Experiencias en Infraestructura',
      description: 'Descubre las últimas tendencias, casos de éxito y conocimientos especializados en gestión de proyectos de infraestructura.',
      show_search: true,
      show_categories: true,
      show_latest_posts: true,
      latest_posts_count: 3
    },
    listing: {
      layout: 'grid',
      posts_per_page: 12,
      show_featured_section: true,
      featured_posts_count: 3,
      show_excerpt: true,
      show_read_more: true,
      show_post_meta: true,
      grid_columns: 3,
      card_style: 'elevated'
    },
    post: {
      show_author: true,
      show_date: true,
      show_reading_time: true,
      show_tags: true,
      show_categories: true,
      show_share_buttons: true,
      show_comments: false,
      show_related_posts: true,
      related_posts_count: 3,
      excerpt_length: 160,
      date_format: 'relative',
      image_aspect_ratio: '16:9'
    },
    sidebar: {
      show_sidebar: true,
      position: 'right',
      sticky: true,
      width: 'md',
      components: {
        search: true,
        categories: true,
        recent_posts: true,
        popular_posts: true,
        tags: true,
        archive: true,
        newsletter: false
      },
      recent_posts_count: 5,
      popular_posts_count: 5,
      tags_limit: 20
    },
    categories: [],
    sections: [],
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

    if (config.listing.posts_per_page < 1 || config.listing.posts_per_page > 50) {
      errors.posts_per_page = 'Posts por página debe estar entre 1 y 50';
    }

    if (config.listing.grid_columns < 1 || config.listing.grid_columns > 5) {
      errors.grid_columns = 'Columnas debe estar entre 1 y 5';
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
      console.error('Error saving blog config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save cada 30 segundos si hay cambios
  useEffect(() => {
    if (readOnly) return;

    const interval = setInterval(() => {
      if (validateConfig()) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [config, readOnly]);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Blog</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la configuración, categorías y apariencia del blog
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
          <TabsTrigger value="listing" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Listado
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Secciones
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
              <CardTitle>Configuración Básica del Blog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Título del Blog *</label>
                  <Input
                    value={config.basic.title}
                    onChange={(e) => updateConfig('basic.title', e.target.value)}
                    placeholder="Blog Métrica FM"
                    className={validationErrors.title ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Slug del Blog *</label>
                  <Input
                    value={config.basic.slug}
                    onChange={(e) => updateConfig('basic.slug', e.target.value)}
                    placeholder="blog"
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
                  placeholder="Noticias, insights y actualizaciones"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={config.basic.description}
                  onChange={(e) => updateConfig('basic.description', e.target.value)}
                  placeholder="Descripción del blog para SEO y metadatos"
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

                <div>
                  <label className="text-sm font-medium">Zona Horaria</label>
                  <select
                    value={config.basic.timezone}
                    onChange={(e) => updateConfig('basic.timezone', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="America/Lima">Lima (UTC-5)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración Hero */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero del Blog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Título Hero</label>
                <Input
                  value={config.hero.title}
                  onChange={(e) => updateConfig('hero.title', e.target.value)}
                  placeholder="Blog Métrica FM"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo Hero</label>
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                  placeholder="Insights y Experiencias en Infraestructura"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Color de Fondo</label>
                  <Input
                    type="color"
                    value={config.hero.background_color || '#ffffff'}
                    onChange={(e) => updateConfig('hero.background_color', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Color de Texto</label>
                  <Input
                    type="color"
                    value={config.hero.text_color || '#000000'}
                    onChange={(e) => updateConfig('hero.text_color', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Elementos a Mostrar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Buscador</label>
                    <Switch
                      checked={config.hero.show_search}
                      onCheckedChange={(checked) => updateConfig('hero.show_search', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Categorías</label>
                    <Switch
                      checked={config.hero.show_categories}
                      onCheckedChange={(checked) => updateConfig('hero.show_categories', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Últimos Posts</label>
                    <Switch
                      checked={config.hero.show_latest_posts}
                      onCheckedChange={(checked) => updateConfig('hero.show_latest_posts', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  {config.hero.show_latest_posts && (
                    <div>
                      <label className="text-sm font-medium">Cantidad de Posts</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.hero.latest_posts_count}
                        onChange={(e) => updateConfig('hero.latest_posts_count', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración Listado */}
        <TabsContent value="listing">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Listado de Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Layout</label>
                  <select
                    value={config.listing.layout}
                    onChange={(e) => updateConfig('listing.layout', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="grid">Grid</option>
                    <option value="list">Lista</option>
                    <option value="masonry">Masonry</option>
                    <option value="magazine">Magazine</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Estilo de Tarjeta</label>
                  <select
                    value={config.listing.card_style}
                    onChange={(e) => updateConfig('listing.card_style', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="simple">Simple</option>
                    <option value="elevated">Elevado</option>
                    <option value="bordered">Con borde</option>
                    <option value="gradient">Gradiente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Posts por Página</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={config.listing.posts_per_page}
                    onChange={(e) => updateConfig('listing.posts_per_page', Number(e.target.value))}
                    className={validationErrors.posts_per_page ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                  {validationErrors.posts_per_page && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.posts_per_page}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Columnas (Grid)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={config.listing.grid_columns}
                    onChange={(e) => updateConfig('listing.grid_columns', Number(e.target.value))}
                    className={validationErrors.grid_columns ? 'border-red-500' : ''}
                    disabled={readOnly}
                  />
                  {validationErrors.grid_columns && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.grid_columns}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Posts Destacados</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={config.listing.featured_posts_count}
                    onChange={(e) => updateConfig('listing.featured_posts_count', Number(e.target.value))}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Elementos del Post</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Sección Destacados</label>
                    <Switch
                      checked={config.listing.show_featured_section}
                      onCheckedChange={(checked) => updateConfig('listing.show_featured_section', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Extracto</label>
                    <Switch
                      checked={config.listing.show_excerpt}
                      onCheckedChange={(checked) => updateConfig('listing.show_excerpt', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Botón "Leer Más"</label>
                    <Switch
                      checked={config.listing.show_read_more}
                      onCheckedChange={(checked) => updateConfig('listing.show_read_more', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Metadatos del Post</label>
                    <Switch
                      checked={config.listing.show_post_meta}
                      onCheckedChange={(checked) => updateConfig('listing.show_post_meta', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración Posts */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Individual de Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Metadatos del Post</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Autor</label>
                    <Switch
                      checked={config.post.show_author}
                      onCheckedChange={(checked) => updateConfig('post.show_author', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Fecha</label>
                    <Switch
                      checked={config.post.show_date}
                      onCheckedChange={(checked) => updateConfig('post.show_date', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Tiempo de Lectura</label>
                    <Switch
                      checked={config.post.show_reading_time}
                      onCheckedChange={(checked) => updateConfig('post.show_reading_time', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Tags</label>
                    <Switch
                      checked={config.post.show_tags}
                      onCheckedChange={(checked) => updateConfig('post.show_tags', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mostrar Categorías</label>
                    <Switch
                      checked={config.post.show_categories}
                      onCheckedChange={(checked) => updateConfig('post.show_categories', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Botones de Compartir</label>
                    <Switch
                      checked={config.post.show_share_buttons}
                      onCheckedChange={(checked) => updateConfig('post.show_share_buttons', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Formato de Fecha</label>
                  <select
                    value={config.post.date_format}
                    onChange={(e) => updateConfig('post.date_format', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="relative">Relativo (hace 2 días)</option>
                    <option value="absolute">Absoluto (15 Feb 2024)</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Aspecto de Imagen</label>
                  <select
                    value={config.post.image_aspect_ratio}
                    onChange={(e) => updateConfig('post.image_aspect_ratio', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={readOnly}
                  >
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="4:3">4:3 (Clásico)</option>
                    <option value="1:1">1:1 (Cuadrado)</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Longitud del Extracto</label>
                  <Input
                    type="number"
                    min="50"
                    max="500"
                    value={config.post.excerpt_length}
                    onChange={(e) => updateConfig('post.excerpt_length', Number(e.target.value))}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Posts Relacionados</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={config.post.related_posts_count}
                    onChange={(e) => updateConfig('post.related_posts_count', Number(e.target.value))}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Funcionalidades Adicionales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Sistema de Comentarios</label>
                    <Switch
                      checked={config.post.show_comments}
                      onCheckedChange={(checked) => updateConfig('post.show_comments', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Posts Relacionados</label>
                    <Switch
                      checked={config.post.show_related_posts}
                      onCheckedChange={(checked) => updateConfig('post.show_related_posts', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Sidebar */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configuración del Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mostrar Sidebar</label>
                <Switch
                  checked={config.sidebar.show_sidebar}
                  onCheckedChange={(checked) => updateConfig('sidebar.show_sidebar', checked)}
                  disabled={readOnly}
                />
              </div>

              {config.sidebar.show_sidebar && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Posición</label>
                      <select
                        value={config.sidebar.position}
                        onChange={(e) => updateConfig('sidebar.position', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={readOnly}
                      >
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ancho</label>
                      <select
                        value={config.sidebar.width}
                        onChange={(e) => updateConfig('sidebar.width', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={readOnly}
                      >
                        <option value="sm">Pequeño</option>
                        <option value="md">Mediano</option>
                        <option value="lg">Grande</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Sticky</label>
                      <Switch
                        checked={config.sidebar.sticky}
                        onCheckedChange={(checked) => updateConfig('sidebar.sticky', checked)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Componentes del Sidebar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(config.sidebar.components).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-sm capitalize">
                            {key.replace('_', ' ')}
                          </label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => updateConfig(`sidebar.components.${key}`, checked)}
                            disabled={readOnly}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Posts Recientes</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={config.sidebar.recent_posts_count}
                        onChange={(e) => updateConfig('sidebar.recent_posts_count', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Posts Populares</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={config.sidebar.popular_posts_count}
                        onChange={(e) => updateConfig('sidebar.popular_posts_count', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Límite de Tags</label>
                      <Input
                        type="number"
                        min="5"
                        max="50"
                        value={config.sidebar.tags_limit}
                        onChange={(e) => updateConfig('sidebar.tags_limit', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categories">
          <CategoryManager
            categories={config.categories}
            onChange={(categories) => updateConfig('categories', categories)}
            allowReordering={!readOnly}
            contextType="blog"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Secciones */}
        <TabsContent value="sections">
          <ContentSectionsManager
            sections={config.sections}
            onChange={(sections) => updateConfig('sections', sections)}
            allowReordering={!readOnly}
            contextType="blog"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <SEOAdvancedEditor
            data={config.seo}
            onChange={(seo) => updateConfig('seo', seo)}
            contextType="blog"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};