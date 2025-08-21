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
  FAQManager,
  ContactInfoManager
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
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Star,
  Award
} from 'lucide-react';

// Interfaces específicas para Services
export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  icon?: string;
  image?: string;
  price_range?: string;
  duration?: string;
  status: 'active' | 'inactive' | 'coming_soon';
  featured: boolean;
  order: number;
  category_ids?: string[];
  benefits?: string[];
  deliverables?: string[];
  process_steps?: Array<{
    step: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  requirements?: string[];
  faqs?: string[];
  testimonials?: string[];
  portfolio_items?: string[];
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
}

export interface ServicesHeroSection {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_services_grid: boolean;
  show_featured_services: boolean;
  featured_services_count: number;
  show_cta_button: boolean;
  cta_text?: string;
  cta_link?: string;
}

export interface ServicesDisplayConfig {
  layout: 'grid' | 'list' | 'cards' | 'detailed';
  services_per_page: number;
  show_categories_filter: boolean;
  show_price_filter: boolean;
  show_search: boolean;
  grid_columns: number;
  card_style: 'simple' | 'elevated' | 'bordered' | 'gradient';
  show_service_icons: boolean;
  show_service_images: boolean;
  show_pricing: boolean;
  show_duration: boolean;
  show_benefits_preview: boolean;
  benefits_preview_count: number;
}

export interface ServiceDetailConfig {
  show_breadcrumbs: boolean;
  show_service_meta: boolean;
  show_related_services: boolean;
  related_services_count: number;
  show_process_steps: boolean;
  show_requirements: boolean;
  show_deliverables: boolean;
  show_portfolio_examples: boolean;
  show_testimonials: boolean;
  show_faqs: boolean;
  show_contact_form: boolean;
  contact_form_fields: string[];
}

export interface ServicesConfiguration {
  basic: {
    title: string;
    subtitle: string;
    description: string;
    slug: string;
    status: 'active' | 'inactive' | 'maintenance';
    language: 'es' | 'en';
    show_on_menu: boolean;
  };
  hero: ServicesHeroSection;
  display: ServicesDisplayConfig;
  detail: ServiceDetailConfig;
  services: ServiceItem[];
  categories: any[];
  sections: any[];
  testimonials: any[];
  faqs: any[];
  contact_info: any[];
  seo: any;
  metadata: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
  };
}

interface ServicesPageEditorProps {
  slug: string;
  onSave: (data: ServicesConfiguration) => Promise<void>;
  onPreview: (data: ServicesConfiguration) => void;
  initialData?: Partial<ServicesConfiguration>;
  readOnly?: boolean;
}

export const ServicesPageEditor: React.FC<ServicesPageEditorProps> = ({
  slug,
  onSave,
  onPreview,
  initialData,
  readOnly = false
}) => {
  const [config, setConfig] = useState<ServicesConfiguration>({
    basic: {
      title: 'Nuestros Servicios',
      subtitle: 'Soluciones integrales en infraestructura',
      description: 'Ofrecemos servicios especializados en gestión integral de proyectos de infraestructura.',
      slug: 'services',
      status: 'active',
      language: 'es',
      show_on_menu: true
    },
    hero: {
      title: 'Servicios de Excelencia',
      subtitle: 'Soluciones Integrales en Infraestructura',
      description: 'Transformamos ideas en realidad con nuestros servicios especializados en gestión de proyectos de infraestructura.',
      show_services_grid: true,
      show_featured_services: true,
      featured_services_count: 4,
      show_cta_button: true,
      cta_text: 'Solicitar Cotización',
      cta_link: '/contact'
    },
    display: {
      layout: 'grid',
      services_per_page: 12,
      show_categories_filter: true,
      show_price_filter: false,
      show_search: true,
      grid_columns: 3,
      card_style: 'elevated',
      show_service_icons: true,
      show_service_images: true,
      show_pricing: true,
      show_duration: true,
      show_benefits_preview: true,
      benefits_preview_count: 3
    },
    detail: {
      show_breadcrumbs: true,
      show_service_meta: true,
      show_related_services: true,
      related_services_count: 3,
      show_process_steps: true,
      show_requirements: true,
      show_deliverables: true,
      show_portfolio_examples: true,
      show_testimonials: true,
      show_faqs: true,
      show_contact_form: true,
      contact_form_fields: ['name', 'email', 'phone', 'company', 'message', 'service']
    },
    services: [],
    categories: [],
    sections: [],
    testimonials: [],
    faqs: [],
    contact_info: [],
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
  const [editingService, setEditingService] = useState<string | null>(null);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);

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

    if (config.display.services_per_page < 1 || config.display.services_per_page > 50) {
      errors.services_per_page = 'Servicios por página debe estar entre 1 y 50';
    }

    if (config.display.grid_columns < 1 || config.display.grid_columns > 5) {
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
      console.error('Error saving services config:', error);
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

  // Gestión de servicios
  const addService = (serviceData: Partial<ServiceItem>) => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: serviceData.name || '',
      slug: serviceData.slug || '',
      description: serviceData.description || '',
      short_description: serviceData.short_description || '',
      status: 'active',
      featured: false,
      order: config.services.length,
      benefits: [],
      deliverables: [],
      process_steps: [],
      requirements: [],
      faqs: [],
      testimonials: [],
      portfolio_items: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin',
        version: '1.0.0',
        tags: []
      },
      ...serviceData
    };

    updateConfig('services', [...config.services, newService]);
    setShowAddServiceForm(false);
  };

  const updateService = (serviceId: string, updates: Partial<ServiceItem>) => {
    const updatedServices = config.services.map(service =>
      service.id === serviceId
        ? {
            ...service,
            ...updates,
            metadata: {
              ...service.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : service
    );
    updateConfig('services', updatedServices);
    setEditingService(null);
  };

  const deleteService = (serviceId: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      const updatedServices = config.services.filter(service => service.id !== serviceId);
      updateConfig('services', updatedServices);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Servicios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los servicios, configuración y apariencia de la página de servicios
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
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Secciones
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Testimonios
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            FAQ
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
                    placeholder="Nuestros Servicios"
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
                    placeholder="services"
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
                  placeholder="Soluciones integrales en infraestructura"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={config.basic.description}
                  onChange={(e) => updateConfig('basic.description', e.target.value)}
                  placeholder="Descripción de la página de servicios"
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
                  placeholder="Servicios de Excelencia"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo Hero</label>
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                  placeholder="Soluciones Integrales en Infraestructura"
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
                <h4 className="font-medium">Elementos del Hero</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Grid de Servicios</label>
                    <Switch
                      checked={config.hero.show_services_grid}
                      onCheckedChange={(checked) => updateConfig('hero.show_services_grid', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Servicios Destacados</label>
                    <Switch
                      checked={config.hero.show_featured_services}
                      onCheckedChange={(checked) => updateConfig('hero.show_featured_services', checked)}
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

                  {config.hero.show_featured_services && (
                    <div>
                      <label className="text-sm font-medium">Cantidad Destacados</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.hero.featured_services_count}
                        onChange={(e) => updateConfig('hero.featured_services_count', Number(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>

                {config.hero.show_cta_button && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Texto CTA</label>
                      <Input
                        value={config.hero.cta_text || ''}
                        onChange={(e) => updateConfig('hero.cta_text', e.target.value)}
                        placeholder="Solicitar Cotización"
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Enlace CTA</label>
                      <Input
                        value={config.hero.cta_link || ''}
                        onChange={(e) => updateConfig('hero.cta_link', e.target.value)}
                        placeholder="/contact"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gestión de Servicios */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Gestión de Servicios
                  <Badge variant="secondary">{config.services.length}</Badge>
                </CardTitle>
                <Button
                  onClick={() => setShowAddServiceForm(true)}
                  size="sm"
                  disabled={readOnly}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuración de visualización */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-4">Configuración de Visualización</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Layout</label>
                      <select
                        value={config.display.layout}
                        onChange={(e) => updateConfig('display.layout', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={readOnly}
                      >
                        <option value="grid">Grid</option>
                        <option value="list">Lista</option>
                        <option value="cards">Tarjetas</option>
                        <option value="detailed">Detallado</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Servicios por página</label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={config.display.services_per_page}
                        onChange={(e) => updateConfig('display.services_per_page', Number(e.target.value))}
                        className={validationErrors.services_per_page ? 'border-red-500' : ''}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Columnas (Grid)</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={config.display.grid_columns}
                        onChange={(e) => updateConfig('display.grid_columns', Number(e.target.value))}
                        className={validationErrors.grid_columns ? 'border-red-500' : ''}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Filtro Categorías</label>
                      <Switch
                        checked={config.display.show_categories_filter}
                        onCheckedChange={(checked) => updateConfig('display.show_categories_filter', checked)}
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

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Mostrar Precios</label>
                      <Switch
                        checked={config.display.show_pricing}
                        onCheckedChange={(checked) => updateConfig('display.show_pricing', checked)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de servicios */}
              {config.services.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No hay servicios configurados</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddServiceForm(true)}
                    className="mt-2"
                    disabled={readOnly}
                  >
                    Crear primer servicio
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.services.map((service, index) => (
                    <Card key={service.id} className={service.featured ? 'ring-2 ring-yellow-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-[#003F6F] text-white rounded-lg flex items-center justify-center">
                              <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{service.name}</h4>
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                  {service.status}
                                </Badge>
                                {service.featured && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Award className="w-3 h-3 mr-1" />
                                    Destacado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{service.short_description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingService(service.id)}
                              disabled={readOnly}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteService(service.id)}
                              className="text-red-600 hover:text-red-700"
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

        {/* Tab: Categorías */}
        <TabsContent value="categories">
          <CategoryManager
            categories={config.categories}
            onChange={(categories) => updateConfig('categories', categories)}
            allowReordering={!readOnly}
            contextType="services"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Secciones */}
        <TabsContent value="sections">
          <ContentSectionsManager
            sections={config.sections}
            onChange={(sections) => updateConfig('sections', sections)}
            allowReordering={!readOnly}
            contextType="services"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Testimonios */}
        <TabsContent value="testimonials">
          <TestimonialsManager
            testimonials={config.testimonials}
            onChange={(testimonials) => updateConfig('testimonials', testimonials)}
            allowReordering={!readOnly}
            contextType="services"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: FAQ */}
        <TabsContent value="faq">
          <FAQManager
            faqs={config.faqs}
            onChange={(faqs) => updateConfig('faqs', faqs)}
            allowReordering={!readOnly}
            contextType="services"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <SEOAdvancedEditor
            data={config.seo}
            onChange={(seo) => updateConfig('seo', seo)}
            contextType="services"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};