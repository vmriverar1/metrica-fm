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
  Briefcase,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Building,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

// Interfaces específicas para Careers
export interface JobPosition {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary_range?: {
    min: number;
    max: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have?: string[];
  benefits: string[];
  status: 'active' | 'paused' | 'filled' | 'closed';
  featured: boolean;
  urgent: boolean;
  remote_allowed: boolean;
  travel_required: boolean;
  order: number;
  category_ids: string[];
  skills_required: string[];
  education_required?: string;
  languages?: Array<{
    language: string;
    level: 'basic' | 'intermediate' | 'advanced' | 'native';
  }>;
  application_process: {
    application_deadline?: string;
    contact_email?: string;
    external_url?: string;
    requires_portfolio: boolean;
    requires_cover_letter: boolean;
    custom_questions?: Array<{
      question: string;
      type: 'text' | 'textarea' | 'select' | 'multiselect';
      required: boolean;
      options?: string[];
    }>;
  };
  team_info?: {
    team_size: number;
    reports_to: string;
    team_description: string;
  };
  metadata?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    views?: number;
    applications?: number;
    posted_date?: string;
    last_updated?: string;
  };
}

export interface CareersHeroSection {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_job_stats: boolean;
  show_open_positions: boolean;
  open_positions_count: number;
  show_departments: boolean;
  show_search: boolean;
  cta_text?: string;
  cta_link?: string;
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
    description?: string;
  }>;
}

export interface CareersCompanyInfo {
  show_company_culture: boolean;
  culture_title: string;
  culture_description: string;
  values: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  show_benefits: boolean;
  benefits_title: string;
  benefits_description: string;
  benefits_list: Array<{
    category: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  }>;
  show_office_info: boolean;
  offices: Array<{
    name: string;
    address: string;
    description?: string;
    image?: string;
    amenities?: string[];
  }>;
}

export interface CareersApplicationConfig {
  application_form_fields: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
  file_upload_allowed: boolean;
  max_file_size: string;
  allowed_file_types: string[];
  privacy_policy_required: boolean;
  terms_acceptance_required: boolean;
  auto_reply_enabled: boolean;
  auto_reply_template?: string;
  notification_email: string;
  application_confirmation_page?: string;
}

export interface CareersConfiguration {
  basic: {
    title: string;
    subtitle: string;
    description: string;
    slug: string;
    status: 'active' | 'inactive' | 'maintenance';
    language: 'es' | 'en';
    show_on_menu: boolean;
  };
  hero: CareersHeroSection;
  company_info: CareersCompanyInfo;
  application_config: CareersApplicationConfig;
  jobs: JobPosition[];
  categories: any[];
  sections: any[];
  testimonials: any[];
  faqs: any[];
  pagination: any;
  seo: any;
  metadata: {
    created_at?: string;
    updated_at?: string;
    author?: string;
    version?: string;
  };
}

interface CareersPageEditorProps {
  slug: string;
  onSave: (data: CareersConfiguration) => Promise<void>;
  onPreview: (data: CareersConfiguration) => void;
  initialData?: Partial<CareersConfiguration>;
  readOnly?: boolean;
}

export const CareersPageEditor: React.FC<CareersPageEditorProps> = ({
  slug,
  onSave,
  onPreview,
  initialData,
  readOnly = false
}) => {
  const [config, setConfig] = useState<CareersConfiguration>({
    basic: {
      title: 'Únete a Nuestro Equipo',
      subtitle: 'Construye tu Futuro Profesional',
      description: 'Descubre oportunidades de carrera en una empresa líder en infraestructura y gestión de proyectos.',
      slug: 'careers',
      status: 'active',
      language: 'es',
      show_on_menu: true
    },
    hero: {
      title: 'Construye tu Carrera con Nosotros',
      subtitle: 'Únete al Equipo que Transforma el Futuro',
      description: 'Buscamos profesionales apasionados que quieran crecer en un ambiente de innovación, excelencia y desarrollo continuo.',
      show_job_stats: true,
      show_open_positions: true,
      open_positions_count: 5,
      show_departments: true,
      show_search: true,
      cta_text: 'Ver Posiciones Abiertas',
      cta_link: '#jobs',
      stats: [
        {
          label: 'Posiciones Abiertas',
          value: '12',
          unit: '+',
          description: 'Oportunidades disponibles'
        },
        {
          label: 'Departamentos',
          value: '8',
          description: 'Áreas de especialización'
        },
        {
          label: 'Empleados',
          value: '150',
          unit: '+',
          description: 'Profesionales en el equipo'
        },
        {
          label: 'Años de Crecimiento',
          value: '15',
          unit: '+',
          description: 'De crecimiento continuo'
        }
      ]
    },
    company_info: {
      show_company_culture: true,
      culture_title: 'Nuestra Cultura',
      culture_description: 'En Métrica DIP creemos en el poder del trabajo en equipo, la innovación y el crecimiento personal.',
      values: [
        {
          title: 'Excelencia',
          description: 'Buscamos la excelencia en cada proyecto y proceso',
          icon: 'award'
        },
        {
          title: 'Innovación',
          description: 'Adoptamos nuevas tecnologías y metodologías',
          icon: 'lightbulb'
        },
        {
          title: 'Colaboración',
          description: 'Trabajamos juntos hacia objetivos comunes',
          icon: 'users'
        },
        {
          title: 'Integridad',
          description: 'Actuamos con transparencia y honestidad',
          icon: 'shield'
        }
      ],
      show_benefits: true,
      benefits_title: 'Beneficios y Ventajas',
      benefits_description: 'Ofrecemos un paquete integral de beneficios diseñado para apoyar tu crecimiento personal y profesional.',
      benefits_list: [
        {
          category: 'Salud y Bienestar',
          items: [
            { title: 'Seguro médico completo', description: 'Cobertura médica para ti y tu familia' },
            { title: 'Seguro dental', description: 'Atención odontológica integral' },
            { title: 'Programas de bienestar', description: 'Actividades para mantener un estilo de vida saludable' }
          ]
        },
        {
          category: 'Desarrollo Profesional',
          items: [
            { title: 'Capacitaciones', description: 'Cursos y certificaciones profesionales' },
            { title: 'Plan de carrera', description: 'Oportunidades claras de crecimiento' },
            { title: 'Mentoring', description: 'Acompañamiento de profesionales senior' }
          ]
        }
      ],
      show_office_info: true,
      offices: [
        {
          name: 'Oficina Principal - Lima',
          address: 'Av. El Derby 055, Santiago de Surco, Lima',
          description: 'Nuestra sede principal con instalaciones modernas',
          amenities: ['Estacionamiento', 'Cafetería', 'Salas de reuniones', 'Área de descanso']
        }
      ]
    },
    application_config: {
      application_form_fields: [
        { field: 'name', label: 'Nombre completo', type: 'text', required: true },
        { field: 'email', label: 'Correo electrónico', type: 'email', required: true },
        { field: 'phone', label: 'Teléfono', type: 'tel', required: true },
        { field: 'position', label: 'Posición de interés', type: 'select', required: true },
        { field: 'experience', label: 'Años de experiencia', type: 'number', required: true },
        { field: 'cover_letter', label: 'Carta de presentación', type: 'textarea', required: false }
      ],
      file_upload_allowed: true,
      max_file_size: '5MB',
      allowed_file_types: ['.pdf', '.doc', '.docx'],
      privacy_policy_required: true,
      terms_acceptance_required: true,
      auto_reply_enabled: true,
      notification_email: 'rrhh@metricadip.com',
      application_confirmation_page: '/careers/application-received'
    },
    jobs: [],
    categories: [],
    sections: [],
    testimonials: [],
    faqs: [],
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
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [showAddJobForm, setShowAddJobForm] = useState(false);

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
      console.error('Error saving careers config:', error);
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

  // Gestión de trabajos
  const addJob = (jobData: Partial<JobPosition>) => {
    const newJob: JobPosition = {
      id: Date.now().toString(),
      title: jobData.title || '',
      slug: jobData.slug || '',
      department: jobData.department || '',
      location: jobData.location || 'Lima, Perú',
      employment_type: 'full_time',
      experience_level: 'mid',
      description: jobData.description || '',
      responsibilities: [],
      requirements: [],
      benefits: [],
      status: 'active',
      featured: false,
      urgent: false,
      remote_allowed: false,
      travel_required: false,
      order: config.jobs.length,
      category_ids: [],
      skills_required: [],
      application_process: {
        requires_portfolio: false,
        requires_cover_letter: true,
        custom_questions: []
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin',
        views: 0,
        applications: 0,
        posted_date: new Date().toISOString().split('T')[0]
      },
      ...jobData
    };

    updateConfig('jobs', [...config.jobs, newJob]);
    setShowAddJobForm(false);
  };

  const updateJob = (jobId: string, updates: Partial<JobPosition>) => {
    const updatedJobs = config.jobs.map(job =>
      job.id === jobId
        ? {
            ...job,
            ...updates,
            metadata: {
              ...job.metadata,
              updated_at: new Date().toISOString()
            }
          }
        : job
    );
    updateConfig('jobs', updatedJobs);
    setEditingJob(null);
  };

  const deleteJob = (jobId: string) => {
    if (confirm('¿Estás seguro de eliminar esta posición?')) {
      const updatedJobs = config.jobs.filter(job => job.id !== jobId);
      updateConfig('jobs', updatedJobs);
    }
  };

  const toggleJobFeatured = (jobId: string) => {
    const job = config.jobs.find(j => j.id === jobId);
    if (job) {
      updateJob(jobId, { featured: !job.featured });
    }
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels = {
      full_time: 'Tiempo Completo',
      part_time: 'Tiempo Parcial',
      contract: 'Contrato',
      internship: 'Prácticas',
      freelance: 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      entry: 'Nivel Inicial',
      mid: 'Nivel Medio',
      senior: 'Senior',
      lead: 'Líder',
      executive: 'Ejecutivo'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Careers</h1>
          <p className="text-gray-600 mt-1">
            Gestiona posiciones de trabajo, beneficios y proceso de aplicación
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
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Trabajos
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Aplicación
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
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
                    placeholder="Únete a Nuestro Equipo"
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
                    placeholder="careers"
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
                  placeholder="Construye tu Futuro Profesional"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={config.basic.description}
                  onChange={(e) => updateConfig('basic.description', e.target.value)}
                  placeholder="Descripción de la página de careers"
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
                  placeholder="Construye tu Carrera con Nosotros"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo Hero</label>
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                  placeholder="Únete al Equipo que Transforma el Futuro"
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
                  <label className="text-sm font-medium">Texto CTA</label>
                  <Input
                    value={config.hero.cta_text || ''}
                    onChange={(e) => updateConfig('hero.cta_text', e.target.value)}
                    placeholder="Ver Posiciones Abiertas"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Enlace CTA</label>
                  <Input
                    value={config.hero.cta_link || ''}
                    onChange={(e) => updateConfig('hero.cta_link', e.target.value)}
                    placeholder="#jobs"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Elementos del Hero</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Estadísticas de Trabajos</label>
                    <Switch
                      checked={config.hero.show_job_stats}
                      onCheckedChange={(checked) => updateConfig('hero.show_job_stats', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Posiciones Abiertas</label>
                    <Switch
                      checked={config.hero.show_open_positions}
                      onCheckedChange={(checked) => updateConfig('hero.show_open_positions', checked)}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Departamentos</label>
                    <Switch
                      checked={config.hero.show_departments}
                      onCheckedChange={(checked) => updateConfig('hero.show_departments', checked)}
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
              </div>

              {/* Estadísticas configurables */}
              {config.hero.show_job_stats && (
                <div className="space-y-4">
                  <h4 className="font-medium">Estadísticas de Empleo</h4>
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
                                placeholder="+, %"
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

        {/* Tab: Gestión de Trabajos */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Posiciones de Trabajo
                  <Badge variant="secondary">{config.jobs.length}</Badge>
                </CardTitle>
                <Button
                  onClick={() => setShowAddJobForm(true)}
                  size="sm"
                  disabled={readOnly}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Posición
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No hay posiciones de trabajo configuradas</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddJobForm(true)}
                    className="mt-2"
                    disabled={readOnly}
                  >
                    Crear primera posición
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.jobs.map((job) => (
                    <Card key={job.id} className={`${job.featured ? 'ring-2 ring-yellow-200' : ''} ${job.urgent ? 'ring-2 ring-red-200' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-[#003F6F] text-white rounded-lg flex items-center justify-center">
                              <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status}
                                </Badge>
                                {job.featured && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Destacado
                                  </Badge>
                                )}
                                {job.urgent && (
                                  <Badge variant="destructive">
                                    Urgente
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {job.department}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {getEmploymentTypeLabel(job.employment_type)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="w-4 h-4" />
                                  {getExperienceLevelLabel(job.experience_level)}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleJobFeatured(job.id)}
                              title={job.featured ? "Quitar destacado" : "Destacar"}
                              disabled={readOnly}
                            >
                              <Briefcase className={`w-4 h-4 ${job.featured ? 'text-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingJob(job.id)}
                              title="Editar"
                              disabled={readOnly}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Eliminar"
                              disabled={readOnly}
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Tab: Información de la Empresa */}
        <TabsContent value="company">
          <div className="space-y-6">
            {/* Cultura Organizacional */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cultura Organizacional</CardTitle>
                  <Switch
                    checked={config.company_info.show_company_culture}
                    onCheckedChange={(checked) => updateConfig('company_info.show_company_culture', checked)}
                    disabled={readOnly}
                  />
                </div>
              </CardHeader>
              {config.company_info.show_company_culture && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={config.company_info.culture_title}
                      onChange={(e) => updateConfig('company_info.culture_title', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <Textarea
                      value={config.company_info.culture_description}
                      onChange={(e) => updateConfig('company_info.culture_description', e.target.value)}
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Valores Corporativos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.company_info.values.map((value, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <Input
                              value={value.title}
                              onChange={(e) => {
                                const newValues = [...config.company_info.values];
                                newValues[index] = { ...value, title: e.target.value };
                                updateConfig('company_info.values', newValues);
                              }}
                              placeholder="Título del valor"
                              disabled={readOnly}
                            />
                            <Textarea
                              value={value.description}
                              onChange={(e) => {
                                const newValues = [...config.company_info.values];
                                newValues[index] = { ...value, description: e.target.value };
                                updateConfig('company_info.values', newValues);
                              }}
                              placeholder="Descripción del valor"
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Beneficios */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Beneficios y Ventajas</CardTitle>
                  <Switch
                    checked={config.company_info.show_benefits}
                    onCheckedChange={(checked) => updateConfig('company_info.show_benefits', checked)}
                    disabled={readOnly}
                  />
                </div>
              </CardHeader>
              {config.company_info.show_benefits && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={config.company_info.benefits_title}
                      onChange={(e) => updateConfig('company_info.benefits_title', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <Textarea
                      value={config.company_info.benefits_description}
                      onChange={(e) => updateConfig('company_info.benefits_description', e.target.value)}
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Categorías de Beneficios</h4>
                    <div className="space-y-4">
                      {config.company_info.benefits_list.map((category, categoryIndex) => (
                        <Card key={categoryIndex} className="p-4">
                          <div className="space-y-3">
                            <Input
                              value={category.category}
                              onChange={(e) => {
                                const newBenefits = [...config.company_info.benefits_list];
                                newBenefits[categoryIndex] = { ...category, category: e.target.value };
                                updateConfig('company_info.benefits_list', newBenefits);
                              }}
                              placeholder="Nombre de la categoría"
                              className="font-medium"
                              disabled={readOnly}
                            />
                            
                            <div className="space-y-2">
                              {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={item.title}
                                    onChange={(e) => {
                                      const newBenefits = [...config.company_info.benefits_list];
                                      newBenefits[categoryIndex].items[itemIndex] = { ...item, title: e.target.value };
                                      updateConfig('company_info.benefits_list', newBenefits);
                                    }}
                                    placeholder="Título del beneficio"
                                    disabled={readOnly}
                                  />
                                  <Input
                                    value={item.description}
                                    onChange={(e) => {
                                      const newBenefits = [...config.company_info.benefits_list];
                                      newBenefits[categoryIndex].items[itemIndex] = { ...item, description: e.target.value };
                                      updateConfig('company_info.benefits_list', newBenefits);
                                    }}
                                    placeholder="Descripción"
                                    disabled={readOnly}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Configuración de Aplicación */}
        <TabsContent value="application">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Proceso de Aplicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Permitir Subida de Archivos</label>
                  <Switch
                    checked={config.application_config.file_upload_allowed}
                    onCheckedChange={(checked) => updateConfig('application_config.file_upload_allowed', checked)}
                    disabled={readOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Auto-respuesta Habilitada</label>
                  <Switch
                    checked={config.application_config.auto_reply_enabled}
                    onCheckedChange={(checked) => updateConfig('application_config.auto_reply_enabled', checked)}
                    disabled={readOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Política de Privacidad Requerida</label>
                  <Switch
                    checked={config.application_config.privacy_policy_required}
                    onCheckedChange={(checked) => updateConfig('application_config.privacy_policy_required', checked)}
                    disabled={readOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Términos y Condiciones Requeridos</label>
                  <Switch
                    checked={config.application_config.terms_acceptance_required}
                    onCheckedChange={(checked) => updateConfig('application_config.terms_acceptance_required', checked)}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Tamaño Máximo de Archivo</label>
                  <Input
                    value={config.application_config.max_file_size}
                    onChange={(e) => updateConfig('application_config.max_file_size', e.target.value)}
                    placeholder="5MB"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email de Notificaciones</label>
                  <Input
                    type="email"
                    value={config.application_config.notification_email}
                    onChange={(e) => updateConfig('application_config.notification_email', e.target.value)}
                    placeholder="rrhh@empresa.com"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Página de Confirmación</label>
                  <Input
                    value={config.application_config.application_confirmation_page || ''}
                    onChange={(e) => updateConfig('application_config.application_confirmation_page', e.target.value)}
                    placeholder="/careers/application-received"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tipos de Archivo Permitidos</label>
                <Input
                  value={config.application_config.allowed_file_types.join(', ')}
                  onChange={(e) => updateConfig('application_config.allowed_file_types', e.target.value.split(', '))}
                  placeholder=".pdf, .doc, .docx"
                  disabled={readOnly}
                />
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
            contextType="careers"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: Testimonios */}
        <TabsContent value="testimonials">
          <TestimonialsManager
            testimonials={config.testimonials}
            onChange={(testimonials) => updateConfig('testimonials', testimonials)}
            allowReordering={!readOnly}
            contextType="cultura"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: FAQ */}
        <TabsContent value="faq">
          <FAQManager
            faqs={config.faqs}
            onChange={(faqs) => updateConfig('faqs', faqs)}
            allowReordering={!readOnly}
            contextType="careers"
            showPreview={true}
          />
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <SEOAdvancedEditor
            data={config.seo}
            onChange={(seo) => updateConfig('seo', seo)}
            contextType="careers"
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};