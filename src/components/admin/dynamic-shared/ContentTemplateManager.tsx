'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Save, 
  Download,
  Upload,
  Copy,
  Trash2,
  Settings,
  RefreshCw,
  Edit2,
  Layout,
  Image,
  Video,
  Type,
  Box,
  Layers,
  Code,
  Palette,
  Star,
  Heart,
  Share2,
  Clock,
  Calendar,
  User,
  Tag,
  Folder,
  BookOpen,
  FileImage,
  PlayCircle,
  Mic,
  Globe,
  Database,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  HelpCircle,
  Briefcase,
  Grid3x3,
  List
} from 'lucide-react'

interface ContentField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'rich_text' | 'number' | 'boolean' | 'date' | 'image' | 'video' | 'audio' | 'file' | 'url' | 'select' | 'multi_select' | 'color' | 'json'
  label: string
  description?: string
  required: boolean
  default_value?: any
  validation?: {
    min_length?: number
    max_length?: number
    pattern?: string
    min_value?: number
    max_value?: number
    file_types?: string[]
    max_file_size?: number
  }
  options?: { value: string; label: string; color?: string }[]
  placeholder?: string
  help_text?: string
  conditional_logic?: {
    field: string
    condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }
}

interface ContentTemplate {
  id: string
  name: string
  slug: string
  description: string
  category: 'page' | 'post' | 'product' | 'portfolio' | 'team' | 'testimonial' | 'faq' | 'service' | 'event' | 'news' | 'custom'
  icon: string
  color: string
  fields: ContentField[]
  layout_template?: string
  seo_template?: {
    title_pattern?: string
    description_pattern?: string
    keywords?: string[]
  }
  preview_template: string
  validation_rules: any[]
  is_system: boolean
  is_active: boolean
  version: string
  created_by: string
  usage_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface ContentInstance {
  id: string
  template_id: string
  template_name: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived' | 'scheduled'
  content: Record<string, any>
  metadata: {
    author: string
    created_at: string
    updated_at: string
    published_at?: string
    scheduled_for?: string
    last_edited_by: string
    revision_count: number
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    og_image?: string
  }
  analytics: {
    views: number
    engagement_rate: number
    conversion_rate: number
  }
}

interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  templates_count: number
}

export default function ContentTemplateManager() {
  const [activeTab, setActiveTab] = useState('templates')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<ContentInstance | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isInstanceDialogOpen, setIsInstanceDialogOpen] = useState(false)
  const [activeTemplateTab, setActiveTemplateTab] = useState('fields')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isEditing, setIsEditing] = useState(false)

  const mockTemplates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Blog Post',
      slug: 'blog-post',
      description: 'Template para artículos de blog con contenido rico y SEO',
      category: 'post',
      icon: 'FileText',
      color: '#3b82f6',
      fields: [
        {
          id: 'title',
          name: 'title',
          type: 'text',
          label: 'Título',
          description: 'Título principal del artículo',
          required: true,
          validation: { min_length: 5, max_length: 100 },
          placeholder: 'Ingresa el título del artículo'
        },
        {
          id: 'excerpt',
          name: 'excerpt',
          type: 'textarea',
          label: 'Extracto',
          description: 'Breve resumen del artículo',
          required: true,
          validation: { max_length: 300 },
          placeholder: 'Breve descripción del contenido'
        },
        {
          id: 'content',
          name: 'content',
          type: 'rich_text',
          label: 'Contenido',
          description: 'Contenido principal del artículo',
          required: true,
          validation: { min_length: 100 }
        },
        {
          id: 'featured_image',
          name: 'featured_image',
          type: 'image',
          label: 'Imagen Destacada',
          required: true,
          validation: { file_types: ['jpg', 'png', 'webp'], max_file_size: 2 }
        },
        {
          id: 'category',
          name: 'category',
          type: 'select',
          label: 'Categoría',
          required: true,
          options: [
            { value: 'tecnologia', label: 'Tecnología' },
            { value: 'construccion', label: 'Construcción' },
            { value: 'tendencias', label: 'Tendencias' },
            { value: 'casos-estudio', label: 'Casos de Estudio' }
          ]
        },
        {
          id: 'tags',
          name: 'tags',
          type: 'multi_select',
          label: 'Tags',
          required: false,
          options: [
            { value: 'bim', label: 'BIM' },
            { value: 'sostenibilidad', label: 'Sostenibilidad' },
            { value: 'innovacion', label: 'Innovación' },
            { value: 'proyecto', label: 'Proyecto' }
          ]
        },
        {
          id: 'author',
          name: 'author',
          type: 'text',
          label: 'Autor',
          required: true,
          default_value: 'Equipo Métrica'
        },
        {
          id: 'reading_time',
          name: 'reading_time',
          type: 'number',
          label: 'Tiempo de Lectura (min)',
          required: false,
          validation: { min_value: 1, max_value: 60 }
        },
        {
          id: 'is_featured',
          name: 'is_featured',
          type: 'boolean',
          label: '¿Artículo Destacado?',
          required: false,
          default_value: false
        },
        {
          id: 'publish_date',
          name: 'publish_date',
          type: 'date',
          label: 'Fecha de Publicación',
          required: true
        }
      ],
      layout_template: 'blog-post-layout',
      seo_template: {
        title_pattern: '{{title}} - Métrica DIP Blog',
        description_pattern: '{{excerpt}}',
        keywords: ['construcción', 'proyectos', 'bim', 'arquitectura']
      },
      preview_template: `
        <article class="blog-post">
          <header>
            <h1>{{title}}</h1>
            <p class="excerpt">{{excerpt}}</p>
            <div class="meta">
              <span>Por {{author}}</span>
              <span>{{publish_date}}</span>
              <span>{{reading_time}} min de lectura</span>
            </div>
          </header>
          <img src="{{featured_image}}" alt="{{title}}" class="featured-image">
          <div class="content">{{content}}</div>
          <footer>
            <div class="tags">
              {{#each tags}}
                <span class="tag">{{this}}</span>
              {{/each}}
            </div>
          </footer>
        </article>
      `,
      validation_rules: [],
      is_system: true,
      is_active: true,
      version: '2.1.0',
      created_by: 'System',
      usage_count: 156,
      tags: ['blog', 'content', 'seo'],
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '2',
      name: 'Proyecto Portfolio',
      slug: 'portfolio-project',
      description: 'Template para proyectos del portfolio con galería y detalles técnicos',
      category: 'portfolio',
      icon: 'Briefcase',
      color: '#10b981',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'text',
          label: 'Nombre del Proyecto',
          required: true,
          validation: { min_length: 3, max_length: 80 }
        },
        {
          id: 'description',
          name: 'description',
          type: 'textarea',
          label: 'Descripción',
          required: true,
          validation: { min_length: 50, max_length: 500 }
        },
        {
          id: 'client',
          name: 'client',
          type: 'text',
          label: 'Cliente',
          required: true
        },
        {
          id: 'location',
          name: 'location',
          type: 'text',
          label: 'Ubicación',
          required: true
        },
        {
          id: 'project_type',
          name: 'project_type',
          type: 'select',
          label: 'Tipo de Proyecto',
          required: true,
          options: [
            { value: 'comercial', label: 'Comercial', color: '#3b82f6' },
            { value: 'residencial', label: 'Residencial', color: '#10b981' },
            { value: 'industrial', label: 'Industrial', color: '#f59e0b' },
            { value: 'educativo', label: 'Educativo', color: '#8b5cf6' },
            { value: 'hospitalario', label: 'Hospitalario', color: '#ef4444' },
            { value: 'hotelero', label: 'Hotelero', color: '#06b6d4' }
          ]
        },
        {
          id: 'area',
          name: 'area',
          type: 'number',
          label: 'Área (m²)',
          required: true,
          validation: { min_value: 1 }
        },
        {
          id: 'budget',
          name: 'budget',
          type: 'number',
          label: 'Presupuesto',
          required: false,
          validation: { min_value: 0 }
        },
        {
          id: 'duration',
          name: 'duration',
          type: 'text',
          label: 'Duración',
          required: true,
          placeholder: 'ej: 18 meses'
        },
        {
          id: 'status',
          name: 'status',
          type: 'select',
          label: 'Estado',
          required: true,
          options: [
            { value: 'completed', label: 'Completado', color: '#10b981' },
            { value: 'in_progress', label: 'En Progreso', color: '#f59e0b' },
            { value: 'planned', label: 'Planificado', color: '#6b7280' }
          ]
        },
        {
          id: 'gallery',
          name: 'gallery',
          type: 'file',
          label: 'Galería de Imágenes',
          required: true,
          validation: { file_types: ['jpg', 'png', 'webp'], max_file_size: 5 },
          help_text: 'Subir múltiples imágenes del proyecto'
        },
        {
          id: 'technical_specs',
          name: 'technical_specs',
          type: 'json',
          label: 'Especificaciones Técnicas',
          required: false,
          help_text: 'Datos técnicos en formato JSON'
        },
        {
          id: 'featured',
          name: 'featured',
          type: 'boolean',
          label: '¿Proyecto Destacado?',
          required: false,
          default_value: false
        }
      ],
      layout_template: 'portfolio-project-layout',
      preview_template: `
        <div class="portfolio-project">
          <header>
            <h1>{{name}}</h1>
            <p>{{description}}</p>
          </header>
          <div class="project-meta">
            <div class="meta-item">
              <strong>Cliente:</strong> {{client}}
            </div>
            <div class="meta-item">
              <strong>Ubicación:</strong> {{location}}
            </div>
            <div class="meta-item">
              <strong>Área:</strong> {{area}} m²
            </div>
            <div class="meta-item">
              <strong>Duración:</strong> {{duration}}
            </div>
          </div>
          <div class="gallery">
            {{#each gallery}}
              <img src="{{this}}" alt="{{../name}}">
            {{/each}}
          </div>
        </div>
      `,
      validation_rules: [],
      is_system: true,
      is_active: true,
      version: '1.8.0',
      created_by: 'System',
      usage_count: 89,
      tags: ['portfolio', 'project', 'gallery'],
      created_at: '2024-02-20',
      updated_at: '2024-11-25'
    },
    {
      id: '3',
      name: 'Miembro del Equipo',
      slug: 'team-member',
      description: 'Template para perfiles de miembros del equipo',
      category: 'team',
      icon: 'User',
      color: '#8b5cf6',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'text',
          label: 'Nombre Completo',
          required: true,
          validation: { min_length: 2, max_length: 50 }
        },
        {
          id: 'position',
          name: 'position',
          type: 'text',
          label: 'Cargo',
          required: true,
          validation: { max_length: 100 }
        },
        {
          id: 'department',
          name: 'department',
          type: 'select',
          label: 'Departamento',
          required: true,
          options: [
            { value: 'direccion', label: 'Dirección' },
            { value: 'arquitectura', label: 'Arquitectura' },
            { value: 'ingenieria', label: 'Ingeniería' },
            { value: 'construccion', label: 'Construcción' },
            { value: 'administracion', label: 'Administración' }
          ]
        },
        {
          id: 'bio',
          name: 'bio',
          type: 'rich_text',
          label: 'Biografía',
          required: true,
          validation: { min_length: 50, max_length: 1000 }
        },
        {
          id: 'photo',
          name: 'photo',
          type: 'image',
          label: 'Foto de Perfil',
          required: true,
          validation: { file_types: ['jpg', 'png'], max_file_size: 1 }
        },
        {
          id: 'email',
          name: 'email',
          type: 'text',
          label: 'Email',
          required: false,
          validation: { pattern: '^[^@]+@[^@]+\.[^@]+$' }
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'text',
          label: 'Teléfono',
          required: false
        },
        {
          id: 'linkedin',
          name: 'linkedin',
          type: 'url',
          label: 'LinkedIn',
          required: false
        },
        {
          id: 'specialties',
          name: 'specialties',
          type: 'multi_select',
          label: 'Especialidades',
          required: false,
          options: [
            { value: 'bim', label: 'BIM' },
            { value: 'sostenibilidad', label: 'Sostenibilidad' },
            { value: 'gestion', label: 'Gestión de Proyectos' },
            { value: 'diseno', label: 'Diseño' },
            { value: 'construccion', label: 'Construcción' }
          ]
        },
        {
          id: 'years_experience',
          name: 'years_experience',
          type: 'number',
          label: 'Años de Experiencia',
          required: false,
          validation: { min_value: 0, max_value: 50 }
        }
      ],
      layout_template: 'team-member-layout',
      preview_template: `
        <div class="team-member">
          <div class="photo">
            <img src="{{photo}}" alt="{{name}}">
          </div>
          <div class="info">
            <h2>{{name}}</h2>
            <h3>{{position}}</h3>
            <p>{{department}}</p>
            <div class="bio">{{bio}}</div>
            <div class="contact">
              {{#if email}}<a href="mailto:{{email}}">{{email}}</a>{{/if}}
              {{#if phone}}<a href="tel:{{phone}}">{{phone}}</a>{{/if}}
              {{#if linkedin}}<a href="{{linkedin}}" target="_blank">LinkedIn</a>{{/if}}
            </div>
            <div class="specialties">
              {{#each specialties}}
                <span class="specialty">{{this}}</span>
              {{/each}}
            </div>
          </div>
        </div>
      `,
      validation_rules: [],
      is_system: true,
      is_active: true,
      version: '1.5.0',
      created_by: 'System',
      usage_count: 45,
      tags: ['team', 'profile', 'bio'],
      created_at: '2024-03-10',
      updated_at: '2024-12-05'
    }
  ]

  const mockInstances: ContentInstance[] = [
    {
      id: '1',
      template_id: '1',
      template_name: 'Blog Post',
      title: 'El Futuro de la Construcción Sostenible en Perú',
      slug: 'futuro-construccion-sostenible-peru',
      status: 'published',
      content: {
        title: 'El Futuro de la Construcción Sostenible en Perú',
        excerpt: 'Exploramos las tendencias y tecnologías que están transformando la industria de la construcción hacia un enfoque más sostenible.',
        content: 'Contenido completo del artículo...',
        featured_image: '/blog/construccion-sostenible.jpg',
        category: 'tendencias',
        tags: ['sostenibilidad', 'innovacion'],
        author: 'María González',
        reading_time: 8,
        is_featured: true,
        publish_date: '2024-12-15'
      },
      metadata: {
        author: 'María González',
        created_at: '2024-12-10',
        updated_at: '2024-12-15',
        published_at: '2024-12-15',
        last_edited_by: 'María González',
        revision_count: 3
      },
      seo: {
        title: 'El Futuro de la Construcción Sostenible en Perú - Métrica DIP Blog',
        description: 'Exploramos las tendencias y tecnologías que están transformando la industria de la construcción hacia un enfoque más sostenible.',
        keywords: ['construcción sostenible', 'perú', 'sostenibilidad', 'construcción'],
        og_image: '/blog/construccion-sostenible-og.jpg'
      },
      analytics: {
        views: 2450,
        engagement_rate: 6.8,
        conversion_rate: 2.1
      }
    },
    {
      id: '2',
      template_id: '2',
      template_name: 'Proyecto Portfolio',
      title: 'Centro Comercial Plaza Norte',
      slug: 'centro-comercial-plaza-norte',
      status: 'published',
      content: {
        name: 'Centro Comercial Plaza Norte',
        description: 'Desarrollo integral de centro comercial con enfoque en sostenibilidad y experiencia del usuario.',
        client: 'Grupo Inmobiliario ABC',
        location: 'Lima Norte, Perú',
        project_type: 'comercial',
        area: 85000,
        budget: 120000000,
        duration: '24 meses',
        status: 'completed',
        gallery: ['/projects/plaza-norte-1.jpg', '/projects/plaza-norte-2.jpg'],
        technical_specs: '{"pisos": 4, "locales": 200, "estacionamientos": 1500}',
        featured: true
      },
      metadata: {
        author: 'Equipo Arquitectura',
        created_at: '2024-11-01',
        updated_at: '2024-12-01',
        published_at: '2024-12-01',
        last_edited_by: 'Carlos Ruiz',
        revision_count: 5
      },
      seo: {
        title: 'Centro Comercial Plaza Norte - Proyecto Métrica DIP',
        description: 'Desarrollo integral de centro comercial con enfoque en sostenibilidad y experiencia del usuario.',
        keywords: ['centro comercial', 'plaza norte', 'arquitectura', 'construcción']
      },
      analytics: {
        views: 1890,
        engagement_rate: 8.2,
        conversion_rate: 4.5
      }
    }
  ]

  const mockCategories: TemplateCategory[] = [
    {
      id: 'page',
      name: 'Páginas',
      description: 'Templates para páginas estáticas del sitio web',
      icon: 'FileText',
      color: '#3b82f6',
      templates_count: 12
    },
    {
      id: 'post',
      name: 'Publicaciones',
      description: 'Templates para contenido dinámico como blogs y noticias',
      icon: 'BookOpen',
      color: '#10b981',
      templates_count: 8
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Templates para proyectos y casos de estudio',
      icon: 'Briefcase',
      color: '#f59e0b',
      templates_count: 15
    },
    {
      id: 'team',
      name: 'Equipo',
      description: 'Templates para perfiles de equipo y testimonios',
      icon: 'User',
      color: '#8b5cf6',
      templates_count: 6
    }
  ]

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && template.is_active) ||
                           (filterStatus === 'inactive' && !template.is_active)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, filterCategory, filterStatus])

  const filteredInstances = useMemo(() => {
    return mockInstances.filter(instance => {
      const matchesSearch = instance.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || instance.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, filterStatus])

  const getFieldTypeIcon = useCallback((type: string) => {
    const icons = {
      text: Type,
      textarea: FileText,
      rich_text: Edit2,
      number: BarChart3,
      boolean: Target,
      date: Calendar,
      image: Image,
      video: Video,
      audio: Mic,
      file: FileImage,
      url: Globe,
      select: Database,
      multi_select: Database,
      color: Palette,
      json: Code
    }
    const IconComponent = icons[type as keyof typeof icons] || FileText
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      page: FileText,
      post: BookOpen,
      product: ShoppingCart,
      portfolio: Briefcase,
      team: User,
      testimonial: Star,
      faq: HelpCircle,
      service: Zap,
      event: Calendar,
      news: Globe,
      custom: Box
    }
    const IconComponent = icons[category as keyof typeof icons] || FileText
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryBadge = useCallback((category: string) => {
    const categoryConfig = {
      page: { label: 'Página', className: 'bg-blue-100 text-blue-700' },
      post: { label: 'Publicación', className: 'bg-green-100 text-green-700' },
      product: { label: 'Producto', className: 'bg-purple-100 text-purple-700' },
      portfolio: { label: 'Portfolio', className: 'bg-orange-100 text-orange-700' },
      team: { label: 'Equipo', className: 'bg-pink-100 text-pink-700' },
      testimonial: { label: 'Testimonio', className: 'bg-yellow-100 text-yellow-700' },
      faq: { label: 'FAQ', className: 'bg-indigo-100 text-indigo-700' },
      service: { label: 'Servicio', className: 'bg-teal-100 text-teal-700' },
      event: { label: 'Evento', className: 'bg-red-100 text-red-700' },
      news: { label: 'Noticia', className: 'bg-cyan-100 text-cyan-700' },
      custom: { label: 'Personalizado', className: 'bg-gray-100 text-gray-700' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
      published: { label: 'Publicado', className: 'bg-green-100 text-green-700' },
      archived: { label: 'Archivado', className: 'bg-yellow-100 text-yellow-700' },
      scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
      active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
      inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }, [])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestor de Plantillas de Contenido</h1>
          <p className="text-gray-600">Crea y gestiona plantillas para diferentes tipos de contenido</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar plantillas e instancias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="page">Páginas</SelectItem>
            <SelectItem value="post">Publicaciones</SelectItem>
            <SelectItem value="product">Productos</SelectItem>
            <SelectItem value="portfolio">Portfolio</SelectItem>
            <SelectItem value="team">Equipo</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="instances">Contenido</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredTemplates.length} plantillas encontradas
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      {getStatusBadge(template.is_active ? 'active' : 'inactive')}
                    </div>
                    <div className="flex gap-2">
                      {getCategoryBadge(template.category)}
                      <Badge variant="outline">v{template.version}</Badge>
                      {template.is_system && <Badge variant="secondary">Sistema</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{template.fields.length}</div>
                        <div className="text-gray-500">Campos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{template.usage_count}</div>
                        <div className="text-gray-500">Usos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{formatDate(template.updated_at)}</div>
                        <div className="text-gray-500">Actualizado</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: template.color + '20' }}>
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{template.name}</h3>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(template.is_active ? 'active' : 'inactive')}
                            {getCategoryBadge(template.category)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span>{template.fields.length} campos</span>
                            <span>{template.usage_count} usos</span>
                            <span>v{template.version}</span>
                            <span>{formatDate(template.updated_at)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit2 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button size="sm">
                              Usar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <div className="grid gap-4">
            {filteredInstances.map((instance) => (
              <Card key={instance.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{instance.title}</h3>
                        {getStatusBadge(instance.status)}
                        <Badge variant="outline">{instance.template_name}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Autor:</span> {instance.metadata.author}
                        </div>
                        <div>
                          <span className="font-medium">Creado:</span> {formatDate(instance.metadata.created_at)}
                        </div>
                        <div>
                          <span className="font-medium">Actualizado:</span> {formatDate(instance.metadata.updated_at)}
                        </div>
                        <div>
                          <span className="font-medium">Revisiones:</span> {instance.metadata.revision_count}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{formatNumber(instance.analytics.views)} vistas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{instance.analytics.engagement_rate}% engagement</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span>{instance.analytics.conversion_rate}% conversión</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {getCategoryIcon(category.id)}
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <Badge variant="outline">{category.templates_count} plantillas</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{mockTemplates.length}</div>
                <div className="text-sm text-gray-600">Plantillas Activas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Edit2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{mockInstances.length}</div>
                <div className="text-sm text-gray-600">Contenido Creado</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {formatNumber(mockInstances.reduce((acc, inst) => acc + inst.analytics.views, 0))}
                </div>
                <div className="text-sm text-gray-600">Vistas Totales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {(mockInstances.reduce((acc, inst) => acc + inst.analytics.conversion_rate, 0) / mockInstances.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Conversión Promedio</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas Más Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTemplates
                    .sort((a, b) => b.usage_count - a.usage_count)
                    .slice(0, 5)
                    .map((template) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(template.category)}
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{getCategoryBadge(template.category)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{template.usage_count}</div>
                        <div className="text-sm text-gray-500">usos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInstances
                    .sort((a, b) => b.analytics.views - a.analytics.views)
                    .slice(0, 5)
                    .map((instance) => (
                    <div key={instance.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{instance.title}</div>
                        <Badge variant="outline">{formatNumber(instance.analytics.views)} vistas</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Engagement:</span>
                          <span>{instance.analytics.engagement_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversión:</span>
                          <span>{instance.analytics.conversion_rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Details Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && getCategoryIcon(selectedTemplate.category)}
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <ScrollArea className="h-[70vh]">
              <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="fields">Campos</TabsTrigger>
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="validation">Validación</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    {selectedTemplate.fields.map((field) => (
                      <Card key={field.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {getFieldTypeIcon(field.type)}
                              <div>
                                <h4 className="font-medium">{field.label}</h4>
                                <p className="text-sm text-gray-600">{field.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{field.type}</Badge>
                                  {field.required && <Badge className="bg-red-100 text-red-700">Requerido</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {field.validation && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                              <strong>Validación:</strong> {JSON.stringify(field.validation)}
                            </div>
                          )}
                          {field.options && (
                            <div className="mt-3">
                              <Label className="text-sm font-medium">Opciones:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.options.map((option) => (
                                  <Badge key={option.value} variant="secondary">
                                    {option.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Template de Vista Previa</h4>
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {selectedTemplate.preview_template}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  {selectedTemplate.seo_template ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Patrón de Título</Label>
                        <Input 
                          value={selectedTemplate.seo_template.title_pattern || ''}
                          className="mt-1 font-mono"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="font-medium">Patrón de Descripción</Label>
                        <Input 
                          value={selectedTemplate.seo_template.description_pattern || ''}
                          className="mt-1 font-mono"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="font-medium">Keywords por Defecto</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.seo_template.keywords?.map((keyword) => (
                            <Badge key={keyword} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay configuración SEO definida</p>
                  )}
                </TabsContent>

                <TabsContent value="validation" className="space-y-4 mt-4">
                  <p className="text-gray-500">Reglas de validación global del template</p>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Información General</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Slug:</span>
                            <span className="font-mono">{selectedTemplate.slug}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Versión:</span>
                            <span>{selectedTemplate.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Creado por:</span>
                            <span>{selectedTemplate.created_by}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Usos:</span>
                            <span>{selectedTemplate.usage_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Estado y Configuración</Label>
                        <div className="mt-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Template del sistema</span>
                            <Switch checked={selectedTemplate.is_system} disabled />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Activo</span>
                            <Switch checked={selectedTemplate.is_active} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}