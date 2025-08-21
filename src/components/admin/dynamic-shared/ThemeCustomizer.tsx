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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  Filter, 
  Palette, 
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
  Sun,
  Moon,
  Paintbrush,
  Type,
  Spacing,
  BorderStyle,
  Layers,
  Grid3x3,
  Layout,
  Zap,
  CheckCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  MousePointer,
  Move,
  Image,
  Box,
  Circle,
  Square,
  Triangle,
  Droplets
} from 'lucide-react'

interface ColorPalette {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text_primary: string
    text_secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  created_at: string
}

interface Typography {
  id: string
  name: string
  fonts: {
    primary: {
      family: string
      weights: number[]
      fallback: string
    }
    secondary: {
      family: string
      weights: number[]
      fallback: string
    }
    mono: {
      family: string
      weights: number[]
      fallback: string
    }
  }
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  line_heights: {
    tight: string
    normal: string
    relaxed: string
    loose: string
  }
  letter_spacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
  }
}

interface SpacingSystem {
  id: string
  name: string
  scale: 'linear' | 'geometric' | 'fibonacci' | 'custom'
  values: {
    '0': string
    '1': string
    '2': string
    '3': string
    '4': string
    '5': string
    '6': string
    '8': string
    '10': string
    '12': string
    '16': string
    '20': string
    '24': string
    '32': string
    '40': string
    '48': string
    '56': string
    '64': string
    '80': string
    '96': string
    auto: string
  }
}

interface BorderRadius {
  id: string
  name: string
  values: {
    none: string
    sm: string
    default: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
  }
}

interface ShadowSystem {
  id: string
  name: string
  shadows: {
    sm: string
    default: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
    none: string
  }
}

interface Theme {
  id: string
  name: string
  description: string
  version: string
  author: string
  colors: ColorPalette
  typography: Typography
  spacing: SpacingSystem
  border_radius: BorderRadius
  shadows: ShadowSystem
  components: {
    buttons: Record<string, any>
    inputs: Record<string, any>
    cards: Record<string, any>
    navigation: Record<string, any>
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      ease_in: string
      ease_out: string
      ease_in_out: string
      linear: string
    }
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  dark_mode: boolean
  is_default: boolean
  is_custom: boolean
  preview_image?: string
  downloads: number
  rating: number
  created_at: string
  updated_at: string
}

interface ThemePreset {
  id: string
  name: string
  category: 'business' | 'creative' | 'minimal' | 'modern' | 'classic' | 'colorful'
  description: string
  theme: Theme
  preview_image: string
  is_premium: boolean
  price?: number
  downloads: number
  rating: number
}

export default function ThemeCustomizer() {
  const [activeTab, setActiveTab] = useState('colors')
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [darkMode, setDarkMode] = useState(false)
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
  const [activeThemeTab, setActiveThemeTab] = useState('overview')
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f9fafb',
    text_primary: '#111827',
    text_secondary: '#6b7280'
  })

  const mockThemes: Theme[] = [
    {
      id: '1',
      name: 'Modern Blue',
      description: 'Tema moderno con tonos azules y diseño clean',
      version: '2.1.0',
      author: 'Design Team',
      colors: {
        id: '1',
        name: 'Modern Blue Palette',
        colors: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f9fafb',
          text_primary: '#111827',
          text_secondary: '#6b7280',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        created_at: '2024-01-15'
      },
      typography: {
        id: '1',
        name: 'Modern Typography',
        fonts: {
          primary: { family: 'Inter', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
          secondary: { family: 'Inter', weights: [400, 500, 600], fallback: 'sans-serif' },
          mono: { family: 'JetBrains Mono', weights: [400, 500, 600], fallback: 'monospace' }
        },
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        line_heights: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.625',
          loose: '2'
        },
        letter_spacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em'
        }
      },
      spacing: {
        id: '1',
        name: 'Standard Spacing',
        scale: 'linear',
        values: {
          '0': '0px',
          '1': '0.25rem',
          '2': '0.5rem',
          '3': '0.75rem',
          '4': '1rem',
          '5': '1.25rem',
          '6': '1.5rem',
          '8': '2rem',
          '10': '2.5rem',
          '12': '3rem',
          '16': '4rem',
          '20': '5rem',
          '24': '6rem',
          '32': '8rem',
          '40': '10rem',
          '48': '12rem',
          '56': '14rem',
          '64': '16rem',
          '80': '20rem',
          '96': '24rem',
          auto: 'auto'
        }
      },
      border_radius: {
        id: '1',
        name: 'Modern Radius',
        values: {
          none: '0px',
          sm: '0.125rem',
          default: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
          full: '9999px'
        }
      },
      shadows: {
        id: '1',
        name: 'Soft Shadows',
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
          none: '0 0 #0000'
        }
      },
      components: {
        buttons: {},
        inputs: {},
        cards: {},
        navigation: {}
      },
      animations: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: {
          ease_in: 'cubic-bezier(0.4, 0, 1, 1)',
          ease_out: 'cubic-bezier(0, 0, 0.2, 1)',
          ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',
          linear: 'linear'
        }
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      dark_mode: false,
      is_default: true,
      is_custom: false,
      downloads: 2340,
      rating: 4.8,
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '2',
      name: 'Dark Professional',
      description: 'Tema oscuro profesional para aplicaciones empresariales',
      version: '1.5.2',
      author: 'Pro Themes',
      colors: {
        id: '2',
        name: 'Dark Professional Palette',
        colors: {
          primary: '#6366f1',
          secondary: '#94a3b8',
          accent: '#f59e0b',
          background: '#0f172a',
          surface: '#1e293b',
          text_primary: '#f8fafc',
          text_secondary: '#94a3b8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4'
        },
        created_at: '2024-02-20'
      },
      typography: {
        id: '2',
        name: 'Professional Typography',
        fonts: {
          primary: { family: 'Roboto', weights: [300, 400, 500, 700], fallback: 'sans-serif' },
          secondary: { family: 'Roboto', weights: [400, 500], fallback: 'sans-serif' },
          mono: { family: 'Roboto Mono', weights: [400, 500], fallback: 'monospace' }
        },
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        line_heights: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.625',
          loose: '2'
        },
        letter_spacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em'
        }
      },
      spacing: {
        id: '2',
        name: 'Professional Spacing',
        scale: 'geometric',
        values: {
          '0': '0px',
          '1': '0.25rem',
          '2': '0.5rem',
          '3': '0.75rem',
          '4': '1rem',
          '5': '1.25rem',
          '6': '1.5rem',
          '8': '2rem',
          '10': '2.5rem',
          '12': '3rem',
          '16': '4rem',
          '20': '5rem',
          '24': '6rem',
          '32': '8rem',
          '40': '10rem',
          '48': '12rem',
          '56': '14rem',
          '64': '16rem',
          '80': '20rem',
          '96': '24rem',
          auto: 'auto'
        }
      },
      border_radius: {
        id: '2',
        name: 'Sharp Radius',
        values: {
          none: '0px',
          sm: '0.125rem',
          default: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
          full: '9999px'
        }
      },
      shadows: {
        id: '2',
        name: 'Dark Shadows',
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
          default: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
          none: '0 0 #0000'
        }
      },
      components: {
        buttons: {},
        inputs: {},
        cards: {},
        navigation: {}
      },
      animations: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: {
          ease_in: 'cubic-bezier(0.4, 0, 1, 1)',
          ease_out: 'cubic-bezier(0, 0, 0.2, 1)',
          ease_in_out: 'cubic-bezier(0.4, 0, 0.2, 1)',
          linear: 'linear'
        }
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      dark_mode: true,
      is_default: false,
      is_custom: false,
      downloads: 1580,
      rating: 4.6,
      created_at: '2024-02-20',
      updated_at: '2024-11-25'
    }
  ]

  const mockPresets: ThemePreset[] = [
    {
      id: '1',
      name: 'Corporate Professional',
      category: 'business',
      description: 'Tema profesional ideal para aplicaciones empresariales',
      theme: mockThemes[0],
      preview_image: '/themes/corporate.jpg',
      is_premium: false,
      downloads: 5420,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Creative Studio',
      category: 'creative',
      description: 'Tema vibrante para estudios creativos y portfolios',
      theme: mockThemes[1],
      preview_image: '/themes/creative.jpg',
      is_premium: true,
      price: 19.99,
      downloads: 2340,
      rating: 4.9
    }
  ]

  const filteredPresets = useMemo(() => {
    return mockPresets.filter(preset => {
      const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           preset.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || preset.category === filterCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, filterCategory])

  const getCategoryBadge = useCallback((category: string) => {
    const categoryConfig = {
      business: { label: 'Empresarial', className: 'bg-blue-100 text-blue-700' },
      creative: { label: 'Creativo', className: 'bg-purple-100 text-purple-700' },
      minimal: { label: 'Minimalista', className: 'bg-gray-100 text-gray-700' },
      modern: { label: 'Moderno', className: 'bg-green-100 text-green-700' },
      classic: { label: 'Clásico', className: 'bg-orange-100 text-orange-700' },
      colorful: { label: 'Colorido', className: 'bg-pink-100 text-pink-700' }
    }
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, className: 'bg-gray-100 text-gray-700' }
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
          <h1 className="text-3xl font-bold">Personalizador de Temas</h1>
          <p className="text-gray-600">Crea y personaliza temas para tu aplicación</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tema
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar temas y presets..."
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
            <SelectItem value="business">Empresarial</SelectItem>
            <SelectItem value="creative">Creativo</SelectItem>
            <SelectItem value="minimal">Minimalista</SelectItem>
            <SelectItem value="modern">Moderno</SelectItem>
            <SelectItem value="classic">Clásico</SelectItem>
            <SelectItem value="colorful">Colorido</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Sun className={`w-4 h-4 ${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          <Moon className={`w-4 h-4 ${darkMode ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">Colores</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="spacing">Espaciado</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Paleta de Colores Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(customColors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-sm font-medium capitalize">
                          {key.replace('_', ' ')}
                        </Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                            style={{ backgroundColor: value }}
                          />
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) => setCustomColors(prev => ({
                              ...prev,
                              [key]: e.target.value
                            }))}
                            className="w-20"
                          />
                        </div>
                        <Input
                          value={value}
                          onChange={(e) => setCustomColors(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          className="text-xs font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restablecer
                    </Button>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar CSS
                    </Button>
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Paleta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paletas Predefinidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockThemes.map((theme) => (
                      <div key={theme.id} className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{theme.colors.name}</h4>
                          <Button variant="outline" size="sm">Aplicar</Button>
                        </div>
                        <div className="flex gap-1">
                          {Object.entries(theme.colors.colors).slice(0, 8).map(([key, color]) => (
                            <div
                              key={key}
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: color }}
                              title={`${key}: ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
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
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'max-w-xs' : 
                    previewMode === 'tablet' ? 'max-w-sm' : 'w-full'
                  }`} style={{ 
                    backgroundColor: customColors.background,
                    color: customColors.text_primary
                  }}>
                    <div className="p-4 space-y-4">
                      <div 
                        className="px-4 py-2 rounded font-medium text-center text-white"
                        style={{ backgroundColor: customColors.primary }}
                      >
                        Botón Principal
                      </div>
                      <div 
                        className="px-4 py-2 rounded border"
                        style={{ 
                          backgroundColor: customColors.surface,
                          borderColor: customColors.secondary
                        }}
                      >
                        <h4 className="font-semibold mb-2">Tarjeta de Ejemplo</h4>
                        <p className="text-sm" style={{ color: customColors.text_secondary }}>
                          Este es el contenido de la tarjeta usando los colores seleccionados.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: customColors.success }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: customColors.warning }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: customColors.error }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: customColors.accent }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generador de Colores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">Color Base</Label>
                    <div className="flex gap-2 mt-2">
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: customColors.primary }}
                      />
                      <Input
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors(prev => ({
                          ...prev,
                          primary: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Generar Complementarios
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Droplets className="w-4 h-4 mr-2" />
                      Generar Análogos
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Triangle className="w-4 h-4 mr-2" />
                      Generar Triádicos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Configuración de Fuentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Fuente Principal</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Fuente Secundaria</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Fuente Monoespaciada</Label>
                  <Select defaultValue="jetbrains">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                      <SelectItem value="firacode">Fira Code</SelectItem>
                      <SelectItem value="sourcecodepro">Source Code Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tamaño Base</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[16]}
                      max={24}
                      min={12}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">16px</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Interlineado Base</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[1.5]}
                      max={2.5}
                      min={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">1.5</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Espaciado de Letras</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[0]}
                      max={0.1}
                      min={-0.05}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="text-sm w-16 text-right">0em</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa Tipográfica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-5xl font-bold">Título Principal</h1>
                    <p className="text-sm text-gray-500 mt-1">text-5xl, font-bold</p>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold">Título Secundario</h2>
                    <p className="text-sm text-gray-500 mt-1">text-3xl, font-semibold</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">Subtítulo</h3>
                    <p className="text-sm text-gray-500 mt-1">text-xl, font-medium</p>
                  </div>
                  <div>
                    <p className="text-base">
                      Este es un párrafo de texto regular que muestra cómo se ve el contenido normal 
                      con la configuración tipográfica actual.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">text-base</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Texto secundario más pequeño para información adicional.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">text-sm</p>
                  </div>
                  <div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      console.log('Fuente monoespaciada')
                    </code>
                    <p className="text-sm text-gray-500 mt-1">font-mono</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spacing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Sistema de Espaciado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Escala de Espaciado</Label>
                  <Select defaultValue="linear">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear (4px base)</SelectItem>
                      <SelectItem value="geometric">Geométrica (1.5x)</SelectItem>
                      <SelectItem value="fibonacci">Fibonacci</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Unidad Base</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[4]}
                      max={16}
                      min={2}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">4px</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Label className="text-sm font-medium">Valores de Espaciado</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { key: '1', value: '4px' },
                      { key: '2', value: '8px' },
                      { key: '3', value: '12px' },
                      { key: '4', value: '16px' },
                      { key: '6', value: '24px' },
                      { key: '8', value: '32px' },
                      { key: '12', value: '48px' },
                      { key: '16', value: '64px' }
                    ].map((item) => (
                      <div key={item.key} className="flex justify-between p-2 border rounded">
                        <span className="font-mono text-xs">{item.key}</span>
                        <span className="font-mono text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa de Espaciado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Espaciado Pequeño (4px)</Label>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-blue-200"></div>
                      <div className="w-4 h-4 bg-blue-200"></div>
                      <div className="w-4 h-4 bg-blue-200"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Espaciado Medio (16px)</Label>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-green-200"></div>
                      <div className="w-8 h-8 bg-green-200"></div>
                      <div className="w-8 h-8 bg-green-200"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs text-gray-500">Espaciado Grande (32px)</Label>
                    <div className="flex gap-8">
                      <div className="w-12 h-12 bg-purple-200"></div>
                      <div className="w-12 h-12 bg-purple-200"></div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-xs text-gray-500">Ejemplo de Layout</Label>
                    <div className="mt-2 p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Tarjeta de Ejemplo</h4>
                      <p className="text-sm mb-4">
                        Este contenido muestra cómo se aplica el espaciado configurado.
                      </p>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded">
                        Botón
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personalización de Componentes</h3>
            <p className="text-gray-600 mb-4">
              Personaliza el estilo de componentes individuales como botones, inputs, cards, etc.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Personalizar Componente
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresets.map((preset) => (
              <Card key={preset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <div className="flex gap-2">
                      {preset.is_premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          Premium
                        </Badge>
                      )}
                      {getCategoryBadge(preset.category)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <p className="text-sm text-gray-600">{preset.description}</p>
                  
                  <div className="flex gap-1">
                    {Object.entries(preset.theme.colors.colors).slice(0, 6).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-blue-500" />
                        <span>{formatNumber(preset.downloads)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{preset.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Vista Previa
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      {preset.is_premium ? `$${preset.price}` : 'Aplicar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}