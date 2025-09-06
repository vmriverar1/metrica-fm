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
import { 
  Plus, 
  Search, 
  Filter, 
  Code, 
  Eye, 
  Edit2, 
  Copy, 
  Trash2,
  Settings,
  Save,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Box,
  Palette,
  Type,
  Image,
  Video,
  Map,
  BarChart3,
  Calendar,
  Users,
  Mail,
  FileText,
  Zap,
  Grid3x3,
  Layout,
  MonitorSpeaker,
  Smartphone,
  Tablet
} from 'lucide-react'

interface ComponentProperty {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'textarea' | 'image' | 'array' | 'object'
  label: string
  default_value: any
  required: boolean
  description?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
}

interface DynamicComponent {
  id: string
  name: string
  display_name: string
  category: 'layout' | 'content' | 'media' | 'forms' | 'navigation' | 'widgets' | 'analytics'
  description: string
  version: string
  author: string
  tags: string[]
  properties: ComponentProperty[]
  template: string
  styles: string
  scripts?: string
  dependencies: string[]
  preview_image?: string
  is_active: boolean
  usage_count: number
  responsive: {
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }
  accessibility: {
    aria_labels: boolean
    keyboard_navigation: boolean
    screen_reader_friendly: boolean
  }
  performance: {
    size_kb: number
    load_time_ms: number
    lazy_loading: boolean
  }
  created_at: string
  updated_at: string
  last_used: string
}

interface ComponentInstance {
  id: string
  component_id: string
  component_name: string
  instance_name: string
  page_id: string
  page_name: string
  position: {
    x: number
    y: number
    z: number
  }
  properties: Record<string, any>
  status: 'active' | 'hidden' | 'archived'
  created_at: string
  updated_at: string
}

interface ComponentTemplate {
  id: string
  name: string
  category: string
  description: string
  components: ComponentInstance[]
  preview_image?: string
  is_public: boolean
  downloads: number
  rating: number
  created_by: string
  created_at: string
}

export default function DynamicComponentsEditor() {
  const [activeTab, setActiveTab] = useState('components')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedComponent, setSelectedComponent] = useState<DynamicComponent | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<ComponentInstance | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ComponentTemplate | null>(null)
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isInstanceDialogOpen, setIsInstanceDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [activeComponentTab, setActiveComponentTab] = useState('properties')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isEditing, setIsEditing] = useState(false)

  const mockComponents: DynamicComponent[] = [
    {
      id: '1',
      name: 'hero-banner',
      display_name: 'Hero Banner',
      category: 'layout',
      description: 'Componente de banner principal con imagen de fondo, título y CTA',
      version: '2.1.0',
      author: 'UI Team',
      tags: ['hero', 'banner', 'cta', 'responsive'],
      properties: [
        {
          id: 'title',
          name: 'title',
          type: 'text',
          label: 'Título Principal',
          default_value: 'Bienvenido a nuestra empresa',
          required: true,
          description: 'El título principal que se muestra en el hero'
        },
        {
          id: 'subtitle',
          name: 'subtitle',
          type: 'textarea',
          label: 'Subtítulo',
          default_value: 'Descripción que acompaña al título',
          required: false
        },
        {
          id: 'background_image',
          name: 'background_image',
          type: 'image',
          label: 'Imagen de Fondo',
          default_value: '/images/hero-bg.jpg',
          required: true
        },
        {
          id: 'cta_text',
          name: 'cta_text',
          type: 'text',
          label: 'Texto del Botón',
          default_value: 'Conoce más',
          required: false
        },
        {
          id: 'cta_link',
          name: 'cta_link',
          type: 'text',
          label: 'Enlace del Botón',
          default_value: '/contact',
          required: false
        }
      ],
      template: `<section className="hero-banner relative h-screen flex items-center justify-center" style={{backgroundImage: 'url({{background_image}})'}}>
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">{{title}}</h1>
          <p className="text-xl mb-8">{{subtitle}}</p>
          {{#if cta_text}}
          <a href="{{cta_link}}" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">{{cta_text}}</a>
          {{/if}}
        </div>
      </section>`,
      styles: `.hero-banner { background-size: cover; background-position: center; }`,
      dependencies: [],
      is_active: true,
      usage_count: 45,
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      accessibility: {
        aria_labels: true,
        keyboard_navigation: true,
        screen_reader_friendly: true
      },
      performance: {
        size_kb: 12.5,
        load_time_ms: 150,
        lazy_loading: false
      },
      created_at: '2024-11-15',
      updated_at: '2024-12-10',
      last_used: '2024-12-20'
    },
    {
      id: '2',
      name: 'stats-grid',
      display_name: 'Grid de Estadísticas',
      category: 'widgets',
      description: 'Grid de estadísticas con iconos y animaciones',
      version: '1.5.2',
      author: 'Analytics Team',
      tags: ['stats', 'numbers', 'grid', 'animated'],
      properties: [
        {
          id: 'stats',
          name: 'stats',
          type: 'array',
          label: 'Estadísticas',
          default_value: [
            { number: '150+', label: 'Proyectos', icon: 'briefcase' },
            { number: '50+', label: 'Clientes', icon: 'users' },
            { number: '10', label: 'Años', icon: 'calendar' }
          ],
          required: true
        },
        {
          id: 'columns',
          name: 'columns',
          type: 'select',
          label: 'Columnas',
          default_value: '3',
          options: [
            { value: '2', label: '2 Columnas' },
            { value: '3', label: '3 Columnas' },
            { value: '4', label: '4 Columnas' }
          ],
          required: true
        }
      ],
      template: `<section className="stats-grid py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-{{columns}} gap-8">
            {{#each stats}}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{{number}}</div>
              <div className="text-gray-600">{{label}}</div>
            </div>
            {{/each}}
          </div>
        </div>
      </section>`,
      styles: `.stats-grid .number { animation: countUp 2s ease-out; }`,
      scripts: `
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Animate numbers
            }
          })
        })
      `,
      dependencies: [],
      is_active: true,
      usage_count: 32,
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      accessibility: {
        aria_labels: true,
        keyboard_navigation: false,
        screen_reader_friendly: true
      },
      performance: {
        size_kb: 8.2,
        load_time_ms: 95,
        lazy_loading: true
      },
      created_at: '2024-10-22',
      updated_at: '2024-12-05',
      last_used: '2024-12-19'
    },
    {
      id: '3',
      name: 'contact-form',
      display_name: 'Formulario de Contacto',
      category: 'forms',
      description: 'Formulario de contacto con validación y envío por email',
      version: '3.0.1',
      author: 'Forms Team',
      tags: ['form', 'contact', 'validation', 'email'],
      properties: [
        {
          id: 'title',
          name: 'title',
          type: 'text',
          label: 'Título del Formulario',
          default_value: 'Contáctanos',
          required: true
        },
        {
          id: 'fields',
          name: 'fields',
          type: 'array',
          label: 'Campos del Formulario',
          default_value: [
            { name: 'name', label: 'Nombre', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
          ],
          required: true
        },
        {
          id: 'submit_text',
          name: 'submit_text',
          type: 'text',
          label: 'Texto del Botón',
          default_value: 'Enviar Mensaje',
          required: true
        },
        {
          id: 'success_message',
          name: 'success_message',
          type: 'text',
          label: 'Mensaje de Éxito',
          default_value: 'Mensaje enviado correctamente',
          required: true
        }
      ],
      template: `<section className="contact-form py-16">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">{{title}}</h2>
          <form className="space-y-6">
            {{#each fields}}
            <div>
              <label className="block text-sm font-medium mb-2">{{label}}</label>
              {{#if (eq type 'textarea')}}
              <textarea name="{{name}}" className="w-full px-4 py-2 border rounded-lg" {{#if required}}required{{/if}}></textarea>
              {{else}}
              <input type="{{type}}" name="{{name}}" className="w-full px-4 py-2 border rounded-lg" {{#if required}}required{{/if}}>
              {{/if}}
            </div>
            {{/each}}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">{{submit_text}}</button>
          </form>
        </div>
      </section>`,
      styles: `.contact-form input:focus, .contact-form textarea:focus { outline: 2px solid #3b82f6; }`,
      scripts: `
        document.querySelector('.contact-form form').addEventListener('submit', async (e) => {
          e.preventDefault()
          // Handle form submission
        })
      `,
      dependencies: ['validation-lib'],
      is_active: true,
      usage_count: 28,
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      accessibility: {
        aria_labels: true,
        keyboard_navigation: true,
        screen_reader_friendly: true
      },
      performance: {
        size_kb: 15.8,
        load_time_ms: 200,
        lazy_loading: false
      },
      created_at: '2024-09-18',
      updated_at: '2024-12-15',
      last_used: '2024-12-20'
    }
  ]

  const mockInstances: ComponentInstance[] = [
    {
      id: '1',
      component_id: '1',
      component_name: 'Hero Banner',
      instance_name: 'Home Hero',
      page_id: 'home',
      page_name: 'Página Principal',
      position: { x: 0, y: 0, z: 0 },
      properties: {
        title: 'Métrica FM - Construyendo el Futuro',
        subtitle: 'Líderes en dirección integral de proyectos de infraestructura',
        background_image: '/images/hero-construccion.jpg',
        cta_text: 'Ver Proyectos',
        cta_link: '/portfolio'
      },
      status: 'active',
      created_at: '2024-12-01',
      updated_at: '2024-12-10'
    },
    {
      id: '2',
      component_id: '2',
      component_name: 'Grid de Estadísticas',
      instance_name: 'Stats Home',
      page_id: 'home',
      page_name: 'Página Principal',
      position: { x: 0, y: 1, z: 0 },
      properties: {
        stats: [
          { number: '200+', label: 'Proyectos Completados', icon: 'briefcase' },
          { number: '85+', label: 'Clientes Satisfechos', icon: 'users' },
          { number: '15', label: 'Años de Experiencia', icon: 'calendar' },
          { number: '50M+', label: 'Metros Cuadrados', icon: 'map' }
        ],
        columns: '4'
      },
      status: 'active',
      created_at: '2024-12-01',
      updated_at: '2024-12-05'
    }
  ]

  const mockTemplates: ComponentTemplate[] = [
    {
      id: '1',
      name: 'Landing Page Empresarial',
      category: 'landing',
      description: 'Template completo para landing page de empresa con hero, servicios, stats y contacto',
      components: [
        { ...mockInstances[0], id: 'hero-1' },
        { ...mockInstances[1], id: 'stats-1' }
      ],
      preview_image: '/images/template-landing.jpg',
      is_public: true,
      downloads: 156,
      rating: 4.8,
      created_by: 'Design Team',
      created_at: '2024-11-20'
    },
    {
      id: '2',
      name: 'Página de Contacto',
      category: 'contact',
      description: 'Template para página de contacto con formulario, mapa y información',
      components: [],
      is_public: true,
      downloads: 89,
      rating: 4.5,
      created_by: 'Forms Team',
      created_at: '2024-10-15'
    }
  ]

  const filteredComponents = useMemo(() => {
    return mockComponents.filter(component => {
      const matchesSearch = component.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || component.category === filterCategory
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && component.is_active) ||
                           (filterStatus === 'inactive' && !component.is_active)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, filterCategory, filterStatus])

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      layout: Layout,
      content: FileText,
      media: Image,
      forms: Mail,
      navigation: Grid3x3,
      widgets: Box,
      analytics: BarChart3
    }
    const IconComponent = icons[category as keyof typeof icons] || Box
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryBadge = useCallback((category: string) => {
    const categoryConfig = {
      layout: { label: 'Layout', className: 'bg-blue-100 text-blue-700' },
      content: { label: 'Contenido', className: 'bg-green-100 text-green-700' },
      media: { label: 'Media', className: 'bg-purple-100 text-purple-700' },
      forms: { label: 'Formularios', className: 'bg-orange-100 text-orange-700' },
      navigation: { label: 'Navegación', className: 'bg-indigo-100 text-indigo-700' },
      widgets: { label: 'Widgets', className: 'bg-pink-100 text-pink-700' },
      analytics: { label: 'Analytics', className: 'bg-yellow-100 text-yellow-700' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getStatusBadge = useCallback((isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-700">Activo</Badge>
      : <Badge className="bg-gray-100 text-gray-700">Inactivo</Badge>
  }, [])

  const getDeviceIcon = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    const icons = {
      desktop: MonitorSpeaker,
      tablet: Tablet,
      mobile: Smartphone
    }
    const IconComponent = icons[device]
    return <IconComponent className="w-5 h-5" />
  }, [])

  const formatSize = useCallback((sizeKb: number) => {
    return sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`
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
          <h1 className="text-3xl font-bold">Editor de Componentes Dinámicos</h1>
          <p className="text-gray-600">Crea, gestiona y utiliza componentes reutilizables</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Componente
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar componentes, tags, descripciones..."
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
            <SelectItem value="layout">Layout</SelectItem>
            <SelectItem value="content">Contenido</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="forms">Formularios</SelectItem>
            <SelectItem value="navigation">Navegación</SelectItem>
            <SelectItem value="widgets">Widgets</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="instances">Instancias</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="library">Librería</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(component.category)}
                      <CardTitle className="text-lg">{component.display_name}</CardTitle>
                    </div>
                    {getStatusBadge(component.is_active)}
                  </div>
                  <div className="flex gap-2">
                    {getCategoryBadge(component.category)}
                    <Badge variant="outline">v{component.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{component.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {component.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {component.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{component.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{component.usage_count}</div>
                      <div className="text-gray-500">Usos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{formatSize(component.performance.size_kb)}</div>
                      <div className="text-gray-500">Tamaño</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">{component.performance.load_time_ms}ms</div>
                      <div className="text-gray-500">Carga</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${component.responsive.mobile ? 'bg-green-500' : 'bg-gray-300'}`} title="Mobile" />
                    <div className={`w-2 h-2 rounded-full ${component.responsive.tablet ? 'bg-green-500' : 'bg-gray-300'}`} title="Tablet" />
                    <div className={`w-2 h-2 rounded-full ${component.responsive.desktop ? 'bg-green-500' : 'bg-gray-300'}`} title="Desktop" />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedComponent(component)}
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
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <div className="grid gap-4">
            {mockInstances.map((instance) => (
              <Card key={instance.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{instance.instance_name}</h3>
                        <Badge className="bg-blue-100 text-blue-700">{instance.component_name}</Badge>
                        {getStatusBadge(instance.status === 'active')}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Página:</span> {instance.page_name}
                        </div>
                        <div>
                          <span className="font-medium">Posición:</span> X:{instance.position.x}, Y:{instance.position.y}
                        </div>
                        <div>
                          <span className="font-medium">Creado:</span> {formatDate(instance.created_at)}
                        </div>
                        <div>
                          <span className="font-medium">Actualizado:</span> {formatDate(instance.updated_at)}
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

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={template.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {template.is_public ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.preview_image && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{template.components.length}</div>
                      <div className="text-gray-500">Componentes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{template.downloads}</div>
                      <div className="text-gray-500">Descargas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{template.rating}</div>
                      <div className="text-gray-500">Rating</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Librería de Componentes</h3>
            <p className="text-gray-600 mb-4">
              Explora y descarga componentes de la librería pública
            </p>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Librería
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Component Details Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedComponent && getCategoryIcon(selectedComponent.category)}
              {selectedComponent?.display_name}
            </DialogTitle>
          </DialogHeader>
          {selectedComponent && (
            <ScrollArea className="h-[70vh]">
              <div className="flex gap-6">
                <div className="flex-1">
                  <Tabs value={activeComponentTab} onValueChange={setActiveComponentTab}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="properties">Propiedades</TabsTrigger>
                      <TabsTrigger value="template">Template</TabsTrigger>
                      <TabsTrigger value="styles">Estilos</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="settings">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="properties" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        {selectedComponent.properties.map((prop) => (
                          <div key={prop.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="font-medium">{prop.label}</Label>
                              {prop.required && <Badge variant="outline" className="text-xs">Requerido</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{prop.description}</p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Tipo:</span> {prop.type}
                              </div>
                              <div>
                                <span className="text-gray-500">Nombre:</span> {prop.name}
                              </div>
                              <div>
                                <span className="text-gray-500">Por defecto:</span> 
                                <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                                  {JSON.stringify(prop.default_value)}
                                </code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="template" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">HTML Template</Label>
                          <div className="mt-2 bg-gray-50 rounded-lg p-4">
                            <pre className="text-sm overflow-x-auto">
                              <code>{selectedComponent.template}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="styles" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">CSS Styles</Label>
                          <div className="mt-2 bg-gray-50 rounded-lg p-4">
                            <pre className="text-sm overflow-x-auto">
                              <code>{selectedComponent.styles}</code>
                            </pre>
                          </div>
                        </div>
                        {selectedComponent.scripts && (
                          <div>
                            <Label className="font-medium">JavaScript</Label>
                            <div className="mt-2 bg-gray-50 rounded-lg p-4">
                              <pre className="text-sm overflow-x-auto">
                                <code>{selectedComponent.scripts}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Métricas de Performance</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Tamaño:</span>
                                <span>{formatSize(selectedComponent.performance.size_kb)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tiempo de carga:</span>
                                <span>{selectedComponent.performance.load_time_ms}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lazy loading:</span>
                                <span>{selectedComponent.performance.lazy_loading ? 'Sí' : 'No'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">Compatibilidad</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span>Mobile:</span>
                                <div className={`w-3 h-3 rounded-full ${selectedComponent.responsive.mobile ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Tablet:</span>
                                <div className={`w-3 h-3 rounded-full ${selectedComponent.responsive.tablet ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Desktop:</span>
                                <div className={`w-3 h-3 rounded-full ${selectedComponent.responsive.desktop ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">Información General</Label>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>Versión: {selectedComponent.version}</div>
                            <div>Autor: {selectedComponent.author}</div>
                            <div>Creado: {formatDate(selectedComponent.created_at)}</div>
                            <div>Actualizado: {formatDate(selectedComponent.updated_at)}</div>
                            <div>Último uso: {formatDate(selectedComponent.last_used)}</div>
                            <div>Usos totales: {selectedComponent.usage_count}</div>
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Dependencias</Label>
                          <div className="mt-2">
                            {selectedComponent.dependencies.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedComponent.dependencies.map((dep) => (
                                  <Badge key={dep} variant="outline">{dep}</Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Sin dependencias</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Accesibilidad</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span>ARIA Labels:</span>
                              <div className={`w-3 h-3 rounded-full ${selectedComponent.accessibility.aria_labels ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Navegación por teclado:</span>
                              <div className={`w-3 h-3 rounded-full ${selectedComponent.accessibility.keyboard_navigation ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Screen reader friendly:</span>
                              <div className={`w-3 h-3 rounded-full ${selectedComponent.accessibility.screen_reader_friendly ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="w-96 border-l pl-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Vista Previa</h4>
                      <div className="flex gap-1">
                        {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                          <Button
                            key={device}
                            variant={previewMode === device ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(device)}
                            className="p-2"
                          >
                            {getDeviceIcon(device)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${
                      previewMode === 'mobile' ? 'max-w-xs' : 
                      previewMode === 'tablet' ? 'max-w-sm' : 'w-full'
                    }`}>
                      <div className="bg-gray-100 p-4 text-center text-gray-600">
                        Preview del componente
                        <br />
                        <small>({previewMode})</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}