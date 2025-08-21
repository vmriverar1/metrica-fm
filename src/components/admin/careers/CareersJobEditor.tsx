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
import { Switch } from '@/components/ui/switch'
import { 
  Briefcase, 
  Users, 
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  Upload,
  Download,
  Search,
  Filter,
  Building,
  GraduationCap,
  Target,
  Award,
  Globe,
  Languages,
  Heart,
  Zap,
  TrendingUp,
  BarChart3,
  FileText,
  Link,
  Mail,
  Phone,
  User,
  Settings,
  Activity,
  AlertCircle,
  Info
} from 'lucide-react'

// Types and Interfaces
interface JobPosting {
  id: string
  title: string
  department: string
  location: {
    type: 'remote' | 'onsite' | 'hybrid'
    city?: string
    region?: string
    country: string
    address?: string
    coordinates?: [number, number]
    remote_policy?: string
  }
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  salary: {
    min: number
    max: number
    currency: 'PEN' | 'USD'
    period: 'hourly' | 'monthly' | 'annual'
    negotiable: boolean
    show_salary: boolean
  }
  description: string
  responsibilities: string[]
  requirements: {
    education: {
      level: 'high_school' | 'technical' | 'bachelor' | 'master' | 'phd'
      field?: string
      required: boolean
    }
    experience: {
      years_min: number
      years_max?: number
      industries?: string[]
      specific_roles?: string[]
    }
    skills: {
      technical: string[]
      soft: string[]
      languages: {
        language: string
        level: 'basic' | 'intermediate' | 'advanced' | 'native'
        required: boolean
      }[]
      certifications?: string[]
    }
    other?: string[]
  }
  benefits: {
    health_insurance: boolean
    dental_insurance: boolean
    retirement_plan: boolean
    paid_vacation: number // days
    sick_leave: number // days
    flexible_hours: boolean
    remote_work: boolean
    professional_development: boolean
    gym_membership: boolean
    transportation: boolean
    meal_allowance: boolean
    bonus_structure: boolean
    stock_options: boolean
    custom_benefits: string[]
  }
  company_info: {
    name: string
    description: string
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
    industry: string
    website?: string
    culture_values: string[]
  }
  application: {
    how_to_apply: 'internal_form' | 'email' | 'external_link'
    email?: string
    external_url?: string
    required_documents: string[]
    custom_questions: {
      id: string
      question: string
      type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file'
      options?: string[]
      required: boolean
    }[]
  }
  status: 'draft' | 'active' | 'paused' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  seo: {
    slug: string
    meta_title?: string
    meta_description?: string
    keywords: string[]
  }
  analytics: {
    views: number
    applications: number
    conversion_rate: number
    avg_time_on_page: number
    top_referrers: string[]
  }
  created_at: string
  updated_at: string
  posted_at?: string
  expires_at?: string
  created_by: string
  tags: string[]
}

interface CareersJobEditorProps {
  job?: JobPosting
  onSave?: (job: JobPosting) => void
  onCancel?: () => void
  onDelete?: (jobId: string) => void
  mode?: 'create' | 'edit' | 'view'
  className?: string
}

const DEPARTMENTS = [
  'Ingeniería',
  'Arquitectura',
  'Gestión de Proyectos',
  'Finanzas',
  'Recursos Humanos',
  'Marketing',
  'Ventas',
  'Operaciones',
  'Legal',
  'IT',
  'Calidad',
  'Seguridad',
  'Administración'
]

const INDUSTRIES = [
  'Infraestructura',
  'Construcción',
  'Minería',
  'Energía',
  'Transporte',
  'Telecomunicaciones',
  'Agua y Saneamiento',
  'Educación',
  'Salud',
  'Gobierno',
  'Tecnología'
]

const EMPLOYMENT_TYPE_CONFIG = {
  full_time: { label: 'Tiempo Completo', color: 'bg-green-100 text-green-800' },
  part_time: { label: 'Tiempo Parcial', color: 'bg-blue-100 text-blue-800' },
  contract: { label: 'Contrato', color: 'bg-purple-100 text-purple-800' },
  internship: { label: 'Prácticas', color: 'bg-yellow-100 text-yellow-800' },
  freelance: { label: 'Freelance', color: 'bg-orange-100 text-orange-800' }
}

const EXPERIENCE_LEVEL_CONFIG = {
  entry: { label: 'Sin Experiencia', color: 'bg-gray-100 text-gray-800' },
  junior: { label: 'Junior (1-2 años)', color: 'bg-green-100 text-green-800' },
  mid: { label: 'Semi-Senior (3-5 años)', color: 'bg-blue-100 text-blue-800' },
  senior: { label: 'Senior (5+ años)', color: 'bg-purple-100 text-purple-800' },
  lead: { label: 'Lead (7+ años)', color: 'bg-orange-100 text-orange-800' },
  executive: { label: 'Ejecutivo (10+ años)', color: 'bg-red-100 text-red-800' }
}

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: FileText },
  active: { label: 'Activo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  closed: { label: 'Cerrado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
}

export default function CareersJobEditor({ 
  job,
  onSave,
  onCancel,
  onDelete,
  mode = 'create',
  className 
}: CareersJobEditorProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'basic' | 'requirements' | 'benefits' | 'application' | 'seo' | 'analytics'>('basic')
  const [formData, setFormData] = useState<JobPosting>(() => {
    if (job) return job
    
    return {
      id: '',
      title: '',
      department: '',
      location: {
        type: 'onsite',
        country: 'Perú',
        city: 'Lima',
        region: 'Lima'
      },
      employment_type: 'full_time',
      experience_level: 'mid',
      salary: {
        min: 0,
        max: 0,
        currency: 'PEN',
        period: 'monthly',
        negotiable: true,
        show_salary: true
      },
      description: '',
      responsibilities: [],
      requirements: {
        education: {
          level: 'bachelor',
          required: true
        },
        experience: {
          years_min: 0
        },
        skills: {
          technical: [],
          soft: [],
          languages: [{
            language: 'Español',
            level: 'native',
            required: true
          }]
        }
      },
      benefits: {
        health_insurance: true,
        dental_insurance: false,
        retirement_plan: true,
        paid_vacation: 30,
        sick_leave: 15,
        flexible_hours: false,
        remote_work: false,
        professional_development: true,
        gym_membership: false,
        transportation: false,
        meal_allowance: false,
        bonus_structure: false,
        stock_options: false,
        custom_benefits: []
      },
      company_info: {
        name: 'Métrica DIP',
        description: 'Dirección Integral de Proyectos especializada en infraestructura',
        size: 'medium',
        industry: 'Infraestructura',
        culture_values: []
      },
      application: {
        how_to_apply: 'internal_form',
        required_documents: ['CV', 'Carta de Presentación'],
        custom_questions: []
      },
      status: 'draft',
      priority: 'medium',
      seo: {
        slug: '',
        keywords: []
      },
      analytics: {
        views: 0,
        applications: 0,
        conversion_rate: 0,
        avg_time_on_page: 0,
        top_referrers: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current_user',
      tags: []
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'El título es requerido'
    if (!formData.department) newErrors.department = 'El departamento es requerido'
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (formData.responsibilities.length === 0) newErrors.responsibilities = 'Al menos una responsabilidad es requerida'
    if (!formData.seo.slug.trim()) newErrors.slug = 'El slug es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && mode === 'create') {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          slug
        }
      }))
    }
  }, [formData.title, mode])

  // Event Handlers
  const handleSave = useCallback(async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const updatedJob = {
        ...formData,
        id: formData.id || `job_${Date.now()}`,
        updated_at: new Date().toISOString(),
        ...(mode === 'create' && { posted_at: new Date().toISOString() })
      }

      await onSave?.(updatedJob)
    } finally {
      setIsSaving(false)
    }
  }, [formData, mode, onSave, validateForm])

  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  const handleDelete = useCallback(() => {
    if (formData.id && window.confirm('¿Estás seguro de que deseas eliminar esta oferta de trabajo?')) {
      onDelete?.(formData.id)
    }
  }, [formData.id, onDelete])

  const handleAddItem = useCallback((field: string, value: string) => {
    if (!value.trim()) return

    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) current[keys[i]] = {}
        current = current[keys[i]]
      }

      const lastKey = keys[keys.length - 1]
      if (!Array.isArray(current[lastKey])) current[lastKey] = []
      current[lastKey].push(value)

      return newData
    })
  }, [])

  const handleRemoveItem = useCallback((field: string, index: number) => {
    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      const lastKey = keys[keys.length - 1]
      current[lastKey].splice(index, 1)

      return newData
    })
  }, [])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const isReadOnly = mode === 'view'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nueva Oferta de Trabajo' : 
             mode === 'edit' ? 'Editar Oferta' : 
             'Ver Oferta de Trabajo'}
          </h2>
          {formData.title && (
            <p className="text-gray-600 mt-1">{formData.title}</p>
          )}
        </div>
        <div className="flex gap-2">
          {mode !== 'view' && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </>
          )}
          {mode === 'edit' && formData.id && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Status and Priority Bar */}
      {mode !== 'create' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_CONFIG[formData.status].color}>
                  {STATUS_CONFIG[formData.status].label}
                </Badge>
                <Badge className={PRIORITY_CONFIG[formData.priority].color}>
                  Prioridad {PRIORITY_CONFIG[formData.priority].label}
                </Badge>
              </div>
              
              {formData.analytics && (
                <div className="flex gap-4 text-sm text-gray-600">
                  <span><Eye className="inline h-4 w-4 mr-1" />{formData.analytics.views} vistas</span>
                  <span><Users className="inline h-4 w-4 mr-1" />{formData.analytics.applications} aplicaciones</span>
                  <span><TrendingUp className="inline h-4 w-4 mr-1" />{formData.analytics.conversion_rate.toFixed(1)}% conversión</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Requisitos
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Beneficios
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Aplicación
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Puesto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="ej. Ingeniero de Proyectos Senior"
                    disabled={isReadOnly}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="department">Departamento *</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_type">Tipo de Empleo</Label>
                  <Select 
                    value={formData.employment_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value as any }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EMPLOYMENT_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience_level">Nivel de Experiencia</Label>
                  <Select 
                    value={formData.experience_level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value as any }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPERIENCE_LEVEL_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isReadOnly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="description">Descripción del Puesto *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el puesto, la empresa y lo que hace especial esta oportunidad..."
                  rows={6}
                  disabled={isReadOnly}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Modalidad de Trabajo</Label>
                <Select 
                  value={formData.location.type} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, type: value as any }
                  }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Presencial</SelectItem>
                    <SelectItem value="remote">Remoto</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.location.type !== 'remote' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, country: e.target.value }
                      }))}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      value={formData.location.region || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, region: e.target.value }
                      }))}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.location.city || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, city: e.target.value }
                      }))}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {formData.location.type === 'hybrid' && (
                <div>
                  <Label htmlFor="remote_policy">Política de Trabajo Remoto</Label>
                  <Textarea
                    id="remote_policy"
                    value={formData.location.remote_policy || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, remote_policy: e.target.value }
                    }))}
                    placeholder="ej. 3 días en oficina, 2 días remoto por semana"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="salary_min">Salario Mínimo</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary.min}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, min: Number(e.target.value) }
                    }))}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Salario Máximo</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary.max}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, max: Number(e.target.value) }
                    }))}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select 
                    value={formData.salary.currency} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, currency: value as any }
                    }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN (S/.)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Período</Label>
                  <Select 
                    value={formData.salary.period} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, period: value as any }
                    }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por Hora</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="salary_negotiable"
                    checked={formData.salary.negotiable}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, negotiable: checked }
                    }))}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="salary_negotiable">Salario Negociable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_salary"
                    checked={formData.salary.show_salary}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, show_salary: checked }
                    }))}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="show_salary">Mostrar Salario Público</Label>
                </div>
              </div>

              {formData.salary.min > 0 && formData.salary.max > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Rango salarial: {formatCurrency(formData.salary.min, formData.salary.currency)} - {formatCurrency(formData.salary.max, formData.salary.currency)} {formData.salary.period === 'monthly' ? 'mensual' : formData.salary.period === 'annual' ? 'anual' : 'por hora'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Responsabilidades *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      value={responsibility}
                      onChange={(e) => {
                        const newResponsibilities = [...formData.responsibilities]
                        newResponsibilities[index] = e.target.value
                        setFormData(prev => ({ ...prev, responsibilities: newResponsibilities }))
                      }}
                      placeholder="Describe una responsabilidad..."
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem('responsibilities', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {!isReadOnly && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nueva responsabilidad..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement
                        if (target.value.trim()) {
                          handleAddItem('responsibilities', target.value)
                          target.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Nueva responsabilidad..."]') as HTMLInputElement
                      if (input?.value.trim()) {
                        handleAddItem('responsibilities', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {errors.responsibilities && <p className="text-sm text-red-500">{errors.responsibilities}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          {/* Education Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Requisitos Educativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nivel Educativo</Label>
                  <Select 
                    value={formData.requirements.education.level} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { 
                        ...prev.requirements, 
                        education: { ...prev.requirements.education, level: value as any }
                      }
                    }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">Secundaria</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="bachelor">Universitario</SelectItem>
                      <SelectItem value="master">Maestría</SelectItem>
                      <SelectItem value="phd">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="education_field">Campo de Estudio</Label>
                  <Input
                    id="education_field"
                    value={formData.requirements.education.field || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { 
                        ...prev.requirements, 
                        education: { ...prev.requirements.education, field: e.target.value }
                      }
                    }))}
                    placeholder="ej. Ingeniería Civil, Arquitectura"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="education_required"
                  checked={formData.requirements.education.required}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    requirements: { 
                      ...prev.requirements, 
                      education: { ...prev.requirements.education, required: checked }
                    }
                  }))}
                  disabled={isReadOnly}
                />
                <Label htmlFor="education_required">Requisito Obligatorio</Label>
              </div>
            </CardContent>
          </Card>

          {/* Experience Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Experiencia Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_min">Años Mínimos de Experiencia</Label>
                  <Input
                    id="years_min"
                    type="number"
                    min="0"
                    value={formData.requirements.experience.years_min}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { 
                        ...prev.requirements, 
                        experience: { ...prev.requirements.experience, years_min: Number(e.target.value) }
                      }
                    }))}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="years_max">Años Máximos de Experiencia</Label>
                  <Input
                    id="years_max"
                    type="number"
                    min="0"
                    value={formData.requirements.experience.years_max || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { 
                        ...prev.requirements, 
                        experience: { ...prev.requirements.experience, years_max: e.target.value ? Number(e.target.value) : undefined }
                      }
                    }))}
                    placeholder="Opcional"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Habilidades Requeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technical Skills */}
              <div>
                <Label className="text-base font-medium">Habilidades Técnicas</Label>
                <div className="space-y-2 mt-2">
                  {formData.requirements.skills.technical.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...formData.requirements.skills.technical]
                          newSkills[index] = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            requirements: { 
                              ...prev.requirements, 
                              skills: { ...prev.requirements.skills, technical: newSkills }
                            }
                          }))
                        }}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem('requirements.skills.technical', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ej. AutoCAD, Project Management, BIM..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleAddItem('requirements.skills.technical', target.value)
                              target.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="AutoCAD"]') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleAddItem('requirements.skills.technical', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <Label className="text-base font-medium">Habilidades Blandas</Label>
                <div className="space-y-2 mt-2">
                  {formData.requirements.skills.soft.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...formData.requirements.skills.soft]
                          newSkills[index] = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            requirements: { 
                              ...prev.requirements, 
                              skills: { ...prev.requirements.skills, soft: newSkills }
                            }
                          }))
                        }}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem('requirements.skills.soft', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ej. Liderazgo, Comunicación, Trabajo en equipo..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleAddItem('requirements.skills.soft', target.value)
                              target.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Liderazgo"]') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleAddItem('requirements.skills.soft', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-base font-medium">Idiomas</Label>
                <div className="space-y-3 mt-2">
                  {formData.requirements.skills.languages.map((language, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        value={language.language}
                        onChange={(e) => {
                          const newLanguages = [...formData.requirements.skills.languages]
                          newLanguages[index] = { ...newLanguages[index], language: e.target.value }
                          setFormData(prev => ({ 
                            ...prev, 
                            requirements: { 
                              ...prev.requirements, 
                              skills: { ...prev.requirements.skills, languages: newLanguages }
                            }
                          }))
                        }}
                        placeholder="Idioma"
                        disabled={isReadOnly}
                      />
                      <Select
                        value={language.level}
                        onValueChange={(value) => {
                          const newLanguages = [...formData.requirements.skills.languages]
                          newLanguages[index] = { ...newLanguages[index], level: value as any }
                          setFormData(prev => ({ 
                            ...prev, 
                            requirements: { 
                              ...prev.requirements, 
                              skills: { ...prev.requirements.skills, languages: newLanguages }
                            }
                          }))
                        }}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                          <SelectItem value="native">Nativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={language.required}
                          onCheckedChange={(checked) => {
                            const newLanguages = [...formData.requirements.skills.languages]
                            newLanguages[index] = { ...newLanguages[index], required: checked }
                            setFormData(prev => ({ 
                              ...prev, 
                              requirements: { 
                                ...prev.requirements, 
                                skills: { ...prev.requirements.skills, languages: newLanguages }
                              }
                            }))
                          }}
                          disabled={isReadOnly}
                        />
                        <Label className="text-sm">Requerido</Label>
                      </div>
                      {!isReadOnly && formData.requirements.skills.languages.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newLanguages = [...formData.requirements.skills.languages]
                            newLanguages.splice(index, 1)
                            setFormData(prev => ({ 
                              ...prev, 
                              requirements: { 
                                ...prev.requirements, 
                                skills: { ...prev.requirements.skills, languages: newLanguages }
                              }
                            }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newLanguages = [
                          ...formData.requirements.skills.languages,
                          { language: '', level: 'intermediate' as const, required: false }
                        ]
                        setFormData(prev => ({ 
                          ...prev, 
                          requirements: { 
                            ...prev.requirements, 
                            skills: { ...prev.requirements.skills, languages: newLanguages }
                          }
                        }))
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Idioma
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Beneficios y Compensaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Standard Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Seguros y Salud</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="health_insurance">Seguro de Salud</Label>
                      <Switch
                        id="health_insurance"
                        checked={formData.benefits.health_insurance}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, health_insurance: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dental_insurance">Seguro Dental</Label>
                      <Switch
                        id="dental_insurance"
                        checked={formData.benefits.dental_insurance}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, dental_insurance: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gym_membership">Membresía Gimnasio</Label>
                      <Switch
                        id="gym_membership"
                        checked={formData.benefits.gym_membership}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, gym_membership: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Tiempo y Flexibilidad</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="paid_vacation">Días de Vacaciones</Label>
                      <Input
                        id="paid_vacation"
                        type="number"
                        min="0"
                        value={formData.benefits.paid_vacation}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, paid_vacation: Number(e.target.value) }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sick_leave">Días de Licencia por Enfermedad</Label>
                      <Input
                        id="sick_leave"
                        type="number"
                        min="0"
                        value={formData.benefits.sick_leave}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, sick_leave: Number(e.target.value) }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flexible_hours">Horarios Flexibles</Label>
                      <Switch
                        id="flexible_hours"
                        checked={formData.benefits.flexible_hours}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, flexible_hours: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="remote_work">Trabajo Remoto</Label>
                      <Switch
                        id="remote_work"
                        checked={formData.benefits.remote_work}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, remote_work: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Desarrollo Profesional</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="professional_development">Desarrollo Profesional</Label>
                      <Switch
                        id="professional_development"
                        checked={formData.benefits.professional_development}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, professional_development: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retirement_plan">Plan de Jubilación</Label>
                      <Switch
                        id="retirement_plan"
                        checked={formData.benefits.retirement_plan}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, retirement_plan: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compensaciones Adicionales</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="transportation">Transporte</Label>
                      <Switch
                        id="transportation"
                        checked={formData.benefits.transportation}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, transportation: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meal_allowance">Subsidio de Comida</Label>
                      <Switch
                        id="meal_allowance"
                        checked={formData.benefits.meal_allowance}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, meal_allowance: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bonus_structure">Estructura de Bonos</Label>
                      <Switch
                        id="bonus_structure"
                        checked={formData.benefits.bonus_structure}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, bonus_structure: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stock_options">Opciones de Acciones</Label>
                      <Switch
                        id="stock_options"
                        checked={formData.benefits.stock_options}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          benefits: { ...prev.benefits, stock_options: checked }
                        }))}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Benefits */}
              <div>
                <Label className="text-base font-medium">Beneficios Personalizados</Label>
                <div className="space-y-2 mt-2">
                  {formData.benefits.custom_benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...formData.benefits.custom_benefits]
                          newBenefits[index] = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            benefits: { ...prev.benefits, custom_benefits: newBenefits }
                          }))
                        }}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem('benefits.custom_benefits', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ej. Clases de inglés, Descuentos corporativos..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleAddItem('benefits.custom_benefits', target.value)
                              target.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Clases de inglés"]') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleAddItem('benefits.custom_benefits', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proceso de Aplicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Método de Aplicación</Label>
                <Select 
                  value={formData.application.how_to_apply} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    application: { ...prev.application, how_to_apply: value as any }
                  }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_form">Formulario Interno</SelectItem>
                    <SelectItem value="email">Por Email</SelectItem>
                    <SelectItem value="external_link">Enlace Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.application.how_to_apply === 'email' && (
                <div>
                  <Label htmlFor="application_email">Email de Aplicación</Label>
                  <Input
                    id="application_email"
                    type="email"
                    value={formData.application.email || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      application: { ...prev.application, email: e.target.value }
                    }))}
                    placeholder="rrhh@metricadip.com"
                    disabled={isReadOnly}
                  />
                </div>
              )}

              {formData.application.how_to_apply === 'external_link' && (
                <div>
                  <Label htmlFor="external_url">URL Externa</Label>
                  <Input
                    id="external_url"
                    type="url"
                    value={formData.application.external_url || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      application: { ...prev.application, external_url: e.target.value }
                    }))}
                    placeholder="https://aplicaciones.metricadip.com/trabajo/123"
                    disabled={isReadOnly}
                  />
                </div>
              )}

              {/* Required Documents */}
              <div>
                <Label className="text-base font-medium">Documentos Requeridos</Label>
                <div className="space-y-2 mt-2">
                  {formData.application.required_documents.map((document, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={document}
                        onChange={(e) => {
                          const newDocs = [...formData.application.required_documents]
                          newDocs[index] = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            application: { ...prev.application, required_documents: newDocs }
                          }))
                        }}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem('application.required_documents', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ej. Portfolio, Referencias laborales..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleAddItem('application.required_documents', target.value)
                              target.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Portfolio"]') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleAddItem('application.required_documents', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Questions */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Preguntas Personalizadas</Label>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newQuestion = {
                          id: `q_${Date.now()}`,
                          question: '',
                          type: 'text' as const,
                          required: false
                        }
                        setFormData(prev => ({ 
                          ...prev, 
                          application: { 
                            ...prev.application, 
                            custom_questions: [...prev.application.custom_questions, newQuestion]
                          }
                        }))
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Pregunta
                    </Button>
                  )}
                </div>

                <div className="space-y-4 mt-4">
                  {formData.application.custom_questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <Label>Pregunta</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => {
                              const newQuestions = [...formData.application.custom_questions]
                              newQuestions[index] = { ...newQuestions[index], question: e.target.value }
                              setFormData(prev => ({ 
                                ...prev, 
                                application: { ...prev.application, custom_questions: newQuestions }
                              }))
                            }}
                            placeholder="¿Por qué te interesa trabajar en Métrica DIP?"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Tipo de Respuesta</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => {
                              const newQuestions = [...formData.application.custom_questions]
                              newQuestions[index] = { ...newQuestions[index], type: value as any }
                              setFormData(prev => ({ 
                                ...prev, 
                                application: { ...prev.application, custom_questions: newQuestions }
                              }))
                            }}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto Corto</SelectItem>
                              <SelectItem value="textarea">Texto Largo</SelectItem>
                              <SelectItem value="select">Selección Única</SelectItem>
                              <SelectItem value="multiselect">Selección Múltiple</SelectItem>
                              <SelectItem value="file">Archivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={question.required}
                            onCheckedChange={(checked) => {
                              const newQuestions = [...formData.application.custom_questions]
                              newQuestions[index] = { ...newQuestions[index], required: checked }
                              setFormData(prev => ({ 
                                ...prev, 
                                application: { ...prev.application, custom_questions: newQuestions }
                              }))
                            }}
                            disabled={isReadOnly}
                          />
                          <Label>Requerido</Label>
                        </div>
                        {!isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newQuestions = [...formData.application.custom_questions]
                              newQuestions.splice(index, 1)
                              setFormData(prev => ({ 
                                ...prev, 
                                application: { ...prev.application, custom_questions: newQuestions }
                              }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.seo.slug}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, slug: e.target.value }
                  }))}
                  placeholder="ingeniero-proyectos-senior-lima"
                  disabled={isReadOnly}
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  URL: /careers/{formData.seo.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="meta_title">Meta Título</Label>
                <Input
                  id="meta_title"
                  value={formData.seo.meta_title || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, meta_title: e.target.value }
                  }))}
                  placeholder="Ingeniero de Proyectos Senior - Métrica DIP | Únete a nuestro equipo"
                  disabled={isReadOnly}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seo.meta_title?.length || 0}/60 caracteres recomendados
                </p>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Descripción</Label>
                <Textarea
                  id="meta_description"
                  value={formData.seo.meta_description || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, meta_description: e.target.value }
                  }))}
                  placeholder="Únete como Ingeniero de Proyectos Senior en Métrica DIP. Oportunidad de crecimiento en proyectos de infraestructura. Aplicar ahora."
                  rows={3}
                  disabled={isReadOnly}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seo.meta_description?.length || 0}/160 caracteres recomendados
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">Palabras Clave</Label>
                <div className="space-y-2 mt-2">
                  {formData.seo.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => {
                          const newKeywords = [...formData.seo.keywords]
                          newKeywords[index] = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            seo: { ...prev.seo, keywords: newKeywords }
                          }))
                        }}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem('seo.keywords', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="ej. ingeniero proyectos, infraestructura, lima..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement
                            if (target.value.trim()) {
                              handleAddItem('seo.keywords', target.value)
                              target.value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="ingeniero proyectos"]') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleAddItem('seo.keywords', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...formData.tags]
                        newTags[index] = e.target.value
                        setFormData(prev => ({ ...prev, tags: newTags }))
                      }}
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem('tags', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="ej. urgente, destacado, internacional..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          if (target.value.trim()) {
                            handleAddItem('tags', target.value)
                            target.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="urgente"]') as HTMLInputElement
                        if (input?.value.trim()) {
                          handleAddItem('tags', input.value)
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {mode === 'create' ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Disponible Después de Publicar</h3>
                <p className="text-gray-600">
                  Las métricas de rendimiento estarán disponibles una vez que la oferta esté publicada y activa.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vistas</p>
                        <p className="text-2xl font-bold text-blue-600">{formData.analytics.views}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aplicaciones</p>
                        <p className="text-2xl font-bold text-green-600">{formData.analytics.applications}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversión</p>
                        <p className="text-2xl font-bold text-purple-600">{formData.analytics.conversion_rate.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                        <p className="text-2xl font-bold text-orange-600">{Math.round(formData.analytics.avg_time_on_page / 60)}m</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Referrers */}
              <Card>
                <CardHeader>
                  <CardTitle>Principales Fuentes de Tráfico</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.analytics.top_referrers.length > 0 ? (
                    <div className="space-y-3">
                      {formData.analytics.top_referrers.map((referrer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{referrer}</span>
                          <Badge variant="outline">{Math.floor(Math.random() * 100)}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay datos de tráfico disponibles aún</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}