'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  ChevronDown,
  Award,
  TrendingUp
} from 'lucide-react'

interface AuditScheduleItem {
  type: string
  date: string
  auditor: string
  status: string
  scope: string
}

interface AuditResults {
  last_external_audit: {
    date: string
    result: string
    auditor: string
    recommendations: number
    non_conformities: number
  }
  internal_audits_2023: {
    total_conducted: number
    minor_findings: number
    major_findings: number
    improvement_opportunities: number
  }
}

interface AuditInformationData {
  section: {
    title: string
    subtitle: string
  }
  audit_schedule: AuditScheduleItem[]
  audit_results: AuditResults
}

interface AuditInformationSectionProps {
  data: AuditInformationData
}

const statusColors = {
  programada: 'bg-blue-100 text-blue-800 border-blue-200',
  completada: 'bg-green-100 text-green-800 border-green-200',
  'en-proceso': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  programada: Clock,
  completada: CheckCircle,
  'en-proceso': AlertCircle,
  cancelada: AlertCircle
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function TimelineItem({ audit, index }: { audit: AuditScheduleItem, index: number }) {
  const StatusIcon = statusIcons[audit.status as keyof typeof statusIcons] || Clock
  const isCompleted = audit.status === 'completada'
  const isProgrammed = audit.status === 'programada'
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector */}
      {index < 2 && (
        <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200" />
      )}
      
      <div className="flex items-start gap-4">
        {/* Timeline marker */}
        <div className={`
          w-12 h-12 rounded-full border-4 flex items-center justify-center flex-shrink-0 z-10
          ${isCompleted 
            ? 'bg-green-500 border-green-200' 
            : isProgrammed 
              ? 'bg-blue-500 border-blue-200'
              : 'bg-gray-400 border-gray-200'
          }
        `}>
          <StatusIcon className="w-5 h-5 text-white" />
        </div>
        
        {/* Timeline content */}
        <Card className="flex-1 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 mb-1">
                  {audit.type}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(audit.date)}
                </div>
              </div>
              <Badge className={statusColors[audit.status as keyof typeof statusColors] || statusColors.completada}>
                {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  <strong>Auditor:</strong> {audit.auditor}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-700">
                  <strong>Alcance:</strong> {audit.scope}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function AuditTimeline({ audits }: { audits: AuditScheduleItem[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#00A8E8]" />
        Cronograma de Auditorías
      </h3>
      
      <div className="space-y-4">
        {audits.map((audit, index) => (
          <TimelineItem key={`${audit.date}-${audit.type}`} audit={audit} index={index} />
        ))}
      </div>
    </div>
  )
}

function ResultDetail({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{label}:</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function AuditResults({ results }: { results: AuditResults }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#00A8E8]" />
        Resultados de Auditorías
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Última Auditoría Externa */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Última Auditoría Externa
            </CardTitle>
            <p className="text-sm text-green-700">
              {formatDate(results.last_external_audit.date)}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResultDetail
              label="Resultado"
              value={results.last_external_audit.result}
              icon={CheckCircle}
            />
            <ResultDetail
              label="No Conformidades"
              value={results.last_external_audit.non_conformities}
              icon={AlertCircle}
            />
            <ResultDetail
              label="Recomendaciones"
              value={results.last_external_audit.recommendations}
              icon={FileText}
            />
            <ResultDetail
              label="Auditor"
              value={results.last_external_audit.auditor}
              icon={Users}
            />
          </CardContent>
        </Card>

        {/* Auditorías Internas 2023 */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Auditorías Internas 2023
            </CardTitle>
            <p className="text-sm text-blue-700">
              Resumen anual del programa interno
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResultDetail
              label="Total Realizadas"
              value={results.internal_audits_2023.total_conducted}
              icon={Calendar}
            />
            <ResultDetail
              label="Hallazgos Menores"
              value={results.internal_audits_2023.minor_findings}
              icon={AlertCircle}
            />
            <ResultDetail
              label="Hallazgos Mayores"
              value={results.internal_audits_2023.major_findings}
              icon={AlertCircle}
            />
            <ResultDetail
              label="Oportunidades de Mejora"
              value={results.internal_audits_2023.improvement_opportunities}
              icon={TrendingUp}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AuditInformationSection({ data }: AuditInformationSectionProps) {
  const [showAllAudits, setShowAllAudits] = useState(false)
  
  const visibleAudits = showAllAudits ? data.audit_schedule : data.audit_schedule.slice(0, 3)
  
  return (
    <section className="py-16 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.section.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data.section.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Timeline Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AuditTimeline audits={visibleAudits} />
            
            {data.audit_schedule.length > 3 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllAudits(!showAllAudits)}
                  className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white"
                >
                  {showAllAudits ? 'Ver menos' : 'Ver todas las auditorías'}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAllAudits ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AuditResults results={data.audit_results} />
          </motion.div>
        </div>

        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-xl text-gray-900">
                Resumen del Programa de Auditorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                    {data.audit_schedule.filter(a => a.status === 'completada').length}
                  </div>
                  <div className="text-sm text-gray-600">Auditorías Completadas</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                    {data.audit_schedule.filter(a => a.status === 'programada').length}
                  </div>
                  <div className="text-sm text-gray-600">Auditorías Programadas</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                    {data.audit_results.last_external_audit.non_conformities}
                  </div>
                  <div className="text-sm text-gray-600">No Conformidades</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                    {data.audit_results.internal_audits_2023.improvement_opportunities}
                  </div>
                  <div className="text-sm text-gray-600">Mejoras Identificadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}