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
  Copy, 
  Download,
  Star,
  Heart,
  Share2,
  BookOpen,
  Palette,
  Layout,
  Type,
  Image,
  Grid3x3,
  Box,
  Layers,
  Zap,
  Settings,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Monitor,
  Smartphone,
  Tablet,
  Paintbrush,
  MousePointer,
  Move,
  RotateCcw,
  List,
  BarChart3
} from 'lucide-react'

interface UIComponent {
  id: string
  name: string
  display_name: string
  category: 'buttons' | 'inputs' | 'navigation' | 'layout' | 'feedback' | 'data_display' | 'media' | 'overlays'
  subcategory: string
  description: string
  version: string
  author: string
  organization: string
  tags: string[]
  preview_image: string
  demo_url?: string
  documentation_url?: string
  source_code: {
    html: string
    css: string
    js?: string
    react?: string
    vue?: string
    angular?: string
  }
  customizable: {
    colors: boolean
    sizes: boolean
    animations: boolean
    spacing: boolean
    typography: boolean
  }
  variants: {
    id: string
    name: string
    preview: string
    properties: Record<string, any>
  }[]
  dependencies: string[]
  browser_support: {
    chrome: string
    firefox: string
    safari: string
    edge: string
  }
  accessibility: {
    wcag_level: 'A' | 'AA' | 'AAA'
    keyboard_navigation: boolean
    screen_reader: boolean
    color_contrast: boolean
  }
  performance: {
    bundle_size_kb: number
    render_time_ms: number
    memory_usage_kb: number
  }
  stats: {
    downloads: number
    likes: number
    views: number
    forks: number
    stars: number
  }
  license: 'MIT' | 'GPL' | 'Apache' | 'BSD' | 'Custom'
  is_premium: boolean
  price?: number
  created_at: string
  updated_at: string
}

interface ComponentCollection {
  id: string
  name: string
  description: string
  author: string
  components: string[]
  preview_image: string
  downloads: number
  rating: number
  is_featured: boolean
  tags: string[]
  created_at: string
}

interface UserPreferences {
  favorite_components: string[]
  downloaded_components: string[]
  custom_collections: ComponentCollection[]
  theme_preferences: {
    primary_color: string
    secondary_color: string
    dark_mode: boolean
  }
}

export default function UIComponentLibrary() {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLicense, setFilterLicense] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [selectedComponent, setSelectedComponent] = useState<UIComponent | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<ComponentCollection | null>(null)
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [activeComponentTab, setActiveComponentTab] = useState('preview')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const mockComponents: UIComponent[] = [
    {
      id: '1',
      name: 'gradient-button',
      display_name: 'Gradient Button',
      category: 'buttons',
      subcategory: 'action-buttons',
      description: 'Botón con gradiente animado y efectos hover',
      version: '2.3.1',
      author: 'UIDesigns Pro',
      organization: 'Design Systems Inc',
      tags: ['button', 'gradient', 'animated', 'modern', 'responsive'],
      preview_image: '/components/gradient-button.jpg',
      demo_url: 'https://example.com/demo/gradient-button',
      documentation_url: 'https://docs.example.com/gradient-button',
      source_code: {
        html: `<button class="gradient-btn">
  <span class="btn-text">Click me</span>
  <span class="btn-gradient"></span>
</button>`,
        css: `.gradient-btn {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.gradient-btn:active {
  transform: translateY(0);
}`,
        js: `document.querySelectorAll('.gradient-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    let ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});`,
        react: `import React from 'react';

const GradientButton = ({ children, onClick, ...props }) => {
  return (
    <button 
      className="gradient-btn" 
      onClick={onClick}
      {...props}
    >
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default GradientButton;`
      },
      customizable: {
        colors: true,
        sizes: true,
        animations: true,
        spacing: true,
        typography: true
      },
      variants: [
        {
          id: 'default',
          name: 'Default',
          preview: 'gradient-btn-default.jpg',
          properties: { gradient: 'blue-purple', size: 'medium' }
        },
        {
          id: 'large',
          name: 'Large',
          preview: 'gradient-btn-large.jpg',
          properties: { gradient: 'blue-purple', size: 'large' }
        },
        {
          id: 'pink',
          name: 'Pink Gradient',
          preview: 'gradient-btn-pink.jpg',
          properties: { gradient: 'pink-orange', size: 'medium' }
        }
      ],
      dependencies: [],
      browser_support: {
        chrome: '60+',
        firefox: '55+',
        safari: '12+',
        edge: '79+'
      },
      accessibility: {
        wcag_level: 'AA',
        keyboard_navigation: true,
        screen_reader: true,
        color_contrast: true
      },
      performance: {
        bundle_size_kb: 2.1,
        render_time_ms: 15,
        memory_usage_kb: 0.8
      },
      stats: {
        downloads: 15420,
        likes: 892,
        views: 45680,
        forks: 156,
        stars: 234
      },
      license: 'MIT',
      is_premium: false,
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '2',
      name: 'glassmorphism-card',
      display_name: 'Glassmorphism Card',
      category: 'layout',
      subcategory: 'cards',
      description: 'Tarjeta con efecto glassmorphism y blur backdrop',
      version: '1.8.0',
      author: 'Modern UI Lab',
      organization: 'Glass Effects Studio',
      tags: ['card', 'glassmorphism', 'blur', 'modern', 'transparency'],
      preview_image: '/components/glass-card.jpg',
      source_code: {
        html: `<div class="glass-card">
  <div class="card-header">
    <h3>Glassmorphism Card</h3>
  </div>
  <div class="card-content">
    <p>Content with beautiful glass effect</p>
  </div>
</div>`,
        css: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}`
      },
      customizable: {
        colors: true,
        sizes: true,
        animations: false,
        spacing: true,
        typography: false
      },
      variants: [
        {
          id: 'light',
          name: 'Light Theme',
          preview: 'glass-card-light.jpg',
          properties: { theme: 'light', blur: '10px' }
        },
        {
          id: 'dark',
          name: 'Dark Theme',
          preview: 'glass-card-dark.jpg',
          properties: { theme: 'dark', blur: '10px' }
        }
      ],
      dependencies: [],
      browser_support: {
        chrome: '76+',
        firefox: '103+',
        safari: '14+',
        edge: '79+'
      },
      accessibility: {
        wcag_level: 'A',
        keyboard_navigation: false,
        screen_reader: true,
        color_contrast: false
      },
      performance: {
        bundle_size_kb: 1.5,
        render_time_ms: 8,
        memory_usage_kb: 0.4
      },
      stats: {
        downloads: 8930,
        likes: 567,
        views: 23450,
        forks: 89,
        stars: 145
      },
      license: 'MIT',
      is_premium: false,
      created_at: '2024-03-20',
      updated_at: '2024-11-28'
    },
    {
      id: '3',
      name: 'animated-form',
      display_name: 'Animated Form Fields',
      category: 'inputs',
      subcategory: 'text-inputs',
      description: 'Campos de formulario con animaciones suaves y validación visual',
      version: '3.1.2',
      author: 'FormMaster',
      organization: 'Interactive Forms Co',
      tags: ['form', 'input', 'animated', 'validation', 'floating-label'],
      preview_image: '/components/animated-form.jpg',
      source_code: {
        html: `<div class="form-group">
  <input type="text" id="email" class="form-input" required>
  <label for="email" class="form-label">Email Address</label>
  <div class="form-underline"></div>
</div>`,
        css: `.form-group {
  position: relative;
  margin-bottom: 24px;
}

.form-input {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 2px solid #ddd;
  background: transparent;
  outline: none;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-label {
  position: absolute;
  top: 12px;
  left: 0;
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
}

.form-input:focus + .form-label,
.form-input:valid + .form-label {
  transform: translateY(-24px) scale(0.8);
  color: #667eea;
}`
      },
      customizable: {
        colors: true,
        sizes: true,
        animations: true,
        spacing: true,
        typography: true
      },
      variants: [
        {
          id: 'minimal',
          name: 'Minimal',
          preview: 'form-minimal.jpg',
          properties: { style: 'minimal', animation: 'slide' }
        },
        {
          id: 'material',
          name: 'Material Design',
          preview: 'form-material.jpg',
          properties: { style: 'material', animation: 'scale' }
        }
      ],
      dependencies: [],
      browser_support: {
        chrome: '60+',
        firefox: '55+',
        safari: '12+',
        edge: '79+'
      },
      accessibility: {
        wcag_level: 'AAA',
        keyboard_navigation: true,
        screen_reader: true,
        color_contrast: true
      },
      performance: {
        bundle_size_kb: 3.2,
        render_time_ms: 12,
        memory_usage_kb: 1.1
      },
      stats: {
        downloads: 22340,
        likes: 1234,
        views: 67890,
        forks: 234,
        stars: 456
      },
      license: 'MIT',
      is_premium: false,
      created_at: '2024-02-08',
      updated_at: '2024-12-15'
    },
    {
      id: '4',
      name: 'premium-dashboard',
      display_name: 'Premium Dashboard Layout',
      category: 'layout',
      subcategory: 'dashboard',
      description: 'Layout completo de dashboard con sidebar, header y grid responsivo',
      version: '4.2.0',
      author: 'Dashboard Pro',
      organization: 'Premium UI Solutions',
      tags: ['dashboard', 'layout', 'sidebar', 'responsive', 'premium'],
      preview_image: '/components/dashboard-layout.jpg',
      source_code: {
        html: `<div class="dashboard-layout">
  <aside class="sidebar">
    <!-- Sidebar content -->
  </aside>
  <main class="main-content">
    <header class="dashboard-header">
      <!-- Header content -->
    </header>
    <div class="content-area">
      <!-- Main content -->
    </div>
  </main>
</div>`,
        css: `.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: #1a1a2e;
  padding: 24px;
  transition: transform 0.3s ease;
}

.main-content {
  flex: 1;
  background: #f8fafc;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}`
      },
      customizable: {
        colors: true,
        sizes: true,
        animations: true,
        spacing: true,
        typography: false
      },
      variants: [
        {
          id: 'light',
          name: 'Light Theme',
          preview: 'dashboard-light.jpg',
          properties: { theme: 'light', sidebar: 'expanded' }
        },
        {
          id: 'dark',
          name: 'Dark Theme',
          preview: 'dashboard-dark.jpg',
          properties: { theme: 'dark', sidebar: 'expanded' }
        },
        {
          id: 'compact',
          name: 'Compact Sidebar',
          preview: 'dashboard-compact.jpg',
          properties: { theme: 'light', sidebar: 'compact' }
        }
      ],
      dependencies: ['icons-library', 'responsive-grid'],
      browser_support: {
        chrome: '70+',
        firefox: '65+',
        safari: '13+',
        edge: '79+'
      },
      accessibility: {
        wcag_level: 'AA',
        keyboard_navigation: true,
        screen_reader: true,
        color_contrast: true
      },
      performance: {
        bundle_size_kb: 12.8,
        render_time_ms: 45,
        memory_usage_kb: 3.2
      },
      stats: {
        downloads: 5430,
        likes: 334,
        views: 18920,
        forks: 67,
        stars: 112
      },
      license: 'Custom',
      is_premium: true,
      price: 29.99,
      created_at: '2024-04-12',
      updated_at: '2024-12-01'
    }
  ]

  const mockCollections: ComponentCollection[] = [
    {
      id: '1',
      name: 'Modern UI Kit',
      description: 'Colección completa de componentes modernos con efectos glassmorphism',
      author: 'Design Systems Pro',
      components: ['1', '2', '3'],
      preview_image: '/collections/modern-ui-kit.jpg',
      downloads: 3420,
      rating: 4.8,
      is_featured: true,
      tags: ['modern', 'glassmorphism', 'complete'],
      created_at: '2024-06-15'
    },
    {
      id: '2',
      name: 'Dashboard Essentials',
      description: 'Todo lo que necesitas para crear dashboards profesionales',
      author: 'Dashboard Masters',
      components: ['4'],
      preview_image: '/collections/dashboard-essentials.jpg',
      downloads: 1890,
      rating: 4.6,
      is_featured: false,
      tags: ['dashboard', 'business', 'professional'],
      created_at: '2024-08-22'
    }
  ]

  const filteredComponents = useMemo(() => {
    let filtered = mockComponents.filter(component => {
      const matchesSearch = component.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || component.category === filterCategory
      const matchesLicense = filterLicense === 'all' || component.license === filterLicense
      
      return matchesSearch && matchesCategory && matchesLicense
    })

    // Sort components
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.stats.downloads - a.stats.downloads
        case 'rating':
          return b.stats.likes - a.stats.likes
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'name':
          return a.display_name.localeCompare(b.display_name)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, filterCategory, filterLicense, sortBy])

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      buttons: MousePointer,
      inputs: Type,
      navigation: Grid3x3,
      layout: Layout,
      feedback: AlertCircle,
      data_display: BarChart3,
      media: Image,
      overlays: Layers
    }
    const IconComponent = icons[category as keyof typeof icons] || Box
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryBadge = useCallback((category: string) => {
    const categoryConfig = {
      buttons: { label: 'Botones', className: 'bg-blue-100 text-blue-700' },
      inputs: { label: 'Inputs', className: 'bg-green-100 text-green-700' },
      navigation: { label: 'Navegación', className: 'bg-purple-100 text-purple-700' },
      layout: { label: 'Layout', className: 'bg-orange-100 text-orange-700' },
      feedback: { label: 'Feedback', className: 'bg-red-100 text-red-700' },
      data_display: { label: 'Data Display', className: 'bg-indigo-100 text-indigo-700' },
      media: { label: 'Media', className: 'bg-pink-100 text-pink-700' },
      overlays: { label: 'Overlays', className: 'bg-yellow-100 text-yellow-700' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getLicenseBadge = useCallback((license: string) => {
    const licenseConfig = {
      'MIT': { className: 'bg-green-100 text-green-700' },
      'GPL': { className: 'bg-blue-100 text-blue-700' },
      'Apache': { className: 'bg-orange-100 text-orange-700' },
      'BSD': { className: 'bg-purple-100 text-purple-700' },
      'Custom': { className: 'bg-gray-100 text-gray-700' }
    }
    
    const config = licenseConfig[license as keyof typeof licenseConfig] || { className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{license}</Badge>
  }, [])

  const getAccessibilityBadge = useCallback((level: string) => {
    const config = {
      'A': { className: 'bg-yellow-100 text-yellow-700' },
      'AA': { className: 'bg-blue-100 text-blue-700' },
      'AAA': { className: 'bg-green-100 text-green-700' }
    }
    
    const levelConfig = config[level as keyof typeof config] || { className: 'bg-gray-100 text-gray-700' }
    return <Badge className={levelConfig.className}>WCAG {level}</Badge>
  }, [])

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
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

  const getDeviceIcon = useCallback((device: string) => {
    const icons = {
      desktop: Monitor,
      tablet: Tablet,
      mobile: Smartphone
    }
    const IconComponent = icons[device as keyof typeof icons] || Monitor
    return <IconComponent className="w-4 h-4" />
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Librería de Componentes UI</h1>
          <p className="text-gray-600">Explora, personaliza y descarga componentes de alta calidad</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Subir Componente
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar componentes, tags, autores..."
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
            <SelectItem value="buttons">Botones</SelectItem>
            <SelectItem value="inputs">Inputs</SelectItem>
            <SelectItem value="navigation">Navegación</SelectItem>
            <SelectItem value="layout">Layout</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="data_display">Data Display</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="overlays">Overlays</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterLicense} onValueChange={setFilterLicense}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Licencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="MIT">MIT</SelectItem>
            <SelectItem value="GPL">GPL</SelectItem>
            <SelectItem value="Apache">Apache</SelectItem>
            <SelectItem value="BSD">BSD</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularidad</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="collections">Colecciones</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="downloaded">Descargados</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredComponents.length} componentes encontrados
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
              {filteredComponents.map((component) => (
                <Card key={component.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(component.category)}
                        <CardTitle className="text-lg">{component.display_name}</CardTitle>
                      </div>
                      {component.is_premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {getCategoryBadge(component.category)}
                      <Badge variant="outline">v{component.version}</Badge>
                      {getLicenseBadge(component.license)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <Code className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{component.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-blue-500" />
                          <span>{formatNumber(component.stats.downloads)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{formatNumber(component.stats.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{formatNumber(component.stats.stars)}</span>
                        </div>
                      </div>
                      {getAccessibilityBadge(component.accessibility.wcag_level)}
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>Por {component.author}</div>
                      <div>{formatDate(component.updated_at)}</div>
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
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        {component.is_premium ? `$${component.price}` : 'Gratis'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComponents.map((component) => (
                <Card key={component.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <Code className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{component.display_name}</h3>
                            <p className="text-sm text-gray-600">{component.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {component.is_premium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                Premium
                              </Badge>
                            )}
                            {getCategoryBadge(component.category)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4 text-blue-500" />
                              <span>{formatNumber(component.stats.downloads)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{formatNumber(component.stats.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{formatNumber(component.stats.stars)}</span>
                            </div>
                            {getAccessibilityBadge(component.accessibility.wcag_level)}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              {component.is_premium ? `$${component.price}` : 'Descargar'}
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

        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    {collection.is_featured && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Destacado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <p className="text-sm text-gray-600">{collection.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Box className="w-4 h-4 text-blue-500" />
                        <span>{collection.components.length} componentes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-green-500" />
                        <span>{formatNumber(collection.downloads)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{collection.rating}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Por {collection.author} • {formatDate(collection.created_at)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin componentes favoritos</h3>
            <p className="text-gray-600 mb-4">
              Los componentes que marques como favoritos aparecerán aquí
            </p>
          </div>
        </TabsContent>

        <TabsContent value="downloaded" className="space-y-4">
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin descargas</h3>
            <p className="text-gray-600 mb-4">
              Los componentes descargados aparecerán aquí para fácil acceso
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Component Details Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedComponent && getCategoryIcon(selectedComponent.category)}
              {selectedComponent?.display_name}
              {selectedComponent?.is_premium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Premium
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedComponent && (
            <ScrollArea className="h-[80vh]">
              <div className="flex gap-6">
                <div className="flex-1">
                  <Tabs value={activeComponentTab} onValueChange={setActiveComponentTab}>
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                      <TabsTrigger value="code">Código</TabsTrigger>
                      <TabsTrigger value="variants">Variantes</TabsTrigger>
                      <TabsTrigger value="docs">Documentación</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="details">Detalles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-4 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Label>Dispositivo:</Label>
                        {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                          <Button
                            key={device}
                            variant={previewDevice === device ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewDevice(device)}
                          >
                            {getDeviceIcon(device)}
                          </Button>
                        ))}
                      </div>
                      <div className={`border rounded-lg overflow-hidden bg-white ${
                        previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 
                        previewDevice === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
                      }`}>
                        <div className="p-8 text-center">
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-12 rounded-lg">
                            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Vista previa del componente</p>
                            <p className="text-sm text-gray-500 mt-2">({previewDevice})</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4 mt-4">
                      <Tabs defaultValue="html">
                        <TabsList>
                          <TabsTrigger value="html">HTML</TabsTrigger>
                          <TabsTrigger value="css">CSS</TabsTrigger>
                          {selectedComponent.source_code.js && <TabsTrigger value="js">JavaScript</TabsTrigger>}
                          {selectedComponent.source_code.react && <TabsTrigger value="react">React</TabsTrigger>}
                        </TabsList>
                        
                        <TabsContent value="html">
                          <div className="relative">
                            <Button size="sm" className="absolute right-2 top-2 z-10">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{selectedComponent.source_code.html}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="css">
                          <div className="relative">
                            <Button size="sm" className="absolute right-2 top-2 z-10">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{selectedComponent.source_code.css}</code>
                            </pre>
                          </div>
                        </TabsContent>

                        {selectedComponent.source_code.js && (
                          <TabsContent value="js">
                            <div className="relative">
                              <Button size="sm" className="absolute right-2 top-2 z-10">
                                <Copy className="w-4 h-4" />
                              </Button>
                              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{selectedComponent.source_code.js}</code>
                              </pre>
                            </div>
                          </TabsContent>
                        )}

                        {selectedComponent.source_code.react && (
                          <TabsContent value="react">
                            <div className="relative">
                              <Button size="sm" className="absolute right-2 top-2 z-10">
                                <Copy className="w-4 h-4" />
                              </Button>
                              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{selectedComponent.source_code.react}</code>
                              </pre>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </TabsContent>

                    <TabsContent value="variants" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedComponent.variants.map((variant) => (
                          <Card key={variant.id} className={`cursor-pointer transition-all ${
                            selectedVariant === variant.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                          }`} onClick={() => setSelectedVariant(variant.id)}>
                            <CardContent className="p-4 text-center">
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                <Code className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="font-medium">{variant.name}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="docs" className="space-y-4 mt-4">
                      <div className="prose max-w-none">
                        <h3>Documentación</h3>
                        <p>{selectedComponent.description}</p>
                        
                        <h4>Personalización</h4>
                        <ul>
                          {selectedComponent.customizable.colors && <li>✅ Colores personalizables</li>}
                          {selectedComponent.customizable.sizes && <li>✅ Tamaños ajustables</li>}
                          {selectedComponent.customizable.animations && <li>✅ Animaciones configurables</li>}
                          {selectedComponent.customizable.spacing && <li>✅ Espaciado modificable</li>}
                          {selectedComponent.customizable.typography && <li>✅ Tipografía personalizable</li>}
                        </ul>

                        {selectedComponent.demo_url && (
                          <div className="mt-4">
                            <Button asChild>
                              <a href={selectedComponent.demo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Demo En Vivo
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Métricas de Performance</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Tamaño del bundle:</span>
                              <span className="font-mono">{formatSize(selectedComponent.performance.bundle_size_kb)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tiempo de renderizado:</span>
                              <span className="font-mono">{selectedComponent.performance.render_time_ms}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Uso de memoria:</span>
                              <span className="font-mono">{formatSize(selectedComponent.performance.memory_usage_kb)}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Compatibilidad de Navegadores</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Chrome:</span>
                              <span className="font-mono">{selectedComponent.browser_support.chrome}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Firefox:</span>
                              <span className="font-mono">{selectedComponent.browser_support.firefox}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Safari:</span>
                              <span className="font-mono">{selectedComponent.browser_support.safari}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Edge:</span>
                              <span className="font-mono">{selectedComponent.browser_support.edge}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="font-medium">Información General</Label>
                            <div className="mt-2 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Versión:</span>
                                <span>{selectedComponent.version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Autor:</span>
                                <span>{selectedComponent.author}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Organización:</span>
                                <span>{selectedComponent.organization}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Licencia:</span>
                                <span>{selectedComponent.license}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Creado:</span>
                                <span>{formatDate(selectedComponent.created_at)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Actualizado:</span>
                                <span>{formatDate(selectedComponent.updated_at)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedComponent.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="font-medium">Estadísticas</Label>
                            <div className="mt-2 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Descargas:</span>
                                <span>{formatNumber(selectedComponent.stats.downloads)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Me gusta:</span>
                                <span>{formatNumber(selectedComponent.stats.likes)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vistas:</span>
                                <span>{formatNumber(selectedComponent.stats.views)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Forks:</span>
                                <span>{formatNumber(selectedComponent.stats.forks)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Estrellas:</span>
                                <span>{formatNumber(selectedComponent.stats.stars)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="font-medium">Accesibilidad</Label>
                            <div className="mt-2 space-y-2">
                              {getAccessibilityBadge(selectedComponent.accessibility.wcag_level)}
                              <div className="grid grid-cols-1 gap-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${selectedComponent.accessibility.keyboard_navigation ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>Navegación por teclado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${selectedComponent.accessibility.screen_reader ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>Compatible con lectores de pantalla</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${selectedComponent.accessibility.color_contrast ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>Contraste de color adecuado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="w-80 border-l pl-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-4">
                        <Code className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="font-semibold mb-2">{selectedComponent.display_name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{selectedComponent.description}</p>
                      
                      <div className="space-y-2">
                        <Button className="w-full" size="lg">
                          <Download className="w-4 h-4 mr-2" />
                          {selectedComponent.is_premium ? `Comprar $${selectedComponent.price}` : 'Descargar Gratis'}
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Heart className="w-4 h-4 mr-1" />
                            Me gusta
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Share2 className="w-4 h-4 mr-1" />
                            Compartir
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Dependencias</h4>
                      {selectedComponent.dependencies.length > 0 ? (
                        <div className="space-y-2">
                          {selectedComponent.dependencies.map((dep) => (
                            <div key={dep} className="flex items-center gap-2 text-sm">
                              <Box className="w-4 h-4 text-gray-400" />
                              <span>{dep}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Sin dependencias</p>
                      )}
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