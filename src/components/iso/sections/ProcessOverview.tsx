'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Workflow,
  FileText,
  Users,
  Calendar,
  Clock,
  Target,
  Award,
  ArrowRight
} from 'lucide-react'

import { ProcessPhase } from '@/types/iso'

interface ProcessOverviewPhase extends Omit<ProcessPhase, 'phase'> {
  phase: string
  status: 'completed' | 'in-progress' | 'pending' | 'review'
  responsible: string
}

interface ProcessOverviewData {
  section: {
    title: string
    subtitle: string
  }
  overview?: string
  phases: ProcessOverviewPhase[]
}

interface ProcessOverviewProps {
  data: ProcessOverviewData
}

const phaseStatusColors = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-cyan-100 text-cyan-800 border-cyan-200'
}

const phaseStatusText = {
  completed: 'Completado',
  'in-progress': 'En Progreso',
  pending: 'Pendiente',
  review: 'En Revisión'
}

const phaseIcons = {
  completed: CheckCircle,
  'in-progress': Clock,
  pending: Target,
  review: FileText
}

function StepperConnector({ isCompleted, isActive }: { isCompleted: boolean, isActive: boolean }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className={`
        w-0.5 h-12 transition-colors duration-300
        ${isCompleted 
          ? 'bg-green-500' 
          : isActive 
            ? 'bg-blue-500' 
            : 'bg-gray-200'
        }
      `} />
    </div>
  )
}

function ProcessPhaseCard({ 
  phase, 
  index, 
  isActive, 
  isCompleted, 
  onToggle 
}: { 
  phase: ProcessPhase
  index: number
  isActive: boolean
  isCompleted: boolean
  onToggle: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const StatusIcon = phaseIcons[phase.status as keyof typeof phaseIcons] || Target
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div className="flex items-start gap-4">
        {/* Step Number and Status */}
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.div
            className={`
              w-12 h-12 rounded-full border-4 flex items-center justify-center relative z-10
              ${isCompleted 
                ? 'bg-green-500 border-green-200 text-white' 
                : isActive 
                  ? 'bg-blue-500 border-blue-200 text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-600'
              }
            `}
            whileHover={{ scale: 1.05 }}
          >
            {isCompleted ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <span className="font-bold text-sm">{phase.phase}</span>
            )}
          </motion.div>
          
          {/* Connector Line */}
          {index < 4 && (
            <StepperConnector 
              isCompleted={isCompleted} 
              isActive={isActive}
            />
          )}
        </div>
        
        {/* Phase Content */}
        <div className="flex-1 pb-8">
          <Card className={`
            hover:shadow-lg transition-all duration-300 cursor-pointer
            ${isActive ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}
            ${isCompleted ? 'bg-green-50/50' : ''}
          `}>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="pb-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-[#00A8E8]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 text-left">
                          {phase.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1 text-left">
                          {phase.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={phaseStatusColors[phase.status as keyof typeof phaseStatusColors] || phaseStatusColors.pending}>
                        {phaseStatusText[phase.status as keyof typeof phaseStatusText] || 'Pendiente'}
                      </Badge>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {phase.duration}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {phase.responsible}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  {/* Deliverables */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00A8E8]" />
                      Entregables
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {phase.deliverables.map((deliverable, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className={`
                            w-2 h-2 rounded-full mt-2 flex-shrink-0
                            ${isCompleted ? 'bg-green-500' : 'bg-gray-400'}
                          `} />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {deliverable}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function ProcessStepper({ phases }: { phases: ProcessPhase[] }) {
  const [activePhase, setActivePhase] = useState(0)
  
  const getPhaseStatus = (index: number) => {
    const phase = phases[index]
    return {
      isActive: index === activePhase,
      isCompleted: phase.status === 'completed'
    }
  }
  
  return (
    <div className="space-y-0">
      {phases.map((phase, index) => {
        const { isActive, isCompleted } = getPhaseStatus(index)
        
        return (
          <ProcessPhaseCard
            key={phase.phase}
            phase={phase}
            index={index}
            isActive={isActive}
            isCompleted={isCompleted}
            onToggle={() => setActivePhase(index)}
          />
        )
      })}
    </div>
  )
}

function ProcessOverviewStats({ phases }: { phases: ProcessPhase[] }) {
  const completedPhases = phases.filter(p => p.status === 'completed').length
  const inProgressPhases = phases.filter(p => p.status === 'in-progress').length
  const totalPhases = phases.length
  const completionRate = Math.round((completedPhases / totalPhases) * 100)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-12"
    >
      <Card className="bg-gradient-to-r from-[#00A8E8]/10 to-[#FF6B35]/10 border-[#00A8E8]/20">
        <CardHeader>
          <CardTitle className="text-center text-xl text-gray-900 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-[#00A8E8]" />
            Estado del Proceso Certificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                {completedPhases}
              </div>
              <div className="text-sm text-gray-600">Fases Completadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                {inProgressPhases}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                {totalPhases}
              </div>
              <div className="text-sm text-gray-600">Total de Fases</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8E8] mb-1">
                {completionRate}%
              </div>
              <div className="text-sm text-gray-600">Progreso Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ProcessOverview({ data }: ProcessOverviewProps) {
  return (
    <section className="py-16 bg-gray-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-[#00A8E8]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {data.section.title}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
            {data.section.subtitle}
          </p>
          
          {/* Process Overview */}
          {data.overview && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-sm border-l-4 border-l-[#00A8E8]">
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed text-left">
                    {data.overview}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Process Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Fases del Proceso de Certificación
              </h3>
              <p className="text-gray-600">
                Haz clic en cada fase para ver los entregables detallados y el estado actual.
              </p>
            </div>
            
            <ProcessStepper phases={data.phases} />
          </div>
        </motion.div>

        {/* Process Statistics */}
        <ProcessOverviewStats phases={data.phases} />
      </div>
    </section>
  )
}