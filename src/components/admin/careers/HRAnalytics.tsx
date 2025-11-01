'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Award, 
  Clock, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  UserCheck,
  UserX,
  Briefcase,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface MetricData {
  id: string
  name: string
  value: number
  target?: number
  previous_value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change_percentage: number
  category: string
  last_updated: string
}

interface DepartmentMetrics {
  department: string
  total_employees: number
  active_positions: number
  satisfaction_score: number
  turnover_rate: number
  avg_performance: number
  budget_utilization: number
}

interface RecruitmentMetrics {
  period: string
  total_applications: number
  interviews_conducted: number
  offers_made: number
  offers_accepted: number
  time_to_hire: number
  cost_per_hire: number
  sources: {
    source: string
    applications: number
    hires: number
    conversion_rate: number
  }[]
}

interface PerformanceDistribution {
  rating_range: string
  count: number
  percentage: number
  department_breakdown: {
    department: string
    count: number
  }[]
}

interface RetentionAnalysis {
  period: string
  retention_rate: number
  voluntary_turnover: number
  involuntary_turnover: number
  exit_reasons: {
    reason: string
    count: number
    percentage: number
  }[]
  high_risk_employees: number
}

interface CompensationAnalysis {
  department: string
  avg_salary: number
  median_salary: number
  salary_range: {
    min: number
    max: number
  }
  gender_pay_gap: number
  performance_correlation: number
}

export default function HRAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('last_quarter')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const mockOverviewMetrics: MetricData[] = [
    {
      id: '1',
      name: 'Total Empleados',
      value: 145,
      previous_value: 138,
      unit: '',
      trend: 'up',
      change_percentage: 5.1,
      category: 'headcount',
      last_updated: '2024-12-20'
    },
    {
      id: '2',
      name: 'Tasa de Rotación',
      value: 12.4,
      target: 15,
      previous_value: 14.2,
      unit: '%',
      trend: 'down',
      change_percentage: -12.7,
      category: 'turnover',
      last_updated: '2024-12-20'
    },
    {
      id: '3',
      name: 'Satisfacción Empleados',
      value: 4.2,
      target: 4.0,
      previous_value: 3.9,
      unit: '/5',
      trend: 'up',
      change_percentage: 7.7,
      category: 'engagement',
      last_updated: '2024-12-20'
    },
    {
      id: '4',
      name: 'Tiempo Promedio Contratación',
      value: 28,
      target: 30,
      previous_value: 35,
      unit: 'días',
      trend: 'down',
      change_percentage: -20.0,
      category: 'recruitment',
      last_updated: '2024-12-20'
    },
    {
      id: '5',
      name: 'Costo por Contratación',
      value: 3500,
      target: 4000,
      previous_value: 3800,
      unit: 'PEN',
      trend: 'down',
      change_percentage: -7.9,
      category: 'recruitment',
      last_updated: '2024-12-20'
    },
    {
      id: '6',
      name: 'Performance Promedio',
      value: 3.8,
      target: 4.0,
      previous_value: 3.6,
      unit: '/5',
      trend: 'up',
      change_percentage: 5.6,
      category: 'performance',
      last_updated: '2024-12-20'
    }
  ]

  const mockDepartmentMetrics: DepartmentMetrics[] = [
    {
      department: 'Desarrollo',
      total_employees: 45,
      active_positions: 8,
      satisfaction_score: 4.3,
      turnover_rate: 8.2,
      avg_performance: 4.1,
      budget_utilization: 87
    },
    {
      department: 'Marketing',
      total_employees: 25,
      active_positions: 3,
      satisfaction_score: 4.0,
      turnover_rate: 15.1,
      avg_performance: 3.7,
      budget_utilization: 92
    },
    {
      department: 'Ventas',
      total_employees: 35,
      active_positions: 5,
      satisfaction_score: 3.9,
      turnover_rate: 18.5,
      avg_performance: 3.8,
      budget_utilization: 95
    },
    {
      department: 'Gestión',
      total_employees: 18,
      active_positions: 2,
      satisfaction_score: 4.4,
      turnover_rate: 5.3,
      avg_performance: 4.2,
      budget_utilization: 78
    },
    {
      department: 'Operaciones',
      total_employees: 22,
      active_positions: 4,
      satisfaction_score: 4.1,
      turnover_rate: 12.8,
      avg_performance: 3.9,
      budget_utilization: 89
    }
  ]

  const mockRecruitmentMetrics: RecruitmentMetrics = {
    period: 'Q4 2024',
    total_applications: 486,
    interviews_conducted: 127,
    offers_made: 23,
    offers_accepted: 18,
    time_to_hire: 28,
    cost_per_hire: 3500,
    sources: [
      { source: 'LinkedIn', applications: 198, hires: 8, conversion_rate: 4.0 },
      { source: 'Indeed', applications: 142, hires: 5, conversion_rate: 3.5 },
      { source: 'Referidos', applications: 89, hires: 4, conversion_rate: 4.5 },
      { source: 'Web Corporativa', applications: 57, hires: 1, conversion_rate: 1.8 }
    ]
  }

  const mockPerformanceDistribution: PerformanceDistribution[] = [
    {
      rating_range: '4.5 - 5.0',
      count: 28,
      percentage: 19.3,
      department_breakdown: [
        { department: 'Desarrollo', count: 12 },
        { department: 'Gestión', count: 8 },
        { department: 'Marketing', count: 5 },
        { department: 'Operaciones', count: 3 }
      ]
    },
    {
      rating_range: '4.0 - 4.4',
      count: 52,
      percentage: 35.9,
      department_breakdown: [
        { department: 'Desarrollo', count: 18 },
        { department: 'Ventas', count: 15 },
        { department: 'Marketing', count: 11 },
        { department: 'Operaciones', count: 8 }
      ]
    },
    {
      rating_range: '3.5 - 3.9',
      count: 41,
      percentage: 28.3,
      department_breakdown: [
        { department: 'Ventas', count: 14 },
        { department: 'Desarrollo', count: 11 },
        { department: 'Operaciones', count: 9 },
        { department: 'Marketing', count: 7 }
      ]
    },
    {
      rating_range: '3.0 - 3.4',
      count: 18,
      percentage: 12.4,
      department_breakdown: [
        { department: 'Ventas', count: 6 },
        { department: 'Marketing', count: 5 },
        { department: 'Desarrollo', count: 4 },
        { department: 'Operaciones', count: 3 }
      ]
    },
    {
      rating_range: '< 3.0',
      count: 6,
      percentage: 4.1,
      department_breakdown: [
        { department: 'Ventas', count: 3 },
        { department: 'Marketing', count: 2 },
        { department: 'Operaciones', count: 1 }
      ]
    }
  ]

  const mockRetentionAnalysis: RetentionAnalysis = {
    period: 'Últimos 12 meses',
    retention_rate: 87.6,
    voluntary_turnover: 8.9,
    involuntary_turnover: 3.5,
    exit_reasons: [
      { reason: 'Mejor oportunidad laboral', count: 8, percentage: 44.4 },
      { reason: 'Insatisfacción salarial', count: 4, percentage: 22.2 },
      { reason: 'Falta de crecimiento', count: 3, percentage: 16.7 },
      { reason: 'Problemas personales', count: 2, percentage: 11.1 },
      { reason: 'Otros', count: 1, percentage: 5.6 }
    ],
    high_risk_employees: 12
  }

  const mockCompensationAnalysis: CompensationAnalysis[] = [
    {
      department: 'Desarrollo',
      avg_salary: 8500,
      median_salary: 8200,
      salary_range: { min: 4500, max: 15000 },
      gender_pay_gap: 2.1,
      performance_correlation: 0.72
    },
    {
      department: 'Marketing',
      avg_salary: 6800,
      median_salary: 6500,
      salary_range: { min: 3500, max: 12000 },
      gender_pay_gap: 1.8,
      performance_correlation: 0.65
    },
    {
      department: 'Ventas',
      avg_salary: 7200,
      median_salary: 7000,
      salary_range: { min: 4000, max: 14000 },
      gender_pay_gap: 3.2,
      performance_correlation: 0.58
    }
  ]

  const getTrendIcon = useCallback((trend: string, changePercentage: number) => {
    if (trend === 'up') {
      return <ArrowUpRight className={`w-4 h-4 ${changePercentage > 0 ? 'text-green-500' : 'text-red-500'}`} />
    } else if (trend === 'down') {
      return <ArrowDownRight className={`w-4 h-4 ${changePercentage < 0 ? 'text-green-500' : 'text-red-500'}`} />
    }
    return <Minus className="w-4 h-4 text-gray-500" />
  }, [])

  const getChangeColor = useCallback((changePercentage: number, isPositiveGood: boolean = true) => {
    if (changePercentage === 0) return 'text-gray-500'
    if (isPositiveGood) {
      return changePercentage > 0 ? 'text-green-500' : 'text-red-500'
    } else {
      return changePercentage > 0 ? 'text-red-500' : 'text-green-500'
    }
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`
  }, [])

  const getPerformanceColor = useCallback((rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100'
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100'
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100'
    if (rating >= 3.0) return 'text-cyan-600 bg-cyan-100'
    return 'text-red-600 bg-red-100'
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analíticas de RRHH</h1>
          <p className="text-gray-600">Métricas y análisis integral del capital humano</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Último mes</SelectItem>
              <SelectItem value="last_quarter">Último trimestre</SelectItem>
              <SelectItem value="last_year">Último año</SelectItem>
              <SelectItem value="ytd">Año actual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="recruitment">Reclutamiento</TabsTrigger>
          <TabsTrigger value="performance">Desempeño</TabsTrigger>
          <TabsTrigger value="retention">Retención</TabsTrigger>
          <TabsTrigger value="compensation">Compensación</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockOverviewMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{metric.name}</p>
                      {getTrendIcon(metric.trend, metric.change_percentage)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {metric.unit === 'PEN' ? formatCurrency(metric.value) : 
                         `${metric.value}${metric.unit}`}
                      </p>
                      {metric.target && (
                        <p className="text-xs text-gray-500">
                          Meta: {metric.unit === 'PEN' ? formatCurrency(metric.target) : 
                                 `${metric.target}${metric.unit}`}
                        </p>
                      )}
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${
                          getChangeColor(metric.change_percentage, 
                            !['turnover', 'recruitment'].includes(metric.category))
                        }`}>
                          {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-400">vs período anterior</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencias Principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Mejora en Satisfacción</p>
                      <p className="text-sm text-green-600">+7.7% vs trimestre anterior</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Reducción Tiempo Contratación</p>
                      <p className="text-sm text-blue-600">-20% vs trimestre anterior</p>
                    </div>
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                    <div>
                      <p className="font-medium text-cyan-800">Área de Atención</p>
                      <p className="text-sm text-cyan-600">Performance promedio por debajo de meta</p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribución por Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDepartmentMetrics.slice(0, 4).map((dept) => (
                    <div key={dept.department} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{dept.department}</p>
                        <p className="text-sm text-gray-600">{dept.total_employees} empleados</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(dept.avg_performance) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm ml-1">{dept.avg_performance.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Rotación: {formatPercentage(dept.turnover_rate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Aplicaciones</p>
                    <p className="text-2xl font-bold">{mockRecruitmentMetrics.total_applications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ofertas Aceptadas</p>
                    <p className="text-2xl font-bold">{mockRecruitmentMetrics.offers_accepted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold">{mockRecruitmentMetrics.time_to_hire} días</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Costo por Contratación</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockRecruitmentMetrics.cost_per_hire)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Reclutamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecruitmentMetrics.sources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-sm text-gray-600">
                          {source.hires}/{source.applications} 
                          ({formatPercentage(source.conversion_rate)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(source.applications / mockRecruitmentMetrics.total_applications) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funnel de Reclutamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Aplicaciones Recibidas</span>
                    <span className="font-bold">{mockRecruitmentMetrics.total_applications}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Entrevistas Realizadas</span>
                    <span className="font-bold">
                      {mockRecruitmentMetrics.interviews_conducted} 
                      ({formatPercentage((mockRecruitmentMetrics.interviews_conducted / mockRecruitmentMetrics.total_applications) * 100)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Ofertas Realizadas</span>
                    <span className="font-bold">
                      {mockRecruitmentMetrics.offers_made} 
                      ({formatPercentage((mockRecruitmentMetrics.offers_made / mockRecruitmentMetrics.interviews_conducted) * 100)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                    <span>Ofertas Aceptadas</span>
                    <span className="font-bold text-green-600">
                      {mockRecruitmentMetrics.offers_accepted} 
                      ({formatPercentage((mockRecruitmentMetrics.offers_accepted / mockRecruitmentMetrics.offers_made) * 100)})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {mockPerformanceDistribution.map((dist, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{dist.rating_range}</span>
                        <span className="text-sm text-gray-600">
                          {dist.count} empleados ({formatPercentage(dist.percentage)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getPerformanceColor(parseFloat(dist.rating_range.split(' - ')[0]))}`}
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Empleados de Alto Rendimiento (4.5+)</h4>
                  <div className="space-y-2">
                    {mockPerformanceDistribution[0].department_breakdown.map((dept) => (
                      <div key={dept.department} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-green-800">{dept.department}</span>
                        <Badge className="bg-green-100 text-green-700">{dept.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">28</p>
                <p className="text-sm text-gray-600">Top Performers</p>
                <p className="text-xs text-gray-500">19.3% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">52</p>
                <p className="text-sm text-gray-600">Cumple Expectativas</p>
                <p className="text-xs text-gray-500">35.9% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">6</p>
                <p className="text-sm text-gray-600">Necesita Mejora</p>
                <p className="text-xs text-gray-500">4.1% del total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa Retención</p>
                    <p className="text-2xl font-bold">{formatPercentage(mockRetentionAnalysis.retention_rate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <UserX className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rotación Voluntaria</p>
                    <p className="text-2xl font-bold">{formatPercentage(mockRetentionAnalysis.voluntary_turnover)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rotación Involuntaria</p>
                    <p className="text-2xl font-bold">{formatPercentage(mockRetentionAnalysis.involuntary_turnover)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alto Riesgo</p>
                    <p className="text-2xl font-bold">{mockRetentionAnalysis.high_risk_employees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Razones de Salida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRetentionAnalysis.exit_reasons.map((reason, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{reason.reason}</span>
                        <span className="text-sm text-gray-600">
                          {reason.count} ({formatPercentage(reason.percentage)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empleados en Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Indicadores de Riesgo</span>
                    </div>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      <li>• Baja satisfacción en encuestas (&lt; 3.0)</li>
                      <li>• Performance por debajo del promedio</li>
                      <li>• No ha recibido aumentos recientes</li>
                      <li>• Historial de quejas o conflictos</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-yellow-600 mb-2">
                      {mockRetentionAnalysis.high_risk_employees} empleados identificados
                    </p>
                    <Button variant="outline" className="w-full">
                      Ver Lista Detallada
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compensation" className="space-y-6">
          <div className="space-y-4">
            {mockCompensationAnalysis.map((comp) => (
              <Card key={comp.department}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{comp.department}</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      Correlación Performance: {(comp.performance_correlation * 100).toFixed(0)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Salario Promedio</p>
                      <p className="text-xl font-bold">{formatCurrency(comp.avg_salary)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Salario Mediano</p>
                      <p className="text-xl font-bold">{formatCurrency(comp.median_salary)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Rango Salarial</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(comp.salary_range.min)} - {formatCurrency(comp.salary_range.max)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Brecha de Género</p>
                      <p className="text-xl font-bold text-cyan-600">
                        {formatPercentage(comp.gender_pay_gap)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Equidad Salarial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Fortalezas</span>
                  </div>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Correlación positiva entre performance y compensación</li>
                    <li>• Salarios competitivos en el mercado</li>
                    <li>• Estructura salarial transparente</li>
                  </ul>
                </div>
                <div className="p-4 border border-cyan-200 rounded-lg bg-cyan-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-cyan-600" />
                    <span className="font-medium text-cyan-800">Áreas de Mejora</span>
                  </div>
                  <ul className="space-y-1 text-sm text-cyan-700">
                    <li>• Revisar brecha salarial de género en Ventas (3.2%)</li>
                    <li>• Mejorar correlación performance-compensación en algunos departamentos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid gap-4">
            {mockDepartmentMetrics.map((dept) => (
              <Card key={dept.department}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dept.department}</span>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-700">
                        {dept.total_employees} empleados
                      </Badge>
                      <Badge className="bg-green-100 text-green-700">
                        {dept.active_positions} posiciones abiertas
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Satisfacción</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(dept.satisfaction_score) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-lg font-bold ml-1">{dept.satisfaction_score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tasa Rotación</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatPercentage(dept.turnover_rate)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Performance Promedio</p>
                      <p className="text-2xl font-bold text-green-600">
                        {dept.avg_performance.toFixed(1)}/5
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Utilización Presupuesto</p>
                      <div className="mt-1">
                        <p className="text-2xl font-bold text-purple-600">
                          {dept.budget_utilization}%
                        </p>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${dept.budget_utilization}%` }}
                          />
                        </div>
                      </div>
                    </div>
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