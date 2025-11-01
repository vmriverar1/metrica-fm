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
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  User,
  Crown,
  Shield,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  FileText,
  MessageCircle,
  Send,
  UserPlus,
  UserMinus,
  UserCheck,
  Building,
  Zap,
  Globe,
  Languages,
  Heart,
  Coffee,
  Laptop,
  Home,
  Car,
  DollarSign,
  Percent,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

// Types and Interfaces
interface TeamMember {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    email: string
    phone: string
    birth_date: string
    nationality: string
    profile_photo?: string
    emergency_contact: {
      name: string
      relationship: string
      phone: string
    }
  }
  employment: {
    employee_id: string
    hire_date: string
    department: string
    position: string
    employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
    status: 'active' | 'inactive' | 'on_leave' | 'terminated'
    probation_end_date?: string
    contract_end_date?: string
    reports_to?: string
    location: {
      office: string
      work_arrangement: 'onsite' | 'remote' | 'hybrid'
      address: string
      city: string
      country: string
    }
  }
  compensation: {
    salary: {
      base: number
      currency: 'PEN' | 'USD'
      frequency: 'monthly' | 'annual'
    }
    benefits: {
      health_insurance: boolean
      dental_insurance: boolean
      retirement_plan: boolean
      vacation_days: number
      sick_days: number
      bonuses: {
        performance_bonus: number
        annual_bonus: number
        other_bonuses: number
      }
    }
    salary_history: {
      effective_date: string
      previous_salary: number
      new_salary: number
      reason: string
      approved_by: string
    }[]
  }
  skills_and_qualifications: {
    technical_skills: {
      skill: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      certified: boolean
      last_assessed: string
    }[]
    soft_skills: string[]
    languages: {
      language: string
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native'
    }[]
    education: {
      degree: string
      institution: string
      graduation_year: number
      field_of_study: string
    }[]
    certifications: {
      name: string
      issuer: string
      issue_date: string
      expiry_date?: string
      verification_id?: string
    }[]
  }
  performance: {
    overall_rating: number // 1-5
    last_review_date: string
    next_review_date: string
    goals: {
      id: string
      title: string
      description: string
      target_date: string
      status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
      progress: number
    }[]
    achievements: {
      id: string
      title: string
      description: string
      date: string
      recognition_type: 'internal' | 'client' | 'industry'
    }[]
    development_areas: string[]
    career_interests: string[]
  }
  projects: {
    id: string
    project_name: string
    role: string
    start_date: string
    end_date?: string
    status: 'active' | 'completed' | 'paused'
    contribution_percentage: number
    key_responsibilities: string[]
  }[]
  time_off: {
    vacation_balance: number
    sick_leave_balance: number
    personal_days_balance: number
    requests: {
      id: string
      type: 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement'
      start_date: string
      end_date: string
      days_requested: number
      status: 'pending' | 'approved' | 'denied'
      reason?: string
      approved_by?: string
      created_at: string
    }[]
  }
  permissions: {
    role: 'admin' | 'hr' | 'manager' | 'team_lead' | 'employee'
    system_access: string[]
    project_access: string[]
    can_approve_time_off: boolean
    can_view_team_data: boolean
    can_manage_projects: boolean
  }
  analytics: {
    productivity_score: number
    collaboration_score: number
    attendance_rate: number
    goal_completion_rate: number
    project_success_rate: number
    peer_feedback_score: number
    growth_trajectory: 'ascending' | 'stable' | 'declining'
  }
  notes: {
    id: string
    content: string
    created_by: string
    created_at: string
    is_confidential: boolean
    category: 'general' | 'performance' | 'disciplinary' | 'recognition'
  }[]
  created_at: string
  updated_at: string
  last_login?: string
  is_team_lead: boolean
  direct_reports: string[]
}

interface Team {
  id: string
  name: string
  description: string
  department: string
  team_lead_id: string
  members: string[]
  goals: {
    id: string
    title: string
    description: string
    target_date: string
    progress: number
    status: 'active' | 'completed' | 'paused'
  }[]
  metrics: {
    productivity: number
    collaboration: number
    satisfaction: number
    retention_rate: number
    average_tenure: number
  }
  budget: {
    allocated: number
    spent: number
    currency: 'PEN' | 'USD'
  }
  created_at: string
  updated_at: string
}

interface TeamManagementProps {
  teamMembers?: TeamMember[]
  teams?: Team[]
  onTeamMembersChange?: (members: TeamMember[]) => void
  onTeamsChange?: (teams: Team[]) => void
  onCreateMember?: () => void
  onEditMember?: (memberId: string) => void
  onDeleteMember?: (memberId: string) => void
  onCreateTeam?: () => void
  onEditTeam?: (teamId: string) => void
  onAssignToTeam?: (memberId: string, teamId: string) => void
  onApproveTimeOff?: (requestId: string, memberId: string, approved: boolean) => void
  className?: string
}

const EMPLOYMENT_STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  on_leave: { label: 'De Licencia', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  terminated: { label: 'Terminado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const EMPLOYMENT_TYPE_CONFIG = {
  full_time: { label: 'Tiempo Completo', color: 'bg-blue-100 text-blue-800' },
  part_time: { label: 'Tiempo Parcial', color: 'bg-green-100 text-green-800' },
  contract: { label: 'Contrato', color: 'bg-purple-100 text-purple-800' },
  intern: { label: 'Practicante', color: 'bg-cyan-100 text-cyan-800' }
}

const ROLE_CONFIG = {
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: Shield },
  hr: { label: 'Recursos Humanos', color: 'bg-purple-100 text-purple-800', icon: Users },
  manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-800', icon: Crown },
  team_lead: { label: 'Líder de Equipo', color: 'bg-green-100 text-green-800', icon: Star },
  employee: { label: 'Empleado', color: 'bg-gray-100 text-gray-800', icon: User }
}

const DEPARTMENTS = [
  'Ingeniería',
  'Arquitectura',
  'Gestión de Proyectos',
  'Finanzas',
  'Recursos Humanos',
  'Marketing',
  'Ventas',
  'Operaciones',
  'Legal',
  'IT',
  'Calidad',
  'Seguridad',
  'Administración'
]

export default function TeamManagement({ 
  teamMembers = [], 
  teams = [],
  onTeamMembersChange,
  onTeamsChange,
  onCreateMember,
  onEditMember,
  onDeleteMember,
  onCreateTeam,
  onEditTeam,
  onAssignToTeam,
  onApproveTimeOff,
  className 
}: TeamManagementProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'members' | 'teams' | 'analytics' | 'time_off'>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    return [...new Set(teamMembers.map(m => m.employment.department))].sort()
  }, [teamMembers])

  // Filtered Team Members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const fullName = `${member.personal_info.first_name} ${member.personal_info.last_name}`.toLowerCase()
      const email = member.personal_info.email.toLowerCase()
      const position = member.employment.position.toLowerCase()
      
      const matchesSearch = searchQuery === '' || 
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        position.includes(searchQuery.toLowerCase())

      const matchesDepartment = filterDepartment === 'all' || member.employment.department === filterDepartment
      const matchesStatus = filterStatus === 'all' || member.employment.status === filterStatus
      const matchesRole = filterRole === 'all' || member.permissions.role === filterRole

      return matchesSearch && matchesDepartment && matchesStatus && matchesRole
    })
  }, [teamMembers, searchQuery, filterDepartment, filterStatus, filterRole])

  // Team Analytics
  const teamAnalytics = useMemo(() => {
    const totalMembers = teamMembers.length
    const activeMembers = teamMembers.filter(m => m.employment.status === 'active').length
    const onLeaveMembers = teamMembers.filter(m => m.employment.status === 'on_leave').length
    
    const averageTenure = teamMembers.reduce((sum, member) => {
      const hireDate = new Date(member.employment.hire_date)
      const tenure = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return sum + tenure
    }, 0) / totalMembers || 0

    const averageRating = teamMembers.reduce((sum, m) => sum + m.performance.overall_rating, 0) / totalMembers || 0
    const averageProductivity = teamMembers.reduce((sum, m) => sum + m.analytics.productivity_score, 0) / totalMembers || 0

    // Department distribution
    const departmentDistribution = DEPARTMENTS.map(dept => ({
      department: dept,
      count: teamMembers.filter(m => m.employment.department === dept).length,
      averageRating: teamMembers.filter(m => m.employment.department === dept).reduce((sum, m) => sum + m.performance.overall_rating, 0) / teamMembers.filter(m => m.employment.department === dept).length || 0
    })).filter(d => d.count > 0)

    // Role distribution
    const roleDistribution = Object.keys(ROLE_CONFIG).map(role => ({
      role,
      count: teamMembers.filter(m => m.permissions.role === role).length,
      label: ROLE_CONFIG[role as keyof typeof ROLE_CONFIG].label
    })).filter(r => r.count > 0)

    // Performance distribution
    const performanceDistribution = [
      { range: '4.5-5.0', count: teamMembers.filter(m => m.performance.overall_rating >= 4.5).length },
      { range: '4.0-4.4', count: teamMembers.filter(m => m.performance.overall_rating >= 4.0 && m.performance.overall_rating < 4.5).length },
      { range: '3.5-3.9', count: teamMembers.filter(m => m.performance.overall_rating >= 3.5 && m.performance.overall_rating < 4.0).length },
      { range: '3.0-3.4', count: teamMembers.filter(m => m.performance.overall_rating >= 3.0 && m.performance.overall_rating < 3.5).length },
      { range: 'Below 3.0', count: teamMembers.filter(m => m.performance.overall_rating < 3.0).length }
    ]

    // Pending time off requests
    const pendingTimeOffRequests = teamMembers.reduce((total, member) => 
      total + member.time_off.requests.filter(r => r.status === 'pending').length, 0
    )

    return {
      totalMembers,
      activeMembers,
      onLeaveMembers,
      averageTenure,
      averageRating,
      averageProductivity,
      departmentDistribution,
      roleDistribution,
      performanceDistribution,
      pendingTimeOffRequests
    }
  }, [teamMembers])

  // Event Handlers
  const handleCreateMember = useCallback(() => {
    onCreateMember?.()
  }, [onCreateMember])

  const handleEditMember = useCallback((memberId: string) => {
    onEditMember?.(memberId)
  }, [onEditMember])

  const handleDeleteMember = useCallback((memberId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este miembro del equipo?')) {
      onDeleteMember?.(memberId)
    }
  }, [onDeleteMember])

  const handleViewMember = useCallback((member: TeamMember) => {
    setSelectedMember(member)
  }, [])

  const handleCreateTeam = useCallback(() => {
    onCreateTeam?.()
  }, [onCreateTeam])

  const handleEditTeam = useCallback((teamId: string) => {
    onEditTeam?.(teamId)
  }, [onEditTeam])

  const handleViewTeam = useCallback((team: Team) => {
    setSelectedTeam(team)
  }, [])

  const handleAssignToTeam = useCallback((memberId: string, teamId: string) => {
    onAssignToTeam?.(memberId, teamId)
  }, [onAssignToTeam])

  const handleApproveTimeOff = useCallback((requestId: string, memberId: string, approved: boolean) => {
    onApproveTimeOff?.(requestId, memberId, approved)
  }, [onApproveTimeOff])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getTeamForMember = (memberId: string) => {
    return teams.find(team => team.members.includes(memberId))
  }

  const getMembersByTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return []
    return teamMembers.filter(m => team.members.includes(m.id))
  }

  const getTenureText = (hireDate: string) => {
    const hire = new Date(hireDate)
    const now = new Date()
    const years = Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365))
    const months = Math.floor(((now.getTime() - hire.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''} ${months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : ''}`
    }
    return `${months} mes${months > 1 ? 'es' : ''}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h2>
          <p className="text-gray-600 mt-1">
            Administra miembros del equipo, roles y rendimiento organizacional
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateMember} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Miembro
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                <p className="text-2xl font-bold text-gray-900">{teamAnalytics.totalMembers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {teamAnalytics.activeMembers} activos
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Antigüedad Promedio</p>
                <p className="text-2xl font-bold text-green-600">{teamAnalytics.averageTenure.toFixed(1)} años</p>
                <p className="text-xs text-gray-500 mt-1">
                  {teamAnalytics.onLeaveMembers} de licencia
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-yellow-600">{teamAnalytics.averageRating.toFixed(1)}/5</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < teamAnalytics.averageRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-cyan-600">{teamAnalytics.pendingTimeOffRequests}</p>
                <p className="text-xs text-gray-500 mt-1">
                  tiempo libre
                </p>
              </div>
              <Clock className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Equipos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="time_off" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tiempo Libre
            {teamAnalytics.pendingTimeOffRequests > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {teamAnalytics.pendingTimeOffRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar miembros por nombre, email o posición..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(EMPLOYMENT_STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      Lista
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Mostrando {filteredMembers.length} de {teamMembers.length} miembros
              </p>
            </CardHeader>
          </Card>

          {/* Members Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => {
                const statusConfig = EMPLOYMENT_STATUS_CONFIG[member.employment.status]
                const roleConfig = ROLE_CONFIG[member.permissions.role]
                const StatusIcon = statusConfig.icon
                const RoleIcon = roleConfig.icon
                const team = getTeamForMember(member.id)
                
                return (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.personal_info.profile_photo} />
                          <AvatarFallback>
                            {member.personal_info.first_name.charAt(0)}{member.personal_info.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {member.personal_info.first_name} {member.personal_info.last_name}
                          </h3>
                          <p className="text-xs text-gray-500">{member.employment.position}</p>
                          <p className="text-xs text-gray-400">{member.employment.department}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex gap-1">
                        <Badge className={statusConfig.color} size="sm">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={roleConfig.color} size="sm">
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{member.personal_info.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{member.employment.location.city}, {member.employment.location.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{getTenureText(member.employment.hire_date)}</span>
                        </div>
                        {team && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span>{team.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < member.performance.overall_rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            {member.performance.overall_rating}/5
                          </span>
                        </div>
                        <Badge className={EMPLOYMENT_TYPE_CONFIG[member.employment.employment_type].color} size="sm">
                          {EMPLOYMENT_TYPE_CONFIG[member.employment.employment_type].label}
                        </Badge>
                      </div>

                      <div className="text-xs">
                        <span className="text-gray-600">Salario:</span>
                        <span className="ml-1 font-medium">
                          {formatCurrency(member.compensation.salary.base, member.compensation.salary.currency)}
                        </span>
                        <span className="text-gray-500">
                          /{member.compensation.salary.frequency === 'monthly' ? 'mes' : 'año'}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMember(member)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(member.id)}
                          className="h-8 px-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Empleado</th>
                        <th className="text-left p-4">Posición</th>
                        <th className="text-center p-4">Departamento</th>
                        <th className="text-center p-4">Estado</th>
                        <th className="text-center p-4">Rol</th>
                        <th className="text-right p-4">Salario</th>
                        <th className="text-center p-4">Rating</th>
                        <th className="text-center p-4">Antigüedad</th>
                        <th className="text-center p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => {
                        const statusConfig = EMPLOYMENT_STATUS_CONFIG[member.employment.status]
                        const roleConfig = ROLE_CONFIG[member.permissions.role]
                        
                        return (
                          <tr key={member.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.personal_info.profile_photo} />
                                  <AvatarFallback>
                                    {member.personal_info.first_name.charAt(0)}{member.personal_info.last_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {member.personal_info.first_name} {member.personal_info.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{member.personal_info.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{member.employment.position}</td>
                            <td className="text-center p-4">{member.employment.department}</td>
                            <td className="text-center p-4">
                              <Badge className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="text-center p-4">
                              <Badge className={roleConfig.color}>
                                {roleConfig.label}
                              </Badge>
                            </td>
                            <td className="text-right p-4">
                              {formatCurrency(member.compensation.salary.base, member.compensation.salary.currency)}
                            </td>
                            <td className="text-center p-4">
                              <div className="flex justify-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < member.performance.overall_rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="text-center p-4 text-xs">
                              {getTenureText(member.employment.hire_date)}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewMember(member)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditMember(member.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredMembers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron miembros</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterDepartment !== 'all' || filterStatus !== 'all' || filterRole !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay miembros registrados en el equipo'
                  }
                </p>
                <Button onClick={handleCreateMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Miembro
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Equipos de Trabajo</h3>
            <Button onClick={handleCreateTeam} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Equipo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamMembers = getMembersByTeam(team.id)
              const teamLead = teamMembers.find(m => m.id === team.team_lead_id)
              
              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-gray-600">{team.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{team.department}</p>
                      </div>
                      <Badge variant="outline">{teamMembers.length} miembros</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {teamLead && (
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={teamLead.personal_info.profile_photo} />
                            <AvatarFallback className="text-xs">
                              {teamLead.personal_info.first_name.charAt(0)}{teamLead.personal_info.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {teamLead.personal_info.first_name} {teamLead.personal_info.last_name}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-medium">Productividad</p>
                        <p className="text-blue-600">{team.metrics.productivity}%</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-medium">Satisfacción</p>
                        <p className="text-green-600">{team.metrics.satisfaction}%</p>
                      </div>
                    </div>

                    {team.goals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Objetivos Activos</p>
                        <div className="space-y-1">
                          {team.goals.filter(g => g.status === 'active').slice(0, 2).map((goal) => (
                            <div key={goal.id} className="text-xs">
                              <div className="flex justify-between">
                                <span>{goal.title}</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Presupuesto: {formatCurrency(team.budget.spent, team.budget.currency)} / {formatCurrency(team.budget.allocated, team.budget.currency)}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTeam(team)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTeam(team.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {teams.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipos</h3>
                <p className="text-gray-600 mb-4">Comienza creando equipos de trabajo</p>
                <Button onClick={handleCreateTeam}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Equipo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamAnalytics.departmentDistribution.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{dept.department}</span>
                      <div className="text-sm text-gray-600">
                        {dept.count} miembros • {dept.averageRating.toFixed(1)}/5 promedio
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full flex items-center justify-center text-xs text-white"
                        style={{ width: `${Math.max((dept.averageRating / 5) * 100, 10)}%` }}
                      >
                        {dept.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role and Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Rol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamAnalytics.roleDistribution.map((role) => (
                    <div key={role.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {React.createElement(ROLE_CONFIG[role.role as keyof typeof ROLE_CONFIG].icon, { 
                          className: "h-4 w-4 text-gray-600" 
                        })}
                        <span className="text-sm">{role.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(role.count / teamAnalytics.totalMembers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{role.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamAnalytics.performanceDistribution.map((perf) => (
                    <div key={perf.range} className="flex items-center justify-between">
                      <span className="text-sm">{perf.range}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              perf.range.startsWith('4.5') ? 'bg-green-600' :
                              perf.range.startsWith('4.0') ? 'bg-blue-600' :
                              perf.range.startsWith('3.5') ? 'bg-yellow-600' :
                              perf.range.startsWith('3.0') ? 'bg-cyan-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.max((perf.count / teamAnalytics.totalMembers) * 100, 5)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{perf.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Equipo</th>
                      <th className="text-center py-3">Miembros</th>
                      <th className="text-center py-3">Productividad</th>
                      <th className="text-center py-3">Colaboración</th>
                      <th className="text-center py-3">Satisfacción</th>
                      <th className="text-right py-3">Presupuesto Utilizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => {
                      const teamMemberCount = getMembersByTeam(team.id).length
                      const budgetUtilization = (team.budget.spent / team.budget.allocated) * 100
                      
                      return (
                        <tr key={team.id} className="border-b last:border-b-0">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-gray-500">{team.department}</p>
                            </div>
                          </td>
                          <td className="text-center py-3">{teamMemberCount}</td>
                          <td className="text-center py-3">
                            <span className={`font-medium ${
                              team.metrics.productivity >= 90 ? 'text-green-600' :
                              team.metrics.productivity >= 70 ? 'text-blue-600' :
                              team.metrics.productivity >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {team.metrics.productivity}%
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className={`font-medium ${
                              team.metrics.collaboration >= 90 ? 'text-green-600' :
                              team.metrics.collaboration >= 70 ? 'text-blue-600' :
                              team.metrics.collaboration >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {team.metrics.collaboration}%
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className={`font-medium ${
                              team.metrics.satisfaction >= 90 ? 'text-green-600' :
                              team.metrics.satisfaction >= 70 ? 'text-blue-600' :
                              team.metrics.satisfaction >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {team.metrics.satisfaction}%
                            </span>
                          </td>
                          <td className="text-right py-3">
                            <div className="text-right">
                              <p className="font-medium">{budgetUtilization.toFixed(1)}%</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(team.budget.spent)} / {formatCurrency(team.budget.allocated)}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Off Tab */}
        <TabsContent value="time_off" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Solicitudes de Tiempo Libre</h3>
            <Badge className="bg-cyan-100 text-cyan-800">
              {teamAnalytics.pendingTimeOffRequests} pendientes
            </Badge>
          </div>

          <div className="space-y-4">
            {teamMembers
              .filter(member => member.time_off.requests.some(r => r.status === 'pending'))
              .map((member) => {
                const pendingRequests = member.time_off.requests.filter(r => r.status === 'pending')
                
                return (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.personal_info.profile_photo} />
                            <AvatarFallback>
                              {member.personal_info.first_name.charAt(0)}{member.personal_info.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {member.personal_info.first_name} {member.personal_info.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{member.employment.position}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {pendingRequests.length} solicitud{pendingRequests.length > 1 ? 'es' : ''} pendiente{pendingRequests.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{request.type}</Badge>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    {request.days_requested} días
                                  </Badge>
                                </div>
                                <p className="text-sm">
                                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </p>
                                {request.reason && (
                                  <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Solicitado: {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveTimeOff(request.id, member.id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleApproveTimeOff(request.id, member.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">Vacaciones</p>
                          <p className="text-blue-600">{member.time_off.vacation_balance} días</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Enfermedad</p>
                          <p className="text-green-600">{member.time_off.sick_leave_balance} días</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Personales</p>
                          <p className="text-purple-600">{member.time_off.personal_days_balance} días</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            
            {teamMembers.every(member => member.time_off.requests.filter(r => r.status === 'pending').length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
                  <p className="text-gray-600">Todas las solicitudes de tiempo libre han sido procesadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Member Detail Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedMember.personal_info.profile_photo} />
                  <AvatarFallback>
                    {selectedMember.personal_info.first_name.charAt(0)}{selectedMember.personal_info.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {selectedMember.personal_info.first_name} {selectedMember.personal_info.last_name}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                <TabsTrigger value="compensation">Compensación</TabsTrigger>
                <TabsTrigger value="projects">Proyectos</TabsTrigger>
                <TabsTrigger value="development">Desarrollo</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información Personal</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedMember.personal_info.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {selectedMember.personal_info.phone}</p>
                        <p><span className="font-medium">Nacionalidad:</span> {selectedMember.personal_info.nationality}</p>
                        <p><span className="font-medium">Fecha de Nacimiento:</span> {new Date(selectedMember.personal_info.birth_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Contacto de Emergencia</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Nombre:</span> {selectedMember.personal_info.emergency_contact.name}</p>
                        <p><span className="font-medium">Relación:</span> {selectedMember.personal_info.emergency_contact.relationship}</p>
                        <p><span className="font-medium">Teléfono:</span> {selectedMember.personal_info.emergency_contact.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información Laboral</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">ID Empleado:</span> {selectedMember.employment.employee_id}</p>
                        <p><span className="font-medium">Fecha de Contratación:</span> {new Date(selectedMember.employment.hire_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Departamento:</span> {selectedMember.employment.department}</p>
                        <p><span className="font-medium">Posición:</span> {selectedMember.employment.position}</p>
                        <p><span className="font-medium">Tipo:</span> 
                          <Badge className={EMPLOYMENT_TYPE_CONFIG[selectedMember.employment.employment_type].color} size="sm">
                            {EMPLOYMENT_TYPE_CONFIG[selectedMember.employment.employment_type].label}
                          </Badge>
                        </p>
                        <p><span className="font-medium">Estado:</span> 
                          <Badge className={EMPLOYMENT_STATUS_CONFIG[selectedMember.employment.status].color} size="sm">
                            {EMPLOYMENT_STATUS_CONFIG[selectedMember.employment.status].label}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Ubicación de Trabajo</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Oficina:</span> {selectedMember.employment.location.office}</p>
                        <p><span className="font-medium">Modalidad:</span> {selectedMember.employment.location.work_arrangement}</p>
                        <p><span className="font-medium">Ciudad:</span> {selectedMember.employment.location.city}, {selectedMember.employment.location.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Calificación General</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
                              i < selectedMember.performance.overall_rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-medium text-lg">{selectedMember.performance.overall_rating}/5</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Última revisión: {new Date(selectedMember.performance.last_review_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Próxima revisión: {new Date(selectedMember.performance.next_review_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Métricas de Análisis</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Productividad</span>
                            <span>{selectedMember.analytics.productivity_score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${selectedMember.analytics.productivity_score}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Colaboración</span>
                            <span>{selectedMember.analytics.collaboration_score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${selectedMember.analytics.collaboration_score}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Asistencia</span>
                            <span>{selectedMember.analytics.attendance_rate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${selectedMember.analytics.attendance_rate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Objetivos Actuales</h3>
                      <div className="space-y-3">
                        {selectedMember.performance.goals.filter(g => g.status !== 'completed').slice(0, 3).map((goal) => (
                          <div key={goal.id} className="border rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{goal.title}</h4>
                              <Badge className={
                                goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              } size="sm">
                                {goal.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progreso</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full" 
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Meta: {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedMember.performance.achievements.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Logros Recientes</h3>
                        <div className="space-y-2">
                          {selectedMember.performance.achievements.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="bg-green-50 p-2 rounded">
                              <h4 className="font-medium text-sm text-green-800">{achievement.title}</h4>
                              <p className="text-xs text-green-700">{achievement.description}</p>
                              <p className="text-xs text-green-600">{new Date(achievement.date).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compensation" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Salario Actual</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-800">
                          {formatCurrency(selectedMember.compensation.salary.base, selectedMember.compensation.salary.currency)}
                        </p>
                        <p className="text-blue-600 text-sm">
                          {selectedMember.compensation.salary.frequency === 'monthly' ? 'por mes' : 'por año'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Bonificaciones</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bono de Rendimiento:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedMember.compensation.benefits.bonuses.performance_bonus, selectedMember.compensation.salary.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bono Anual:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedMember.compensation.benefits.bonuses.annual_bonus, selectedMember.compensation.salary.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Otros Bonos:</span>
                          <span className="font-medium">
                            {formatCurrency(selectedMember.compensation.benefits.bonuses.other_bonuses, selectedMember.compensation.salary.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Beneficios</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedMember.compensation.benefits.health_insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm">Seguro de Salud</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedMember.compensation.benefits.dental_insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm">Seguro Dental</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedMember.compensation.benefits.retirement_plan ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm">Plan de Jubilación</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="font-medium">Días de Vacaciones</p>
                          <p className="text-blue-600">{selectedMember.compensation.benefits.vacation_days} días</p>
                        </div>
                        <div>
                          <p className="font-medium">Días de Enfermedad</p>
                          <p className="text-green-600">{selectedMember.compensation.benefits.sick_days} días</p>
                        </div>
                      </div>
                    </div>

                    {selectedMember.compensation.salary_history.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Historial Salarial</h3>
                        <div className="space-y-2">
                          {selectedMember.compensation.salary_history.slice(0, 3).map((history, index) => (
                            <div key={index} className="border rounded p-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">
                                    {formatCurrency(history.previous_salary)} → {formatCurrency(history.new_salary)}
                                  </p>
                                  <p className="text-xs text-gray-500">{history.reason}</p>
                                </div>
                                <p className="text-xs text-gray-400">
                                  {new Date(history.effective_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <h3 className="font-semibold">Proyectos Asignados</h3>
                <div className="space-y-3">
                  {selectedMember.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{project.project_name}</h4>
                          <p className="text-sm text-gray-600">Rol: {project.role}</p>
                        </div>
                        <Badge className={
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Inicio:</p>
                          <p>{new Date(project.start_date).toLocaleDateString()}</p>
                        </div>
                        {project.end_date && (
                          <div>
                            <p className="text-gray-600">Fin:</p>
                            <p>{new Date(project.end_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Contribución: {project.contribution_percentage}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.contribution_percentage}%` }}
                          />
                        </div>
                      </div>

                      {project.key_responsibilities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Responsabilidades clave:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {project.key_responsibilities.slice(0, 3).map((responsibility, index) => (
                              <li key={index}>{responsibility}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {selectedMember.projects.length === 0 && (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay proyectos asignados</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="development" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Habilidades Técnicas</h3>
                      <div className="space-y-3">
                        {selectedMember.skills_and_qualifications.technical_skills.slice(0, 5).map((skill, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{skill.skill}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" size="sm">{skill.level}</Badge>
                                {skill.certified && <Award className="h-3 w-3 text-yellow-600" />}
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full ${
                                  skill.level === 'expert' ? 'bg-red-600' :
                                  skill.level === 'advanced' ? 'bg-cyan-600' :
                                  skill.level === 'intermediate' ? 'bg-blue-600' : 'bg-green-600'
                                }`}
                                style={{ 
                                  width: `${
                                    skill.level === 'expert' ? 100 :
                                    skill.level === 'advanced' ? 80 :
                                    skill.level === 'intermediate' ? 60 : 40
                                  }%` 
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Idiomas</h3>
                      <div className="space-y-2">
                        {selectedMember.skills_and_qualifications.languages.map((language, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{language.language}</span>
                            <Badge variant="outline" size="sm">{language.proficiency}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Educación</h3>
                      <div className="space-y-3">
                        {selectedMember.skills_and_qualifications.education.map((education, index) => (
                          <div key={index} className="border rounded p-3">
                            <h4 className="font-medium">{education.degree}</h4>
                            <p className="text-sm text-gray-600">{education.field_of_study}</p>
                            <p className="text-sm text-gray-500">{education.institution}</p>
                            <p className="text-xs text-gray-400">{education.graduation_year}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Certificaciones</h3>
                      <div className="space-y-2">
                        {selectedMember.skills_and_qualifications.certifications.slice(0, 3).map((cert, index) => (
                          <div key={index} className="border rounded p-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{cert.name}</p>
                                <p className="text-xs text-gray-600">{cert.issuer}</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(cert.issue_date).getFullYear()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedMember.performance.development_areas.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Áreas de Desarrollo</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedMember.performance.development_areas.map((area, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}