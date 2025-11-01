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
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  DollarSign,
  Calendar,
  Clock,
  Users,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  BarChart,
  Zap,
  Building,
  Globe,
  Star,
  Percent,
  Calculator,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Info
} from 'lucide-react'

// Types and Interfaces
interface ProjectAnalyticsData {
  id: string
  title: string
  client: string
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled'
  category: string
  start_date: string
  planned_end_date: string
  actual_end_date?: string
  budget: {
    planned: number
    spent: number
    remaining: number
    currency: 'PEN' | 'USD'
  }
  progress: {
    overall: number
    design: number
    construction: number
    supervision: number
    documentation: number
  }
  kpis: {
    on_time: boolean
    on_budget: boolean
    quality_score: number
    client_satisfaction: number
    team_performance: number
    safety_score: number
  }
  risks: {
    level: 'low' | 'medium' | 'high' | 'critical'
    count: number
    active_issues: number
  }
  team: {
    size: number
    efficiency: number
    turnover_rate: number
  }
  timeline: {
    planned_duration: number // days
    actual_duration?: number // days
    delays: number // days
  }
  location: {
    region: string
    city: string
    zone_type: 'urban' | 'rural' | 'industrial'
  }
  created_at: string
  updated_at: string
}

interface PerformanceMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  averageCompletion: number
  totalBudget: number
  spentBudget: number
  budgetUtilization: number
  averageClientSatisfaction: number
  onTimeDelivery: number
  onBudgetDelivery: number
  averageQualityScore: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  monthlyProgress: Array<{
    month: string
    completed: number
    started: number
    budget_spent: number
  }>
  categoryPerformance: Array<{
    category: string
    count: number
    avg_completion: number
    avg_satisfaction: number
    total_budget: number
  }>
}

interface ProjectAnalyticsProps {
  projects?: ProjectAnalyticsData[]
  onProjectsChange?: (projects: ProjectAnalyticsData[]) => void
  onRefreshData?: () => void
  onExportReport?: (type: 'pdf' | 'excel' | 'csv') => void
  className?: string
}

const STATUS_CONFIG = {
  planning: { label: 'Planificación', color: 'bg-blue-100 text-blue-800', icon: Clock },
  active: { label: 'Activo', color: 'bg-green-100 text-green-800', icon: Activity },
  completed: { label: 'Completado', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const RISK_CONFIG = {
  low: { label: 'Bajo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  high: { label: 'Alto', color: 'bg-cyan-100 text-cyan-800', icon: AlertTriangle },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const PROJECT_CATEGORIES = [
  'Infraestructura Vial',
  'Edificaciones',
  'Saneamiento',
  'Energía',
  'Telecomunicaciones',
  'Puertos y Aeropuertos',
  'Minería',
  'Agricultura',
  'Educación',
  'Salud'
]

export default function ProjectAnalytics({ 
  projects = [], 
  onProjectsChange,
  onRefreshData,
  onExportReport,
  className 
}: ProjectAnalyticsProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risks' | 'timeline' | 'comparison'>('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<ProjectAnalyticsData | null>(null)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filtered Projects based on selected filters
  const filteredProjects = useMemo(() => {
    let filtered = projects

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus)
    }

    // Apply time range filter
    if (selectedTimeRange !== 'all') {
      const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      filtered = filtered.filter(p => new Date(p.updated_at) >= cutoffDate)
    }

    return filtered
  }, [projects, selectedCategory, selectedStatus, selectedTimeRange])

  // Performance Metrics Calculation
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter(p => p.status === 'active').length
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length
    const averageCompletion = filteredProjects.reduce((sum, p) => sum + p.progress.overall, 0) / totalProjects || 0
    
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget.planned, 0)
    const spentBudget = filteredProjects.reduce((sum, p) => sum + p.budget.spent, 0)
    const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
    
    const averageClientSatisfaction = filteredProjects.reduce((sum, p) => sum + p.kpis.client_satisfaction, 0) / totalProjects || 0
    const onTimeDelivery = (filteredProjects.filter(p => p.kpis.on_time).length / totalProjects) * 100 || 0
    const onBudgetDelivery = (filteredProjects.filter(p => p.kpis.on_budget).length / totalProjects) * 100 || 0
    const averageQualityScore = filteredProjects.reduce((sum, p) => sum + p.kpis.quality_score, 0) / totalProjects || 0

    const riskDistribution = {
      low: filteredProjects.filter(p => p.risks.level === 'low').length,
      medium: filteredProjects.filter(p => p.risks.level === 'medium').length,
      high: filteredProjects.filter(p => p.risks.level === 'high').length,
      critical: filteredProjects.filter(p => p.risks.level === 'critical').length
    }

    // Monthly progress simulation
    const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'short' })
      return {
        month,
        completed: Math.floor(Math.random() * 10) + 1,
        started: Math.floor(Math.random() * 15) + 5,
        budget_spent: Math.floor(Math.random() * 1000000) + 500000
      }
    })

    // Category performance
    const categoryPerformance = PROJECT_CATEGORIES.map(category => {
      const categoryProjects = filteredProjects.filter(p => p.category === category)
      return {
        category,
        count: categoryProjects.length,
        avg_completion: categoryProjects.reduce((sum, p) => sum + p.progress.overall, 0) / categoryProjects.length || 0,
        avg_satisfaction: categoryProjects.reduce((sum, p) => sum + p.kpis.client_satisfaction, 0) / categoryProjects.length || 0,
        total_budget: categoryProjects.reduce((sum, p) => sum + p.budget.planned, 0)
      }
    }).filter(cat => cat.count > 0)

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      averageCompletion,
      totalBudget,
      spentBudget,
      budgetUtilization,
      averageClientSatisfaction,
      onTimeDelivery,
      onBudgetDelivery,
      averageQualityScore,
      riskDistribution,
      monthlyProgress,
      categoryPerformance
    }
  }, [filteredProjects])

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefreshData?.()
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefreshData])

  const handleExportReport = useCallback((type: 'pdf' | 'excel' | 'csv') => {
    onExportReport?.(type)
  }, [onExportReport])

  const handleViewProject = useCallback((project: ProjectAnalyticsData) => {
    setSelectedProject(project)
  }, [])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    return config?.icon || Activity
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Proyectos</h2>
          <p className="text-gray-600 mt-1">
            Análisis avanzado del rendimiento y métricas de proyectos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Select onValueChange={(value) => handleExportReport(value as 'pdf' | 'excel' | 'csv')}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as typeof selectedTimeRange)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                  <SelectItem value="all">Todo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {PROJECT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {filteredProjects.length} proyectos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riesgos
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Comparación
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
                    <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalProjects}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performanceMetrics.activeProjects} activos • {performanceMetrics.completedProjects} completados
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.averageCompletion.toFixed(1)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${performanceMetrics.averageCompletion}%` }}
                      />
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(performanceMetrics.totalBudget)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performanceMetrics.budgetUtilization.toFixed(1)}% utilizado
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfacción Cliente</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.averageClientSatisfaction.toFixed(1)}/5
                    </p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < performanceMetrics.averageClientSatisfaction
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Entrega a Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceMetrics.onTimeDelivery)}`}>
                    {performanceMetrics.onTimeDelivery.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">de proyectos a tiempo</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${performanceMetrics.onTimeDelivery >= 90 ? 'bg-green-600' : 
                        performanceMetrics.onTimeDelivery >= 70 ? 'bg-blue-600' : 
                        performanceMetrics.onTimeDelivery >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${performanceMetrics.onTimeDelivery}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cumplimiento Presupuestal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceMetrics.onBudgetDelivery)}`}>
                    {performanceMetrics.onBudgetDelivery.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">dentro del presupuesto</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${performanceMetrics.onBudgetDelivery >= 90 ? 'bg-green-600' : 
                        performanceMetrics.onBudgetDelivery >= 70 ? 'bg-blue-600' : 
                        performanceMetrics.onBudgetDelivery >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${performanceMetrics.onBudgetDelivery}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Puntuación de Calidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceMetrics.averageQualityScore)}`}>
                    {performanceMetrics.averageQualityScore.toFixed(1)}/100
                  </p>
                  <p className="text-sm text-gray-600 mt-1">puntuación promedio</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${performanceMetrics.averageQualityScore >= 90 ? 'bg-green-600' : 
                        performanceMetrics.averageQualityScore >= 70 ? 'bg-blue-600' : 
                        performanceMetrics.averageQualityScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${performanceMetrics.averageQualityScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Distribución de Riesgos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(performanceMetrics.riskDistribution).map(([level, count]) => {
                  const config = RISK_CONFIG[level as keyof typeof RISK_CONFIG]
                  const Icon = config.icon
                  const percentage = performanceMetrics.totalProjects > 0 ? (count / performanceMetrics.totalProjects) * 100 : 0
                  
                  return (
                    <div key={level} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Icon className={`h-8 w-8 ${level === 'low' ? 'text-green-600' : 
                          level === 'medium' ? 'text-yellow-600' : 
                          level === 'high' ? 'text-cyan-600' : 'text-red-600'}`} />
                      </div>
                      <p className="font-semibold">{config.label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Categoría</th>
                      <th className="text-center py-3">Proyectos</th>
                      <th className="text-center py-3">Progreso Promedio</th>
                      <th className="text-center py-3">Satisfacción</th>
                      <th className="text-right py-3">Presupuesto Total</th>
                      <th className="text-center py-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMetrics.categoryPerformance
                      .sort((a, b) => b.total_budget - a.total_budget)
                      .map((category) => (
                        <tr key={category.category} className="border-b last:border-b-0">
                          <td className="py-3 font-medium">{category.category}</td>
                          <td className="text-center py-3">{category.count}</td>
                          <td className="text-center py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${category.avg_completion}%` }}
                                />
                              </div>
                              <span className="text-xs">{category.avg_completion.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3">
                            <div className="flex justify-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < category.avg_satisfaction
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="text-right py-3 font-medium">
                            {formatCurrency(category.total_budget)}
                          </td>
                          <td className="text-center py-3">
                            <Badge className={`${(category.avg_completion * 0.4 + category.avg_satisfaction * 20) >= 90 ? 'bg-green-100 text-green-800' : 
                              (category.avg_completion * 0.4 + category.avg_satisfaction * 20) >= 70 ? 'bg-blue-100 text-blue-800' : 
                              (category.avg_completion * 0.4 + category.avg_satisfaction * 20) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {((category.avg_completion * 0.4 + category.avg_satisfaction * 20)).toFixed(0)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mejores Proyectos por Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProjects
                    .sort((a, b) => b.progress.overall - a.progress.overall)
                    .slice(0, 5)
                    .map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{project.title}</p>
                            <p className="text-xs text-gray-500">{project.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{project.progress.overall}%</p>
                          <Badge className={STATUS_CONFIG[project.status].color} size="sm">
                            {STATUS_CONFIG[project.status].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mejores Proyectos por Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProjects
                    .sort((a, b) => b.kpis.client_satisfaction - a.kpis.client_satisfaction)
                    .slice(0, 5)
                    .map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{project.title}</p>
                            <p className="text-xs text-gray-500">{project.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < project.kpis.client_satisfaction
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {project.kpis.client_satisfaction}/5
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          {/* High Risk Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Proyectos de Alto Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects
                  .filter(p => p.risks.level === 'high' || p.risks.level === 'critical')
                  .map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.client}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={RISK_CONFIG[project.risks.level].color}>
                              {RISK_CONFIG[project.risks.level].label} Riesgo
                            </Badge>
                            <Badge variant="outline">
                              {project.risks.active_issues} problemas activos
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProject(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {filteredProjects.filter(p => p.risks.level === 'high' || p.risks.level === 'critical').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No hay proyectos de alto riesgo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {/* Monthly Progress Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de progreso temporal</p>
                  <p className="text-sm text-gray-500">Visualización de tendencias mensuales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects
                  .filter(p => p.status === 'active')
                  .sort((a, b) => new Date(a.planned_end_date).getTime() - new Date(b.planned_end_date).getTime())
                  .slice(0, 5)
                  .map((project) => {
                    const daysUntilDeadline = Math.ceil((new Date(project.planned_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-gray-600">{project.client}</p>
                          <p className="text-xs text-gray-500">
                            Vence: {new Date(project.planned_end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={daysUntilDeadline <= 7 ? 'bg-red-100 text-red-800' : 
                            daysUntilDeadline <= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {daysUntilDeadline > 0 ? `${daysUntilDeadline} días` : 'Vencido'}
                          </Badge>
                          <div className="mt-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${project.progress.overall}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Budget vs Actual Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación Presupuesto vs Gasto Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects.slice(0, 10).map((project) => {
                  const spentPercentage = (project.budget.spent / project.budget.planned) * 100
                  
                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{project.title}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.planned)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${spentPercentage > 100 ? 'bg-red-600' : 
                            spentPercentage > 90 ? 'bg-yellow-600' : 'bg-green-600'}`}
                          style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{spentPercentage.toFixed(1)}% utilizado</span>
                        <span>{project.progress.overall}% completado</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                {selectedProject.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información del Proyecto</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Cliente:</span> {selectedProject.client}</p>
                  <p><span className="font-medium">Categoría:</span> {selectedProject.category}</p>
                  <p><span className="font-medium">Estado:</span> 
                    <Badge className={STATUS_CONFIG[selectedProject.status].color} size="sm">
                      {STATUS_CONFIG[selectedProject.status].label}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Ubicación:</span> {selectedProject.location.city}, {selectedProject.location.region}</p>
                </div>
              </div>

              {/* Budget Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información Financiera</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Presupuesto:</span> {formatCurrency(selectedProject.budget.planned, selectedProject.budget.currency)}</p>
                  <p><span className="font-medium">Gastado:</span> {formatCurrency(selectedProject.budget.spent, selectedProject.budget.currency)}</p>
                  <p><span className="font-medium">Restante:</span> {formatCurrency(selectedProject.budget.remaining, selectedProject.budget.currency)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(selectedProject.budget.spent / selectedProject.budget.planned) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <h3 className="font-semibold">Progreso del Proyecto</h3>
                <div className="space-y-3">
                  {Object.entries(selectedProject.progress).map(([phase, progress]) => (
                    <div key={phase}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{phase.replace('_', ' ')}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="space-y-4">
                <h3 className="font-semibold">Indicadores Clave</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">A tiempo</p>
                    <p className={selectedProject.kpis.on_time ? 'text-green-600' : 'text-red-600'}>
                      {selectedProject.kpis.on_time ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">En presupuesto</p>
                    <p className={selectedProject.kpis.on_budget ? 'text-green-600' : 'text-red-600'}>
                      {selectedProject.kpis.on_budget ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Calidad</p>
                    <p>{selectedProject.kpis.quality_score}/100</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Seguridad</p>
                    <p>{selectedProject.kpis.safety_score}/100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Information */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Información de Riesgos</h3>
              <div className="flex gap-2">
                <Badge className={RISK_CONFIG[selectedProject.risks.level].color}>
                  Nivel: {RISK_CONFIG[selectedProject.risks.level].label}
                </Badge>
                <Badge variant="outline">
                  {selectedProject.risks.active_issues} problemas activos
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}