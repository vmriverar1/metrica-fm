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
  Send, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Play,
  Pause,
  Stop,
  BarChart3,
  TrendingUp,
  Target,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Download,
  Settings,
  Zap,
  Globe,
  Heart,
  Share2,
  MousePointer,
  UserMinus,
  ArrowRight,
  FileText,
  Megaphone,
  Gift,
  Star,
  X
} from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader?: string
  template_id: string
  template_name: string
  type: 'newsletter' | 'promotional' | 'transactional' | 'announcement' | 'drip'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  recipient_count: number
  segment_criteria?: {
    tags: string[]
    locations: string[]
    behavior: string[]
    engagement: string
  }
  scheduling: {
    send_immediately: boolean
    send_date?: string
    timezone: string
    optimal_send_time: boolean
  }
  ab_testing?: {
    enabled: boolean
    test_type: 'subject' | 'content' | 'send_time'
    variant_a: any
    variant_b: any
    test_percentage: number
    winner_criteria: 'open_rate' | 'click_rate' | 'conversion'
  }
  tracking: {
    open_tracking: boolean
    click_tracking: boolean
    conversion_tracking: boolean
    utm_parameters: boolean
  }
  metrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
    spam_complaints: number
    conversions: number
    revenue: number
    open_rate: number
    click_rate: number
    unsubscribe_rate: number
    bounce_rate: number
    conversion_rate: number
  }
  created_date: string
  sent_date?: string
  created_by: string
  tags: string[]
  notes?: string
}

interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  avgOpenRate: number
  avgClickRate: number
  totalRevenue: number
  recentCampaigns: EmailCampaign[]
  topPerformers: EmailCampaign[]
}

interface EmailCampaignManagerProps {
  campaigns: EmailCampaign[]
  stats: CampaignStats
  templates: { id: string; name: string; category: string }[]
  segments: { id: string; name: string; size: number }[]
  onCreateCampaign: (campaign: Omit<EmailCampaign, 'id'>) => Promise<void>
  onUpdateCampaign: (id: string, updates: Partial<EmailCampaign>) => Promise<void>
  onDeleteCampaign: (id: string) => Promise<void>
  onDuplicateCampaign: (id: string) => Promise<void>
  onSendCampaign: (id: string) => Promise<void>
  onPauseCampaign: (id: string) => Promise<void>
  onResumeCampaign: (id: string) => Promise<void>
  onCancelCampaign: (id: string) => Promise<void>
  onPreviewCampaign: (campaign: EmailCampaign) => void
  onExportMetrics: (campaignId: string) => Promise<void>
  loading?: boolean
}

export default function EmailCampaignManager({
  campaigns,
  stats,
  templates,
  segments,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onDuplicateCampaign,
  onSendCampaign,
  onPauseCampaign,
  onResumeCampaign,
  onCancelCampaign,
  onPreviewCampaign,
  onExportMetrics,
  loading = false
}: EmailCampaignManagerProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Campaign form state
  const [formData, setFormData] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    preheader: '',
    template_id: '',
    type: 'newsletter',
    recipient_count: 0,
    scheduling: {
      send_immediately: true,
      timezone: 'America/Lima',
      optimal_send_time: false
    },
    tracking: {
      open_tracking: true,
      click_tracking: true,
      conversion_tracking: false,
      utm_parameters: true
    },
    tags: []
  })

  // Type configurations
  const typeConfig = {
    newsletter: { label: 'Newsletter', color: 'bg-blue-100 text-blue-800', icon: <Mail className="h-4 w-4" /> },
    promotional: { label: 'Promocional', color: 'bg-green-100 text-green-800', icon: <Gift className="h-4 w-4" /> },
    transactional: { label: 'Transaccional', color: 'bg-purple-100 text-purple-800', icon: <FileText className="h-4 w-4" /> },
    announcement: { label: 'Anuncio', color: 'bg-yellow-100 text-yellow-800', icon: <Megaphone className="h-4 w-4" /> },
    drip: { label: 'Secuencia', color: 'bg-indigo-100 text-indigo-800', icon: <Zap className="h-4 w-4" /> }
  }

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: <Edit className="h-4 w-4" /> },
    scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4" /> },
    sending: { label: 'Enviando', color: 'bg-yellow-100 text-yellow-800', icon: <RefreshCw className="h-4 w-4" /> },
    sent: { label: 'Enviada', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
    paused: { label: 'Pausada', color: 'bg-cyan-100 text-cyan-800', icon: <Pause className="h-4 w-4" /> },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: <X className="h-4 w-4" /> }
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || campaign.type === filterType
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Handle campaign selection
  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const selectAllCampaigns = () => {
    setSelectedCampaigns(
      selectedCampaigns.length === filteredCampaigns.length 
        ? []
        : filteredCampaigns.map(campaign => campaign.id)
    )
  }

  // Form operations
  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      preheader: '',
      template_id: '',
      type: 'newsletter',
      recipient_count: 0,
      scheduling: {
        send_immediately: true,
        timezone: 'America/Lima',
        optimal_send_time: false
      },
      tracking: {
        open_tracking: true,
        click_tracking: true,
        conversion_tracking: false,
        utm_parameters: true
      },
      tags: []
    })
    setEditingCampaign(null)
    setShowCreateModal(false)
  }

  const handleEdit = (campaign: EmailCampaign) => {
    setFormData(campaign)
    setEditingCampaign(campaign)
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        await onUpdateCampaign(editingCampaign.id, formData)
      } else {
        await onCreateCampaign(formData as Omit<EmailCampaign, 'id'>)
      }
      resetForm()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Campaign actions
  const handleCampaignAction = async (campaignId: string, action: string) => {
    try {
      switch (action) {
        case 'send':
          await onSendCampaign(campaignId)
          break
        case 'pause':
          await onPauseCampaign(campaignId)
          break
        case 'resume':
          await onResumeCampaign(campaignId)
          break
        case 'cancel':
          await onCancelCampaign(campaignId)
          break
        case 'duplicate':
          await onDuplicateCampaign(campaignId)
          break
        case 'delete':
          if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
            await onDeleteCampaign(campaignId)
          }
          break
      }
    } catch (error) {
      console.error(`${action} failed:`, error)
    }
  }

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get campaign performance score
  const getPerformanceScore = (metrics: EmailCampaign['metrics']) => {
    if (!metrics) return 0
    
    const openScore = Math.min(metrics.open_rate / 25 * 40, 40) // 25% open rate = 40 points
    const clickScore = Math.min(metrics.click_rate / 5 * 30, 30) // 5% click rate = 30 points  
    const unsubScore = Math.max(30 - (metrics.unsubscribe_rate * 10), 0) // Low unsub = higher score
    
    return Math.round(openScore + clickScore + unsubScore)
  }

  // Render campaign card
  const renderCampaignCard = (campaign: EmailCampaign) => {
    const isSelected = selectedCampaigns.includes(campaign.id)
    const typeInfo = typeConfig[campaign.type]
    const statusInfo = statusConfig[campaign.status]
    const performanceScore = campaign.metrics ? getPerformanceScore(campaign.metrics) : 0
    
    return (
      <Card 
        key={campaign.id}
        className={`transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCampaignSelection(campaign.id)}
              className="mt-1 rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                  {campaign.preheader && (
                    <p className="text-xs text-gray-500 mt-1">{campaign.preheader}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={typeInfo.color}>
                    {typeInfo.icon}
                    <span className="ml-1">{typeInfo.label}</span>
                  </Badge>
                  <Badge className={statusInfo.color}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.label}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{formatNumber(campaign.recipient_count)}</span>
                  </div>
                  <p className="text-gray-600">Destinatarios</p>
                </div>
                
                {campaign.metrics && (
                  <>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatPercent(campaign.metrics.open_rate)}</span>
                      </div>
                      <p className="text-gray-600">Apertura</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <MousePointer className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatPercent(campaign.metrics.click_rate)}</span>
                      </div>
                      <p className="text-gray-600">Clics</p>
                    </div>
                  </>
                )}
              </div>
              
              {campaign.metrics && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Performance Score</span>
                    <span className="text-sm font-medium">{performanceScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        performanceScore >= 80 ? 'bg-green-500' :
                        performanceScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${performanceScore}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(campaign.created_date)}</span>
                  </div>
                  
                  {campaign.sent_date && (
                    <div className="flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>{formatDate(campaign.sent_date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{campaign.template_name}</span>
                </div>
              </div>
              
              {campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {campaign.tags.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{campaign.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Campaign Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'send')}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  )}
                  
                  {campaign.status === 'sending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'pause')}
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'resume')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Reanudar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreviewCampaign(campaign)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Vista previa
                  </Button>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(campaign)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCampaignAction(campaign.id, 'duplicate')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  {campaign.metrics && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExportMetrics(campaign.id)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCampaignAction(campaign.id, 'delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
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
            Gestión de Campañas
          </h1>
          <p className="text-gray-600">
            Crea, programa y monitorea campañas de email marketing
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campañas</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enviados</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalSent)}</p>
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
              <MousePointer className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
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
                placeholder="Buscar campañas por nombre, asunto o tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
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
      {selectedCampaigns.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {selectedCampaigns.length} campaña{selectedCampaigns.length !== 1 ? 's' : ''} seleccionada{selectedCampaigns.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
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

      {/* Campaigns List */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Campañas ({filteredCampaigns.length})
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAllCampaigns}
        >
          {selectedCampaigns.length === filteredCampaigns.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </Button>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay campañas
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'No se encontraron campañas con los filtros aplicados' 
              : 'Comienza creando tu primera campaña de email'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera campaña
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map(renderCampaignCard)}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-blue-500" />
              <div className="text-center">
                <p className="font-medium">Campaña Express</p>
                <p className="text-sm text-gray-600">Envío rápido con template predefinido</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <p className="font-medium">Reporte Semanal</p>
                <p className="text-sm text-gray-600">Resumen automático de performance</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Target className="h-8 w-8 text-purple-500" />
              <div className="text-center">
                <p className="font-medium">A/B Test Setup</p>
                <p className="text-sm text-gray-600">Configurar pruebas de optimización</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Campaign Modal would go here */}
      {/* For brevity, I'm not including the full modal implementation */}
    </div>
  )
}