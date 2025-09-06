'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3
} from 'lucide-react'

interface KPI {
  category: string
  current_value: string
  target: string
  trend: string
  status: string
  description: string
  icon: string
}

interface QualityMetricsData {
  section: {
    title: string
    subtitle: string
  }
  kpis: KPI[]
}

interface QualityMetricsSectionProps {
  data: QualityMetricsData
}

const iconMap = {
  Heart,
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  GraduationCap
}

const statusColors = {
  achieved: 'bg-green-100 text-green-800 border-green-200',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusText = {
  achieved: 'Logrado',
  'in-progress': 'En Progreso', 
  pending: 'Pendiente'
}

function parseMetricValue(value: string): number {
  // Extraer números del string, manejando porcentajes y valores numéricos
  const numMatch = value.match(/[\d.]+/)
  return numMatch ? parseFloat(numMatch[0]) : 0
}

function parseTargetValue(target: string): number {
  // Manejar diferentes formatos de target (≥95%, ≤±5%, ≤1%, etc.)
  const numMatch = target.match(/[\d.]+/)
  return numMatch ? parseFloat(numMatch[0]) : 100
}

function getProgressValue(current: string, target: string): number {
  const currentNum = parseMetricValue(current)
  const targetNum = parseTargetValue(target)
  
  // Lógica diferente según el tipo de métrica
  if (target.includes('≤')) {
    // Para métricas donde menor es mejor (ej: no conformidades)
    return Math.max(0, 100 - (currentNum / targetNum) * 100)
  } else if (target.includes('≥')) {
    // Para métricas donde mayor es mejor
    return Math.min(100, (currentNum / targetNum) * 100)
  } else {
    // Para métricas de rango o tiempo
    return Math.min(100, (currentNum / targetNum) * 100)
  }
}

function MetricsFilter({ selectedCategory, onCategoryChange, categories }: {
  selectedCategory: string
  onCategoryChange: (value: string) => void
  categories: string[]
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filtrar métricas:</span>
      </div>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleccionar categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las Métricas</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function TrendIndicator({ trend }: { trend: string }) {
  const isPositive = trend.startsWith('+')
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <TrendIcon className="w-4 h-4" />
      <span className="text-sm font-medium">{trend}</span>
    </div>
  )
}

function MetricCard({ kpi, index }: { kpi: KPI, index: number }) {
  const IconComponent = iconMap[kpi.icon as keyof typeof iconMap] || Heart
  const progress = getProgressValue(kpi.current_value, kpi.target)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-50" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#007bc4]/10 flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-[#007bc4]" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {kpi.category}
              </CardTitle>
            </div>
            <Badge className={statusColors[kpi.status as keyof typeof statusColors] || statusColors.achieved}>
              {statusText[kpi.status as keyof typeof statusText] || 'Logrado'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Metric Values */}
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-[#007bc4]">
                  {kpi.current_value}
                </div>
                <div className="text-sm text-gray-600">
                  Meta: <span className="font-medium">{kpi.target}</span>
                </div>
              </div>
              <TrendIndicator trend={kpi.trend} />
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {kpi.description}
          </p>
          
          {/* Achievement Indicator */}
          {progress >= 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-800">Meta alcanzada</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function QualityMetricsSection({ data }: QualityMetricsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Categorías disponibles basadas en los KPIs
  const categories = useMemo(() => {
    const cats = new Set<string>()
    data.kpis.forEach(kpi => {
      if (kpi.category.toLowerCase().includes('satisfacción') || kpi.category.toLowerCase().includes('cliente')) {
        cats.add('satisfaccion')
      } else if (kpi.category.toLowerCase().includes('cronograma') || kpi.category.toLowerCase().includes('tiempo')) {
        cats.add('rendimiento')
      } else if (kpi.category.toLowerCase().includes('presupuesto') || kpi.category.toLowerCase().includes('costo')) {
        cats.add('rendimiento')
      } else {
        cats.add('calidad')
      }
    })
    return Array.from(cats)
  }, [data.kpis])
  
  // Filtrar KPIs según categoría seleccionada
  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return data.kpis
    
    return data.kpis.filter(kpi => {
      switch (selectedCategory) {
        case 'satisfaccion':
          return kpi.category.toLowerCase().includes('satisfacción') || kpi.category.toLowerCase().includes('cliente')
        case 'rendimiento':
          return kpi.category.toLowerCase().includes('cronograma') || 
                 kpi.category.toLowerCase().includes('tiempo') || 
                 kpi.category.toLowerCase().includes('presupuesto') || 
                 kpi.category.toLowerCase().includes('costo')
        case 'calidad':
          return !kpi.category.toLowerCase().includes('satisfacción') &&
                 !kpi.category.toLowerCase().includes('cronograma') &&
                 !kpi.category.toLowerCase().includes('presupuesto') &&
                 !kpi.category.toLowerCase().includes('tiempo')
        default:
          return true
      }
    })
  }, [data.kpis, selectedCategory])
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#007bc4]/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#007bc4]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {data.section.title}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data.section.subtitle}
          </p>
        </motion.div>

        {/* Metrics Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricsFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredKPIs.map((kpi, index) => (
            <MetricCard key={kpi.category} kpi={kpi} index={index} />
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block bg-gradient-to-r from-[#007bc4]/10 to-[#FF6B35]/10 border-[#007bc4]/20">
            <CardContent className="px-8 py-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007bc4]">
                    {filteredKPIs.filter(kpi => kpi.status === 'achieved').length}
                  </div>
                  <div className="text-sm text-gray-600">Metas Logradas</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007bc4]">
                    {filteredKPIs.length}
                  </div>
                  <div className="text-sm text-gray-600">Total KPIs</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007bc4]">
                    {Math.round((filteredKPIs.filter(kpi => kpi.status === 'achieved').length / filteredKPIs.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa de Éxito</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}