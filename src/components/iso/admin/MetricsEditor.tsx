'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save,
  RotateCcw,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Heart,
  Clock,
  DollarSign,
  Zap,
  GraduationCap,
  Users,
  Target,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QualityKPI {
  category: string
  current_value: string
  target: string
  trend: string
  status: 'achieved' | 'in_progress' | 'not_met'
  description: string
  icon: string
}

interface QualityMetricsData {
  section: {
    title: string
    subtitle: string
  }
  kpis: QualityKPI[]
}

interface MetricsEditorProps {
  data: QualityMetricsData
  onSave?: (data: QualityMetricsData) => void
  onCancel?: () => void
}

const iconOptions = [
  { value: 'Heart', label: 'Corazón', icon: Heart },
  { value: 'Clock', label: 'Reloj', icon: Clock },
  { value: 'DollarSign', label: 'Dinero', icon: DollarSign },
  { value: 'AlertTriangle', label: 'Alerta', icon: AlertTriangle },
  { value: 'Zap', label: 'Energía', icon: Zap },
  { value: 'GraduationCap', label: 'Educación', icon: GraduationCap },
  { value: 'Users', label: 'Usuarios', icon: Users },
  { value: 'Target', label: 'Objetivo', icon: Target },
  { value: 'Award', label: 'Premio', icon: Award },
  { value: 'TrendingUp', label: 'Crecimiento', icon: TrendingUp }
]

const statusOptions = [
  { value: 'achieved', label: 'Logrado', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'in_progress', label: 'En Progreso', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'not_met', label: 'No Cumplido', color: 'text-red-600', bg: 'bg-red-100' }
]

function FormField({ 
  label, 
  children, 
  required = false,
  error,
  help,
  className = "" 
}: { 
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  help?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {help && <p className="text-xs text-gray-500">{help}</p>}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

function ValidationMessage({ field, value }: { field: string, value: string }) {
  const [isValid, message] = useMemo(() => {
    if (field === 'current_value') {
      const patterns = {
        percentage: /^\d+(\.\d+)?%$/,
        currency: /^\$?\d+(\.\d+)?(k|K|M|B)?$/,
        number: /^\d+(\.\d+)?$/,
        days: /^\d+\s*(days?|días?|d)$/i
      }
      
      const isPercentage = patterns.percentage.test(value)
      const isCurrency = patterns.currency.test(value)
      const isNumber = patterns.number.test(value)
      const isDays = patterns.days.test(value)
      
      if (isPercentage || isCurrency || isNumber || isDays || !value) {
        return [true, '']
      } else {
        return [false, 'Formato inválido. Use: 95.5%, $1000, 30 días, o un número']
      }
    }
    return [true, '']
  }, [field, value])

  if (!message) return null

  return (
    <div className={`flex items-center gap-1 text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
      {isValid ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {message}
    </div>
  )
}

function IconSelector({ 
  value, 
  onSelect 
}: { 
  value: string
  onSelect: (icon: string) => void 
}) {
  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            {(() => {
              const iconData = iconOptions.find(icon => icon.value === value);
              if (iconData?.icon) {
                const IconComponent = iconData.icon;
                return <IconComponent className="w-4 h-4" />;
              }
              return null;
            })()}
            {iconOptions.find(icon => icon.value === value)?.label || value}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {iconOptions.map(icon => (
          <SelectItem key={icon.value} value={icon.value}>
            <div className="flex items-center gap-2">
              <icon.icon className="w-4 h-4" />
              {icon.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusSelector({
  status,
  onStatusChange
}: {
  status: QualityKPI['status']
  onStatusChange: (status: QualityKPI['status']) => void
}) {
  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger>
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusOptions.find(s => s.value === status)?.bg.replace('bg-', 'bg-')}`} />
            {statusOptions.find(s => s.value === status)?.label}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(status => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.bg}`} />
              {status.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function getValidationPattern(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('satisfacción') || lower.includes('porcentaje')) return 'percentage'
  if (lower.includes('presupuesto') || lower.includes('costo')) return 'currency'
  if (lower.includes('tiempo') || lower.includes('días')) return 'days'
  return 'number'
}

function parseMetricValue(value: string): number {
  const numMatch = value.match(/[\d.]+/)
  return numMatch ? parseFloat(numMatch[0]) : 0
}

function parseTargetValue(target: string): number {
  const numMatch = target.match(/[\d.]+/)
  return numMatch ? parseFloat(numMatch[0]) : 100
}

function getProgressValue(current: string, target: string): number {
  const currentNum = parseMetricValue(current)
  const targetNum = parseTargetValue(target)
  
  if (target.includes('≤')) {
    return Math.max(0, 100 - (currentNum / targetNum) * 100)
  } else if (target.includes('≥')) {
    return Math.min(100, (currentNum / targetNum) * 100)
  } else {
    return Math.min(100, (currentNum / targetNum) * 100)
  }
}

function MetricEditCard({ 
  kpi, 
  index, 
  onUpdate, 
  onDelete,
  isEditing,
  onToggleEdit 
}: { 
  kpi: QualityKPI
  index: number
  onUpdate: (field: keyof QualityKPI, value: any) => void
  onDelete: () => void
  isEditing: boolean
  onToggleEdit: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const progress = getProgressValue(kpi.current_value, kpi.target)
  const IconComponent = iconOptions.find(icon => icon.value === kpi.icon)?.icon || BarChart3
  
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'category' && !value.trim()) {
      newErrors.category = 'La categoría es requerida'
    } else {
      delete newErrors.category
    }
    
    if (field === 'current_value') {
      const pattern = getValidationPattern(kpi.category)
      // Validation logic here
      if (value && !value.match(/^[\d.]+[%$]?$/)) {
        newErrors.current_value = 'Formato inválido'
      } else {
        delete newErrors.current_value
      }
    }
    
    setErrors(newErrors)
  }

  const handleTrendChange = (value: 'positive' | 'negative') => {
    const trendValue = value === 'positive' 
      ? `+${Math.abs(parseFloat(kpi.trend.replace(/[+\-]/, '')))}%`
      : `-${Math.abs(parseFloat(kpi.trend.replace(/[+\-]/, '')))}%`
    onUpdate('trend', trendValue)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card className="relative hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-[#00A8E8]" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isEditing ? (
                    <Input
                      value={kpi.category}
                      onChange={(e) => {
                        onUpdate('category', e.target.value)
                        validateField('category', e.target.value)
                      }}
                      className="text-lg font-bold"
                    />
                  ) : (
                    kpi.category
                  )}
                </CardTitle>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={statusOptions.find(s => s.value === kpi.status)?.bg + ' ' + statusOptions.find(s => s.value === kpi.status)?.color + ' border-0'}>
                {statusOptions.find(s => s.value === kpi.status)?.label}
              </Badge>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleEdit}
                >
                  {isEditing ? <CheckCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {/* Edit Mode */}
              <div className="space-y-4">
                <FormField label="Ícono" className="grid grid-cols-2 gap-4 items-center">
                  <IconSelector 
                    value={kpi.icon}
                    onSelect={(icon) => onUpdate('icon', icon)}
                  />
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    label="Valor Actual" 
                    required
                    error={errors.current_value}
                    help="Ej: 98.2%, $1200, 30 días"
                  >
                    <Input 
                      value={kpi.current_value}
                      onChange={(e) => {
                        onUpdate('current_value', e.target.value)
                        validateField('current_value', e.target.value)
                      }}
                      pattern={getValidationPattern(kpi.category)}
                    />
                    <ValidationMessage field="current_value" value={kpi.current_value} />
                  </FormField>
                  
                  <FormField 
                    label="Meta"
                    help="Ej: ≥95%, ≤$1000, ≤5 días"
                  >
                    <Input 
                      value={kpi.target}
                      onChange={(e) => onUpdate('target', e.target.value)}
                    />
                  </FormField>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Tendencia">
                    <Select 
                      value={kpi.trend.startsWith('+') ? 'positive' : 'negative'}
                      onValueChange={handleTrendChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            Mejorando
                          </div>
                        </SelectItem>
                        <SelectItem value="negative">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            Empeorando
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  
                  <FormField label="Estado">
                    <StatusSelector 
                      status={kpi.status}
                      onStatusChange={(status) => onUpdate('status', status)}
                    />
                  </FormField>
                </div>
                
                <FormField label="Descripción">
                  <Textarea
                    value={kpi.description}
                    onChange={(e) => onUpdate('description', e.target.value)}
                    rows={3}
                  />
                </FormField>
              </div>
            </>
          ) : (
            <>
              {/* View Mode */}
              <div className="space-y-4">
                {/* Metric Values */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-[#00A8E8]">
                      {kpi.current_value}
                    </div>
                    <div className="text-sm text-gray-600">
                      Meta: <span className="font-medium">{kpi.target}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend.startsWith('+') ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{kpi.trend}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progreso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
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
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function MetricsEditor({ data, onSave, onCancel }: MetricsEditorProps) {
  const [formData, setFormData] = useState<QualityMetricsData>(data)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const updateKPI = (index: number, field: keyof QualityKPI, value: any) => {
    const updatedKPIs = [...formData.kpis]
    updatedKPIs[index] = { ...updatedKPIs[index], [field]: value }
    setFormData(prev => ({ ...prev, kpis: updatedKPIs }))
    setHasChanges(true)
  }

  const addKPI = () => {
    const newKPI: QualityKPI = {
      category: 'Nueva Métrica',
      current_value: '0%',
      target: '100%',
      trend: '+0%',
      status: 'in_progress',
      description: 'Descripción de la nueva métrica',
      icon: 'BarChart3'
    }
    
    setFormData(prev => ({
      ...prev,
      kpis: [...prev.kpis, newKPI]
    }))
    setEditingIndex(formData.kpis.length)
    setHasChanges(true)
  }

  const deleteKPI = (index: number) => {
    const updatedKPIs = formData.kpis.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, kpis: updatedKPIs }))
    setHasChanges(true)
    
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleSave = () => {
    onSave?.(formData)
    setHasChanges(false)
    setEditingIndex(null)
    toast({
      title: "Métricas guardadas",
      description: "Las métricas de calidad han sido actualizadas exitosamente",
    })
  }

  const handleReset = () => {
    setFormData(data)
    setHasChanges(false)
    setEditingIndex(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor de Métricas de Calidad</h1>
          <p className="text-gray-600 mt-1">
            Administra los indicadores clave de rendimiento (KPIs) del sistema ISO
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={hasChanges ? "destructive" : "secondary"}>
            {hasChanges ? "Sin guardar" : "Guardado"}
          </Badge>
          
          <Button onClick={addKPI} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Métrica
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Descartar
          </Button>
          
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Section Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00A8E8]" />
            Información de la Sección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Título de la Sección" required>
              <Input
                value={formData.section.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    section: { ...prev.section, title: e.target.value }
                  }))
                  setHasChanges(true)
                }}
              />
            </FormField>
            
            <FormField label="Subtítulo">
              <Input
                value={formData.section.subtitle}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    section: { ...prev.section, subtitle: e.target.value }
                  }))
                  setHasChanges(true)
                }}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Métricas de Calidad ({formData.kpis.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {formData.kpis.filter(kpi => kpi.status === 'achieved').length} Logradas
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              {formData.kpis.filter(kpi => kpi.status === 'in_progress').length} En Progreso
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              {formData.kpis.filter(kpi => kpi.status === 'not_met').length} No Cumplidas
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {formData.kpis.map((kpi, index) => (
              <MetricEditCard
                key={`${kpi.category}-${index}`}
                kpi={kpi}
                index={index}
                onUpdate={(field, value) => updateKPI(index, field, value)}
                onDelete={() => deleteKPI(index)}
                isEditing={editingIndex === index}
                onToggleEdit={() => setEditingIndex(editingIndex === index ? null : index)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}