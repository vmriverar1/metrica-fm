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
  User, 
  Users, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Languages,
  MessageCircle,
  Send,
  Flag,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Heart,
  Zap,
  Building,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Link,
  Bookmark,
  Archive
} from 'lucide-react'

// Types and Interfaces
interface CandidateProfile {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    email: string
    phone: string
    location: {
      city: string
      region: string
      country: string
      address?: string
      willing_to_relocate: boolean
      remote_preference: 'onsite' | 'remote' | 'hybrid' | 'flexible'
    }
    birth_date?: string
    nationality?: string
    profile_photo?: string
    linkedin_url?: string
    portfolio_url?: string
    github_url?: string
  }
  professional_info: {
    current_title?: string
    current_company?: string
    years_of_experience: number
    salary_expectation: {
      min: number
      max: number
      currency: 'PEN' | 'USD'
      negotiable: boolean
    }
    availability: {
      notice_period: number // days
      start_date?: string
      preferred_schedule: 'full_time' | 'part_time' | 'contract' | 'flexible'
    }
    work_authorization: {
      country: string
      status: 'citizen' | 'permanent_resident' | 'work_visa' | 'student_visa' | 'other'
      visa_expiry?: string
      sponsorship_required: boolean
    }
  }
  education: {
    id: string
    institution: string
    degree: string
    field_of_study: string
    graduation_date: string
    gpa?: number
    honors?: string[]
  }[]
  experience: {
    id: string
    company: string
    title: string
    location: string
    start_date: string
    end_date?: string
    is_current: boolean
    description: string
    achievements: string[]
    technologies?: string[]
  }[]
  skills: {
    technical: {
      skill: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      years_of_experience?: number
      certifications?: string[]
    }[]
    soft: string[]
    languages: {
      language: string
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native'
    }[]
  }
  certifications: {
    id: string
    name: string
    issuer: string
    issue_date: string
    expiry_date?: string
    credential_id?: string
    verification_url?: string
  }[]
  applications: {
    job_id: string
    job_title: string
    application_date: string
    status: 'applied' | 'screening' | 'interview' | 'offered' | 'accepted' | 'rejected' | 'withdrawn'
    stage: string
    notes: string[]
    documents: {
      type: 'resume' | 'cover_letter' | 'portfolio' | 'other'
      name: string
      url: string
      upload_date: string
    }[]
    interviews: {
      id: string
      type: 'phone' | 'video' | 'onsite' | 'technical' | 'panel'
      date: string
      duration: number
      interviewer: string
      feedback: string
      score?: number
      outcome: 'passed' | 'failed' | 'pending'
    }[]
    offer_details?: {
      salary: number
      currency: 'PEN' | 'USD'
      start_date: string
      benefits: string[]
      terms: string
    }
  }[]
  analytics: {
    profile_views: number
    application_rate: number
    interview_success_rate: number
    response_time: number // hours
    last_activity: string
    source: 'direct' | 'linkedin' | 'referral' | 'job_board' | 'social_media' | 'other'
  }
  tags: string[]
  notes: {
    id: string
    content: string
    created_by: string
    created_at: string
    is_private: boolean
  }[]
  created_at: string
  updated_at: string
  last_contact: string
  status: 'active' | 'hired' | 'blacklisted' | 'inactive'
  rating: number // 1-5 stars
  recruiter_assigned?: string
}

interface CandidateManagementProps {
  candidates?: CandidateProfile[]
  onCandidatesChange?: (candidates: CandidateProfile[]) => void
  onViewCandidate?: (candidateId: string) => void
  onEditCandidate?: (candidateId: string) => void
  onDeleteCandidate?: (candidateId: string) => void
  onContactCandidate?: (candidateId: string) => void
  onScheduleInterview?: (candidateId: string, jobId: string) => void
  onExportCandidates?: (format: 'csv' | 'excel' | 'pdf') => void
  className?: string
}

const APPLICATION_STATUS_CONFIG = {
  applied: { label: 'Aplicado', color: 'bg-blue-100 text-blue-800', icon: FileText },
  screening: { label: 'Revisión', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  interview: { label: 'Entrevista', color: 'bg-purple-100 text-purple-800', icon: MessageCircle },
  offered: { label: 'Oferta Enviada', color: 'bg-green-100 text-green-800', icon: Send },
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
  withdrawn: { label: 'Retirado', color: 'bg-gray-100 text-gray-800', icon: Archive }
}

const CANDIDATE_STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  hired: { label: 'Contratado', color: 'bg-blue-100 text-blue-800' },
  blacklisted: { label: 'Lista Negra', color: 'bg-red-100 text-red-800' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' }
}

const EXPERIENCE_LEVELS = [
  { min: 0, max: 1, label: 'Sin experiencia' },
  { min: 1, max: 3, label: 'Junior (1-3 años)' },
  { min: 3, max: 6, label: 'Semi-Senior (3-6 años)' },
  { min: 6, max: 10, label: 'Senior (6-10 años)' },
  { min: 10, max: 99, label: 'Experto (10+ años)' }
]

export default function CandidateManagement({ 
  candidates = [], 
  onCandidatesChange,
  onViewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onContactCandidate,
  onScheduleInterview,
  onExportCandidates,
  className 
}: CandidateManagementProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'list' | 'applications' | 'analytics' | 'pipeline'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterExperience, setFilterExperience] = useState<string>('all')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [filterSkill, setFilterSkill] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'rating' | 'last_activity' | 'applications'>('last_activity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique values for filters
  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(candidates.map(c => `${c.personal_info.location.city}, ${c.personal_info.location.region}`))]
    return locations.sort()
  }, [candidates])

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>()
    candidates.forEach(candidate => {
      candidate.skills.technical.forEach(skill => skills.add(skill.skill))
    })
    return Array.from(skills).sort()
  }, [candidates])

  // Filtered and Sorted Candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const fullName = `${candidate.personal_info.first_name} ${candidate.personal_info.last_name}`.toLowerCase()
      const email = candidate.personal_info.email.toLowerCase()
      const skills = candidate.skills.technical.map(s => s.skill.toLowerCase()).join(' ')
      const company = candidate.professional_info.current_company?.toLowerCase() || ''
      
      const matchesSearch = searchQuery === '' || 
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        skills.includes(searchQuery.toLowerCase()) ||
        company.includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus

      const matchesExperience = filterExperience === 'all' || (() => {
        const experienceRange = EXPERIENCE_LEVELS.find(level => 
          candidate.professional_info.years_of_experience >= level.min &&
          candidate.professional_info.years_of_experience <= level.max
        )
        return experienceRange?.label === filterExperience
      })()

      const candidateLocation = `${candidate.personal_info.location.city}, ${candidate.personal_info.location.region}`
      const matchesLocation = filterLocation === 'all' || candidateLocation === filterLocation

      const matchesSkill = filterSkill === 'all' || 
        candidate.skills.technical.some(skill => skill.skill === filterSkill)

      return matchesSearch && matchesStatus && matchesExperience && matchesLocation && matchesSkill
    })

    // Sort candidates
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.personal_info.first_name} ${a.personal_info.last_name}`
          const nameB = `${b.personal_info.first_name} ${b.personal_info.last_name}`
          comparison = nameA.localeCompare(nameB)
          break
        case 'experience':
          comparison = a.professional_info.years_of_experience - b.professional_info.years_of_experience
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'last_activity':
          comparison = new Date(a.analytics.last_activity).getTime() - new Date(b.analytics.last_activity).getTime()
          break
        case 'applications':
          comparison = a.applications.length - b.applications.length
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [candidates, searchQuery, filterStatus, filterExperience, filterLocation, filterSkill, sortBy, sortOrder])

  // Analytics Data
  const analyticsData = useMemo(() => {
    const totalCandidates = candidates.length
    const activeCandidates = candidates.filter(c => c.status === 'active').length
    const hiredCandidates = candidates.filter(c => c.status === 'hired').length
    const averageRating = candidates.reduce((sum, c) => sum + c.rating, 0) / totalCandidates || 0
    const averageExperience = candidates.reduce((sum, c) => sum + c.professional_info.years_of_experience, 0) / totalCandidates || 0

    // Application statistics
    const totalApplications = candidates.reduce((sum, c) => sum + c.applications.length, 0)
    const applicationsByStatus = Object.keys(APPLICATION_STATUS_CONFIG).map(status => ({
      status,
      count: candidates.reduce((sum, c) => sum + c.applications.filter(app => app.status === status).length, 0),
      label: APPLICATION_STATUS_CONFIG[status as keyof typeof APPLICATION_STATUS_CONFIG].label
    }))

    // Experience distribution
    const experienceDistribution = EXPERIENCE_LEVELS.map(level => ({
      ...level,
      count: candidates.filter(c => 
        c.professional_info.years_of_experience >= level.min &&
        c.professional_info.years_of_experience <= level.max
      ).length
    }))

    // Top skills
    const skillCounts: Record<string, number> = {}
    candidates.forEach(candidate => {
      candidate.skills.technical.forEach(skill => {
        skillCounts[skill.skill] = (skillCounts[skill.skill] || 0) + 1
      })
    })
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))

    // Location distribution
    const locationCounts: Record<string, number> = {}
    candidates.forEach(candidate => {
      const location = `${candidate.personal_info.location.city}, ${candidate.personal_info.location.region}`
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })
    const topLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }))

    return {
      totalCandidates,
      activeCandidates,
      hiredCandidates,
      averageRating,
      averageExperience,
      totalApplications,
      applicationsByStatus,
      experienceDistribution,
      topSkills,
      topLocations
    }
  }, [candidates])

  // Event Handlers
  const handleViewCandidate = useCallback((candidate: CandidateProfile) => {
    setSelectedCandidate(candidate)
    onViewCandidate?.(candidate.id)
  }, [onViewCandidate])

  const handleEditCandidate = useCallback((candidateId: string) => {
    onEditCandidate?.(candidateId)
  }, [onEditCandidate])

  const handleDeleteCandidate = useCallback((candidateId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
      onDeleteCandidate?.(candidateId)
    }
  }, [onDeleteCandidate])

  const handleContactCandidate = useCallback((candidateId: string) => {
    onContactCandidate?.(candidateId)
  }, [onContactCandidate])

  const handleScheduleInterview = useCallback((candidateId: string, jobId: string) => {
    onScheduleInterview?.(candidateId, jobId)
  }, [onScheduleInterview])

  const handleExportCandidates = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    onExportCandidates?.(format)
  }, [onExportCandidates])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getExperienceLevel = (years: number) => {
    return EXPERIENCE_LEVELS.find(level => years >= level.min && years <= level.max)?.label || 'No especificado'
  }

  const getLastActivityText = (lastActivity: string) => {
    const diffTime = Date.now() - new Date(lastActivity).getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
    return `Hace ${Math.floor(diffDays / 365)} años`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Candidatos</h2>
          <p className="text-gray-600 mt-1">
            Administra candidatos, aplicaciones y proceso de reclutamiento
          </p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(value) => handleExportCandidates(value as any)}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Candidatos
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Aplicaciones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        {/* Candidates List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar candidatos por nombre, email, habilidades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(CANDIDATE_STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterExperience} onValueChange={setFilterExperience}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {EXPERIENCE_LEVELS.map(level => (
                        <SelectItem key={level.label} value={level.label}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterSkill} onValueChange={setFilterSkill}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Habilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueSkills.slice(0, 20).map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredCandidates.length} de {candidates.length} candidatos
                </p>
                
                <div className="flex gap-2 items-center">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="experience">Experiencia</SelectItem>
                      <SelectItem value="rating">Calificación</SelectItem>
                      <SelectItem value="last_activity">Última Actividad</SelectItem>
                      <SelectItem value="applications">Aplicaciones</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>

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
            </CardHeader>
          </Card>

          {/* Candidates Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.personal_info.profile_photo} />
                        <AvatarFallback>
                          {candidate.personal_info.first_name.charAt(0)}{candidate.personal_info.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {candidate.personal_info.first_name} {candidate.personal_info.last_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {candidate.professional_info.current_title || 'Sin título actual'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {candidate.professional_info.current_company || 'Sin empresa actual'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={CANDIDATE_STATUS_CONFIG[candidate.status].color} size="sm">
                        {CANDIDATE_STATUS_CONFIG[candidate.status].label}
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < candidate.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{candidate.personal_info.location.city}, {candidate.personal_info.location.region}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-gray-400" />
                        <span>{getExperienceLevel(candidate.professional_info.years_of_experience)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-gray-400" />
                        <span>{candidate.applications.length} aplicaciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{getLastActivityText(candidate.analytics.last_activity)}</span>
                      </div>
                    </div>

                    {/* Top Skills */}
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.technical.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" size="sm" className="text-xs">
                          {skill.skill}
                        </Badge>
                      ))}
                      {candidate.skills.technical.length > 3 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{candidate.skills.technical.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCandidate(candidate)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactCandidate(candidate.id)}
                        className="h-8 px-2"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCandidate(candidate.id)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Candidato</th>
                        <th className="text-left p-4">Puesto Actual</th>
                        <th className="text-center p-4">Experiencia</th>
                        <th className="text-center p-4">Ubicación</th>
                        <th className="text-center p-4">Rating</th>
                        <th className="text-center p-4">Aplicaciones</th>
                        <th className="text-center p-4">Estado</th>
                        <th className="text-center p-4">Última Actividad</th>
                        <th className="text-center p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={candidate.personal_info.profile_photo} />
                                <AvatarFallback>
                                  {candidate.personal_info.first_name.charAt(0)}{candidate.personal_info.last_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {candidate.personal_info.first_name} {candidate.personal_info.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{candidate.personal_info.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{candidate.professional_info.current_title || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{candidate.professional_info.current_company || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="text-center p-4">
                            {candidate.professional_info.years_of_experience} años
                          </td>
                          <td className="text-center p-4">
                            {candidate.personal_info.location.city}, {candidate.personal_info.location.region}
                          </td>
                          <td className="text-center p-4">
                            <div className="flex justify-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < candidate.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="text-center p-4">
                            <Badge variant="outline">
                              {candidate.applications.length}
                            </Badge>
                          </td>
                          <td className="text-center p-4">
                            <Badge className={CANDIDATE_STATUS_CONFIG[candidate.status].color}>
                              {CANDIDATE_STATUS_CONFIG[candidate.status].label}
                            </Badge>
                          </td>
                          <td className="text-center p-4 text-xs text-gray-500">
                            {getLastActivityText(candidate.analytics.last_activity)}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewCandidate(candidate)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleContactCandidate(candidate.id)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCandidate(candidate.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredCandidates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron candidatos</h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus !== 'all' || filterExperience !== 'all' || filterLocation !== 'all' || filterSkill !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Los candidatos aparecerán aquí cuando se registren aplicaciones'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aplicaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidates
                  .flatMap(candidate => 
                    candidate.applications.map(application => ({
                      ...application,
                      candidate_name: `${candidate.personal_info.first_name} ${candidate.personal_info.last_name}`,
                      candidate_id: candidate.id,
                      candidate_photo: candidate.personal_info.profile_photo,
                      candidate_rating: candidate.rating
                    }))
                  )
                  .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
                  .slice(0, 20)
                  .map((application) => {
                    const statusConfig = APPLICATION_STATUS_CONFIG[application.status]
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <div key={`${application.candidate_id}-${application.job_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={application.candidate_photo} />
                            <AvatarFallback>
                              {application.candidate_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{application.candidate_name}</h3>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < application.candidate_rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{application.job_title}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>Aplicó: {new Date(application.application_date).toLocaleDateString()}</span>
                              <span>Etapa: {application.stage}</span>
                              {application.interviews.length > 0 && (
                                <span>{application.interviews.length} entrevistas</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const candidate = candidates.find(c => c.id === application.candidate_id)
                                if (candidate) handleViewCandidate(candidate)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScheduleInterview(application.candidate_id, application.job_id)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                
                {candidates.every(c => c.applications.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay aplicaciones registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Candidatos</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCandidates}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analyticsData.activeCandidates} activos
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
                    <p className="text-sm font-medium text-gray-600">Contratados</p>
                    <p className="text-2xl font-bold text-green-600">{analyticsData.hiredCandidates}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analyticsData.totalCandidates > 0 ? 
                        ((analyticsData.hiredCandidates / analyticsData.totalCandidates) * 100).toFixed(1) 
                        : 0}% tasa de conversión
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
                    <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                    <p className="text-2xl font-bold text-yellow-600">{analyticsData.averageRating.toFixed(1)}/5</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < analyticsData.averageRating
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
                    <p className="text-sm font-medium text-gray-600">Aplicaciones Totales</p>
                    <p className="text-2xl font-bold text-purple-600">{analyticsData.totalApplications}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analyticsData.totalCandidates > 0 ? 
                        (analyticsData.totalApplications / analyticsData.totalCandidates).toFixed(1) 
                        : 0} por candidato
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Experiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.experienceDistribution.map((level) => {
                    const percentage = analyticsData.totalCandidates > 0 ? 
                      (level.count / analyticsData.totalCandidates) * 100 : 0
                    
                    return (
                      <div key={level.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{level.label}</span>
                          <span>{level.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Habilidades Más Comunes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <span className="text-sm">{skill.skill}</span>
                      </div>
                      <Badge variant="outline">{skill.count} candidatos</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Aplicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.applicationsByStatus
                    .filter(status => status.count > 0)
                    .map((status) => {
                      const percentage = analyticsData.totalApplications > 0 ? 
                        (status.count / analyticsData.totalApplications) * 100 : 0
                      const config = APPLICATION_STATUS_CONFIG[status.status as keyof typeof APPLICATION_STATUS_CONFIG]
                      
                      return (
                        <div key={status.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={config.color} size="sm">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">{status.count}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicaciones Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topLocations.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{location.location}</span>
                      </div>
                      <Badge variant="outline">{location.count} candidatos</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Reclutamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(APPLICATION_STATUS_CONFIG).slice(0, 4).map(([status, config]) => {
                  const count = analyticsData.applicationsByStatus.find(s => s.status === status)?.count || 0
                  const Icon = config.icon
                  
                  return (
                    <Card key={status} className="text-center">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className={`p-3 rounded-full ${config.color.replace('text-', 'bg-').replace('800', '200')} mb-3`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold">{config.label}</h3>
                          <p className="text-2xl font-bold text-blue-600 my-2">{count}</p>
                          <p className="text-sm text-gray-600">
                            {analyticsData.totalApplications > 0 ? 
                              ((count / analyticsData.totalApplications) * 100).toFixed(1) 
                              : 0}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
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
                  <AvatarImage src={selectedCandidate.personal_info.profile_photo} />
                  <AvatarFallback>
                    {selectedCandidate.personal_info.first_name.charAt(0)}{selectedCandidate.personal_info.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {selectedCandidate.personal_info.first_name} {selectedCandidate.personal_info.last_name}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="experience">Experiencia</TabsTrigger>
                <TabsTrigger value="skills">Habilidades</TabsTrigger>
                <TabsTrigger value="applications">Aplicaciones</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información Personal</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedCandidate.personal_info.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {selectedCandidate.personal_info.phone}</p>
                        <p><span className="font-medium">Ubicación:</span> {selectedCandidate.personal_info.location.city}, {selectedCandidate.personal_info.location.region}</p>
                        <p><span className="font-medium">Disponibilidad para relocación:</span> {selectedCandidate.personal_info.location.willing_to_relocate ? 'Sí' : 'No'}</p>
                        <p><span className="font-medium">Preferencia de trabajo:</span> {selectedCandidate.personal_info.location.remote_preference}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Enlaces</h3>
                      <div className="space-y-2">
                        {selectedCandidate.personal_info.linkedin_url && (
                          <a href={selectedCandidate.personal_info.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                            <ExternalLink className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {selectedCandidate.personal_info.portfolio_url && (
                          <a href={selectedCandidate.personal_info.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                            <ExternalLink className="h-4 w-4" />
                            Portfolio
                          </a>
                        )}
                        {selectedCandidate.personal_info.github_url && (
                          <a href={selectedCandidate.personal_info.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                            <ExternalLink className="h-4 w-4" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información Profesional</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Puesto actual:</span> {selectedCandidate.professional_info.current_title || 'N/A'}</p>
                        <p><span className="font-medium">Empresa actual:</span> {selectedCandidate.professional_info.current_company || 'N/A'}</p>
                        <p><span className="font-medium">Años de experiencia:</span> {selectedCandidate.professional_info.years_of_experience}</p>
                        <p><span className="font-medium">Expectativa salarial:</span> {formatCurrency(selectedCandidate.professional_info.salary_expectation.min, selectedCandidate.professional_info.salary_expectation.currency)} - {formatCurrency(selectedCandidate.professional_info.salary_expectation.max, selectedCandidate.professional_info.salary_expectation.currency)}</p>
                        <p><span className="font-medium">Período de aviso:</span> {selectedCandidate.professional_info.availability.notice_period} días</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Calificación</h3>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < selectedCandidate.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-medium">{selectedCandidate.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <h3 className="font-semibold">Experiencia Laboral</h3>
                <div className="space-y-4">
                  {selectedCandidate.experience.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-xs text-gray-500">{exp.location}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Presente'}
                        </div>
                      </div>
                      <p className="text-sm mb-3">{exp.description}</p>
                      {exp.achievements.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Logros:</h5>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" size="sm">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                <h3 className="font-semibold">Educación</h3>
                <div className="space-y-3">
                  {selectedCandidate.education.map((edu) => (
                    <div key={edu.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.field_of_study}</p>
                          <p className="text-sm text-gray-500">{edu.institution}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">{new Date(edu.graduation_date).getFullYear()}</p>
                          {edu.gpa && <p className="text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                      {edu.honors && edu.honors.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {edu.honors.map((honor, index) => (
                              <Badge key={index} variant="outline" size="sm" className="text-xs">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Habilidades Técnicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCandidate.skills.technical.map((skill, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{skill.skill}</h4>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                        {skill.years_of_experience && (
                          <p className="text-sm text-gray-600">{skill.years_of_experience} años de experiencia</p>
                        )}
                        {skill.certifications && skill.certifications.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Certificaciones:</p>
                            <div className="flex flex-wrap gap-1">
                              {skill.certifications.map((cert, certIndex) => (
                                <Badge key={certIndex} variant="outline" size="sm" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Habilidades Blandas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.soft.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Idiomas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCandidate.skills.languages.map((language, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">{language.language}</span>
                        <Badge variant="outline">{language.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCandidate.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Certificaciones</h3>
                    <div className="space-y-3">
                      {selectedCandidate.certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-gray-600">{cert.issuer}</p>
                              {cert.credential_id && (
                                <p className="text-xs text-gray-500">ID: {cert.credential_id}</p>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-500">{new Date(cert.issue_date).toLocaleDateString()}</p>
                              {cert.expiry_date && (
                                <p className="text-gray-500">Expira: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          {cert.verification_url && (
                            <a href={cert.verification_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mt-2">
                              <ExternalLink className="h-3 w-3" />
                              Verificar
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <h3 className="font-semibold">Historial de Aplicaciones</h3>
                <div className="space-y-4">
                  {selectedCandidate.applications.map((application) => {
                    const statusConfig = APPLICATION_STATUS_CONFIG[application.status]
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <div key={application.job_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{application.job_title}</h4>
                            <p className="text-sm text-gray-600">Aplicado: {new Date(application.application_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Etapa actual: {application.stage}</p>
                          </div>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {application.interviews.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-sm mb-2">Entrevistas ({application.interviews.length})</h5>
                            <div className="space-y-2">
                              {application.interviews.map((interview) => (
                                <div key={interview.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{interview.type} - {interview.interviewer}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(interview.date).toLocaleDateString()} • {interview.duration}min
                                      </p>
                                    </div>
                                    <Badge variant={interview.outcome === 'passed' ? 'default' : interview.outcome === 'failed' ? 'destructive' : 'secondary'} size="sm">
                                      {interview.outcome}
                                    </Badge>
                                  </div>
                                  {interview.feedback && (
                                    <p className="text-xs mt-1">{interview.feedback}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {application.offer_details && (
                          <div className="bg-green-50 p-3 rounded">
                            <h5 className="font-medium text-sm mb-2 text-green-800">Detalles de la Oferta</h5>
                            <div className="text-sm text-green-700">
                              <p>Salario: {formatCurrency(application.offer_details.salary, application.offer_details.currency)}</p>
                              <p>Fecha de inicio: {new Date(application.offer_details.start_date).toLocaleDateString()}</p>
                              {application.offer_details.benefits.length > 0 && (
                                <div className="mt-2">
                                  <p className="font-medium">Beneficios:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {application.offer_details.benefits.map((benefit, index) => (
                                      <Badge key={index} variant="outline" size="sm" className="text-xs">
                                        {benefit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {application.documents.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-sm mb-2">Documentos ({application.documents.length})</h5>
                            <div className="flex flex-wrap gap-2">
                              {application.documents.map((document, index) => (
                                <a
                                  key={index}
                                  href={document.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                >
                                  <FileText className="h-3 w-3" />
                                  {document.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Notas del Candidato</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Nota
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedCandidate.notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{note.created_by}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          {note.is_private && (
                            <Badge variant="outline" size="sm" className="text-xs">
                              Privada
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                  
                  {selectedCandidate.notes.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay notas para este candidato</p>
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