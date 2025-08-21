'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  FileText,
  Edit2,
  Trash2,
  Send,
  Download,
  Eye
} from 'lucide-react'

interface PerformanceGoal {
  id: string
  title: string
  description: string
  category: 'technical' | 'leadership' | 'collaboration' | 'innovation' | 'productivity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  target_value: number
  current_value: number
  unit: string
  deadline: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  weight: number
  assigned_by: string
  created_at: string
  updated_at: string
}

interface PerformanceMetric {
  id: string
  name: string
  category: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  last_updated: string
}

interface PerformanceReview {
  id: string
  employee_id: string
  employee_name: string
  employee_position: string
  employee_department: string
  review_period: {
    start_date: string
    end_date: string
    type: 'quarterly' | 'semi_annual' | 'annual' | 'probationary'
  }
  reviewer_id: string
  reviewer_name: string
  status: 'draft' | 'pending_review' | 'in_review' | 'completed' | 'approved'
  overall_rating: number
  scores: {
    technical_skills: number
    communication: number
    teamwork: number
    leadership: number
    problem_solving: number
    initiative: number
    punctuality: number
    quality_of_work: number
  }
  goals: PerformanceGoal[]
  achievements: {
    id: string
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    date: string
  }[]
  development_areas: {
    area: string
    priority: 'low' | 'medium' | 'high'
    action_plan: string
    deadline: string
  }[]
  feedback: {
    strengths: string
    areas_for_improvement: string
    additional_comments: string
  }
  next_review_date: string
  created_at: string
  updated_at: string
  submitted_at?: string
  approved_at?: string
}

interface PerformancePlan {
  id: string
  employee_id: string
  employee_name: string
  type: 'improvement' | 'development' | 'succession' | 'career'
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  objectives: {
    id: string
    description: string
    success_criteria: string
    deadline: string
    status: 'pending' | 'in_progress' | 'completed'
    progress: number
  }[]
  milestones: {
    id: string
    title: string
    date: string
    completed: boolean
    notes?: string
  }[]
  resources_needed: string[]
  assigned_mentor?: string
  created_at: string
  start_date: string
  end_date: string
  progress: number
}

export default function PerformanceEvaluator() {
  const [activeTab, setActiveTab] = useState('reviews')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [activeReviewTab, setActiveReviewTab] = useState('overview')
  const [activePlanTab, setActivePlanTab] = useState('objectives')

  const mockReviews: PerformanceReview[] = [
    {
      id: '1',
      employee_id: 'emp_001',
      employee_name: 'Ana García',
      employee_position: 'Ingeniera Senior',
      employee_department: 'Desarrollo',
      review_period: {
        start_date: '2024-07-01',
        end_date: '2024-12-31',
        type: 'semi_annual'
      },
      reviewer_id: 'mgr_001',
      reviewer_name: 'Carlos López',
      status: 'completed',
      overall_rating: 4.2,
      scores: {
        technical_skills: 4.5,
        communication: 4.0,
        teamwork: 4.3,
        leadership: 3.8,
        problem_solving: 4.4,
        initiative: 4.1,
        punctuality: 4.6,
        quality_of_work: 4.3
      },
      goals: [],
      achievements: [
        {
          id: 'ach_001',
          title: 'Optimización de Performance',
          description: 'Mejoró el rendimiento del sistema en un 40%',
          impact: 'high',
          date: '2024-10-15'
        }
      ],
      development_areas: [
        {
          area: 'Liderazgo de Equipos',
          priority: 'medium',
          action_plan: 'Participar en programa de liderazgo',
          deadline: '2025-06-30'
        }
      ],
      feedback: {
        strengths: 'Excelente conocimiento técnico y capacidad de resolución de problemas',
        areas_for_improvement: 'Desarrollar habilidades de liderazgo y mentoría',
        additional_comments: 'Empleada de alto rendimiento con gran potencial'
      },
      next_review_date: '2025-06-30',
      created_at: '2024-12-01',
      updated_at: '2024-12-15',
      submitted_at: '2024-12-10',
      approved_at: '2024-12-15'
    },
    {
      id: '2',
      employee_id: 'emp_002',
      employee_name: 'Luis Morales',
      employee_position: 'Project Manager',
      employee_department: 'Gestión',
      review_period: {
        start_date: '2024-10-01',
        end_date: '2024-12-31',
        type: 'quarterly'
      },
      reviewer_id: 'mgr_002',
      reviewer_name: 'María Fernández',
      status: 'in_review',
      overall_rating: 3.8,
      scores: {
        technical_skills: 3.5,
        communication: 4.2,
        teamwork: 4.0,
        leadership: 4.1,
        problem_solving: 3.7,
        initiative: 3.9,
        punctuality: 4.3,
        quality_of_work: 3.8
      },
      goals: [],
      achievements: [],
      development_areas: [],
      feedback: {
        strengths: '',
        areas_for_improvement: '',
        additional_comments: ''
      },
      next_review_date: '2025-03-31',
      created_at: '2024-12-01',
      updated_at: '2024-12-20'
    }
  ]

  const mockPlans: PerformancePlan[] = [
    {
      id: '1',
      employee_id: 'emp_001',
      employee_name: 'Ana García',
      type: 'development',
      status: 'active',
      objectives: [
        {
          id: 'obj_001',
          description: 'Completar certificación en arquitectura de software',
          success_criteria: 'Obtener certificación AWS Solutions Architect',
          deadline: '2025-06-30',
          status: 'in_progress',
          progress: 60
        },
        {
          id: 'obj_002',
          description: 'Liderar proyecto de refactorización',
          success_criteria: 'Completar migración exitosa del sistema legacy',
          deadline: '2025-04-30',
          status: 'in_progress',
          progress: 30
        }
      ],
      milestones: [
        {
          id: 'mil_001',
          title: 'Inscripción en curso de certificación',
          date: '2024-12-01',
          completed: true,
          notes: 'Completado exitosamente'
        },
        {
          id: 'mil_002',
          title: 'Examen de práctica',
          date: '2025-02-15',
          completed: false
        }
      ],
      resources_needed: ['Presupuesto para certificación', 'Tiempo dedicado para estudio'],
      assigned_mentor: 'Carlos López',
      created_at: '2024-11-15',
      start_date: '2024-12-01',
      end_date: '2025-06-30',
      progress: 45
    }
  ]

  const mockMetrics: PerformanceMetric[] = [
    {
      id: '1',
      name: 'Productividad Promedio',
      category: 'Rendimiento',
      value: 87,
      target: 85,
      unit: '%',
      trend: 'up',
      last_updated: '2024-12-20'
    },
    {
      id: '2',
      name: 'Satisfacción Empleados',
      category: 'Clima Laboral',
      value: 4.2,
      target: 4.0,
      unit: '/5',
      trend: 'up',
      last_updated: '2024-12-20'
    },
    {
      id: '3',
      name: 'Tiempo Promedio Evaluación',
      category: 'Eficiencia',
      value: 12,
      target: 15,
      unit: 'días',
      trend: 'down',
      last_updated: '2024-12-20'
    }
  ]

  const filteredReviews = useMemo(() => {
    return mockReviews.filter(review => {
      const matchesSearch = review.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.employee_position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus
      const matchesDepartment = filterDepartment === 'all' || review.employee_department === filterDepartment
      
      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [searchTerm, filterStatus, filterDepartment])

  const filteredPlans = useMemo(() => {
    return mockPlans.filter(plan => {
      const matchesSearch = plan.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, filterStatus])

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
      pending_review: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
      in_review: { label: 'En Revisión', className: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
      approved: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-700' },
      active: { label: 'Activo', className: 'bg-blue-100 text-blue-700' },
      on_hold: { label: 'En Pausa', className: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getTypeBadge = useCallback((type: string) => {
    const typeConfig = {
      improvement: { label: 'Mejora', className: 'bg-orange-100 text-orange-700' },
      development: { label: 'Desarrollo', className: 'bg-blue-100 text-blue-700' },
      succession: { label: 'Sucesión', className: 'bg-purple-100 text-purple-700' },
      career: { label: 'Carrera', className: 'bg-green-100 text-green-700' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const getRatingStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }, [])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Evaluador de Desempeño</h1>
          <p className="text-gray-600">Gestiona evaluaciones, metas y planes de desarrollo</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </p>
                  <p className="text-xs text-gray-500">
                    Meta: {metric.target}{metric.unit}
                  </p>
                </div>
                <div className="flex items-center">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="pending_review">Pendiente</SelectItem>
            <SelectItem value="in_review">En Revisión</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="approved">Aprobado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Desarrollo">Desarrollo</SelectItem>
            <SelectItem value="Gestión">Gestión</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Ventas">Ventas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Evaluaciones</TabsTrigger>
          <TabsTrigger value="plans">Planes de Desarrollo</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{review.employee_name}</h3>
                        {getStatusBadge(review.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Posición:</span> {review.employee_position}
                        </div>
                        <div>
                          <span className="font-medium">Departamento:</span> {review.employee_department}
                        </div>
                        <div>
                          <span className="font-medium">Período:</span> {formatDate(review.review_period.start_date)} - {formatDate(review.review_period.end_date)}
                        </div>
                        <div>
                          <span className="font-medium">Revisor:</span> {review.reviewer_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Calificación:</span>
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.overall_rating)}
                            <span className="text-sm ml-1">{review.overall_rating.toFixed(1)}/5</span>
                          </div>
                        </div>
                        {review.next_review_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Próxima: {formatDate(review.next_review_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Evaluación de Desempeño - {selectedReview?.employee_name}</DialogTitle>
                          </DialogHeader>
                          {selectedReview && (
                            <ScrollArea className="h-[70vh]">
                              <Tabs value={activeReviewTab} onValueChange={setActiveReviewTab}>
                                <TabsList className="grid w-full grid-cols-5">
                                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                                  <TabsTrigger value="scores">Puntuaciones</TabsTrigger>
                                  <TabsTrigger value="goals">Metas</TabsTrigger>
                                  <TabsTrigger value="feedback">Retroalimentación</TabsTrigger>
                                  <TabsTrigger value="development">Desarrollo</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="font-medium">Empleado</Label>
                                        <p>{selectedReview.employee_name}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Posición</Label>
                                        <p>{selectedReview.employee_position}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Departamento</Label>
                                        <p>{selectedReview.employee_department}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="font-medium">Revisor</Label>
                                        <p>{selectedReview.reviewer_name}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Período</Label>
                                        <p>{formatDate(selectedReview.review_period.start_date)} - {formatDate(selectedReview.review_period.end_date)}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Estado</Label>
                                        <div className="mt-1">
                                          {getStatusBadge(selectedReview.status)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Calificación General</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getRatingStars(selectedReview.overall_rating)}
                                      <span className="text-lg font-semibold">{selectedReview.overall_rating.toFixed(1)}/5</span>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="scores" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(selectedReview.scores).map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
                                        <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                                        <div className="flex items-center gap-2">
                                          {getRatingStars(value)}
                                          <span className="font-semibold">{value.toFixed(1)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TabsContent>

                                <TabsContent value="goals" className="space-y-4">
                                  <div className="space-y-3">
                                    {selectedReview.goals.length > 0 ? (
                                      selectedReview.goals.map((goal) => (
                                        <Card key={goal.id}>
                                          <CardContent className="p-4">
                                            <h4 className="font-medium">{goal.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                          </CardContent>
                                        </Card>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 text-center py-8">No hay metas definidas para esta evaluación</p>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="feedback" className="space-y-4">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="font-medium">Fortalezas</Label>
                                      <Textarea 
                                        value={selectedReview.feedback.strengths}
                                        readOnly
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="font-medium">Áreas de Mejora</Label>
                                      <Textarea 
                                        value={selectedReview.feedback.areas_for_improvement}
                                        readOnly
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="font-medium">Comentarios Adicionales</Label>
                                      <Textarea 
                                        value={selectedReview.feedback.additional_comments}
                                        readOnly
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="development" className="space-y-4">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="font-medium">Logros</Label>
                                      <div className="space-y-2 mt-2">
                                        {selectedReview.achievements.map((achievement) => (
                                          <Card key={achievement.id}>
                                            <CardContent className="p-3">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <h5 className="font-medium">{achievement.title}</h5>
                                                  <p className="text-sm text-gray-600">{achievement.description}</p>
                                                </div>
                                                <Badge className={
                                                  achievement.impact === 'high' ? 'bg-green-100 text-green-700' :
                                                  achievement.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-gray-100 text-gray-700'
                                                }>
                                                  {achievement.impact}
                                                </Badge>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Áreas de Desarrollo</Label>
                                      <div className="space-y-2 mt-2">
                                        {selectedReview.development_areas.map((area, index) => (
                                          <Card key={index}>
                                            <CardContent className="p-3">
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                  <h5 className="font-medium">{area.area}</h5>
                                                  <Badge className={
                                                    area.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    area.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                  }>
                                                    {area.priority}
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">{area.action_plan}</p>
                                                <p className="text-xs text-gray-500">Fecha límite: {formatDate(area.deadline)}</p>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{plan.employee_name}</h3>
                        {getTypeBadge(plan.type)}
                        {getStatusBadge(plan.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Fecha inicio:</span> {formatDate(plan.start_date)}
                        </div>
                        <div>
                          <span className="font-medium">Fecha fin:</span> {formatDate(plan.end_date)}
                        </div>
                        <div>
                          <span className="font-medium">Mentor:</span> {plan.assigned_mentor || 'No asignado'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progreso</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {plan.objectives.length} objetivos
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Plan de Desarrollo - {selectedPlan?.employee_name}</DialogTitle>
                          </DialogHeader>
                          {selectedPlan && (
                            <ScrollArea className="h-[70vh]">
                              <Tabs value={activePlanTab} onValueChange={setActivePlanTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="objectives">Objetivos</TabsTrigger>
                                  <TabsTrigger value="milestones">Hitos</TabsTrigger>
                                  <TabsTrigger value="resources">Recursos</TabsTrigger>
                                </TabsList>

                                <TabsContent value="objectives" className="space-y-4">
                                  <div className="space-y-3">
                                    {selectedPlan.objectives.map((objective) => (
                                      <Card key={objective.id}>
                                        <CardContent className="p-4">
                                          <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                              <h4 className="font-medium">{objective.description}</h4>
                                              {getStatusBadge(objective.status)}
                                            </div>
                                            <p className="text-sm text-gray-600">{objective.success_criteria}</p>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-500">
                                                Fecha límite: {formatDate(objective.deadline)}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{ width: `${objective.progress}%` }}
                                                  />
                                                </div>
                                                <span className="text-sm font-medium">{objective.progress}%</span>
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </TabsContent>

                                <TabsContent value="milestones" className="space-y-4">
                                  <div className="space-y-3">
                                    {selectedPlan.milestones.map((milestone) => (
                                      <Card key={milestone.id}>
                                        <CardContent className="p-4">
                                          <div className="flex items-center gap-3">
                                            {milestone.completed ? (
                                              <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                              <Clock className="w-5 h-5 text-gray-400" />
                                            )}
                                            <div className="flex-1">
                                              <h4 className="font-medium">{milestone.title}</h4>
                                              <p className="text-sm text-gray-500">{formatDate(milestone.date)}</p>
                                              {milestone.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </TabsContent>

                                <TabsContent value="resources" className="space-y-4">
                                  <div>
                                    <Label className="font-medium">Recursos Necesarios</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedPlan.resources_needed.map((resource, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                          <AlertCircle className="w-4 h-4 text-blue-500" />
                                          <span>{resource}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Plantillas de Evaluación</h3>
            <p className="text-gray-600 mb-4">
              Gestiona plantillas predefinidas para diferentes tipos de evaluaciones
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Plantilla
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}