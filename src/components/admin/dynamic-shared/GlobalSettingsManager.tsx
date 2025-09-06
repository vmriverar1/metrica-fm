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
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Eye, 
  Save, 
  Download,
  Upload,
  Copy,
  Trash2,
  RefreshCw,
  Edit2,
  Globe,
  Shield,
  Database,
  Mail,
  Image,
  Code,
  Palette,
  Type,
  Clock,
  Bell,
  Lock,
  Key,
  Server,
  Cloud,
  Zap,
  BarChart3,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Sun,
  Moon,
  Languages,
  MapPin,
  CreditCard,
  Wifi,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Gauge,
  FileText,
  Folder,
  Link
} from 'lucide-react'

interface SettingGroup {
  id: string
  name: string
  description: string
  icon: string
  color: string
  settings_count: number
  is_system: boolean
  category: 'general' | 'security' | 'performance' | 'integrations' | 'appearance' | 'content' | 'advanced'
}

interface Setting {
  id: string
  key: string
  name: string
  description: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'json' | 'color' | 'file' | 'url' | 'password' | 'array'
  group_id: string
  value: any
  default_value: any
  options?: { value: string; label: string; description?: string }[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    file_types?: string[]
    max_size?: number
  }
  is_sensitive: boolean
  is_readonly: boolean
  requires_restart: boolean
  environment_variable?: string
  help_text?: string
  dependencies?: string[]
  created_at: string
  updated_at: string
}

interface EnvironmentConfig {
  id: string
  name: string
  type: 'development' | 'staging' | 'production' | 'testing'
  description: string
  is_active: boolean
  variables: {
    key: string
    value: string
    is_encrypted: boolean
    last_updated: string
  }[]
  deployment_info?: {
    last_deploy: string
    version: string
    build_id: string
  }
}

interface SystemStatus {
  id: string
  component: string
  status: 'healthy' | 'warning' | 'error' | 'maintenance'
  message: string
  last_check: string
  response_time?: number
  uptime_percentage: number
  details?: Record<string, any>
}

export default function GlobalSettingsManager() {
  const [activeTab, setActiveTab] = useState('general')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null)
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState('development')
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const mockSettingGroups: SettingGroup[] = [
    {
      id: 'site',
      name: 'Configuración del Sitio',
      description: 'Configuraciones básicas del sitio web',
      icon: 'Globe',
      color: '#3b82f6',
      settings_count: 12,
      is_system: true,
      category: 'general'
    },
    {
      id: 'security',
      name: 'Seguridad',
      description: 'Configuraciones de seguridad y autenticación',
      icon: 'Shield',
      color: '#ef4444',
      settings_count: 8,
      is_system: true,
      category: 'security'
    },
    {
      id: 'database',
      name: 'Base de Datos',
      description: 'Configuración de conexiones de base de datos',
      icon: 'Database',
      color: '#10b981',
      settings_count: 6,
      is_system: true,
      category: 'advanced'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Configuración de servicios de email',
      icon: 'Mail',
      color: '#f59e0b',
      settings_count: 10,
      is_system: true,
      category: 'integrations'
    },
    {
      id: 'media',
      name: 'Media y Archivos',
      description: 'Configuración de almacenamiento y media',
      icon: 'Image',
      color: '#8b5cf6',
      settings_count: 7,
      is_system: true,
      category: 'content'
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Configuraciones de cache y optimización',
      icon: 'Zap',
      color: '#06b6d4',
      settings_count: 9,
      is_system: true,
      category: 'performance'
    }
  ]

  const mockSettings: Setting[] = [
    {
      id: '1',
      key: 'site_title',
      name: 'Título del Sitio',
      description: 'Título principal que aparece en el navegador y SEO',
      type: 'text',
      group_id: 'site',
      value: 'Métrica FM - Dirección Integral de Proyectos',
      default_value: 'Mi Sitio Web',
      validation: { required: true, max: 100 },
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'Este título aparece en la pestaña del navegador y como título por defecto en resultados de búsqueda.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '2',
      key: 'site_description',
      name: 'Descripción del Sitio',
      description: 'Descripción meta para SEO',
      type: 'textarea',
      group_id: 'site',
      value: 'Líderes en dirección integral de proyectos de infraestructura en Perú. Experiencia, innovación y resultados excepcionales.',
      default_value: '',
      validation: { max: 300 },
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'Esta descripción se usa para SEO y aparece en resultados de búsqueda.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '3',
      key: 'maintenance_mode',
      name: 'Modo Mantenimiento',
      description: 'Activar modo de mantenimiento del sitio',
      type: 'boolean',
      group_id: 'site',
      value: false,
      default_value: false,
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'Cuando está activo, el sitio muestra una página de mantenimiento a los visitantes.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '4',
      key: 'default_language',
      name: 'Idioma por Defecto',
      description: 'Idioma predeterminado del sitio',
      type: 'select',
      group_id: 'site',
      value: 'es',
      default_value: 'es',
      options: [
        { value: 'es', label: 'Español', description: 'Español (España)' },
        { value: 'en', label: 'English', description: 'English (US)' },
        { value: 'pt', label: 'Português', description: 'Português (Brasil)' }
      ],
      is_sensitive: false,
      is_readonly: false,
      requires_restart: true,
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '5',
      key: 'timezone',
      name: 'Zona Horaria',
      description: 'Zona horaria predeterminada del sistema',
      type: 'select',
      group_id: 'site',
      value: 'America/Lima',
      default_value: 'UTC',
      options: [
        { value: 'America/Lima', label: 'Lima (GMT-5)', description: 'Hora de Perú' },
        { value: 'UTC', label: 'UTC (GMT+0)', description: 'Tiempo Universal Coordinado' },
        { value: 'America/New_York', label: 'New York (GMT-5)', description: 'Hora del Este de EE.UU.' },
        { value: 'Europe/Madrid', label: 'Madrid (GMT+1)', description: 'Hora de España' }
      ],
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '6',
      key: 'session_timeout',
      name: 'Timeout de Sesión',
      description: 'Tiempo en minutos antes de que expire una sesión inactiva',
      type: 'number',
      group_id: 'security',
      value: 30,
      default_value: 60,
      validation: { min: 5, max: 480 },
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'Valor en minutos. Valores muy bajos pueden ser molestos para los usuarios.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '7',
      key: 'enable_2fa',
      name: 'Autenticación de Dos Factores',
      description: 'Habilitar 2FA para todos los usuarios administradores',
      type: 'boolean',
      group_id: 'security',
      value: true,
      default_value: false,
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'Recomendado para mejorar la seguridad del sistema.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '8',
      key: 'jwt_secret',
      name: 'JWT Secret Key',
      description: 'Clave secreta para firmar tokens JWT',
      type: 'password',
      group_id: 'security',
      value: '***************',
      default_value: '',
      validation: { required: true, min: 32 },
      is_sensitive: true,
      is_readonly: false,
      requires_restart: true,
      environment_variable: 'JWT_SECRET',
      help_text: 'Debe ser una cadena aleatoria de al menos 32 caracteres. Cambiar esta clave invalidará todas las sesiones.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '9',
      key: 'database_url',
      name: 'URL de Base de Datos',
      description: 'Cadena de conexión a la base de datos principal',
      type: 'password',
      group_id: 'database',
      value: 'postgresql://***************',
      default_value: '',
      validation: { required: true },
      is_sensitive: true,
      is_readonly: false,
      requires_restart: true,
      environment_variable: 'DATABASE_URL',
      help_text: 'Formato: postgresql://usuario:contraseña@host:puerto/basedatos',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    },
    {
      id: '10',
      key: 'cache_enabled',
      name: 'Cache Habilitado',
      description: 'Activar sistema de cache para mejorar performance',
      type: 'boolean',
      group_id: 'performance',
      value: true,
      default_value: true,
      is_sensitive: false,
      is_readonly: false,
      requires_restart: false,
      help_text: 'El cache mejora significativamente los tiempos de respuesta.',
      created_at: '2024-01-15',
      updated_at: '2024-12-10'
    }
  ]

  const mockEnvironments: EnvironmentConfig[] = [
    {
      id: 'dev',
      name: 'Development',
      type: 'development',
      description: 'Entorno de desarrollo local',
      is_active: true,
      variables: [
        { key: 'NODE_ENV', value: 'development', is_encrypted: false, last_updated: '2024-12-10' },
        { key: 'DATABASE_URL', value: 'postgresql://localhost:5432/metrica_dev', is_encrypted: true, last_updated: '2024-12-10' },
        { key: 'JWT_SECRET', value: '***************', is_encrypted: true, last_updated: '2024-12-10' },
        { key: 'NEXT_PUBLIC_API_URL', value: 'http://localhost:3000/api', is_encrypted: false, last_updated: '2024-12-10' }
      ]
    },
    {
      id: 'prod',
      name: 'Production',
      type: 'production',
      description: 'Entorno de producción',
      is_active: false,
      variables: [
        { key: 'NODE_ENV', value: 'production', is_encrypted: false, last_updated: '2024-12-01' },
        { key: 'DATABASE_URL', value: '***************', is_encrypted: true, last_updated: '2024-12-01' },
        { key: 'JWT_SECRET', value: '***************', is_encrypted: true, last_updated: '2024-12-01' },
        { key: 'NEXT_PUBLIC_API_URL', value: 'https://metrica-dip.com/api', is_encrypted: false, last_updated: '2024-12-01' }
      ],
      deployment_info: {
        last_deploy: '2024-12-15',
        version: '2.1.4',
        build_id: 'build-789'
      }
    }
  ]

  const mockSystemStatus: SystemStatus[] = [
    {
      id: '1',
      component: 'Base de Datos Principal',
      status: 'healthy',
      message: 'Conexión estable',
      last_check: '2024-12-20T15:30:00Z',
      response_time: 12,
      uptime_percentage: 99.98,
      details: { connection_pool: 'active', transactions: 1245 }
    },
    {
      id: '2',
      component: 'Cache Redis',
      status: 'healthy',
      message: 'Funcionando correctamente',
      last_check: '2024-12-20T15:30:00Z',
      response_time: 3,
      uptime_percentage: 99.95,
      details: { memory_usage: '45%', hit_rate: '89%' }
    },
    {
      id: '3',
      component: 'Almacenamiento S3',
      status: 'warning',
      message: 'Uso de almacenamiento alto (85%)',
      last_check: '2024-12-20T15:29:00Z',
      response_time: 150,
      uptime_percentage: 99.89,
      details: { storage_used: '850GB', total_storage: '1TB' }
    },
    {
      id: '4',
      component: 'Servicio de Email',
      status: 'healthy',
      message: 'Todos los emails se están entregando',
      last_check: '2024-12-20T15:28:00Z',
      response_time: 89,
      uptime_percentage: 99.92,
      details: { queue_size: 0, daily_sent: 245 }
    }
  ]

  const filteredSettings = useMemo(() => {
    return mockSettings.filter(setting => {
      const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           setting.key.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGroup = filterGroup === 'all' || setting.group_id === filterGroup
      
      return matchesSearch && matchesGroup
    })
  }, [searchTerm, filterGroup])

  const getGroupIcon = useCallback((iconName: string) => {
    const icons = {
      Globe,
      Shield,
      Database,
      Mail,
      Image,
      Zap,
      Settings,
      Code,
      Users,
      BarChart3
    }
    const IconComponent = icons[iconName as keyof typeof icons] || Settings
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    const icons = {
      healthy: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      maintenance: Info
    }
    const IconComponent = icons[status as keyof typeof icons] || Info
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getStatusColor = useCallback((status: string) => {
    const colors = {
      healthy: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      maintenance: 'text-blue-500'
    }
    return colors[status as keyof typeof colors] || 'text-gray-500'
  }, [])

  const getEnvironmentBadge = useCallback((type: string) => {
    const typeConfig = {
      development: { label: 'Desarrollo', className: 'bg-blue-100 text-blue-700' },
      staging: { label: 'Staging', className: 'bg-yellow-100 text-yellow-700' },
      production: { label: 'Producción', className: 'bg-green-100 text-green-700' },
      testing: { label: 'Testing', className: 'bg-purple-100 text-purple-700' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: 'bg-gray-100 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }, [])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const handleSettingChange = useCallback((settingId: string, newValue: any) => {
    // Update setting value logic here
    setHasUnsavedChanges(true)
  }, [])

  const handleSaveChanges = useCallback(() => {
    // Save changes logic here
    setHasUnsavedChanges(false)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración Global del Sistema</h1>
          <p className="text-gray-600">Gestiona todas las configuraciones del sistema</p>
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button onClick={handleSaveChanges}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Config
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar Config
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar configuraciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            {mockSettingGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currentEnvironment} onValueChange={setCurrentEnvironment}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockEnvironments.map((env) => (
              <SelectItem key={env.id} value={env.id}>
                {env.name} {env.is_active ? '(Activo)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="environment">Entornos</TabsTrigger>
          <TabsTrigger value="status">Estado</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {mockSettingGroups
              .filter(group => ['general', 'content', 'appearance'].includes(group.category))
              .map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: group.color + '20' }}
                  >
                    {getGroupIcon(group.icon)}
                  </div>
                  <h3 className="font-semibold mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <Badge variant="outline">{group.settings_count} configuraciones</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Configuraciones Principales</h3>
            <div className="grid gap-4">
              {filteredSettings
                .filter(setting => ['site'].includes(setting.group_id))
                .map((setting) => (
                <Card key={setting.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{setting.name}</h4>
                          {setting.requires_restart && (
                            <Badge className="bg-orange-100 text-orange-700">Requiere Reinicio</Badge>
                          )}
                          {setting.is_sensitive && (
                            <Badge className="bg-red-100 text-red-700">Sensible</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                        {setting.help_text && (
                          <p className="text-xs text-gray-500 mb-3">{setting.help_text}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {setting.type === 'boolean' && (
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">{setting.name}</Label>
                          <Switch 
                            checked={setting.value}
                            onCheckedChange={(value) => handleSettingChange(setting.id, value)}
                          />
                        </div>
                      )}

                      {setting.type === 'text' && (
                        <div>
                          <Label className="text-sm">{setting.name}</Label>
                          <Input
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {setting.type === 'textarea' && (
                        <div>
                          <Label className="text-sm">{setting.name}</Label>
                          <Textarea
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      )}

                      {setting.type === 'select' && setting.options && (
                        <div>
                          <Label className="text-sm">{setting.name}</Label>
                          <Select value={setting.value} onValueChange={(value) => handleSettingChange(setting.id, value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <div>{option.label}</div>
                                    {option.description && (
                                      <div className="text-xs text-gray-500">{option.description}</div>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {setting.type === 'number' && (
                        <div>
                          <Label className="text-sm">{setting.name}</Label>
                          <Input
                            type="number"
                            value={setting.value}
                            min={setting.validation?.min}
                            max={setting.validation?.max}
                            onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {setting.type === 'password' && (
                        <div>
                          <Label className="text-sm">{setting.name}</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="password"
                              value={setting.value}
                              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="text-xs text-gray-500">
                        Actualizado: {formatDate(setting.updated_at)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restaurar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Configuraciones de Seguridad</h3>
            <div className="grid gap-4">
              {filteredSettings
                .filter(setting => setting.group_id === 'security')
                .map((setting) => (
                <Card key={setting.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-red-500" />
                          <h4 className="font-medium">{setting.name}</h4>
                          {setting.is_sensitive && (
                            <Badge className="bg-red-100 text-red-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Sensible
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>

                    {/* Setting controls based on type */}
                    <div className="space-y-3">
                      {setting.type === 'boolean' && (
                        <Switch checked={setting.value} />
                      )}
                      {setting.type === 'number' && (
                        <Input type="number" value={setting.value} />
                      )}
                      {setting.type === 'password' && (
                        <div className="flex gap-2">
                          <Input type="password" value={setting.value} className="flex-1" />
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Configuraciones de Performance</h3>
            <div className="grid gap-4">
              {filteredSettings
                .filter(setting => setting.group_id === 'performance')
                .map((setting) => (
                <Card key={setting.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <h4 className="font-medium">{setting.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                        
                        {setting.type === 'boolean' && (
                          <Switch checked={setting.value} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuraciones de Integraciones</h3>
            <p className="text-gray-600 mb-4">
              Gestiona las conexiones con servicios externos
            </p>
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Variables de Entorno</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Variable
                </Button>
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockEnvironments.map((env) => (
                <Card key={env.id} className={env.is_active ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        {env.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        {env.is_active && <Badge className="bg-green-100 text-green-700">Activo</Badge>}
                        {getEnvironmentBadge(env.type)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{env.description}</p>
                    
                    {env.deployment_info && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium mb-2">Información de Despliegue</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Versión: {env.deployment_info.version}</div>
                          <div>Build: {env.deployment_info.build_id}</div>
                          <div colSpan={2}>Último deploy: {formatDate(env.deployment_info.last_deploy)}</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="font-medium">Variables ({env.variables.length})</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                        {env.variables.map((variable, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {variable.is_encrypted && <Lock className="w-3 h-3 text-red-500" />}
                              <code className="text-sm">{variable.key}</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-gray-600">
                                {variable.is_encrypted ? '***************' : variable.value}
                              </code>
                              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Estado del Sistema</h3>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar Estado
              </Button>
            </div>

            <div className="grid gap-4">
              {mockSystemStatus.map((status) => (
                <Card key={status.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={getStatusColor(status.status)}>
                          {getStatusIcon(status.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{status.component}</h4>
                          <p className="text-sm text-gray-600 mt-1">{status.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Última verificación: {formatDate(status.last_check)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          {status.response_time && (
                            <div className="text-center">
                              <div className="text-lg font-semibold">{status.response_time}ms</div>
                              <div className="text-xs text-gray-500">Respuesta</div>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {status.uptime_percentage.toFixed(2)}%
                            </div>
                            <div className="text-xs text-gray-500">Uptime</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {status.details && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Detalles</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(status.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}