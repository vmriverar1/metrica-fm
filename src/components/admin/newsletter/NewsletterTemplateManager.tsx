'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Send, 
  Download, 
  Upload,
  Mail,
  Palette,
  Layout,
  Type,
  Image,
  Code,
  Settings,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react'

interface NewsletterTemplate {
  id: string
  name: string
  description: string
  category: 'newsletter' | 'announcement' | 'promotion' | 'digest' | 'welcome'
  thumbnail: string
  html_content: string
  text_content: string
  subject_template: string
  preheader: string
  tags: string[]
  variables: { name: string; type: string; default: string; description: string }[]
  styling: {
    primary_color: string
    secondary_color: string
    font_family: string
    header_background: string
    footer_background: string
  }
  responsive: boolean
  created_date: string
  last_used?: string
  usage_count: number
  performance_metrics?: {
    avg_open_rate: number
    avg_click_rate: number
    total_sends: number
    revenue_generated: number
  }
  status: 'active' | 'inactive' | 'draft'
  created_by: string
}

interface TemplateStats {
  totalTemplates: number
  activeTemplates: number
  totalSends: number
  avgOpenRate: number
  avgClickRate: number
  topPerformers: NewsletterTemplate[]
}

interface NewsletterTemplateManagerProps {
  templates: NewsletterTemplate[]
  stats: TemplateStats
  onCreateTemplate: (template: Omit<NewsletterTemplate, 'id'>) => Promise<void>
  onUpdateTemplate: (id: string, updates: Partial<NewsletterTemplate>) => Promise<void>
  onDeleteTemplate: (id: string) => Promise<void>
  onDuplicateTemplate: (id: string) => Promise<void>
  onPreviewTemplate: (template: NewsletterTemplate) => void
  onTestSend: (templateId: string, emails: string[]) => Promise<void>
  onExportTemplate: (templateId: string, format: 'html' | 'json') => Promise<void>
  onImportTemplate: (file: File) => Promise<void>
  loading?: boolean
}

export default function NewsletterTemplateManager({
  templates,
  stats,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onPreviewTemplate,
  onTestSend,
  onExportTemplate,
  onImportTemplate,
  loading = false
}: NewsletterTemplateManagerProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NewsletterTemplate | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('visual')

  // Template form state
  const [formData, setFormData] = useState<Partial<NewsletterTemplate>>({
    name: '',
    description: '',
    category: 'newsletter',
    html_content: '',
    text_content: '',
    subject_template: '',
    preheader: '',
    tags: [],
    variables: [],
    styling: {
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      font_family: 'Arial, sans-serif',
      header_background: '#F8FAFC',
      footer_background: '#1F2937'
    },
    responsive: true,
    status: 'active'
  })

  // Category configurations
  const categoryConfig = {
    newsletter: { label: 'Newsletter', color: 'bg-blue-100 text-blue-800', icon: <Mail className="h-4 w-4" /> },
    announcement: { label: 'Anuncio', color: 'bg-purple-100 text-purple-800', icon: <AlertCircle className="h-4 w-4" /> },
    promotion: { label: 'Promoción', color: 'bg-green-100 text-green-800', icon: <Target className="h-4 w-4" /> },
    digest: { label: 'Resumen', color: 'bg-yellow-100 text-yellow-800', icon: <BarChart3 className="h-4 w-4" /> },
    welcome: { label: 'Bienvenida', color: 'bg-pink-100 text-pink-800', icon: <Star className="h-4 w-4" /> }
  }

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Handle template selection
  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const selectAllTemplates = () => {
    setSelectedTemplates(
      selectedTemplates.length === filteredTemplates.length 
        ? []
        : filteredTemplates.map(template => template.id)
    )
  }

  // Form operations
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'newsletter',
      html_content: '',
      text_content: '',
      subject_template: '',
      preheader: '',
      tags: [],
      variables: [],
      styling: {
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        font_family: 'Arial, sans-serif',
        header_background: '#F8FAFC',
        footer_background: '#1F2937'
      },
      responsive: true,
      status: 'active'
    })
    setEditingTemplate(null)
    setShowCreateModal(false)
  }

  const handleEdit = (template: NewsletterTemplate) => {
    setFormData(template)
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await onUpdateTemplate(editingTemplate.id, formData)
      } else {
        await onCreateTemplate(formData as Omit<NewsletterTemplate, 'id'>)
      }
      resetForm()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Handle test send
  const [testEmails, setTestEmails] = useState('')
  const handleTestSend = async (templateId: string) => {
    const emails = testEmails.split(',').map(email => email.trim()).filter(Boolean)
    if (emails.length === 0) return
    
    try {
      await onTestSend(templateId, emails)
      setTestEmails('')
    } catch (error) {
      console.error('Test send failed:', error)
    }
  }

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Render template card
  const renderTemplateCard = (template: NewsletterTemplate) => {
    const isSelected = selectedTemplates.includes(template.id)
    const category = categoryConfig[template.category]
    
    return (
      <Card 
        key={template.id}
        className={`transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <CardContent className="p-0">
          {/* Template Thumbnail */}
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Mail className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPreviewTemplate(template)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(template)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDuplicateTemplate(template.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleTemplateSelection(template.id)}
              className="absolute top-2 left-2 rounded"
            />
            
            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <Badge 
                className={
                  template.status === 'active' ? 'bg-green-100 text-green-800' :
                  template.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }
              >
                {template.status === 'active' ? 'Activo' : 
                 template.status === 'inactive' ? 'Inactivo' : 'Borrador'}
              </Badge>
            </div>
          </div>
          
          {/* Template Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {template.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Badge className={category.color}>
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </Badge>
              
              {template.responsive && (
                <Badge variant="outline">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Responsive
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Performance metrics */}
            {template.performance_metrics && (
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900">
                    {formatPercent(template.performance_metrics.avg_open_rate)}
                  </p>
                  <p className="text-gray-600">Open Rate</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">
                    {formatPercent(template.performance_metrics.avg_click_rate)}
                  </p>
                  <p className="text-gray-600">Click Rate</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>Usado {template.usage_count} veces</span>
              <span>{formatDate(template.created_date)}</span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(template)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicateTemplate(template.id)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteTemplate(template.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Templates
          </h1>
          <p className="text-gray-600">
            Crea y administra plantillas para newsletters y campañas de email
          </p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json,.html"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportTemplate(file)
            }}
            className="hidden"
            id="import-template"
          />
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-template')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold">{stats.totalTemplates}</p>
              </div>
              <Layout className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.activeTemplates}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Envíos</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalSends)}</p>
              </div>
              <Send className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Rate Prom.</p>
                <p className="text-2xl font-bold">{formatPercent(stats.avgOpenRate)}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Rate Prom.</p>
                <p className="text-2xl font-bold">{formatPercent(stats.avgClickRate)}</p>
              </div>
              <Target className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar templates por nombre, descripción o tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todas las categorías</option>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="draft">Borradores</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTemplates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} seleccionado{selectedTemplates.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Activar
                </Button>
                <Button variant="outline" size="sm">
                  Desactivar
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Templates ({filteredTemplates.length})
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAllTemplates}
        >
          {selectedTemplates.length === filteredTemplates.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </Button>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay templates
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'No se encontraron templates con los filtros aplicados' 
              : 'Comienza creando tu primer template de newsletter'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(renderTemplateCard)}
        </div>
      )}

      {/* Test Send Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Envío de Prueba</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emails para prueba (separados por comas)
            </label>
            <Input
              value={testEmails}
              onChange={(e) => setTestEmails(e.target.value)}
              placeholder="email1@ejemplo.com, email2@ejemplo.com"
            />
          </div>
          
          <div className="flex gap-2">
            {selectedTemplates.slice(0, 1).map(templateId => {
              const template = templates.find(t => t.id === templateId)
              return template ? (
                <Button
                  key={templateId}
                  onClick={() => handleTestSend(templateId)}
                  disabled={!testEmails.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar "{template.name}"
                </Button>
              ) : null
            })}
            
            {selectedTemplates.length === 0 && (
              <p className="text-sm text-gray-500">
                Selecciona un template para enviar prueba
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Template Modal would go here */}
      {/* For brevity, I'm not including the full modal implementation */}
    </div>
  )
}