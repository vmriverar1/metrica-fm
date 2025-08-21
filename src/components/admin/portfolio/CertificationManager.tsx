'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  Award, 
  Shield, 
  FileCheck,
  Certificate,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Building,
  Users,
  Globe,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Bell,
  RefreshCw,
  FileText,
  Link,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react'

// Types and Interfaces
interface Certification {
  id: string
  name: string
  code: string
  category: 'quality' | 'environmental' | 'safety' | 'technical' | 'financial'
  type: 'iso' | 'ohsas' | 'leed' | 'government' | 'industry' | 'client'
  issuing_authority: string
  description: string
  requirements: string[]
  benefits: string[]
  validity_period: number // months
  cost_estimate: {
    initial: number
    annual: number
    currency: 'PEN' | 'USD'
  }
  difficulty_level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  applicable_projects: string[]
  market_value: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

interface ProjectCertification {
  id: string
  project_id: string
  project_title: string
  certification_id: string
  certification_name: string
  certification_code: string
  status: 'required' | 'in_progress' | 'obtained' | 'expired' | 'not_applicable'
  priority: 'low' | 'medium' | 'high' | 'critical'
  obtained_date?: string
  expiry_date?: string
  renewal_date?: string
  certificate_number?: string
  certificate_url?: string
  auditor_name?: string
  auditor_contact?: string
  compliance_score?: number
  last_audit_date?: string
  next_audit_date?: string
  findings: {
    id: string
    type: 'major' | 'minor' | 'observation'
    description: string
    status: 'open' | 'closed' | 'in_progress'
    due_date: string
    responsible: string
  }[]
  documents: {
    id: string
    name: string
    type: 'certificate' | 'audit_report' | 'compliance_document' | 'corrective_action'
    url: string
    upload_date: string
  }[]
  costs: {
    audit_fees: number
    certification_fees: number
    consultant_fees: number
    travel_expenses: number
    other_costs: number
    total: number
    currency: 'PEN' | 'USD'
  }
  notes: string
  created_at: string
  updated_at: string
}

interface CertificationAlert {
  id: string
  type: 'expiring_soon' | 'expired' | 'audit_due' | 'compliance_issue' | 'renewal_required'
  severity: 'low' | 'medium' | 'high' | 'critical'
  project_id: string
  project_title: string
  certification_name: string
  message: string
  due_date?: string
  days_remaining?: number
  created_at: string
  is_read: boolean
}

interface CertificationManagerProps {
  certifications?: Certification[]
  projectCertifications?: ProjectCertification[]
  alerts?: CertificationAlert[]
  onCertificationsChange?: (certifications: Certification[]) => void
  onProjectCertificationsChange?: (projectCertifications: ProjectCertification[]) => void
  onCreateCertification?: () => void
  onEditCertification?: (certificationId: string) => void
  onDeleteCertification?: (certificationId: string) => void
  onCreateProjectCertification?: () => void
  onEditProjectCertification?: (projectCertificationId: string) => void
  onDeleteProjectCertification?: (projectCertificationId: string) => void
  onUploadDocument?: (projectCertificationId: string) => void
  className?: string
}

const CERTIFICATION_CATEGORIES = {
  quality: { label: 'Calidad', color: 'bg-blue-100 text-blue-800', icon: Star },
  environmental: { label: 'Medio Ambiente', color: 'bg-green-100 text-green-800', icon: Globe },
  safety: { label: 'Seguridad', color: 'bg-red-100 text-red-800', icon: Shield },
  technical: { label: 'Técnica', color: 'bg-purple-100 text-purple-800', icon: Zap },
  financial: { label: 'Financiera', color: 'bg-yellow-100 text-yellow-800', icon: Target }
}

const CERTIFICATION_TYPES = {
  iso: { label: 'ISO', color: 'bg-blue-100 text-blue-800' },
  ohsas: { label: 'OHSAS', color: 'bg-red-100 text-red-800' },
  leed: { label: 'LEED', color: 'bg-green-100 text-green-800' },
  government: { label: 'Gubernamental', color: 'bg-gray-100 text-gray-800' },
  industry: { label: 'Industrial', color: 'bg-purple-100 text-purple-800' },
  client: { label: 'Cliente', color: 'bg-orange-100 text-orange-800' }
}

const STATUS_CONFIG = {
  required: { label: 'Requerida', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800', icon: Activity },
  obtained: { label: 'Obtenida', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  expired: { label: 'Expirada', color: 'bg-red-100 text-red-800', icon: XCircle },
  not_applicable: { label: 'No Aplicable', color: 'bg-gray-100 text-gray-800', icon: XCircle }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
}

const DIFFICULTY_LEVELS = {
  basic: { label: 'Básico', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Intermedio', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Avanzado', color: 'bg-orange-100 text-orange-800' },
  expert: { label: 'Experto', color: 'bg-red-100 text-red-800' }
}

const MARKET_VALUE = {
  low: { label: 'Bajo', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medio', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-800' }
}

export default function CertificationManager({ 
  certifications = [], 
  projectCertifications = [],
  alerts = [],
  onCertificationsChange,
  onProjectCertificationsChange,
  onCreateCertification,
  onEditCertification,
  onDeleteCertification,
  onCreateProjectCertification,
  onEditProjectCertification,
  onDeleteProjectCertification,
  onUploadDocument,
  className 
}: CertificationManagerProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'projects' | 'compliance' | 'alerts'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [selectedProjectCertification, setSelectedProjectCertification] = useState<ProjectCertification | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique projects for filter
  const uniqueProjects = useMemo(() => {
    const projects = [...new Set(projectCertifications.map(pc => ({ id: pc.project_id, title: pc.project_title })))]
    return projects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    )
  }, [projectCertifications])

  // Filtered Project Certifications
  const filteredProjectCertifications = useMemo(() => {
    let filtered = projectCertifications

    if (searchQuery) {
      filtered = filtered.filter(pc => 
        pc.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pc.certification_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pc.certification_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(pc => pc.status === filterStatus)
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(pc => pc.priority === filterPriority)
    }

    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [projectCertifications, searchQuery, filterStatus, filterPriority])

  // Certification Statistics
  const certificationStats = useMemo(() => {
    const totalCertifications = projectCertifications.length
    const obtainedCertifications = projectCertifications.filter(pc => pc.status === 'obtained').length
    const inProgressCertifications = projectCertifications.filter(pc => pc.status === 'in_progress').length
    const expiredCertifications = projectCertifications.filter(pc => pc.status === 'expired').length
    const requiredCertifications = projectCertifications.filter(pc => pc.status === 'required').length

    const complianceRate = totalCertifications > 0 ? (obtainedCertifications / totalCertifications) * 100 : 0

    // Expiring soon (within 30 days)
    const expiringSoon = projectCertifications.filter(pc => {
      if (!pc.expiry_date) return false
      const expiryDate = new Date(pc.expiry_date)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
    }).length

    // Total costs
    const totalCosts = projectCertifications.reduce((sum, pc) => sum + (pc.costs?.total || 0), 0)

    // Category distribution
    const categoryDistribution = Object.keys(CERTIFICATION_CATEGORIES).map(category => {
      const categoryCount = projectCertifications.filter(pc => {
        const cert = certifications.find(c => c.id === pc.certification_id)
        return cert?.category === category
      }).length
      return {
        category,
        count: categoryCount,
        percentage: totalCertifications > 0 ? (categoryCount / totalCertifications) * 100 : 0
      }
    })

    return {
      totalCertifications,
      obtainedCertifications,
      inProgressCertifications,
      expiredCertifications,
      requiredCertifications,
      complianceRate,
      expiringSoon,
      totalCosts,
      categoryDistribution
    }
  }, [projectCertifications, certifications])

  // Unread alerts
  const unreadAlerts = alerts.filter(alert => !alert.is_read)

  // Event Handlers
  const handleCreateCertification = useCallback(() => {
    onCreateCertification?.()
  }, [onCreateCertification])

  const handleEditCertification = useCallback((certificationId: string) => {
    onEditCertification?.(certificationId)
  }, [onEditCertification])

  const handleDeleteCertification = useCallback((certificationId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta certificación?')) {
      onDeleteCertification?.(certificationId)
    }
  }, [onDeleteCertification])

  const handleCreateProjectCertification = useCallback(() => {
    onCreateProjectCertification?.()
  }, [onCreateProjectCertification])

  const handleEditProjectCertification = useCallback((projectCertificationId: string) => {
    onEditProjectCertification?.(projectCertificationId)
  }, [onEditProjectCertification])

  const handleDeleteProjectCertification = useCallback((projectCertificationId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta certificación del proyecto?')) {
      onDeleteProjectCertification?.(projectCertificationId)
    }
  }, [onDeleteProjectCertification])

  const handleViewCertification = useCallback((certification: Certification) => {
    setSelectedCertification(certification)
  }, [])

  const handleViewProjectCertification = useCallback((projectCertification: ProjectCertification) => {
    setSelectedProjectCertification(projectCertification)
  }, [])

  const handleUploadDocument = useCallback((projectCertificationId: string) => {
    onUploadDocument?.(projectCertificationId)
  }, [onUploadDocument])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestor de Certificaciones</h2>
          <p className="text-gray-600 mt-1">
            Administra certificaciones, cumplimiento normativo y documentación de proyectos
          </p>
        </div>
        <div className="flex gap-2">
          {unreadAlerts.length > 0 && (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {unreadAlerts.length} alertas
            </Button>
          )}
          <Button onClick={handleCreateCertification} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Certificación
          </Button>
          <Button onClick={handleCreateProjectCertification} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar a Proyecto
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Certificate className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Cumplimiento
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Certificaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{certificationStats.totalCertifications}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {certificationStats.obtainedCertifications} obtenidas • {certificationStats.inProgressCertifications} en proceso
                    </p>
                  </div>
                  <Certificate className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Cumplimiento</p>
                    <p className="text-2xl font-bold text-green-600">{certificationStats.complianceRate.toFixed(1)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ width: `${certificationStats.complianceRate}%` }}
                      />
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Por Expirar</p>
                    <p className="text-2xl font-bold text-orange-600">{certificationStats.expiringSoon}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Próximos 30 días
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Costo Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(certificationStats.totalCosts)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Inversión total
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribución por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {certificationStats.categoryDistribution.map((category) => {
                  const categoryConfig = CERTIFICATION_CATEGORIES[category.category as keyof typeof CERTIFICATION_CATEGORIES]
                  const Icon = categoryConfig.icon
                  
                  return (
                    <div key={category.category} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-3">
                        <div className={`p-3 rounded-full ${categoryConfig.color.replace('text-', 'bg-').replace('800', '200')}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="font-semibold">{categoryConfig.label}</h3>
                      <p className="text-2xl font-bold text-blue-600 my-2">{category.count}</p>
                      <p className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificaciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectCertifications
                    .filter(pc => pc.status === 'obtained')
                    .sort((a, b) => new Date(b.obtained_date || '').getTime() - new Date(a.obtained_date || '').getTime())
                    .slice(0, 5)
                    .map((projectCert) => (
                      <div key={projectCert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{projectCert.certification_name}</p>
                            <p className="text-xs text-gray-500">{projectCert.project_title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {projectCert.obtained_date ? new Date(projectCert.obtained_date).toLocaleDateString() : 'N/A'}
                          </p>
                          <Badge className="bg-green-100 text-green-800" size="sm">
                            Obtenida
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
                {projectCertifications.filter(pc => pc.status === 'obtained').length === 0 && (
                  <div className="text-center py-8">
                    <Certificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay certificaciones obtenidas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas a Expirar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectCertifications
                    .filter(pc => pc.expiry_date && getDaysUntilExpiry(pc.expiry_date) <= 90 && getDaysUntilExpiry(pc.expiry_date) > 0)
                    .sort((a, b) => getDaysUntilExpiry(a.expiry_date!) - getDaysUntilExpiry(b.expiry_date!))
                    .slice(0, 5)
                    .map((projectCert) => {
                      const daysUntilExpiry = getDaysUntilExpiry(projectCert.expiry_date!)
                      
                      return (
                        <div key={projectCert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              daysUntilExpiry <= 30 ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                              <Clock className={`h-4 w-4 ${
                                daysUntilExpiry <= 30 ? 'text-red-600' : 'text-orange-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{projectCert.certification_name}</p>
                              <p className="text-xs text-gray-500">{projectCert.project_title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-medium ${
                              daysUntilExpiry <= 30 ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              {daysUntilExpiry} días
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(projectCert.expiry_date!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
                {projectCertifications.filter(pc => pc.expiry_date && getDaysUntilExpiry(pc.expiry_date) <= 90 && getDaysUntilExpiry(pc.expiry_date) > 0).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Todas las certificaciones están vigentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catálogo de Certificaciones</h3>
            <Button onClick={handleCreateCertification} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Certificación
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((certification) => {
              const categoryConfig = CERTIFICATION_CATEGORIES[certification.category]
              const typeConfig = CERTIFICATION_TYPES[certification.type]
              const difficultyConfig = DIFFICULTY_LEVELS[certification.difficulty_level]
              const marketValueConfig = MARKET_VALUE[certification.market_value]
              const CategoryIcon = categoryConfig.icon
              
              return (
                <Card key={certification.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${categoryConfig.color.replace('text-', 'bg-').replace('800', '200')}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-sm">{certification.name}</h3>
                          <p className="text-xs text-gray-500">{certification.code}</p>
                        </div>
                      </div>
                      <Badge className={marketValueConfig.color} size="sm">
                        {marketValueConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{certification.description}</p>
                    
                    <div className="flex gap-1 flex-wrap">
                      <Badge className={categoryConfig.color} size="sm">
                        {categoryConfig.label}
                      </Badge>
                      <Badge className={typeConfig.color} size="sm">
                        {typeConfig.label}
                      </Badge>
                      <Badge className={difficultyConfig.color} size="sm">
                        {difficultyConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Autoridad:</span>
                        <p className="font-medium truncate">{certification.issuing_authority}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Vigencia:</span>
                        <p className="font-medium">{certification.validity_period} meses</p>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-600">Costo inicial:</span>
                      <span className="ml-1 font-medium text-blue-600">
                        {formatCurrency(certification.cost_estimate.initial, certification.cost_estimate.currency)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCertification(certification)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCertification(certification.id)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCertification(certification.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {certifications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Certificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificaciones</h3>
                <p className="text-gray-600 mb-4">Comienza agregando certificaciones al catálogo</p>
                <Button onClick={handleCreateCertification}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Certificación
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar certificaciones de proyectos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={handleCreateProjectCertification} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar a Proyecto
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Mostrando {filteredProjectCertifications.length} de {projectCertifications.length} certificaciones
              </p>
            </CardHeader>
          </Card>

          {/* Project Certifications List */}
          <div className="space-y-4">
            {filteredProjectCertifications.map((projectCert) => {
              const statusConfig = STATUS_CONFIG[projectCert.status]
              const priorityConfig = PRIORITY_CONFIG[projectCert.priority]
              const StatusIcon = statusConfig.icon
              
              return (
                <Card key={projectCert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-full ${statusConfig.color.replace('text-', 'bg-').replace('800', '200')}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{projectCert.certification_name}</h3>
                              <p className="text-sm text-gray-600">{projectCert.project_title}</p>
                              <p className="text-xs text-gray-500">{projectCert.certification_code}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                              <Badge className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {projectCert.obtained_date && (
                              <div>
                                <span className="text-gray-600">Obtenida:</span>
                                <p className="font-medium">{new Date(projectCert.obtained_date).toLocaleDateString()}</p>
                              </div>
                            )}
                            {projectCert.expiry_date && (
                              <div>
                                <span className="text-gray-600">Expira:</span>
                                <p className={`font-medium ${getDaysUntilExpiry(projectCert.expiry_date) <= 30 ? 'text-red-600' : ''}`}>
                                  {new Date(projectCert.expiry_date).toLocaleDateString()}
                                  {getDaysUntilExpiry(projectCert.expiry_date) <= 90 && (
                                    <span className="ml-1 text-xs">
                                      ({getDaysUntilExpiry(projectCert.expiry_date)} días)
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            {projectCert.costs && (
                              <div>
                                <span className="text-gray-600">Costo:</span>
                                <p className="font-medium">{formatCurrency(projectCert.costs.total, projectCert.costs.currency)}</p>
                              </div>
                            )}
                          </div>

                          {projectCert.compliance_score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Cumplimiento:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                                <div 
                                  className={`h-2 rounded-full ${projectCert.compliance_score >= 90 ? 'bg-green-600' : 
                                    projectCert.compliance_score >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                  style={{ width: `${projectCert.compliance_score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{projectCert.compliance_score}%</span>
                            </div>
                          )}

                          {projectCert.findings.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-600">
                                {projectCert.findings.filter(f => f.status === 'open').length} hallazgos pendientes
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProjectCertification(projectCert)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProjectCertification(projectCert.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUploadDocument(projectCert.id)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredProjectCertifications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron certificaciones</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay certificaciones asignadas a proyectos'
                  }
                </p>
                <Button onClick={handleCreateProjectCertification}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Certificación a Proyecto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = projectCertifications.filter(pc => pc.status === status).length
                  const percentage = projectCertifications.length > 0 ? (count / projectCertifications.length) * 100 : 0
                  const Icon = config.icon
                  
                  return (
                    <div key={status} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-3">
                        <Icon className={`h-8 w-8 ${status === 'obtained' ? 'text-green-600' : 
                          status === 'in_progress' ? 'text-blue-600' : 
                          status === 'expired' ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-2xl font-bold my-2">{count}</p>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Findings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Hallazgos de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectCertifications
                  .filter(pc => pc.findings.length > 0)
                  .map((projectCert) => (
                    <div key={projectCert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{projectCert.certification_name}</h3>
                          <p className="text-sm text-gray-600">{projectCert.project_title}</p>
                        </div>
                        <Badge className={STATUS_CONFIG[projectCert.status].color}>
                          {STATUS_CONFIG[projectCert.status].label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {projectCert.findings.map((finding) => (
                          <div key={finding.id} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={finding.type === 'major' ? 'bg-red-100 text-red-800' : 
                                  finding.type === 'minor' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'} size="sm">
                                  {finding.type}
                                </Badge>
                                <Badge className={finding.status === 'open' ? 'bg-red-100 text-red-800' : 
                                  finding.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} size="sm">
                                  {finding.status}
                                </Badge>
                              </div>
                              <p className="text-sm">{finding.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Responsable: {finding.responsible} | Vence: {new Date(finding.due_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {projectCertifications.filter(pc => pc.findings.length > 0).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No hay hallazgos pendientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                        <Badge className={
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }>
                          {alert.severity === 'critical' ? 'Crítico' : 
                           alert.severity === 'high' ? 'Alto' :
                           alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="destructive" size="sm">Nuevo</Badge>
                        )}
                      </div>
                      <h3 className="font-medium">{alert.project_title} - {alert.certification_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      {alert.due_date && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          Fecha límite: {new Date(alert.due_date).toLocaleDateString()}
                          {alert.days_remaining !== undefined && (
                            <span className="ml-1">({alert.days_remaining} días restantes)</span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(alert.created_at).toLocaleDateString()} - {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
                <p className="text-gray-600">Todas las certificaciones están bajo control</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Certification Detail Modal */}
      {selectedCertification && (
        <Dialog open={!!selectedCertification} onOpenChange={() => setSelectedCertification(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Certificate className="h-5 w-5" />
                {selectedCertification.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Código</Label>
                    <p className="font-medium">{selectedCertification.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Autoridad Emisora</Label>
                    <p>{selectedCertification.issuing_authority}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Categoría</Label>
                    <Badge className={CERTIFICATION_CATEGORIES[selectedCertification.category].color}>
                      {CERTIFICATION_CATEGORIES[selectedCertification.category].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                    <Badge className={CERTIFICATION_TYPES[selectedCertification.type].color}>
                      {CERTIFICATION_TYPES[selectedCertification.type].label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nivel de Dificultad</Label>
                    <Badge className={DIFFICULTY_LEVELS[selectedCertification.difficulty_level].color}>
                      {DIFFICULTY_LEVELS[selectedCertification.difficulty_level].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valor de Mercado</Label>
                    <Badge className={MARKET_VALUE[selectedCertification.market_value].color}>
                      {MARKET_VALUE[selectedCertification.market_value].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Período de Validez</Label>
                    <p>{selectedCertification.validity_period} meses</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Costo Inicial</Label>
                    <p className="font-medium text-blue-600">
                      {formatCurrency(selectedCertification.cost_estimate.initial, selectedCertification.cost_estimate.currency)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Descripción</Label>
                <p className="text-sm">{selectedCertification.description}</p>
              </div>

              {selectedCertification.requirements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Requisitos</Label>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedCertification.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCertification.benefits.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Beneficios</Label>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedCertification.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Costo Anual</Label>
                  <p>{formatCurrency(selectedCertification.cost_estimate.annual, selectedCertification.cost_estimate.currency)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Proyectos Aplicables</Label>
                  <p>{selectedCertification.applicable_projects.length} tipos de proyecto</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Project Certification Detail Modal */}
      {selectedProjectCertification && (
        <Dialog open={!!selectedProjectCertification} onOpenChange={() => setSelectedProjectCertification(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                {selectedProjectCertification.certification_name} - {selectedProjectCertification.project_title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <Badge className={STATUS_CONFIG[selectedProjectCertification.status].color}>
                    {STATUS_CONFIG[selectedProjectCertification.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                  <Badge className={PRIORITY_CONFIG[selectedProjectCertification.priority].color}>
                    {PRIORITY_CONFIG[selectedProjectCertification.priority].label}
                  </Badge>
                </div>
                {selectedProjectCertification.compliance_score !== undefined && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Puntuación de Cumplimiento</Label>
                    <p className="text-lg font-bold">{selectedProjectCertification.compliance_score}%</p>
                  </div>
                )}
              </div>

              {selectedProjectCertification.obtained_date && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Fecha de Obtención</Label>
                    <p>{new Date(selectedProjectCertification.obtained_date).toLocaleDateString()}</p>
                  </div>
                  {selectedProjectCertification.expiry_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Expiración</Label>
                      <p className={getDaysUntilExpiry(selectedProjectCertification.expiry_date) <= 30 ? 'text-red-600 font-medium' : ''}>
                        {new Date(selectedProjectCertification.expiry_date).toLocaleDateString()}
                        {getDaysUntilExpiry(selectedProjectCertification.expiry_date) <= 90 && (
                          <span className="ml-2 text-sm">
                            ({getDaysUntilExpiry(selectedProjectCertification.expiry_date)} días restantes)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedProjectCertification.certificate_number && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Número de Certificado</Label>
                    <p className="font-mono">{selectedProjectCertification.certificate_number}</p>
                  </div>
                  {selectedProjectCertification.auditor_name && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Auditor</Label>
                      <p>{selectedProjectCertification.auditor_name}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedProjectCertification.costs && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Costos de Certificación</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Auditoría</p>
                      <p>{formatCurrency(selectedProjectCertification.costs.audit_fees, selectedProjectCertification.costs.currency)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Certificación</p>
                      <p>{formatCurrency(selectedProjectCertification.costs.certification_fees, selectedProjectCertification.costs.currency)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Consultoría</p>
                      <p>{formatCurrency(selectedProjectCertification.costs.consultant_fees, selectedProjectCertification.costs.currency)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Viajes</p>
                      <p>{formatCurrency(selectedProjectCertification.costs.travel_expenses, selectedProjectCertification.costs.currency)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Otros</p>
                      <p>{formatCurrency(selectedProjectCertification.costs.other_costs, selectedProjectCertification.costs.currency)}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-medium">Total</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(selectedProjectCertification.costs.total, selectedProjectCertification.costs.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedProjectCertification.findings.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">Hallazgos de Auditoría</Label>
                  <div className="space-y-3">
                    {selectedProjectCertification.findings.map((finding) => (
                      <div key={finding.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-2">
                            <Badge className={finding.type === 'major' ? 'bg-red-100 text-red-800' : 
                              finding.type === 'minor' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'} size="sm">
                              {finding.type}
                            </Badge>
                            <Badge className={finding.status === 'open' ? 'bg-red-100 text-red-800' : 
                              finding.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} size="sm">
                              {finding.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Vence: {new Date(finding.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm mb-2">{finding.description}</p>
                        <p className="text-xs text-gray-600">Responsable: {finding.responsible}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProjectCertification.documents.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">Documentos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProjectCertification.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm">{document.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{document.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={document.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProjectCertification.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Notas</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedProjectCertification.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}