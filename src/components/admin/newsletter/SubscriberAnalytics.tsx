'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  UserMinus,
  Mail,
  Eye,
  MousePointer,
  Heart,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Share2,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface SubscriberMetrics {
  total_subscribers: number
  active_subscribers: number
  new_subscribers_this_month: number
  unsubscribed_this_month: number
  growth_rate: number
  churn_rate: number
  engagement_rate: number
  avg_list_age: number
}

interface SegmentData {
  id: string
  name: string
  subscriber_count: number
  growth_rate: number
  engagement_rate: number
  avg_open_rate: number
  avg_click_rate: number
  revenue_per_subscriber: number
  tags: string[]
  last_campaign_date?: string
}

interface GeographicData {
  country: string
  region?: string
  city?: string
  subscriber_count: number
  percentage: number
  engagement_rate: number
  top_interests: string[]
}

interface EngagementData {
  date: string
  opens: number
  clicks: number
  unsubscribes: number
  new_subscribers: number
  engagement_score: number
}

interface DeviceData {
  device: 'desktop' | 'mobile' | 'tablet'
  percentage: number
  avg_engagement: number
  preferred_send_time: string
}

interface CohortData {
  cohort_month: string
  initial_size: number
  retention_rates: number[]
  lifetime_value: number
  avg_engagement: number
}

interface SubscriberAnalyticsProps {
  metrics: SubscriberMetrics
  segments: SegmentData[]
  geographic_data: GeographicData[]
  engagement_timeline: EngagementData[]
  device_data: DeviceData[]
  cohort_data: CohortData[]
  timeRange: '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void
  onRefresh: () => Promise<void>
  onExportData: (format: 'csv' | 'pdf' | 'excel') => Promise<void>
  onCreateSegment: (criteria: any) => Promise<void>
  loading?: boolean
}

export default function SubscriberAnalytics({
  metrics,
  segments,
  geographic_data,
  engagement_timeline,
  device_data,
  cohort_data,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExportData,
  onCreateSegment,
  loading = false
}: SubscriberAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)

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

  // Get trend indicator
  const getTrendIndicator = (value: number, isPositive: boolean = true) => {
    const isGoodTrend = (isPositive && value > 0) || (!isPositive && value < 0)
    const icon = value > 0 ? <ArrowUp className="h-4 w-4" /> : 
                 value < 0 ? <ArrowDown className="h-4 w-4" /> : 
                 <Minus className="h-4 w-4" />
    
    const color = isGoodTrend ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    )
  }

  // Calculate engagement score
  const getEngagementScore = (openRate: number, clickRate: number, unsubRate: number) => {
    const openScore = Math.min(openRate / 25 * 40, 40) // 25% open rate = 40 points
    const clickScore = Math.min(clickRate / 5 * 35, 35) // 5% click rate = 35 points
    const unsubPenalty = Math.min(unsubRate * 50, 25) // High unsub rate penalty
    
    return Math.max(0, Math.round(openScore + clickScore + 25 - unsubPenalty))
  }

  // Top performing segments
  const topSegments = useMemo(() => {
    return [...segments]
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, 5)
  }, [segments])

  // Geographic insights
  const topLocations = useMemo(() => {
    return [...geographic_data]
      .sort((a, b) => b.subscriber_count - a.subscriber_count)
      .slice(0, 10)
  }, [geographic_data])

  // Recent engagement trend
  const engagementTrend = useMemo(() => {
    if (engagement_timeline.length < 2) return 0
    
    const recent = engagement_timeline.slice(-7)
    const previous = engagement_timeline.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, day) => sum + day.engagement_score, 0) / recent.length
    const previousAvg = previous.reduce((sum, day) => sum + day.engagement_score, 0) / previous.length
    
    return ((recentAvg - previousAvg) / previousAvg) * 100
  }, [engagement_timeline])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics de Suscriptores
          </h1>
          <p className="text-gray-600">
            Análisis detallado del comportamiento y crecimiento de suscriptores
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suscriptores</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(metrics.total_subscribers)}
                </p>
                <div className="mt-2">
                  {getTrendIndicator(metrics.growth_rate, true)}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Este Mes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(metrics.new_subscribers_this_month)}
                </p>
                <div className="mt-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatPercent((metrics.new_subscribers_this_month / metrics.total_subscribers) * 100)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPercent(metrics.engagement_rate)}
                </p>
                <div className="mt-2">
                  {getTrendIndicator(engagementTrend, true)}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPercent(metrics.churn_rate)}
                </p>
                <div className="mt-2">
                  {getTrendIndicator(metrics.churn_rate, false)}
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <UserMinus className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Target className="h-4 w-4 mr-2" />
            Segmentos
          </TabsTrigger>
          <TabsTrigger value="geographic">
            <Globe className="h-4 w-4 mr-2" />
            Geografía
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Eye className="h-4 w-4 mr-2" />
            Comportamiento
          </TabsTrigger>
          <TabsTrigger value="cohorts">
            <Calendar className="h-4 w-4 mr-2" />
            Cohortes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Engagement Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Gráfico de engagement en el tiempo</p>
                    <p className="text-sm">{engagement_timeline.length} días de datos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Distribución por Dispositivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {device_data.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {device.device === 'desktop' && <Monitor className="h-5 w-5 text-blue-500" />}
                        {device.device === 'mobile' && <Smartphone className="h-5 w-5 text-green-500" />}
                        {device.device === 'tablet' && <Smartphone className="h-5 w-5 text-purple-500" />}
                        <span className="font-medium capitalize">{device.device}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatPercent(device.percentage)}</p>
                          <p className="text-sm text-gray-500">
                            {formatPercent(device.avg_engagement)} engagement
                          </p>
                        </div>
                        
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Segmentos Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSegments.map((segment, index) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{segment.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatNumber(segment.subscriber_count)} suscriptores
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPercent(segment.engagement_rate)}
                      </p>
                      <p className="text-sm text-gray-600">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Análisis por Segmentos</h2>
            <Button onClick={() => onCreateSegment({})}>
              <Target className="h-4 w-4 mr-2" />
              Crear Segmento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map(segment => {
              const engagementScore = getEngagementScore(
                segment.avg_open_rate, 
                segment.avg_click_rate, 
                0 // Assuming low unsubscribe rate for segments
              )
              
              return (
                <Card key={segment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatNumber(segment.subscriber_count)} suscriptores
                        </p>
                      </div>
                      
                      <Badge className={
                        engagementScore >= 80 ? 'bg-green-100 text-green-800' :
                        engagementScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {engagementScore}/100
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engagement Rate:</span>
                        <span className="font-medium">{formatPercent(segment.engagement_rate)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Open Rate:</span>
                        <span className="font-medium">{formatPercent(segment.avg_open_rate)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Click Rate:</span>
                        <span className="font-medium">{formatPercent(segment.avg_click_rate)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue/Subscriber:</span>
                        <span className="font-medium">{formatCurrency(segment.revenue_per_subscriber)}</span>
                      </div>
                    </div>
                    
                    {segment.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {segment.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {segment.tags.length > 3 && (
                            <Badge variant="outline" size="sm">
                              +{segment.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {getTrendIndicator(segment.growth_rate, true)}
                      </div>
                      
                      {segment.last_campaign_date && (
                        <p className="text-xs text-gray-500">
                          Última campaña: {new Date(segment.last_campaign_date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Top Ubicaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{location.country}</p>
                          {location.city && (
                            <p className="text-sm text-gray-600">{location.city}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(location.subscriber_count)}</p>
                        <p className="text-sm text-gray-600">{formatPercent(location.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Engagement por Región</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographic_data
                    .sort((a, b) => b.engagement_rate - a.engagement_rate)
                    .slice(0, 8)
                    .map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{location.country}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {location.top_interests.slice(0, 2).map((interest, i) => (
                            <Badge key={i} variant="outline" size="sm">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatPercent(location.engagement_rate)}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${location.engagement_rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Edad Promedio Lista</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {metrics.avg_list_age} días
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suscriptores Activos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPercent((metrics.active_subscribers / metrics.total_subscribers) * 100)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Desuscripciones</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.unsubscribed_this_month)}
                    </p>
                  </div>
                  <UserMinus className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Patrones de Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Análisis de patrones de comportamiento</p>
                  <p className="text-sm">Datos de {timeRangeLabels[timeRange]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Análisis de Cohortes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohort_data.map((cohort, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Cohorte {cohort.cohort_month}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tamaño inicial: {formatNumber(cohort.initial_size)} suscriptores
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          LTV: {formatCurrency(cohort.lifetime_value)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Engagement: {formatPercent(cohort.avg_engagement)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {cohort.retention_rates.map((rate, monthIndex) => (
                        <div key={monthIndex} className="flex-1">
                          <div className="text-center text-xs text-gray-600 mb-1">
                            M{monthIndex + 1}
                          </div>
                          <div className="bg-gray-200 rounded h-6 flex items-center justify-center">
                            <div 
                              className={`h-full rounded ${
                                rate >= 80 ? 'bg-green-500' :
                                rate >= 60 ? 'bg-yellow-500' :
                                rate >= 40 ? 'bg-cyan-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                            <span className="text-xs font-medium text-gray-700 absolute">
                              {rate.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
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