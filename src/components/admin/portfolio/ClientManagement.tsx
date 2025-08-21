'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Users,
  Star,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  BarChart3,
  Globe,
  Clock,
  User,
  Briefcase,
  Target,
  Award
} from 'lucide-react'

// Types and Interfaces
interface ClientContact {
  id: string
  name: string
  position: string
  email: string
  phone: string
  is_primary: boolean
  department?: string
  avatar?: string
}

interface ClientProject {
  id: string
  title: string
  status: 'planning' | 'active' | 'completed' | 'paused'
  value: number
  start_date: string
  end_date?: string
  completion: number
}

interface Client {
  id: string
  name: string
  legal_name: string
  type: 'public' | 'private' | 'ngo' | 'international'
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  logo?: string
  website?: string
  description: string
  
  // Contact Information
  address: {
    street: string
    city: string
    region: string
    country: string
    postal_code: string
    coordinates?: [number, number]
  }
  
  // Business Information
  tax_id: string
  registration_date?: string
  legal_status: string
  annual_revenue?: number
  employees_count?: number
  
  // Relationship Management
  acquisition_source: string
  relationship_manager: string
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  satisfaction_rating: number
  
  // Project Information
  projects: ClientProject[]
  total_value: number
  avg_project_value: number
  
  // Communication
  contacts: ClientContact[]
  last_interaction: string
  next_follow_up?: string
  
  // Analytics
  created_at: string
  updated_at: string
  tags: string[]
}

interface ClientManagementProps {
  clients?: Client[]
  onClientChange?: (clients: Client[]) => void
  onCreateClient?: () => void
  onEditClient?: (clientId: string) => void
  onDeleteClient?: (clientId: string) => void
  onViewClient?: (clientId: string) => void
  className?: string
}

const INDUSTRY_OPTIONS = [
  'Infraestructura',
  'Construcción',
  'Minería',
  'Energía',
  'Transporte',
  'Telecomunicaciones',
  'Agua y Saneamiento',
  'Educación',
  'Salud',
  'Gobierno',
  'Comercio',
  'Turismo',
  'Agricultura',
  'Tecnología',
  'Otros'
]

const SIZE_OPTIONS = [
  { value: 'startup', label: 'Startup (1-10)', color: 'bg-green-100 text-green-800' },
  { value: 'small', label: 'Pequeña (11-50)', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Mediana (51-200)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'large', label: 'Grande (201-1000)', color: 'bg-orange-100 text-orange-800' },
  { value: 'enterprise', label: 'Corporativa (1000+)', color: 'bg-purple-100 text-purple-800' }
]

const TYPE_OPTIONS = [
  { value: 'public', label: 'Sector Público', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  { value: 'private', label: 'Sector Privado', icon: Briefcase, color: 'bg-green-100 text-green-800' },
  { value: 'ngo', label: 'ONG', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'international', label: 'Internacional', icon: Globe, color: 'bg-orange-100 text-orange-800' }
]

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

export default function ClientManagement({ 
  clients = [], 
  onClientChange,
  onCreateClient,
  onEditClient,
  onDeleteClient,
  onViewClient,
  className 
}: ClientManagementProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'interactions'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'projects' | 'rating'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filtered and Sorted Clients
  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = filterType === 'all' || client.type === filterType
      const matchesIndustry = filterIndustry === 'all' || client.industry === filterIndustry
      const matchesPriority = filterPriority === 'all' || client.priority_level === filterPriority
      
      return matchesSearch && matchesType && matchesIndustry && matchesPriority
    })

    // Sort clients
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'value':
          comparison = a.total_value - b.total_value
          break
        case 'projects':
          comparison = a.projects.length - b.projects.length
          break
        case 'rating':
          comparison = a.satisfaction_rating - b.satisfaction_rating
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [clients, searchQuery, filterType, filterIndustry, filterPriority, sortBy, sortOrder])

  // Analytics Data
  const analyticsData = useMemo(() => {
    const totalClients = clients.length
    const totalValue = clients.reduce((sum, client) => sum + client.total_value, 0)
    const avgSatisfaction = clients.reduce((sum, client) => sum + client.satisfaction_rating, 0) / totalClients || 0
    const activeProjects = clients.reduce((sum, client) => 
      sum + client.projects.filter(p => p.status === 'active').length, 0
    )
    
    const byType = TYPE_OPTIONS.map(type => ({
      ...type,
      count: clients.filter(c => c.type === type.value).length,
      percentage: (clients.filter(c => c.type === type.value).length / totalClients) * 100
    }))
    
    const byIndustry = INDUSTRY_OPTIONS.map(industry => ({
      industry,
      count: clients.filter(c => c.industry === industry).length,
      value: clients.filter(c => c.industry === industry)
        .reduce((sum, c) => sum + c.total_value, 0)
    })).filter(item => item.count > 0)
    
    const topClients = [...clients]
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 5)
    
    return {
      totalClients,
      totalValue,
      avgSatisfaction,
      activeProjects,
      byType,
      byIndustry,
      topClients
    }
  }, [clients])

  // Event Handlers
  const handleCreateClient = useCallback(() => {
    onCreateClient?.()
  }, [onCreateClient])

  const handleEditClient = useCallback((clientId: string) => {
    onEditClient?.(clientId)
  }, [onEditClient])

  const handleDeleteClient = useCallback((clientId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      onDeleteClient?.(clientId)
    }
  }, [onDeleteClient])

  const handleViewClient = useCallback((client: Client) => {
    setSelectedClient(client)
    onViewClient?.(client.id)
  }, [onViewClient])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  const getTypeIcon = (type: string) => {
    const typeOption = TYPE_OPTIONS.find(opt => opt.value === type)
    return typeOption?.icon || Building2
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-600 mt-1">
            Administra tu cartera de clientes y relaciones comerciales
          </p>
        </div>
        <Button onClick={handleCreateClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Clientes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Interacciones
          </TabsTrigger>
        </TabsList>

        {/* Client List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {TYPE_OPTIONS.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las industrias</SelectItem>
                      {INDUSTRY_OPTIONS.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredClients.length} de {clients.length} clientes
                </p>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="value">Valor</SelectItem>
                      <SelectItem value="projects">Proyectos</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClients.map((client) => {
              const TypeIcon = getTypeIcon(client.type)
              const typeOption = TYPE_OPTIONS.find(opt => opt.value === client.type)
              const sizeOption = SIZE_OPTIONS.find(opt => opt.value === client.size)
              
              return (
                <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {client.logo ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.logo} alt={client.name} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <TypeIcon className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-sm">{client.name}</h3>
                          <p className="text-xs text-gray-500">{client.industry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < client.satisfaction_rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex gap-1">
                      <Badge className={typeOption?.color}>
                        {typeOption?.label}
                      </Badge>
                      <Badge className={sizeOption?.color}>
                        {sizeOption?.label.split(' ')[0]}
                      </Badge>
                      <Badge className={PRIORITY_COLORS[client.priority_level]}>
                        {client.priority_level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-gray-400" />
                        <span>{client.projects.length} proyectos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span>{formatCurrency(client.total_value)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{client.address.city}, {client.address.region}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClient(client)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClient(client.id)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
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

          {filteredClients.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterType !== 'all' || filterIndustry !== 'all' || filterPriority !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza agregando tu primer cliente'
                  }
                </p>
                {!searchQuery && filterType === 'all' && filterIndustry === 'all' && filterPriority === 'all' && (
                  <Button onClick={handleCreateClient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalClients}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analyticsData.totalValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfacción Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.avgSatisfaction.toFixed(1)}/5
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.activeProjects}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Type */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.byType.map((type) => (
                    <div key={type.value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clientes por Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.industry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(client.total_value)}</p>
                        <p className="text-xs text-gray-500">{client.projects.length} proyectos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Industria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Industria</th>
                      <th className="text-right py-2">Clientes</th>
                      <th className="text-right py-2">Valor Total</th>
                      <th className="text-right py-2">Valor Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.byIndustry
                      .sort((a, b) => b.value - a.value)
                      .map((industry) => (
                        <tr key={industry.industry} className="border-b last:border-b-0">
                          <td className="py-2">{industry.industry}</td>
                          <td className="text-right py-2">{industry.count}</td>
                          <td className="text-right py-2">{formatCurrency(industry.value)}</td>
                          <td className="text-right py-2">
                            {formatCurrency(industry.value / industry.count)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Interacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients
                  .filter(client => client.next_follow_up)
                  .sort((a, b) => new Date(a.next_follow_up!).getTime() - new Date(b.next_follow_up!).getTime())
                  .slice(0, 10)
                  .map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.logo} alt={client.name} />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">
                            Seguimiento programado para {new Date(client.next_follow_up!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={PRIORITY_COLORS[client.priority_level]}>
                        {client.priority_level}
                      </Badge>
                    </div>
                  ))}
                
                {clients.filter(client => client.next_follow_up).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay seguimientos programados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedClient.logo} alt={selectedClient.name} />
                  <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedClient.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información Básica</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nombre Legal:</span> {selectedClient.legal_name}</p>
                  <p><span className="font-medium">Tipo:</span> {TYPE_OPTIONS.find(t => t.value === selectedClient.type)?.label}</p>
                  <p><span className="font-medium">Industria:</span> {selectedClient.industry}</p>
                  <p><span className="font-medium">Tamaño:</span> {SIZE_OPTIONS.find(s => s.value === selectedClient.size)?.label}</p>
                  <p><span className="font-medium">RUC:</span> {selectedClient.tax_id}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información de Contacto</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Dirección:</span> {selectedClient.address.street}</p>
                  <p><span className="font-medium">Ciudad:</span> {selectedClient.address.city}, {selectedClient.address.region}</p>
                  {selectedClient.website && (
                    <p><span className="font-medium">Website:</span> 
                      <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {selectedClient.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Projects Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold">Resumen de Proyectos</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Total Proyectos</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.projects.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.total_value)}</p>
                  </div>
                </div>
              </div>

              {/* Satisfaction */}
              <div className="space-y-4">
                <h3 className="font-semibold">Satisfacción</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedClient.satisfaction_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{selectedClient.satisfaction_rating}/5</span>
                </div>
                <Badge className={PRIORITY_COLORS[selectedClient.priority_level]}>
                  Prioridad: {selectedClient.priority_level}
                </Badge>
              </div>
            </div>

            {/* Recent Projects */}
            {selectedClient.projects.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Proyectos Recientes</h3>
                <div className="space-y-2">
                  {selectedClient.projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(project.start_date).toLocaleDateString()} - 
                          {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'En progreso'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(project.value)}</p>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
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