'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  Filter, 
  Layout, 
  Eye, 
  Save, 
  Download,
  Upload,
  Copy,
  Trash2,
  Settings,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Grid3x3,
  Layers,
  Box,
  Move,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FlipHorizontal,
  FlipVertical,
  MoreVertical,
  Grip,
  MousePointer,
  Zap,
  Code,
  Palette,
  Type,
  Image,
  Video,
  FileText,
  Mail,
  Calendar,
  BarChart3,
  Users,
  ShoppingCart,
  Navigation,
  Menu,
  Star
} from 'lucide-react'

interface LayoutComponent {
  id: string
  type: 'container' | 'section' | 'grid' | 'flex' | 'text' | 'image' | 'button' | 'input' | 'card' | 'header' | 'footer' | 'sidebar' | 'navigation'
  name: string
  properties: {
    width: string
    height: string
    padding: string
    margin: string
    background: string
    border: string
    border_radius: string
    display: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block'
    justify_content?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
    align_items?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
    flex_direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    grid_template_columns?: string
    grid_template_rows?: string
    grid_gap?: string
    text_content?: string
    font_size?: string
    font_weight?: string
    color?: string
    src?: string
    alt?: string
    href?: string
    placeholder?: string
    type_input?: string
  }
  children: LayoutComponent[]
  position: {
    x: number
    y: number
    z: number
  }
  responsive: {
    mobile: Partial<LayoutComponent['properties']>
    tablet: Partial<LayoutComponent['properties']>
    desktop: Partial<LayoutComponent['properties']>
  }
  animations: {
    entrance?: string
    hover?: string
    scroll?: string
  }
  conditions: {
    show_when?: string
    hide_when?: string
  }
  created_at: string
  updated_at: string
}

interface LayoutTemplate {
  id: string
  name: string
  category: 'landing' | 'dashboard' | 'blog' | 'ecommerce' | 'portfolio' | 'corporate' | 'creative'
  description: string
  preview_image: string
  layout: LayoutComponent
  devices: ('desktop' | 'tablet' | 'mobile')[]
  is_responsive: boolean
  complexity: 'simple' | 'medium' | 'complex'
  components_count: number
  author: string
  rating: number
  downloads: number
  is_premium: boolean
  price?: number
  tags: string[]
  created_at: string
}

interface LayoutProject {
  id: string
  name: string
  description: string
  layout: LayoutComponent
  current_device: 'desktop' | 'tablet' | 'mobile'
  canvas_settings: {
    width: number
    height: number
    background: string
    grid_visible: boolean
    snap_to_grid: boolean
    grid_size: number
  }
  history: {
    id: string
    action: string
    timestamp: string
    data: any
  }[]
  history_index: number
  created_at: string
  updated_at: string
}

export default function LayoutBuilder() {
  const [activeTab, setActiveTab] = useState('builder')
  const [currentProject, setCurrentProject] = useState<LayoutProject | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<LayoutComponent | null>(null)
  const [draggedComponent, setDraggedComponent] = useState<LayoutComponent | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [zoom, setZoom] = useState(100)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)
  const [isComponentsOpen, setIsComponentsOpen] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  const mockProjects: LayoutProject[] = [
    {
      id: '1',
      name: 'Landing Page Principal',
      description: 'Página de inicio para Métrica FM',
      layout: {
        id: 'root',
        type: 'container',
        name: 'Root Container',
        properties: {
          width: '100%',
          height: '100vh',
          padding: '0',
          margin: '0',
          background: '#ffffff',
          border: 'none',
          border_radius: '0',
          display: 'flex',
          flex_direction: 'column'
        },
        children: [],
        position: { x: 0, y: 0, z: 0 },
        responsive: {
          mobile: { padding: '16px' },
          tablet: { padding: '24px' },
          desktop: { padding: '32px' }
        },
        animations: {},
        conditions: {},
        created_at: '2024-12-01',
        updated_at: '2024-12-15'
      },
      current_device: 'desktop',
      canvas_settings: {
        width: 1200,
        height: 800,
        background: '#f8fafc',
        grid_visible: true,
        snap_to_grid: true,
        grid_size: 20
      },
      history: [],
      history_index: 0,
      created_at: '2024-12-01',
      updated_at: '2024-12-15'
    }
  ]

  const mockTemplates: LayoutTemplate[] = [
    {
      id: '1',
      name: 'Hero Section',
      category: 'landing',
      description: 'Sección hero con imagen de fondo, título y CTA',
      preview_image: '/templates/hero-section.jpg',
      layout: {
        id: 'hero-1',
        type: 'section',
        name: 'Hero Section',
        properties: {
          width: '100%',
          height: '100vh',
          padding: '0',
          margin: '0',
          background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/hero-bg.jpg)',
          border: 'none',
          border_radius: '0',
          display: 'flex',
          justify_content: 'center',
          align_items: 'center',
          flex_direction: 'column'
        },
        children: [],
        position: { x: 0, y: 0, z: 0 },
        responsive: {
          mobile: { height: '70vh', padding: '20px' },
          tablet: { height: '80vh', padding: '40px' },
          desktop: { height: '100vh', padding: '60px' }
        },
        animations: {
          entrance: 'fadeInUp'
        },
        conditions: {},
        created_at: '2024-01-15',
        updated_at: '2024-12-10'
      },
      devices: ['desktop', 'tablet', 'mobile'],
      is_responsive: true,
      complexity: 'simple',
      components_count: 5,
      author: 'Design Team',
      rating: 4.8,
      downloads: 1240,
      is_premium: false,
      tags: ['hero', 'landing', 'cta'],
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dashboard Layout',
      category: 'dashboard',
      description: 'Layout completo de dashboard con sidebar y header',
      preview_image: '/templates/dashboard-layout.jpg',
      layout: {
        id: 'dashboard-1',
        type: 'container',
        name: 'Dashboard Container',
        properties: {
          width: '100%',
          height: '100vh',
          padding: '0',
          margin: '0',
          background: '#f8fafc',
          border: 'none',
          border_radius: '0',
          display: 'grid',
          grid_template_columns: '280px 1fr',
          grid_template_rows: '64px 1fr'
        },
        children: [],
        position: { x: 0, y: 0, z: 0 },
        responsive: {
          mobile: { grid_template_columns: '1fr', grid_template_rows: '64px 1fr' },
          tablet: { grid_template_columns: '240px 1fr', grid_template_rows: '64px 1fr' },
          desktop: { grid_template_columns: '280px 1fr', grid_template_rows: '64px 1fr' }
        },
        animations: {},
        conditions: {},
        created_at: '2024-02-20',
        updated_at: '2024-11-25'
      },
      devices: ['desktop', 'tablet', 'mobile'],
      is_responsive: true,
      complexity: 'complex',
      components_count: 12,
      author: 'Dashboard Pro',
      rating: 4.9,
      downloads: 890,
      is_premium: true,
      price: 24.99,
      tags: ['dashboard', 'admin', 'sidebar'],
      created_at: '2024-02-20'
    }
  ]

  const componentTypes = [
    { id: 'container', name: 'Container', icon: Box, category: 'layout' },
    { id: 'section', name: 'Section', icon: Layout, category: 'layout' },
    { id: 'grid', name: 'Grid', icon: Grid3x3, category: 'layout' },
    { id: 'flex', name: 'Flex', icon: FlipHorizontal, category: 'layout' },
    { id: 'text', name: 'Text', icon: Type, category: 'content' },
    { id: 'image', name: 'Image', icon: Image, category: 'media' },
    { id: 'button', name: 'Button', icon: MousePointer, category: 'interactive' },
    { id: 'input', name: 'Input', icon: Type, category: 'forms' },
    { id: 'card', name: 'Card', icon: Box, category: 'layout' },
    { id: 'header', name: 'Header', icon: AlignLeft, category: 'navigation' },
    { id: 'footer', name: 'Footer', icon: AlignLeft, category: 'navigation' },
    { id: 'sidebar', name: 'Sidebar', icon: Menu, category: 'navigation' },
    { id: 'navigation', name: 'Navigation', icon: Navigation, category: 'navigation' }
  ]

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, filterCategory])

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      layout: Layout,
      content: FileText,
      media: Image,
      interactive: MousePointer,
      forms: Mail,
      navigation: Navigation
    }
    const IconComponent = icons[category as keyof typeof icons] || Box
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryBadge = useCallback((category: string) => {
    const categoryConfig = {
      landing: { label: 'Landing', className: 'bg-blue-100 text-blue-700' },
      dashboard: { label: 'Dashboard', className: 'bg-green-100 text-green-700' },
      blog: { label: 'Blog', className: 'bg-purple-100 text-purple-700' },
      ecommerce: { label: 'E-commerce', className: 'bg-orange-100 text-orange-700' },
      portfolio: { label: 'Portfolio', className: 'bg-pink-100 text-pink-700' },
      corporate: { label: 'Corporativo', className: 'bg-indigo-100 text-indigo-700' },
      creative: { label: 'Creativo', className: 'bg-yellow-100 text-yellow-700' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getComplexityBadge = useCallback((complexity: string) => {
    const complexityConfig = {
      simple: { label: 'Simple', className: 'bg-green-100 text-green-700' },
      medium: { label: 'Medio', className: 'bg-yellow-100 text-yellow-700' },
      complex: { label: 'Complejo', className: 'bg-red-100 text-red-700' }
    }
    
    const config = complexityConfig[complexity as keyof typeof complexityConfig] || { label: complexity, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getDeviceIcon = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    const icons = {
      desktop: Monitor,
      tablet: Tablet,
      mobile: Smartphone
    }
    const IconComponent = icons[device]
    return <IconComponent className="w-5 h-5" />
  }, [])

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }, [])

  const createNewComponent = useCallback((type: string) => {
    const newComponent: LayoutComponent = {
      id: `${type}-${Date.now()}`,
      type: type as LayoutComponent['type'],
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
      properties: {
        width: '100px',
        height: '100px',
        padding: '16px',
        margin: '0',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        border_radius: '8px',
        display: 'block'
      },
      children: [],
      position: { x: 50, y: 50, z: 1 },
      responsive: {
        mobile: {},
        tablet: {},
        desktop: {}
      },
      animations: {},
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Customize properties based on component type
    switch (type) {
      case 'text':
        newComponent.properties.text_content = 'Sample Text'
        newComponent.properties.font_size = '16px'
        newComponent.properties.color = '#111827'
        break
      case 'button':
        newComponent.properties.text_content = 'Click me'
        newComponent.properties.background = '#3b82f6'
        newComponent.properties.color = '#ffffff'
        break
      case 'image':
        newComponent.properties.src = '/placeholder-image.jpg'
        newComponent.properties.alt = 'Placeholder image'
        break
      case 'grid':
        newComponent.properties.display = 'grid'
        newComponent.properties.grid_template_columns = '1fr 1fr'
        newComponent.properties.grid_gap = '16px'
        break
      case 'flex':
        newComponent.properties.display = 'flex'
        newComponent.properties.justify_content = 'center'
        newComponent.properties.align_items = 'center'
        break
    }

    return newComponent
  }, [])

  const handleDragStart = useCallback((component: any, e: React.DragEvent) => {
    setDraggedComponent(component)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedComponent || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newComponent = typeof draggedComponent === 'string' 
      ? createNewComponent(draggedComponent)
      : { ...draggedComponent, id: `${draggedComponent.id}-${Date.now()}` }

    newComponent.position.x = snapToGrid ? Math.round(x / gridSize) * gridSize : x
    newComponent.position.y = snapToGrid ? Math.round(y / gridSize) * gridSize : y

    // Add component to current project layout
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        layout: {
          ...currentProject.layout,
          children: [...currentProject.layout.children, newComponent]
        }
      }
      setCurrentProject(updatedProject)
    }

    setDraggedComponent(null)
  }, [draggedComponent, snapToGrid, gridSize, createNewComponent, currentProject])

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Constructor de Layouts</h1>
          <p className="text-gray-600">Diseña y construye layouts visuales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="builder">Constructor</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="flex-1 flex m-0">
          <div className="flex-1 flex">
            {/* Components Panel */}
            <div className={`bg-white border-r transition-all duration-300 ${
              isComponentsOpen ? 'w-80' : 'w-12'
            }`}>
              <div className="flex items-center justify-between p-3 border-b">
                {isComponentsOpen && <Label className="font-medium">Componentes</Label>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComponentsOpen(!isComponentsOpen)}
                >
                  {isComponentsOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
              
              {isComponentsOpen && (
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {['layout', 'content', 'media', 'interactive', 'forms', 'navigation'].map((category) => (
                      <div key={category}>
                        <Label className="text-xs uppercase text-gray-500 mb-2 block">
                          {category}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {componentTypes
                            .filter(comp => comp.category === category)
                            .map((component) => (
                            <Card
                              key={component.id}
                              className="cursor-grab hover:shadow-md transition-shadow border-dashed"
                              draggable
                              onDragStart={(e) => handleDragStart(component.id, e)}
                            >
                              <CardContent className="p-3 text-center">
                                <component.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                <p className="text-xs font-medium">{component.name}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col bg-gray-100">
              {/* Toolbar */}
              <div className="bg-white border-b p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Zoom:</Label>
                    <Select value={zoom.toString()} onValueChange={(value) => setZoom(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="125">125%</SelectItem>
                        <SelectItem value="150">150%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Grid:</Label>
                    <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Snap:</Label>
                    <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                  </div>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Deshacer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4 overflow-auto">
                <div 
                  ref={canvasRef}
                  className={`relative mx-auto bg-white shadow-lg ${
                    previewMode === 'mobile' ? 'w-80' : 
                    previewMode === 'tablet' ? 'w-[768px]' : 'w-full max-w-[1200px]'
                  } min-h-[600px] border rounded-lg`}
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    backgroundImage: showGrid 
                      ? `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`
                      : 'none',
                    backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto'
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {currentProject?.layout.children.map((component) => (
                    <div
                      key={component.id}
                      className="absolute border-2 border-dashed border-transparent hover:border-blue-500 cursor-pointer"
                      style={{
                        left: component.position.x,
                        top: component.position.y,
                        width: component.properties.width,
                        height: component.properties.height,
                        backgroundColor: component.properties.background,
                        padding: component.properties.padding,
                        margin: component.properties.margin,
                        borderRadius: component.properties.border_radius,
                        zIndex: component.position.z
                      }}
                      onClick={() => setSelectedComponent(component)}
                    >
                      {/* Component content based on type */}
                      {component.type === 'text' && (
                        <div style={{ 
                          fontSize: component.properties.font_size,
                          color: component.properties.color,
                          fontWeight: component.properties.font_weight
                        }}>
                          {component.properties.text_content}
                        </div>
                      )}
                      {component.type === 'button' && (
                        <button className="px-4 py-2 rounded" style={{
                          backgroundColor: component.properties.background,
                          color: component.properties.color
                        }}>
                          {component.properties.text_content}
                        </button>
                      )}
                      {component.type === 'image' && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                      {component.type === 'container' && (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                          <Box className="w-8 h-8" />
                        </div>
                      )}
                      
                      {/* Component controls */}
                      <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity">
                        {component.name}
                        <div className="absolute top-full left-2 flex gap-1 mt-1">
                          <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                            <Move className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Drop zone indicator */}
                  {!currentProject?.layout.children.length && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                      <div className="text-center">
                        <Layout className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Canvas Vacío</p>
                        <p className="text-sm">Arrastra componentes aquí para comenzar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className={`bg-white border-l transition-all duration-300 ${
              isPropertiesOpen ? 'w-80' : 'w-12'
            }`}>
              <div className="flex items-center justify-between p-3 border-b">
                {isPropertiesOpen && (
                  <Label className="font-medium">
                    {selectedComponent ? 'Propiedades' : 'Selecciona un componente'}
                  </Label>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
                >
                  {isPropertiesOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>

              {isPropertiesOpen && selectedComponent && (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Nombre del Componente</Label>
                      <Input
                        value={selectedComponent.name}
                        onChange={(e) => {
                          // Update component name logic here
                        }}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Dimensiones</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs">Ancho</Label>
                          <Input value={selectedComponent.properties.width} />
                        </div>
                        <div>
                          <Label className="text-xs">Alto</Label>
                          <Input value={selectedComponent.properties.height} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Espaciado</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs">Padding</Label>
                          <Input value={selectedComponent.properties.padding} />
                        </div>
                        <div>
                          <Label className="text-xs">Margin</Label>
                          <Input value={selectedComponent.properties.margin} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Estilo</Label>
                      <div className="space-y-2 mt-1">
                        <div>
                          <Label className="text-xs">Background</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={selectedComponent.properties.background}
                              className="w-12"
                            />
                            <Input
                              value={selectedComponent.properties.background}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Border Radius</Label>
                          <Input value={selectedComponent.properties.border_radius} />
                        </div>
                      </div>
                    </div>

                    {selectedComponent.type === 'text' && (
                      <div>
                        <Label className="text-sm font-medium">Texto</Label>
                        <div className="space-y-2 mt-1">
                          <Textarea
                            value={selectedComponent.properties.text_content || ''}
                            placeholder="Contenido del texto"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Tamaño</Label>
                              <Input value={selectedComponent.properties.font_size || '16px'} />
                            </div>
                            <div>
                              <Label className="text-xs">Peso</Label>
                              <Select value={selectedComponent.properties.font_weight || 'normal'}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="lighter">Light</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedComponent.type === 'flex' && (
                      <div>
                        <Label className="text-sm font-medium">Flexbox</Label>
                        <div className="space-y-2 mt-1">
                          <div>
                            <Label className="text-xs">Justify Content</Label>
                            <Select value={selectedComponent.properties.justify_content || 'flex-start'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flex-start">Flex Start</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="flex-end">Flex End</SelectItem>
                                <SelectItem value="space-between">Space Between</SelectItem>
                                <SelectItem value="space-around">Space Around</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Align Items</Label>
                            <Select value={selectedComponent.properties.align_items || 'flex-start'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flex-start">Flex Start</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="flex-end">Flex End</SelectItem>
                                <SelectItem value="stretch">Stretch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Responsive</Label>
                      <Tabs defaultValue="desktop" className="mt-2">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="mobile">📱</TabsTrigger>
                          <TabsTrigger value="tablet">📱</TabsTrigger>
                          <TabsTrigger value="desktop">💻</TabsTrigger>
                        </TabsList>
                        <TabsContent value="mobile" className="space-y-2">
                          <p className="text-xs text-gray-500">Propiedades específicas para móvil</p>
                        </TabsContent>
                        <TabsContent value="tablet" className="space-y-2">
                          <p className="text-xs text-gray-500">Propiedades específicas para tablet</p>
                        </TabsContent>
                        <TabsContent value="desktop" className="space-y-2">
                          <p className="text-xs text-gray-500">Propiedades específicas para desktop</p>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas..."
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
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2">
                        {template.is_premium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            Premium
                          </Badge>
                        )}
                        {getCategoryBadge(template.category)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getComplexityBadge(template.complexity)}
                      <Badge variant="outline">{template.components_count} componentes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg flex items-center justify-center">
                      <Layout className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div className="flex items-center justify-center gap-1">
                      {template.devices.map((device) => (
                        <div key={device} className="flex items-center">
                          {getDeviceIcon(device)}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-blue-500" />
                          <span>{formatNumber(template.downloads)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{template.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        {template.is_premium ? `$${template.price}` : 'Usar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Mis Proyectos</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setCurrentProject(project)
                        setActiveTab('builder')
                      }}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <Layout className="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>Actualizado: {new Date(project.updated_at).toLocaleDateString()}</div>
                        <div className="flex gap-1">
                          {getDeviceIcon(project.current_device)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}