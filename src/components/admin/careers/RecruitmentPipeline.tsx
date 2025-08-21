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
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Activity, 
  Users, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  Calendar,
  MessageCircle,
  FileText,
  Star,
  Filter,
  BarChart3,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Target,
  Zap,
  Building,
  Send,
  Archive,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Flag
} from 'lucide-react'

// Types and Interfaces
interface PipelineStage {
  id: string
  name: string
  description: string
  order: number
  color: string
  icon: string
  required_actions: string[]
  auto_advance: boolean
  time_limit_days?: number
  success_criteria: string[]
}

interface CandidateInPipeline {
  id: string
  candidate_id: string
  job_id: string
  job_title: string
  candidate: {
    first_name: string
    last_name: string
    email: string
    phone: string
    profile_photo?: string
    current_title?: string
    current_company?: string
    location: string
    rating: number
    tags: string[]
  }
  current_stage_id: string
  stage_history: {
    stage_id: string
    stage_name: string
    entered_at: string
    exited_at?: string
    duration_days?: number
    outcome?: 'passed' | 'failed' | 'withdrawn' | 'pending'
    notes: string
    completed_by?: string
  }[]
  status: 'active' | 'on_hold' | 'rejected' | 'hired' | 'withdrawn'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_recruiter: string
  source: 'direct' | 'linkedin' | 'referral' | 'job_board' | 'social_media'
  application_date: string
  last_activity: string
  next_action: {
    type: 'interview' | 'review' | 'decision' | 'offer' | 'follow_up'
    description: string
    due_date: string
    assigned_to: string
  }
  interviews: {
    id: string
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'panel'
    scheduled_date: string
    duration: number
    interviewer: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    feedback?: string
    score?: number
    outcome?: 'pass' | 'fail' | 'pending'
    next_steps?: string
  }[]
  documents: {
    id: string
    type: 'resume' | 'cover_letter' | 'portfolio' | 'assessment' | 'reference'
    name: string
    url: string
    uploaded_at: string
    reviewed: boolean
  }[]
  communications: {
    id: string
    type: 'email' | 'phone' | 'sms' | 'note'
    subject?: string
    content: string
    sent_at: string
    sent_by: string
    response_required: boolean
    responded: boolean
  }[]
  offer_details?: {
    salary: number
    currency: 'PEN' | 'USD'
    benefits: string[]
    start_date: string
    offer_sent_date: string
    response_deadline: string
    status: 'pending' | 'accepted' | 'rejected' | 'countered'
    counter_offer?: {
      candidate_salary: number
      candidate_terms: string[]
      response_date: string
    }
  }
  analytics: {
    time_in_pipeline: number // days
    stage_conversion_rates: Record<string, number>
    response_time: number // hours
    engagement_score: number
  }
}

interface RecruitmentPipelineProps {
  stages?: PipelineStage[]
  candidates?: CandidateInPipeline[]
  onStagesChange?: (stages: PipelineStage[]) => void
  onCandidatesChange?: (candidates: CandidateInPipeline[]) => void
  onMoveCandidateToStage?: (candidateId: string, stageId: string, notes: string) => void
  onScheduleInterview?: (candidateId: string, interviewData: any) => void
  onUpdateCandidateStatus?: (candidateId: string, status: string) => void
  onSendCommunication?: (candidateId: string, communication: any) => void
  className?: string
}

const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 'applied',
    name: 'Aplicado',
    description: 'Candidatos que han enviado su aplicación',
    order: 1,
    color: 'bg-blue-100 text-blue-800',
    icon: 'FileText',
    required_actions: ['Revisar CV'],
    auto_advance: false,
    success_criteria: ['CV completo', 'Requisitos básicos cumplidos']
  },
  {
    id: 'screening',
    name: 'Filtrado Inicial',
    description: 'Revisión inicial de candidatos',
    order: 2,
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Eye',
    required_actions: ['Revisión de perfil', 'Verificación de requisitos'],
    auto_advance: false,
    time_limit_days: 3,
    success_criteria: ['Perfil alineado', 'Experiencia relevante']
  },
  {
    id: 'phone_interview',
    name: 'Entrevista Telefónica',
    description: 'Primera entrevista con el candidato',
    order: 3,
    color: 'bg-purple-100 text-purple-800',
    icon: 'Phone',
    required_actions: ['Programar entrevista', 'Realizar entrevista'],
    auto_advance: false,
    time_limit_days: 5,
    success_criteria: ['Entrevista completada', 'Feedback positivo']
  },
  {
    id: 'technical_interview',
    name: 'Evaluación Técnica',
    description: 'Evaluación de habilidades técnicas',
    order: 4,
    color: 'bg-green-100 text-green-800',
    icon: 'Zap',
    required_actions: ['Prueba técnica', 'Entrevista técnica'],
    auto_advance: false,
    time_limit_days: 7,
    success_criteria: ['Prueba aprobada', 'Habilidades validadas']
  },
  {
    id: 'final_interview',
    name: 'Entrevista Final',
    description: 'Entrevista con el equipo directivo',
    order: 5,
    color: 'bg-orange-100 text-orange-800',
    icon: 'Users',
    required_actions: ['Entrevista con gerencia', 'Referencias'],
    auto_advance: false,
    time_limit_days: 5,
    success_criteria: ['Aprobación gerencial', 'Referencias verificadas']
  },
  {
    id: 'offer',
    name: 'Oferta Enviada',
    description: 'Oferta laboral enviada al candidato',
    order: 6,
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'Send',
    required_actions: ['Preparar oferta', 'Enviar oferta'],
    auto_advance: true,
    time_limit_days: 3,
    success_criteria: ['Oferta enviada', 'Condiciones acordadas']
  },
  {
    id: 'hired',
    name: 'Contratado',
    description: 'Candidato contratado exitosamente',
    order: 7,
    color: 'bg-emerald-100 text-emerald-800',
    icon: 'CheckCircle',
    required_actions: ['Onboarding'],
    auto_advance: false,
    success_criteria: ['Contrato firmado', 'Fecha de inicio definida']
  }
]

const STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  on_hold: { label: 'En Pausa', color: 'bg-yellow-100 text-yellow-800' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  hired: { label: 'Contratado', color: 'bg-blue-100 text-blue-800' },
  withdrawn: { label: 'Retirado', color: 'bg-gray-100 text-gray-800' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
}

export default function RecruitmentPipeline({ 
  stages = DEFAULT_STAGES,
  candidates = [], 
  onStagesChange,
  onCandidatesChange,
  onMoveCandidateToStage,
  onScheduleInterview,
  onUpdateCandidateStatus,
  onSendCommunication,
  className 
}: RecruitmentPipelineProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'settings'>('pipeline')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateInPipeline | null>(null)
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all')
  const [draggedCandidate, setDraggedCandidate] = useState<CandidateInPipeline | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  // Candidates grouped by stage
  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, CandidateInPipeline[]> = {}
    
    stages.forEach(stage => {
      grouped[stage.id] = candidates.filter(candidate => {
        const matchesStage = candidate.current_stage_id === stage.id
        const matchesStatus = selectedStatusFilter === 'all' || candidate.status === selectedStatusFilter
        const matchesPriority = selectedPriorityFilter === 'all' || candidate.priority === selectedPriorityFilter
        
        return matchesStage && matchesStatus && matchesPriority
      })
    })
    
    return grouped
  }, [stages, candidates, selectedStatusFilter, selectedPriorityFilter])

  // Pipeline Analytics
  const pipelineAnalytics = useMemo(() => {
    const totalCandidates = candidates.length
    const activeCandidates = candidates.filter(c => c.status === 'active').length
    const hiredCandidates = candidates.filter(c => c.status === 'hired').length
    const rejectedCandidates = candidates.filter(c => c.status === 'rejected').length
    
    const conversionRate = totalCandidates > 0 ? (hiredCandidates / totalCandidates) * 100 : 0
    const averageTimeInPipeline = candidates.reduce((sum, c) => sum + c.analytics.time_in_pipeline, 0) / totalCandidates || 0
    const averageResponseTime = candidates.reduce((sum, c) => sum + c.analytics.response_time, 0) / totalCandidates || 0

    // Stage conversion rates
    const stageConversions = stages.map((stage, index) => {
      const candidatesInStage = candidates.filter(c => 
        c.stage_history.some(h => h.stage_id === stage.id)
      ).length
      
      const candidatesPassedStage = candidates.filter(c => 
        c.stage_history.some(h => h.stage_id === stage.id && h.outcome === 'passed')
      ).length
      
      const conversionRate = candidatesInStage > 0 ? (candidatesPassedStage / candidatesInStage) * 100 : 0
      
      return {
        stage: stage.name,
        candidates_entered: candidatesInStage,
        candidates_passed: candidatesPassedStage,
        conversion_rate: conversionRate,
        average_time: candidates
          .filter(c => c.stage_history.some(h => h.stage_id === stage.id && h.duration_days))
          .reduce((sum, c) => {
            const stageHistory = c.stage_history.find(h => h.stage_id === stage.id)
            return sum + (stageHistory?.duration_days || 0)
          }, 0) / candidatesInStage || 0
      }
    })

    // Bottleneck analysis
    const bottlenecks = stages
      .map(stage => ({
        stage: stage.name,
        candidates_stuck: candidates.filter(c => 
          c.current_stage_id === stage.id && 
          c.analytics.time_in_pipeline > (stage.time_limit_days || 7)
        ).length,
        average_time_stuck: candidates
          .filter(c => c.current_stage_id === stage.id)
          .reduce((sum, c) => sum + c.analytics.time_in_pipeline, 0) / 
          candidates.filter(c => c.current_stage_id === stage.id).length || 0
      }))
      .filter(b => b.candidates_stuck > 0)
      .sort((a, b) => b.candidates_stuck - a.candidates_stuck)

    return {
      totalCandidates,
      activeCandidates,
      hiredCandidates,
      rejectedCandidates,
      conversionRate,
      averageTimeInPipeline,
      averageResponseTime,
      stageConversions,
      bottlenecks
    }
  }, [candidates, stages])

  // Event Handlers
  const handleDragStart = useCallback((candidate: CandidateInPipeline) => {
    setDraggedCandidate(candidate)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedCandidate(null)
  }, [])

  const handleDrop = useCallback((stageId: string) => {
    if (!draggedCandidate || draggedCandidate.current_stage_id === stageId) return

    setIsMoving(true)
    onMoveCandidateToStage?.(draggedCandidate.id, stageId, 'Movido mediante drag & drop')
    setDraggedCandidate(null)
    setIsMoving(false)
  }, [draggedCandidate, onMoveCandidateToStage])

  const handleViewCandidate = useCallback((candidate: CandidateInPipeline) => {
    setSelectedCandidate(candidate)
  }, [])

  const handleScheduleInterview = useCallback((candidateId: string) => {
    onScheduleInterview?.(candidateId, {})
  }, [onScheduleInterview])

  const handleUpdateStatus = useCallback((candidateId: string, status: string) => {
    onUpdateCandidateStatus?.(candidateId, status)
  }, [onUpdateCandidateStatus])

  const handleSendCommunication = useCallback((candidateId: string, communication: any) => {
    onSendCommunication?.(candidateId, communication)
  }, [onSendCommunication])

  const getStageIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      FileText, Eye, Phone, Zap, Users, Send, CheckCircle
    }
    return icons[iconName] || FileText
  }

  const getDaysInStage = (candidate: CandidateInPipeline) => {
    const currentStageHistory = candidate.stage_history
      .filter(h => h.stage_id === candidate.current_stage_id)
      .sort((a, b) => new Date(b.entered_at).getTime() - new Date(a.entered_at).getTime())[0]
    
    if (!currentStageHistory) return 0
    
    const daysDiff = Math.floor(
      (Date.now() - new Date(currentStageHistory.entered_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysDiff
  }

  const isOverdue = (candidate: CandidateInPipeline) => {
    const currentStage = stages.find(s => s.id === candidate.current_stage_id)
    const daysInStage = getDaysInStage(candidate)
    return currentStage?.time_limit_days ? daysInStage > currentStage.time_limit_days : false
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline de Reclutamiento</h2>
          <p className="text-gray-600 mt-1">
            Gestiona el flujo de candidatos a través del proceso de contratación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidatos Activos</p>
                <p className="text-2xl font-bold text-blue-600">{pipelineAnalytics.activeCandidates}</p>
                <p className="text-xs text-gray-500 mt-1">
                  de {pipelineAnalytics.totalCandidates} total
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
                <p className="text-sm font-medium text-gray-600">Contratados</p>
                <p className="text-2xl font-bold text-green-600">{pipelineAnalytics.hiredCandidates}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pipelineAnalytics.conversionRate.toFixed(1)}% conversión
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(pipelineAnalytics.averageTimeInPipeline)}d</p>
                <p className="text-xs text-gray-500 mt-1">en pipeline</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(pipelineAnalytics.averageResponseTime)}h</p>
                <p className="text-xs text-gray-500 mt-1">promedio</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPriorityFilter} onValueChange={setSelectedPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="ml-auto text-sm text-gray-600">
                  {candidates.filter(c => 
                    (selectedStatusFilter === 'all' || c.status === selectedStatusFilter) &&
                    (selectedPriorityFilter === 'all' || c.priority === selectedPriorityFilter)
                  ).length} candidatos mostrados
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Stages */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {stages.sort((a, b) => a.order - b.order).map((stage, stageIndex) => {
                const stageCandidates = candidatesByStage[stage.id] || []
                const StageIcon = getStageIcon(stage.icon)
                
                return (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    {/* Stage Header */}
                    <Card className="mb-4">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stage.color.replace('text-', 'bg-').replace('800', '200')}`}>
                              <StageIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{stage.name}</h3>
                              <p className="text-xs text-gray-500">{stage.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{stageCandidates.length}</Badge>
                        </div>
                        {stage.time_limit_days && (
                          <div className="text-xs text-gray-500 mt-2">
                            Tiempo límite: {stage.time_limit_days} días
                          </div>
                        )}
                      </CardHeader>
                    </Card>

                    {/* Stage Candidates */}
                    <div 
                      className="space-y-3 min-h-32 p-3 border-2 border-dashed border-gray-200 rounded-lg"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(stage.id)}
                    >
                      {stageCandidates.map((candidate) => {
                        const daysInStage = getDaysInStage(candidate)
                        const overdue = isOverdue(candidate)
                        
                        return (
                          <Card 
                            key={candidate.id} 
                            className={`cursor-move hover:shadow-md transition-shadow ${
                              draggedCandidate?.id === candidate.id ? 'opacity-50' : ''
                            } ${overdue ? 'border-red-200' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(candidate)}
                            onDragEnd={handleDragEnd}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={candidate.candidate.profile_photo} />
                                  <AvatarFallback>
                                    {candidate.candidate.first_name.charAt(0)}{candidate.candidate.last_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm truncate">
                                        {candidate.candidate.first_name} {candidate.candidate.last_name}
                                      </h4>
                                      <p className="text-xs text-gray-500 truncate">
                                        {candidate.job_title}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {candidate.candidate.current_title || 'Sin título actual'}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Badge className={STATUS_CONFIG[candidate.status].color} size="sm">
                                        {STATUS_CONFIG[candidate.status].label}
                                      </Badge>
                                      <Badge className={PRIORITY_CONFIG[candidate.priority].color} size="sm">
                                        {PRIORITY_CONFIG[candidate.priority].label}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500">En etapa:</span>
                                      <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                                        {daysInStage} días {overdue && '⚠️'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < candidate.candidate.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="text-xs text-gray-500 ml-1">
                                        {candidate.candidate.rating}/5
                                      </span>
                                    </div>

                                    {candidate.next_action && (
                                      <div className="bg-blue-50 p-2 rounded text-xs">
                                        <p className="font-medium text-blue-800">Próxima acción:</p>
                                        <p className="text-blue-700">{candidate.next_action.description}</p>
                                        <p className="text-blue-600">
                                          Vence: {new Date(candidate.next_action.due_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}

                                    {candidate.interviews.filter(i => i.status === 'scheduled').length > 0 && (
                                      <div className="bg-green-50 p-2 rounded text-xs">
                                        <p className="font-medium text-green-800">
                                          Entrevista programada: {new Date(candidate.interviews.find(i => i.status === 'scheduled')!.scheduled_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Tags */}
                                  {candidate.candidate.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {candidate.candidate.tags.slice(0, 2).map((tag, index) => (
                                        <Badge key={index} variant="outline" size="sm" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {candidate.candidate.tags.length > 2 && (
                                        <Badge variant="outline" size="sm" className="text-xs">
                                          +{candidate.candidate.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center mt-3 pt-2 border-t">
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleViewCandidate(candidate)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleScheduleInterview(candidate.id)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSendCommunication(candidate.id, {})}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Mail className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    
                                    <div className="text-xs text-gray-400">
                                      {new Date(candidate.application_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                      
                      {stageCandidates.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No hay candidatos en esta etapa</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineAnalytics.stageConversions.map((stage, index) => {
                  const isLastStage = index === pipelineAnalytics.stageConversions.length - 1
                  
                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="text-sm text-gray-600">
                          {stage.candidates_entered} → {stage.candidates_passed} ({stage.conversion_rate.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-6">
                          <div 
                            className={`h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                              stage.conversion_rate >= 80 ? 'bg-green-500' :
                              stage.conversion_rate >= 60 ? 'bg-yellow-500' :
                              stage.conversion_rate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(stage.conversion_rate, 10)}%` }}
                          >
                            {stage.conversion_rate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="absolute right-2 top-0 h-6 flex items-center text-xs text-gray-600">
                          {stage.average_time.toFixed(1)}d promedio
                        </div>
                      </div>
                      {!isLastStage && (
                        <div className="flex justify-center my-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bottlenecks */}
          {pipelineAnalytics.bottlenecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Cuellos de Botella Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineAnalytics.bottlenecks.map((bottleneck) => (
                    <div key={bottleneck.stage} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-orange-800">{bottleneck.stage}</h4>
                          <p className="text-orange-700 text-sm">
                            {bottleneck.candidates_stuck} candidatos estancados
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-800 font-medium">
                            {bottleneck.average_time_stuck.toFixed(1)} días
                          </p>
                          <p className="text-orange-600 text-xs">tiempo promedio</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiempo por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipelineAnalytics.stageConversions.map((stage) => (
                    <div key={stage.stage} className="flex justify-between items-center">
                      <span className="text-sm">{stage.stage}</span>
                      <span className="text-sm font-medium">
                        {stage.average_time.toFixed(1)}d
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fuentes de Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    candidates.reduce((acc, c) => {
                      acc[c.source] = (acc[c.source] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reclutadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    candidates.reduce((acc, c) => {
                      acc[c.assigned_recruiter] = (acc[c.assigned_recruiter] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([recruiter, count]) => (
                    <div key={recruiter} className="flex justify-between items-center">
                      <span className="text-sm">{recruiter}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Personaliza las etapas del pipeline de reclutamiento según las necesidades de tu organización.
                </p>
                
                <div className="space-y-4">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${stage.color.replace('text-', 'bg-').replace('800', '200')}`}>
                            {React.createElement(getStageIcon(stage.icon), { className: "h-4 w-4" })}
                          </div>
                          <div>
                            <h4 className="font-medium">{stage.name}</h4>
                            <p className="text-sm text-gray-600">{stage.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Orden: {stage.order}</Badge>
                          {stage.time_limit_days && (
                            <Badge variant="outline">{stage.time_limit_days}d límite</Badge>
                          )}
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {stage.required_actions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Acciones requeridas:</p>
                          <div className="flex flex-wrap gap-1">
                            {stage.required_actions.map((action, actionIndex) => (
                              <Badge key={actionIndex} variant="outline" size="sm">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nueva Etapa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedCandidate.candidate.profile_photo} />
                  <AvatarFallback>
                    {selectedCandidate.candidate.first_name.charAt(0)}{selectedCandidate.candidate.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {selectedCandidate.candidate.first_name} {selectedCandidate.candidate.last_name}
                <Badge className={STATUS_CONFIG[selectedCandidate.status].color}>
                  {STATUS_CONFIG[selectedCandidate.status].label}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="interviews">Entrevistas</TabsTrigger>
                <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información del Candidato</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedCandidate.candidate.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {selectedCandidate.candidate.phone}</p>
                        <p><span className="font-medium">Ubicación:</span> {selectedCandidate.candidate.location}</p>
                        <p><span className="font-medium">Empresa Actual:</span> {selectedCandidate.candidate.current_company || 'N/A'}</p>
                        <p><span className="font-medium">Título Actual:</span> {selectedCandidate.candidate.current_title || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Calificación</h3>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < selectedCandidate.candidate.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-medium">{selectedCandidate.candidate.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información del Proceso</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Puesto:</span> {selectedCandidate.job_title}</p>
                        <p><span className="font-medium">Fuente:</span> {selectedCandidate.source}</p>
                        <p><span className="font-medium">Reclutador:</span> {selectedCandidate.assigned_recruiter}</p>
                        <p><span className="font-medium">Prioridad:</span> 
                          <Badge className={PRIORITY_CONFIG[selectedCandidate.priority].color} size="sm">
                            {PRIORITY_CONFIG[selectedCandidate.priority].label}
                          </Badge>
                        </p>
                        <p><span className="font-medium">Fecha de Aplicación:</span> {new Date(selectedCandidate.application_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Tiempo en Pipeline:</span> {selectedCandidate.analytics.time_in_pipeline} días</p>
                      </div>
                    </div>

                    {selectedCandidate.next_action && (
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium text-blue-800 mb-1">Próxima Acción</h4>
                        <p className="text-blue-700 text-sm">{selectedCandidate.next_action.description}</p>
                        <p className="text-blue-600 text-xs mt-1">
                          Vence: {new Date(selectedCandidate.next_action.due_date).toLocaleDateString()} • Asignado a: {selectedCandidate.next_action.assigned_to}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <h3 className="font-semibold">Historial del Pipeline</h3>
                <div className="space-y-4">
                  {selectedCandidate.stage_history
                    .sort((a, b) => new Date(b.entered_at).getTime() - new Date(a.entered_at).getTime())
                    .map((history, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            history.outcome === 'passed' ? 'bg-green-500' :
                            history.outcome === 'failed' ? 'bg-red-500' :
                            history.outcome === 'withdrawn' ? 'bg-gray-500' : 'bg-blue-500'
                          }`} />
                          {index < selectedCandidate.stage_history.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{history.stage_name}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(history.entered_at).toLocaleDateString()}
                            </span>
                          </div>
                          {history.duration_days && (
                            <p className="text-sm text-gray-600">
                              Duración: {history.duration_days} días
                            </p>
                          )}
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                          {history.outcome && (
                            <Badge 
                              size="sm" 
                              className={
                                history.outcome === 'passed' ? 'bg-green-100 text-green-800' :
                                history.outcome === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {history.outcome}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Entrevistas</h3>
                  <Button size="sm" onClick={() => handleScheduleInterview(selectedCandidate.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Programar Entrevista
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedCandidate.interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium capitalize">{interview.type} Interview</h4>
                          <p className="text-sm text-gray-600">Entrevistador: {interview.interviewer}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(interview.scheduled_date).toLocaleDateString()} • {interview.duration} min
                          </p>
                        </div>
                        <Badge className={
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          interview.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {interview.status}
                        </Badge>
                      </div>
                      
                      {interview.feedback && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Feedback:</p>
                          <p className="text-sm text-gray-700">{interview.feedback}</p>
                        </div>
                      )}
                      
                      {interview.score && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Puntuación: {interview.score}/100</p>
                        </div>
                      )}
                      
                      {interview.outcome && (
                        <div className="mt-2">
                          <Badge className={
                            interview.outcome === 'pass' ? 'bg-green-100 text-green-800' :
                            interview.outcome === 'fail' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }>
                            {interview.outcome}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {selectedCandidate.interviews.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay entrevistas programadas</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Historial de Comunicaciones</h3>
                  <Button size="sm" onClick={() => handleSendCommunication(selectedCandidate.id, {})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Comunicación
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedCandidate.communications
                    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
                    .map((communication) => (
                      <div key={communication.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" size="sm">
                                {communication.type}
                              </Badge>
                              {communication.response_required && !communication.responded && (
                                <Badge className="bg-orange-100 text-orange-800" size="sm">
                                  Respuesta Pendiente
                                </Badge>
                              )}
                            </div>
                            {communication.subject && (
                              <h4 className="font-medium mt-1">{communication.subject}</h4>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(communication.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{communication.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Enviado por: {communication.sent_by}
                        </p>
                      </div>
                    ))}
                  
                  {selectedCandidate.communications.length === 0 && (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay comunicaciones registradas</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}