'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  FileText,
  Calendar,
  CheckCircle,
  Users,
  Shield,
  Heart,
  Globe
} from 'lucide-react'

interface PolicyDocument {
  title: string
  version: string
  last_update: string
  approved_by: string
  effective_date: string
  next_review: string
}

interface Commitment {
  icon: string
  title: string
  description: string
  color: string
  bg_color: string
  border_color: string
}

interface Objective {
  id: string
  title: string
  target: string
  current: string
  description: string
  status: string
}

interface QualityPolicyData {
  document: PolicyDocument
  commitments: Commitment[]
  objectives: Objective[]
}

interface QualityPolicySectionProps {
  data: QualityPolicyData
}

const iconMap = {
  Target,
  Users,
  Shield,
  TrendingUp,
  Heart,
  Globe,
  FileText
}

function PolicyHeader({ document: doc }: { document: PolicyDocument }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card className="bg-gradient-to-r from-[#003F6F] to-[#002A4D] text-white">
      <CardHeader className="text-center pb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold mb-2">
          {doc.title}
        </CardTitle>
        <div className="flex justify-center gap-2">
          <Badge className="bg-[#E84E0F] hover:bg-[#E84E0F]/90">
            Versión {doc.version}
          </Badge>
          <Badge variant="outline" className="border-white/30 text-white">
            Vigente
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-white/70" />
            <div className="font-medium text-white/90">Última Actualización</div>
            <div className="text-white/70">{formatDate(doc.last_update)}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-white/70" />
            <div className="font-medium text-white/90">Aprobado por</div>
            <div className="text-white/70">{doc.approved_by}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-white/70" />
            <div className="font-medium text-white/90">Próxima Revisión</div>
            <div className="text-white/70">{formatDate(doc.next_review)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CommitmentsGrid({ commitments }: { commitments: Commitment[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {commitments.map((commitment, index) => {
        const IconComponent = iconMap[commitment.icon as keyof typeof iconMap] || Target
        
        return (
          <motion.div
            key={commitment.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full hover:shadow-lg transition-all duration-300 ${commitment.bg_color} border ${commitment.border_color}`}>
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3`}>
                  <IconComponent className={`w-6 h-6 ${commitment.color}`} />
                </div>
                <CardTitle className={`text-lg font-bold ${commitment.color}`}>
                  {commitment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {commitment.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function ObjectivesTable({ objectives }: { objectives: Objective[] }) {
  const getProgressValue = (current: string, target: string) => {
    // Extraer números de los strings
    const currentNum = parseFloat(current.replace(/[^\d.]/g, ''))
    const targetNum = parseFloat(target.replace(/[^\d.]/g, ''))
    
    if (isNaN(currentNum) || isNaN(targetNum)) return 0
    
    return Math.min((currentNum / targetNum) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'Logrado'
      case 'in-progress':
        return 'En Progreso'
      case 'pending':
        return 'Pendiente'
      default:
        return 'Logrado'
    }
  }

  return (
    <div className="space-y-6">
      {objectives.map((objective, index) => (
        <motion.div
          key={objective.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {objective.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {objective.description}
                  </p>
                </div>
                <Badge className={`ml-4 ${getStatusColor(objective.status)}`}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {getStatusText(objective.status)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progreso</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">
                      Actual: <span className="text-[#E84E0F]">{objective.current}</span>
                    </span>
                    <span className="text-gray-600">
                      Meta: <span className="font-medium">{objective.target}</span>
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={getProgressValue(objective.current, objective.target)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export function QualityPolicySection({ data }: QualityPolicySectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Policy Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <PolicyHeader document={data.document} />
        </motion.div>

        {/* Interactive Accordions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="commitments" className="bg-gray-50/50 rounded-lg border border-gray-200">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E84E0F]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#E84E0F]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-semibold text-gray-900">
                      Compromisos de Calidad
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.commitments.length} compromisos organizacionales
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <CommitmentsGrid commitments={data.commitments} />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="objectives" className="bg-gray-50/50 rounded-lg border border-gray-200">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E84E0F]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#E84E0F]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-semibold text-gray-900">
                      Objetivos y Metas
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.objectives.length} indicadores de desempeño monitoreados
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <ObjectivesTable objectives={data.objectives} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}