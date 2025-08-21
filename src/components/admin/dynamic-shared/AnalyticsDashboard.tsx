'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Clock, 
  Target,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Activity,
  Zap,
  Globe,
  Heart,
  Star,
  MessageCircle,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Calendar as CalendarIcon
} from 'lucide-react'

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  module: string
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'date'
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color: string
  }[]
}

interface AnalyticsData {
  overview: {
    totalItems: number
    totalViews: number
    totalEngagement: number
    avgPerformance: number
  }
  modules: {
    newsletter: {
      articles: number
      authors: number
      categories: number
      totalReads: number
      avgReadTime: number
      topArticles: { id: string; title: string; views: number }[]
      readsOverTime: ChartData
      categoryDistribution: ChartData
    }
    portfolio: {
      projects: number
      clients: number
      categories: number
      totalInvestment: number
      avgProjectValue: number
      topProjects: { id: string; title: string; views: number; investment: number }[]
      projectsOverTime: ChartData
      investmentByCategory: ChartData
      geographicDistribution: Record<string, number>
    }
    careers: {
      activeJobs: number
      applications: number
      departments: number
      avgTimeToHire: number
      fillRate: number
      topJobs: { id: string; title: string; applications: number }[]
      applicationsOverTime: ChartData
      departmentDistribution: ChartData
    }
  }
  performance: {
    pageLoadTimes: Record<string, number>
    searchQueries: { query: string; count: number }[]
    popularContent: { id: string; title: string; module: string; views: number }[]
    userJourney: { step: string; users: number; dropoff: number }[]
  }
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  timeRange: '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void
  onRefresh: () => Promise<void>
  onExport: (format: 'pdf' | 'excel' | 'csv') => Promise<void>
  modules: ('newsletter' | 'portfolio' | 'careers')[]
  loading?: boolean
}

export default function AnalyticsDashboard({
  data,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExport,
  modules,
  loading = false
}: AnalyticsDashboardProps) {
  const [selectedModule, setSelectedModule] = useState<string>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Module configurations
  const moduleConfig = {
    newsletter: { 
      title: 'Analytics Blog/Newsletter', 
      icon: '📰', 
      color: 'bg-blue-100 text-blue-800',
      primaryMetric: 'lecturas'
    },
    portfolio: { 
      title: 'Analytics Portfolio', 
      icon: '🏗️', 
      color: 'bg-green-100 text-green-800',
      primaryMetric: 'inversión'
    },
    careers: { 
      title: 'Analytics Careers', 
      icon: '💼', 
      color: 'bg-purple-100 text-purple-800',
      primaryMetric: 'aplicaciones'
    }
  }

  // Time range labels
  const timeRangeLabels = {
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    '90d': 'Últimos 3 meses',
    '1y': 'Último año'
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  // Format numbers
  const formatNumber = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-PE', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'duration':
        const minutes = Math.floor(value / 60)
        const seconds = Math.floor(value % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      default:
        return new Intl.NumberFormat('es-ES').format(value)
    }
  }

  // Get change icon and color
  const getChangeIndicator = (change: number, type: 'increase' | 'decrease' | 'neutral') => {
    if (type === 'neutral' || change === 0) {
      return { icon: <Activity className="h-4 w-4" />, color: 'text-gray-500' }
    }
    
    const isPositive = (type === 'increase' && change > 0) || (type === 'decrease' && change < 0)
    return {
      icon: isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    }
  }

  // Generate overview metrics
  const overviewMetrics: MetricCard[] = [
    {
      id: 'total-items',
      title: 'Total de Elementos',
      value: data.overview.totalItems,
      change: 12.5,
      changeType: 'increase',
      icon: <Globe className="h-6 w-6" />,
      module: 'overview'
    },
    {
      id: 'total-views',
      title: 'Visualizaciones Totales',
      value: formatNumber(data.overview.totalViews),
      change: 8.2,
      changeType: 'increase',
      icon: <Eye className="h-6 w-6" />,
      module: 'overview'
    },
    {
      id: 'engagement',
      title: 'Engagement Rate',
      value: data.overview.totalEngagement,
      change: -2.1,
      changeType: 'decrease',
      icon: <Heart className="h-6 w-6" />,
      module: 'overview',
      format: 'percentage'
    },
    {
      id: 'performance',
      title: 'Performance Score',
      value: data.overview.avgPerformance,
      change: 5.8,
      changeType: 'increase',
      icon: <Zap className="h-6 w-6" />,
      module: 'overview'
    }
  ]

  // Generate module-specific metrics
  const getModuleMetrics = (module: string): MetricCard[] => {
    switch (module) {
      case 'newsletter':
        return [
          {
            id: 'articles',
            title: 'Artículos Publicados',
            value: data.modules.newsletter.articles,
            change: 15.3,
            changeType: 'increase',
            icon: <BarChart3 className="h-6 w-6" />,
            module: 'newsletter'
          },
          {
            id: 'total-reads',
            title: 'Lecturas Totales',
            value: formatNumber(data.modules.newsletter.totalReads),
            change: 22.1,
            changeType: 'increase',
            icon: <Eye className="h-6 w-6" />,
            module: 'newsletter'
          },
          {
            id: 'avg-read-time',
            title: 'Tiempo Promedio de Lectura',
            value: formatNumber(data.modules.newsletter.avgReadTime, 'duration'),
            change: 8.5,
            changeType: 'increase',
            icon: <Clock className="h-6 w-6" />,
            module: 'newsletter'
          },
          {
            id: 'authors',
            title: 'Autores Activos',
            value: data.modules.newsletter.authors,
            change: 0,
            changeType: 'neutral',
            icon: <Users className="h-6 w-6" />,
            module: 'newsletter'
          }
        ]
      
      case 'portfolio':
        return [
          {
            id: 'projects',
            title: 'Proyectos Activos',
            value: data.modules.portfolio.projects,
            change: 18.7,
            changeType: 'increase',
            icon: <BarChart3 className="h-6 w-6" />,
            module: 'portfolio'
          },
          {
            id: 'total-investment',
            title: 'Inversión Total',
            value: formatNumber(data.modules.portfolio.totalInvestment, 'currency'),
            change: 31.2,
            changeType: 'increase',
            icon: <TrendingUp className="h-6 w-6" />,
            module: 'portfolio'
          },
          {
            id: 'avg-project-value',
            title: 'Valor Promedio de Proyecto',
            value: formatNumber(data.modules.portfolio.avgProjectValue, 'currency'),
            change: 12.8,
            changeType: 'increase',
            icon: <Target className="h-6 w-6" />,
            module: 'portfolio'
          },
          {
            id: 'clients',
            title: 'Clientes Únicos',
            value: data.modules.portfolio.clients,
            change: 25.0,
            changeType: 'increase',
            icon: <Users className="h-6 w-6" />,
            module: 'portfolio'
          }
        ]
      
      case 'careers':
        return [
          {
            id: 'active-jobs',
            title: 'Ofertas Activas',
            value: data.modules.careers.activeJobs,
            change: 42.3,
            changeType: 'increase',
            icon: <BarChart3 className="h-6 w-6" />,
            module: 'careers'
          },
          {
            id: 'applications',
            title: 'Aplicaciones Totales',
            value: formatNumber(data.modules.careers.applications),
            change: 67.8,
            changeType: 'increase',
            icon: <Users className="h-6 w-6" />,
            module: 'careers'
          },
          {
            id: 'fill-rate',
            title: 'Tasa de Ocupación',
            value: data.modules.careers.fillRate,
            change: 12.5,
            changeType: 'increase',
            icon: <Target className="h-6 w-6" />,
            module: 'careers',
            format: 'percentage'
          },
          {
            id: 'time-to-hire',
            title: 'Tiempo Promedio de Contratación',
            value: `${data.modules.careers.avgTimeToHire} días`,
            change: -8.2,
            changeType: 'decrease',
            icon: <Clock className="h-6 w-6" />,
            module: 'careers'
          }
        ]
      
      default:
        return overviewMetrics
    }
  }

  const currentMetrics = selectedModule === 'overview' ? overviewMetrics : getModuleMetrics(selectedModule)

  // Render metric card
  const renderMetricCard = (metric: MetricCard) => {
    const { icon: changeIcon, color: changeColor } = getChangeIndicator(metric.change, metric.changeType)
    
    return (
      <Card key={metric.id}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-1 ${changeColor}`}>
              {changeIcon}
              <span className="text-sm font-medium">
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render simple chart placeholder
  const renderChart = (title: string, data: ChartData, type: 'line' | 'bar' | 'pie' = 'line') => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {type === 'line' && <LineChart className="h-5 w-5" />}
            {type === 'bar' && <BarChart3 className="h-5 w-5" />}
            {type === 'pie' && <PieChart className="h-5 w-5" />}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>Gráfico: {title}</p>
              <p className="text-sm">Datos: {data.labels.length} puntos</p>
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
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Métricas y análisis de rendimiento - {timeRangeLabels[timeRange]}
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {Object.entries(timeRangeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Module Tabs */}
      <Tabs value={selectedModule} onValueChange={setSelectedModule}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          {modules.map(module => (
            <TabsTrigger key={module} value={module}>
              <span className="mr-2">{moduleConfig[module].icon}</span>
              {moduleConfig[module].title.split(' ')[1]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewMetrics.map(renderMetricCard)}
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido Más Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.performance.popularContent.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium truncate max-w-xs">{item.title}</p>
                          <Badge className={moduleConfig[item.module as keyof typeof moduleConfig].color} size="sm">
                            {moduleConfig[item.module as keyof typeof moduleConfig].icon}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(item.views)}</p>
                        <p className="text-sm text-gray-500">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Búsquedas Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.performance.searchQueries.slice(0, 5).map((query, index) => (
                    <div key={query.query} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <p className="font-medium">{query.query}</p>
                      </div>
                      <span className="text-sm text-gray-600">{query.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getModuleMetrics('newsletter').map(renderMetricCard)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderChart('Lecturas en el Tiempo', data.modules.newsletter.readsOverTime, 'line')}
            {renderChart('Distribución por Categorías', data.modules.newsletter.categoryDistribution, 'pie')}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Artículos Más Leídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.modules.newsletter.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <p className="font-medium truncate max-w-md">{article.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(article.views)}</p>
                      <p className="text-sm text-gray-500">lecturas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getModuleMetrics('portfolio').map(renderMetricCard)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderChart('Proyectos en el Tiempo', data.modules.portfolio.projectsOverTime, 'bar')}
            {renderChart('Inversión por Categoría', data.modules.portfolio.investmentByCategory, 'pie')}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Destacados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.modules.portfolio.topProjects.map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium truncate max-w-xs">{project.title}</p>
                          <p className="text-sm text-gray-500">
                            {formatNumber(project.investment, 'currency')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(project.views)}</p>
                        <p className="text-sm text-gray-500">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución Geográfica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.modules.portfolio.geographicDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <p className="font-medium capitalize">{location}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ 
                              width: `${(count / Math.max(...Object.values(data.modules.portfolio.geographicDistribution))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Careers Tab */}
        <TabsContent value="careers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getModuleMetrics('careers').map(renderMetricCard)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderChart('Aplicaciones en el Tiempo', data.modules.careers.applicationsOverTime, 'line')}
            {renderChart('Distribución por Departamento', data.modules.careers.departmentDistribution, 'pie')}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ofertas Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.modules.careers.topJobs.map((job, index) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <p className="font-medium truncate max-w-md">{job.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(job.applications)}</p>
                      <p className="text-sm text-gray-500">aplicaciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}