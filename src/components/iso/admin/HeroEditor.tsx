'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { 
  Save,
  RotateCcw,
  Award,
  BarChart3,
  FileText,
  Calendar,
  Building,
  ExternalLink,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface HeroData {
  title: string
  subtitle: string
  description: string
  background_gradient: string
  certification_status: {
    is_valid: boolean
    status_text: string
    since_year: string
  }
  stats: {
    certification_years: string
    certified_projects: string
    average_satisfaction: string
  }
  certificate_details: {
    certifying_body: string
    certificate_number: string
    issue_date: string
    expiry_date: string
    verification_url: string
    pdf_url: string
  }
  action_buttons: Array<{
    text: string
    type: 'primary' | 'outline'
    icon: string
    action: string
  }>
}

interface HeroEditorProps {
  data: HeroData
  onSave?: (data: HeroData) => void
  onCancel?: () => void
}

function FormSection({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: { 
  title: string
  icon: any
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`mb-6 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5 text-[#00A8E8]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function FormField({ 
  label, 
  children, 
  required = false,
  error,
  className = "" 
}: { 
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

function CertificateDetailsEditor({
  details,
  onUpdate
}: {
  details: HeroData['certificate_details']
  onUpdate: (field: keyof HeroData['certificate_details'], value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Organismo Certificador" required>
          <Input
            value={details.certifying_body}
            onChange={(e) => onUpdate('certifying_body', e.target.value)}
            placeholder="Ej: SGS Peru"
          />
        </FormField>
        
        <FormField label="Número de Certificado" required>
          <Input
            value={details.certificate_number}
            onChange={(e) => onUpdate('certificate_number', e.target.value)}
            placeholder="Ej: PE18-Q-001847"
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Fecha de Emisión" required>
          <Input
            type="date"
            value={details.issue_date}
            onChange={(e) => onUpdate('issue_date', e.target.value)}
          />
        </FormField>
        
        <FormField label="Fecha de Vencimiento" required>
          <Input
            type="date"
            value={details.expiry_date}
            onChange={(e) => onUpdate('expiry_date', e.target.value)}
          />
        </FormField>
      </div>
      
      <FormField label="URL de Verificación">
        <div className="flex gap-2">
          <Input
            value={details.verification_url}
            onChange={(e) => onUpdate('verification_url', e.target.value)}
            placeholder="https://www.sgs.com/verify-certificate"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(details.verification_url, '_blank')}
            disabled={!details.verification_url}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </FormField>
      
      <FormField label="URL del PDF del Certificado">
        <div className="flex gap-2">
          <Input
            value={details.pdf_url}
            onChange={(e) => onUpdate('pdf_url', e.target.value)}
            placeholder="/documents/certificado-iso-9001-metrica-dip.pdf"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(details.pdf_url, '_blank')}
            disabled={!details.pdf_url}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </FormField>
    </div>
  )
}

export function HeroEditor({ data, onSave, onCancel }: HeroEditorProps) {
  const [formData, setFormData] = useState<HeroData>(data)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      return newData
    })
    setHasChanges(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    }
    
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'El subtítulo es requerido'
    }
    
    if (!formData.certificate_details.certifying_body.trim()) {
      newErrors.certifying_body = 'El organismo certificador es requerido'
    }
    
    if (!formData.certificate_details.certificate_number.trim()) {
      newErrors.certificate_number = 'El número de certificado es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData)
      setHasChanges(false)
      toast({
        title: "Cambios guardados",
        description: "La configuración del Hero Section ha sido actualizada",
      })
    } else {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores antes de guardar",
        variant: "destructive"
      })
    }
  }

  const handleReset = () => {
    setFormData(data)
    setHasChanges(false)
    setErrors({})
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor Hero Section</h1>
          <p className="text-gray-600 mt-1">
            Administra el contenido principal de la página ISO
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={hasChanges ? "destructive" : "secondary"}>
            {hasChanges ? "Sin guardar" : "Guardado"}
          </Badge>
          
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Información Principal */}
          <FormSection title="Información Principal" icon={Award}>
            <FormField label="Título Principal" required error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ej: ISO 9001"
              />
            </FormField>
            
            <FormField label="Subtítulo" required error={errors.subtitle}>
              <Input
                value={formData.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Ej: Certificación 2015"
              />
            </FormField>
            
            <FormField label="Descripción">
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción breve de la certificación"
                rows={3}
              />
            </FormField>
            
            <FormField label="Gradiente de Fondo">
              <Input
                value={formData.background_gradient}
                onChange={(e) => updateField('background_gradient', e.target.value)}
                placeholder="from-[#003F6F] via-[#002A4D] to-[#001A33]"
              />
            </FormField>
          </FormSection>

          {/* Estado de Certificación */}
          <FormSection title="Estado de Certificación" icon={CheckCircle}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Certificación Vigente</Label>
                <Switch
                  checked={formData.certification_status.is_valid}
                  onCheckedChange={(checked) => updateField('certification_status.is_valid', checked)}
                />
              </div>
              
              <FormField label="Texto de Estado">
                <Input
                  value={formData.certification_status.status_text}
                  onChange={(e) => updateField('certification_status.status_text', e.target.value)}
                  placeholder="Ej: Certificación Vigente"
                />
              </FormField>
              
              <FormField label="Año de Inicio">
                <Input
                  value={formData.certification_status.since_year}
                  onChange={(e) => updateField('certification_status.since_year', e.target.value)}
                  placeholder="2018"
                />
              </FormField>
            </div>
          </FormSection>
        </div>

        {/* Right Column */}
        <div>
          {/* Estadísticas */}
          <FormSection title="Estadísticas" icon={BarChart3}>
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Años de Certificación">
                <Input
                  value={formData.stats.certification_years}
                  onChange={(e) => updateField('stats.certification_years', e.target.value)}
                  placeholder="6+"
                />
              </FormField>
              
              <FormField label="Proyectos Certificados">
                <Input
                  value={formData.stats.certified_projects}
                  onChange={(e) => updateField('stats.certified_projects', e.target.value)}
                  placeholder="180"
                />
              </FormField>
              
              <FormField label="Satisfacción Promedio">
                <Input
                  value={formData.stats.average_satisfaction}
                  onChange={(e) => updateField('stats.average_satisfaction', e.target.value)}
                  placeholder="98"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Detalles del Certificado */}
          <FormSection title="Detalles del Certificado" icon={FileText}>
            <CertificateDetailsEditor
              details={formData.certificate_details}
              onUpdate={(field, value) => updateField(`certificate_details.${field}`, value)}
            />
          </FormSection>
        </div>
      </div>
    </div>
  )
}