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
import { 
  MapPin, 
  Globe, 
  Navigation, 
  Compass,
  Map,
  Mountain,
  Building,
  TreePine,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Star,
  Award,
  Zap,
  TrendingUp,
  Activity,
  Target,
  Layers,
  Route,
  Bookmark
} from 'lucide-react'

// Types and Interfaces
interface GeographicLocation {
  id: string
  name: string
  type: 'region' | 'province' | 'district' | 'city' | 'zone'
  coordinates: [number, number] // [lat, lng]
  parent_id?: string
  code?: string
  area_km2?: number
  population?: number
  elevation?: number
  climate?: string
  economic_profile?: string
}

interface ProjectGeolocation {
  id: string
  project_id: string
  project_title: string
  location: GeographicLocation
  precise_coordinates: [number, number]
  address: string
  area_m2: number
  zone_type: 'urban' | 'rural' | 'industrial' | 'commercial' | 'residential'
  accessibility: {
    road_access: 'excellent' | 'good' | 'regular' | 'poor'
    public_transport: boolean
    distance_to_city: number // km
    distance_to_airport: number // km
    distance_to_port?: number // km
  }
  environmental_factors: {
    risk_level: 'low' | 'medium' | 'high'
    flood_risk: boolean
    seismic_risk: boolean
    environmental_permits_required: string[]
  }
  infrastructure: {
    electricity: boolean
    water: boolean
    sewerage: boolean
    internet: boolean
    gas: boolean
  }
  status: 'active' | 'completed' | 'planning' | 'paused'
  start_date: string
  completion_date?: string
  budget: number
  client_name: string
}

interface RegionStatistics {
  region: string
  total_projects: number
  active_projects: number
  completed_projects: number
  total_investment: number
  avg_project_value: number
  avg_duration: number
  client_satisfaction: number
  predominant_types: string[]
}

interface GeographicManagerProps {
  locations?: GeographicLocation[]
  projects?: ProjectGeolocation[]
  onLocationChange?: (locations: GeographicLocation[]) => void
  onProjectsChange?: (projects: ProjectGeolocation[]) => void
  onCreateLocation?: () => void
  onEditLocation?: (locationId: string) => void
  onDeleteLocation?: (locationId: string) => void
  onViewProject?: (projectId: string) => void
  className?: string
}

// Peru regions and main cities data
const PERU_REGIONS = [
  'Lima', 'Arequipa', 'La Libertad', 'Piura', 'Lambayeque', 'Cajamarca',
  'Junín', 'Cusco', 'Ancash', 'Ica', 'Loreto', 'Huánuco', 'San Martín',
  'Tacna', 'Ayacucho', 'Apurímac', 'Amazonas', 'Huancavelica', 'Moquegua',
  'Pasco', 'Tumbes', 'Ucayali', 'Madre de Dios', 'Puno', 'Callao'
]

const ZONE_TYPES = [
  { value: 'urban', label: 'Urbano', color: 'bg-blue-100 text-blue-800', icon: Building },
  { value: 'rural', label: 'Rural', color: 'bg-green-100 text-green-800', icon: TreePine },
  { value: 'industrial', label: 'Industrial', color: 'bg-gray-100 text-gray-800', icon: Zap },
  { value: 'commercial', label: 'Comercial', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
  { value: 'residential', label: 'Residencial', color: 'bg-cyan-100 text-cyan-800', icon: Users }
]

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const ACCESS_QUALITY = {
  excellent: { label: 'Excelente', color: 'text-green-600' },
  good: { label: 'Bueno', color: 'text-blue-600' },
  regular: { label: 'Regular', color: 'text-yellow-600' },
  poor: { label: 'Deficiente', color: 'text-red-600' }
}

export default function GeographicManager({ 
  locations = [], 
  projects = [],
  onLocationChange,
  onProjectsChange,
  onCreateLocation,
  onEditLocation,
  onDeleteLocation,
  onViewProject,
  className 
}: GeographicManagerProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'map' | 'projects' | 'regions' | 'analytics'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [filterZoneType, setFilterZoneType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<ProjectGeolocation | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards')

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.address.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRegion = filterRegion === 'all' || project.address.includes(filterRegion)
      const matchesZoneType = filterZoneType === 'all' || project.zone_type === filterZoneType
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      
      return matchesSearch && matchesRegion && matchesZoneType && matchesStatus
    })
  }, [projects, searchQuery, filterRegion, filterZoneType, filterStatus])

  // Regional Statistics
  const regionalStats = useMemo(() => {
    const stats: Record<string, RegionStatistics> = {}
    
    projects.forEach(project => {
      const region = PERU_REGIONS.find(r => project.address.includes(r)) || 'Otros'
      
      if (!stats[region]) {
        stats[region] = {
          region,
          total_projects: 0,
          active_projects: 0,
          completed_projects: 0,
          total_investment: 0,
          avg_project_value: 0,
          avg_duration: 0,
          client_satisfaction: 0,
          predominant_types: []
        }
      }
      
      stats[region].total_projects++
      if (project.status === 'active') stats[region].active_projects++
      if (project.status === 'completed') stats[region].completed_projects++
      stats[region].total_investment += project.budget
    })
    
    // Calculate averages
    Object.values(stats).forEach(stat => {
      stat.avg_project_value = stat.total_investment / stat.total_projects
    })
    
    return Object.values(stats).sort((a, b) => b.total_investment - a.total_investment)
  }, [projects])

  // Geographic Distribution
  const geographicDistribution = useMemo(() => {
    const distribution = {
      byZoneType: ZONE_TYPES.map(type => ({
        ...type,
        count: projects.filter(p => p.zone_type === type.value).length,
        investment: projects.filter(p => p.zone_type === type.value)
          .reduce((sum, p) => sum + p.budget, 0)
      })),
      byRiskLevel: Object.keys(RISK_COLORS).map(risk => ({
        risk,
        count: projects.filter(p => p.environmental_factors.risk_level === risk).length,
        investment: projects.filter(p => p.environmental_factors.risk_level === risk)
          .reduce((sum, p) => sum + p.budget, 0)
      }))
    }
    
    return distribution
  }, [projects])

  // Event Handlers
  const handleCreateLocation = useCallback(() => {
    onCreateLocation?.()
  }, [onCreateLocation])

  const handleEditLocation = useCallback((locationId: string) => {
    onEditLocation?.(locationId)
  }, [onEditLocation])

  const handleDeleteLocation = useCallback((locationId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
      onDeleteLocation?.(locationId)
    }
  }, [onDeleteLocation])

  const handleViewProject = useCallback((project: ProjectGeolocation) => {
    setSelectedProject(project)
    onViewProject?.(project.id)
  }, [onViewProject])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getZoneTypeInfo = (type: string) => {
    return ZONE_TYPES.find(zt => zt.value === type) || ZONE_TYPES[0]
  }

  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371 // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestor Geográfico</h2>
          <p className="text-gray-600 mt-1">
            Administra la distribución geográfica de proyectos y análisis regional
          </p>
        </div>
        <Button onClick={handleCreateLocation} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Ubicación
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Mapa de Proyectos
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Lista de Proyectos
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Análisis Regional
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics Geográficos
          </TabsTrigger>
        </TabsList>

        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-4">
          {/* Interactive Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa Interactivo del Perú
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Map Integration Placeholder */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-48 h-32 mx-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-lg shadow-lg transform rotate-6"></div>
                    <div className="absolute inset-0 w-48 h-32 mx-auto bg-gradient-to-br from-yellow-400 via-red-500 to-pink-600 rounded-lg shadow-lg transform -rotate-6"></div>
                    <div className="absolute inset-0 w-48 h-32 mx-auto bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-lg shadow-lg"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mapa Interactivo</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Visualización geográfica de todos los proyectos distribuidos por regiones del Perú
                    </p>
                  </div>
                </div>

                {/* Project Distribution Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold mb-2">Distribución de Proyectos</h4>
                  <div className="space-y-1">
                    {regionalStats.slice(0, 5).map((region, index) => (
                      <div key={region.region} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{region.region}: {region.total_projects}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Layers className="h-4 w-4 mr-2" />
                      Capas
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Route className="h-4 w-4 mr-2" />
                      Rutas
                    </Button>
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {ZONE_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <type.icon className="h-4 w-4" />
                    <span className="text-sm">{type.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Proyectos</p>
                    <p className="text-xl font-bold">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Regiones Activas</p>
                    <p className="text-xl font-bold">{regionalStats.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Proyectos Activos</p>
                    <p className="text-xl font-bold">
                      {projects.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Inversión Total</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects List Tab */}
        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar proyectos por nombre, cliente o ubicación..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las regiones</SelectItem>
                      {PERU_REGIONS.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterZoneType} onValueChange={setFilterZoneType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {ZONE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="planning">Planificación</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Mostrando {filteredProjects.length} de {projects.length} proyectos
              </p>
            </CardHeader>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const zoneInfo = getZoneTypeInfo(project.zone_type)
              const ZoneIcon = zoneInfo.icon
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <ZoneIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <h3 className="font-semibold text-sm">{project.project_title}</h3>
                          <p className="text-xs text-gray-500">{project.client_name}</p>
                        </div>
                      </div>
                      
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{project.address}</span>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      <Badge className={zoneInfo.color}>
                        {zoneInfo.label}
                      </Badge>
                      <Badge className={RISK_COLORS[project.environmental_factors.risk_level]}>
                        Riesgo {project.environmental_factors.risk_level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Área:</span>
                        <p className="font-medium">{project.area_m2.toLocaleString()} m²</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Presupuesto:</span>
                        <p className="font-medium">{formatCurrency(project.budget)}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-600">Acceso:</span>
                      <span className={`ml-1 font-medium ${ACCESS_QUALITY[project.accessibility.road_access].color}`}>
                        {ACCESS_QUALITY[project.accessibility.road_access].label}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Navigation className="h-3 w-3" />
                        <span>
                          {project.precise_coordinates[0].toFixed(4)}, {project.precise_coordinates[1].toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
                <p className="text-gray-600">
                  {searchQuery || filterRegion !== 'all' || filterZoneType !== 'all' || filterStatus !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay proyectos geolocalizados registrados'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regional Analysis Tab */}
        <TabsContent value="regions" className="space-y-6">
          {/* Regional Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Regiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Región</th>
                      <th className="text-center py-3">Total Proyectos</th>
                      <th className="text-center py-3">Activos</th>
                      <th className="text-center py-3">Completados</th>
                      <th className="text-right py-3">Inversión Total</th>
                      <th className="text-right py-3">Valor Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalStats.map((region) => (
                      <tr key={region.region} className="border-b last:border-b-0">
                        <td className="py-3 font-medium">{region.region}</td>
                        <td className="text-center py-3">{region.total_projects}</td>
                        <td className="text-center py-3">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {region.active_projects}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {region.completed_projects}
                          </span>
                        </td>
                        <td className="text-right py-3 font-medium">
                          {formatCurrency(region.total_investment)}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(region.avg_project_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Regions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regiones con Mayor Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalStats.slice(0, 5).map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-gray-500">{region.total_projects} proyectos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(region.total_investment)}</p>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((region.total_investment / regionalStats[0].total_investment) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regiones Más Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalStats
                    .sort((a, b) => b.active_projects - a.active_projects)
                    .slice(0, 5)
                    .map((region, index) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{region.region}</p>
                            <p className="text-sm text-gray-500">{region.total_projects} total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{region.active_projects} activos</p>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-green-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((region.active_projects / region.total_projects) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Zone Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo de Zona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {geographicDistribution.byZoneType.map((zone) => {
                  const ZoneIcon = zone.icon
                  const percentage = projects.length > 0 ? (zone.count / projects.length) * 100 : 0
                  
                  return (
                    <div key={zone.value} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <ZoneIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-semibold">{zone.label}</h3>
                      <p className="text-2xl font-bold text-blue-600 my-2">{zone.count}</p>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(zone.investment)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Riesgo Ambiental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {geographicDistribution.byRiskLevel.map((risk) => {
                  const percentage = projects.length > 0 ? (risk.count / projects.length) * 100 : 0
                  
                  return (
                    <div key={risk.risk} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          risk.risk === 'low' ? 'bg-green-500' :
                          risk.risk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          <Target className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-semibold capitalize">Riesgo {risk.risk}</h3>
                      <p className="text-2xl font-bold my-2">{risk.count}</p>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(risk.investment)}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Infrastructure Analysis */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Análisis de Infraestructura</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['electricity', 'water', 'sewerage', 'internet', 'gas'].map((service) => {
                    const count = projects.filter(p => p.infrastructure[service as keyof typeof p.infrastructure]).length
                    const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
                    
                    return (
                      <div key={service} className="text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <Zap className="h-6 w-6 text-gray-600" />
                        </div>
                        <p className="text-sm font-medium capitalize">{service}</p>
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                {selectedProject.project_title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información del Proyecto</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Cliente:</span> {selectedProject.client_name}</p>
                  <p><span className="font-medium">Estado:</span> 
                    <Badge variant={selectedProject.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                      {selectedProject.status}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Área:</span> {selectedProject.area_m2.toLocaleString()} m²</p>
                  <p><span className="font-medium">Presupuesto:</span> {formatCurrency(selectedProject.budget)}</p>
                  <p><span className="font-medium">Fecha de Inicio:</span> {new Date(selectedProject.start_date).toLocaleDateString()}</p>
                  {selectedProject.completion_date && (
                    <p><span className="font-medium">Fecha de Finalización:</span> {new Date(selectedProject.completion_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información Geográfica</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Dirección:</span> {selectedProject.address}</p>
                  <p><span className="font-medium">Coordenadas:</span> {selectedProject.precise_coordinates[0].toFixed(6)}, {selectedProject.precise_coordinates[1].toFixed(6)}</p>
                  <p><span className="font-medium">Tipo de Zona:</span> 
                    <Badge className={getZoneTypeInfo(selectedProject.zone_type).color} size="sm">
                      {getZoneTypeInfo(selectedProject.zone_type).label}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Nivel de Riesgo:</span> 
                    <Badge className={RISK_COLORS[selectedProject.environmental_factors.risk_level]} size="sm">
                      {selectedProject.environmental_factors.risk_level}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-4">
                <h3 className="font-semibold">Accesibilidad</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Acceso por Carretera:</span> 
                    <span className={`ml-1 font-medium ${ACCESS_QUALITY[selectedProject.accessibility.road_access].color}`}>
                      {ACCESS_QUALITY[selectedProject.accessibility.road_access].label}
                    </span>
                  </p>
                  <p><span className="font-medium">Transporte Público:</span> {selectedProject.accessibility.public_transport ? 'Sí' : 'No'}</p>
                  <p><span className="font-medium">Distancia a la Ciudad:</span> {selectedProject.accessibility.distance_to_city} km</p>
                  <p><span className="font-medium">Distancia al Aeropuerto:</span> {selectedProject.accessibility.distance_to_airport} km</p>
                  {selectedProject.accessibility.distance_to_port && (
                    <p><span className="font-medium">Distancia al Puerto:</span> {selectedProject.accessibility.distance_to_port} km</p>
                  )}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="space-y-4">
                <h3 className="font-semibold">Infraestructura Disponible</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedProject.infrastructure).map(([service, available]) => (
                    <div key={service} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm capitalize">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Factors */}
            {selectedProject.environmental_factors.environmental_permits_required.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Permisos Ambientales Requeridos</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.environmental_factors.environmental_permits_required.map((permit, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {permit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}