'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Settings, Database, Globe, Server, Shield, Zap, Clock, CheckCircle, XCircle, AlertTriangle, Download, Upload, Save, RotateCcw, Copy, Eye, EyeOff, Plus, Trash2, Edit, Search, Filter, RefreshCw, FileText, Code, Key, Lock, Unlock, Monitor, Cpu, Memory, HardDrive, Network, Mail, MessageSquare, Bell, Smartphone, Webhook, Api, Cloud, Terminal, Folder, File, FileJson, FileCode, FileImage, Calendar, Timer, Activity, TrendingUp, BarChart3, PieChart, LineChart, Users, UserCheck, UserX, Workflow, GitBranch, GitCommit, GitMerge, Package, Layers, Component, Puzzle, Link2, ExternalLink, Power, PowerOff, Pause, Play, SkipForward, Rewind, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ConfigurationSection {
  id: string
  name: string
  description: string
  category: string
  settings: ConfigurationSetting[]
  enabled: boolean
  lastModified: Date
  modifiedBy: string
  version: string
}

interface ConfigurationSetting {
  id: string
  key: string
  name: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'password' | 'email' | 'url' | 'file' | 'array' | 'object'
  value: any
  defaultValue: any
  required: boolean
  sensitive: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  group: string
  environment: 'development' | 'staging' | 'production' | 'all'
  restartRequired: boolean
  deprecated: boolean
  tags: string[]
}

interface ConfigurationTemplate {
  id: string
  name: string
  description: string
  category: string
  settings: Partial<ConfigurationSetting>[]
  version: string
  author: string
  downloads: number
  rating: number
  tags: string[]
  lastUpdated: Date
}

interface ConfigurationBackup {
  id: string
  name: string
  description: string
  timestamp: Date
  size: number
  sections: string[]
  environment: string
  createdBy: string
  checksum: string
  encrypted: boolean
}

interface EnvironmentConfig {
  id: string
  name: string
  description: string
  type: 'development' | 'staging' | 'production' | 'testing'
  active: boolean
  url: string
  settings: Record<string, any>
  variables: Record<string, string>
  secrets: string[]
  lastSync: Date
  health: 'healthy' | 'warning' | 'error'
  version: string
}

interface ConfigurationAudit {
  id: string
  action: 'create' | 'update' | 'delete' | 'import' | 'export' | 'backup' | 'restore'
  section: string
  setting?: string
  oldValue?: any
  newValue?: any
  user: string
  timestamp: Date
  ip: string
  userAgent: string
  success: boolean
  reason?: string
}

export default function SystemConfigurationManager() {
  const [activeTab, setActiveTab] = useState('general')
  const [configSections, setConfigSections] = useState<ConfigurationSection[]>([])
  const [configTemplates, setConfigTemplates] = useState<ConfigurationTemplate[]>([])
  const [configBackups, setConfigBackups] = useState<ConfigurationBackup[]>([])
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([])
  const [auditLog, setAuditLog] = useState<ConfigurationAudit[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedEnvironment, setSelectedEnvironment] = useState('production')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSensitive, setShowSensitive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentEnvironment, setCurrentEnvironment] = useState('production')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'env' | 'docker'>('json')

  useEffect(() => {
    loadConfigurationData()
  }, [currentEnvironment])

  const loadConfigurationData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadConfigurationSections(),
      loadConfigurationTemplates(),
      loadConfigurationBackups(),
      loadEnvironments(),
      loadAuditLog()
    ])
    setIsLoading(false)
  }

  const loadConfigurationSections = async () => {
    const mockSections: ConfigurationSection[] = [
      {
        id: '1',
        name: 'Database Configuration',
        description: 'Configuración de base de datos y conexiones',
        category: 'infrastructure',
        enabled: true,
        lastModified: new Date(Date.now() - 3600000),
        modifiedBy: 'admin@metrica.com',
        version: '2.1.0',
        settings: [
          {
            id: '1-1',
            key: 'DB_HOST',
            name: 'Database Host',
            description: 'Hostname del servidor de base de datos',
            type: 'string',
            value: 'localhost',
            defaultValue: 'localhost',
            required: true,
            sensitive: false,
            group: 'connection',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['database', 'connection']
          },
          {
            id: '1-2',
            key: 'DB_PORT',
            name: 'Database Port',
            description: 'Puerto del servidor de base de datos',
            type: 'number',
            value: 5432,
            defaultValue: 5432,
            required: true,
            sensitive: false,
            validation: { min: 1, max: 65535 },
            group: 'connection',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['database', 'connection']
          },
          {
            id: '1-3',
            key: 'DB_PASSWORD',
            name: 'Database Password',
            description: 'Contraseña de la base de datos',
            type: 'password',
            value: '••••••••',
            defaultValue: '',
            required: true,
            sensitive: true,
            group: 'authentication',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['database', 'security', 'authentication']
          },
          {
            id: '1-4',
            key: 'DB_SSL_ENABLED',
            name: 'SSL Enabled',
            description: 'Habilitar conexión SSL',
            type: 'boolean',
            value: true,
            defaultValue: false,
            required: false,
            sensitive: false,
            group: 'security',
            environment: 'production',
            restartRequired: true,
            deprecated: false,
            tags: ['database', 'security', 'ssl']
          }
        ]
      },
      {
        id: '2',
        name: 'Application Settings',
        description: 'Configuración general de la aplicación',
        category: 'application',
        enabled: true,
        lastModified: new Date(Date.now() - 1800000),
        modifiedBy: 'dev@metrica.com',
        version: '1.5.2',
        settings: [
          {
            id: '2-1',
            key: 'APP_NAME',
            name: 'Application Name',
            description: 'Nombre de la aplicación',
            type: 'string',
            value: 'Métrica DIP',
            defaultValue: 'Métrica DIP',
            required: true,
            sensitive: false,
            group: 'general',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['application', 'branding']
          },
          {
            id: '2-2',
            key: 'APP_DEBUG',
            name: 'Debug Mode',
            description: 'Habilitar modo debug',
            type: 'boolean',
            value: false,
            defaultValue: false,
            required: false,
            sensitive: false,
            group: 'development',
            environment: 'development',
            restartRequired: true,
            deprecated: false,
            tags: ['application', 'development']
          },
          {
            id: '2-3',
            key: 'APP_TIMEZONE',
            name: 'Default Timezone',
            description: 'Zona horaria por defecto',
            type: 'string',
            value: 'America/Lima',
            defaultValue: 'UTC',
            required: true,
            sensitive: false,
            validation: { options: ['UTC', 'America/Lima', 'America/New_York', 'Europe/London'] },
            group: 'localization',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['application', 'localization']
          },
          {
            id: '2-4',
            key: 'MAX_UPLOAD_SIZE',
            name: 'Max Upload Size (MB)',
            description: 'Tamaño máximo de archivos subidos',
            type: 'number',
            value: 100,
            defaultValue: 10,
            required: true,
            sensitive: false,
            validation: { min: 1, max: 1000 },
            group: 'limits',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['application', 'files', 'limits']
          }
        ]
      },
      {
        id: '3',
        name: 'Security & Authentication',
        description: 'Configuración de seguridad y autenticación',
        category: 'security',
        enabled: true,
        lastModified: new Date(Date.now() - 900000),
        modifiedBy: 'security@metrica.com',
        version: '3.0.1',
        settings: [
          {
            id: '3-1',
            key: 'JWT_SECRET',
            name: 'JWT Secret Key',
            description: 'Clave secreta para JWT',
            type: 'password',
            value: '••••••••••••••••••••••••',
            defaultValue: '',
            required: true,
            sensitive: true,
            group: 'jwt',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['security', 'authentication', 'jwt']
          },
          {
            id: '3-2',
            key: 'SESSION_TIMEOUT',
            name: 'Session Timeout (minutes)',
            description: 'Tiempo de expiración de sesiones',
            type: 'number',
            value: 120,
            defaultValue: 60,
            required: true,
            sensitive: false,
            validation: { min: 15, max: 1440 },
            group: 'sessions',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['security', 'sessions']
          },
          {
            id: '3-3',
            key: 'MAX_LOGIN_ATTEMPTS',
            name: 'Max Login Attempts',
            description: 'Intentos máximos de login',
            type: 'number',
            value: 5,
            defaultValue: 3,
            required: true,
            sensitive: false,
            validation: { min: 1, max: 10 },
            group: 'brute-force',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['security', 'authentication', 'brute-force']
          },
          {
            id: '3-4',
            key: 'ENABLE_2FA',
            name: 'Enable Two-Factor Auth',
            description: 'Habilitar autenticación de dos factores',
            type: 'boolean',
            value: true,
            defaultValue: false,
            required: false,
            sensitive: false,
            group: 'authentication',
            environment: 'production',
            restartRequired: false,
            deprecated: false,
            tags: ['security', 'authentication', '2fa']
          }
        ]
      },
      {
        id: '4',
        name: 'Email & Notifications',
        description: 'Configuración de correo y notificaciones',
        category: 'communication',
        enabled: true,
        lastModified: new Date(Date.now() - 2700000),
        modifiedBy: 'admin@metrica.com',
        version: '1.8.0',
        settings: [
          {
            id: '4-1',
            key: 'SMTP_HOST',
            name: 'SMTP Server',
            description: 'Servidor SMTP para envío de correos',
            type: 'string',
            value: 'smtp.gmail.com',
            defaultValue: '',
            required: true,
            sensitive: false,
            group: 'smtp',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['email', 'smtp', 'communication']
          },
          {
            id: '4-2',
            key: 'SMTP_PASSWORD',
            name: 'SMTP Password',
            description: 'Contraseña del servidor SMTP',
            type: 'password',
            value: '••••••••••••',
            defaultValue: '',
            required: true,
            sensitive: true,
            group: 'smtp',
            environment: 'all',
            restartRequired: true,
            deprecated: false,
            tags: ['email', 'smtp', 'authentication']
          },
          {
            id: '4-3',
            key: 'EMAIL_RATE_LIMIT',
            name: 'Email Rate Limit (per hour)',
            description: 'Límite de correos por hora',
            type: 'number',
            value: 1000,
            defaultValue: 100,
            required: true,
            sensitive: false,
            validation: { min: 10, max: 10000 },
            group: 'limits',
            environment: 'all',
            restartRequired: false,
            deprecated: false,
            tags: ['email', 'rate-limiting']
          },
          {
            id: '4-4',
            key: 'WEBHOOK_URL',
            name: 'Webhook URL',
            description: 'URL para webhooks de notificaciones',
            type: 'url',
            value: 'https://hooks.metrica.com/notifications',
            defaultValue: '',
            required: false,
            sensitive: false,
            group: 'webhooks',
            environment: 'production',
            restartRequired: false,
            deprecated: false,
            tags: ['notifications', 'webhooks']
          }
        ]
      }
    ]
    setConfigSections(mockSections)
  }

  const loadConfigurationTemplates = async () => {
    const mockTemplates: ConfigurationTemplate[] = [
      {
        id: '1',
        name: 'Production Environment Setup',
        description: 'Configuración optimizada para entorno de producción',
        category: 'environment',
        version: '2.1.0',
        author: 'Métrica DevOps Team',
        downloads: 1247,
        rating: 4.8,
        tags: ['production', 'security', 'performance'],
        lastUpdated: new Date(Date.now() - 86400000),
        settings: [
          { key: 'APP_ENV', value: 'production' },
          { key: 'APP_DEBUG', value: false },
          { key: 'DB_SSL_ENABLED', value: true },
          { key: 'ENABLE_2FA', value: true }
        ]
      },
      {
        id: '2',
        name: 'Development Environment',
        description: 'Configuración para entorno de desarrollo',
        category: 'environment',
        version: '1.5.0',
        author: 'Métrica Dev Team',
        downloads: 892,
        rating: 4.5,
        tags: ['development', 'debug', 'testing'],
        lastUpdated: new Date(Date.now() - 172800000),
        settings: [
          { key: 'APP_ENV', value: 'development' },
          { key: 'APP_DEBUG', value: true },
          { key: 'DB_SSL_ENABLED', value: false },
          { key: 'ENABLE_2FA', value: false }
        ]
      },
      {
        id: '3',
        name: 'High Performance Config',
        description: 'Configuración para máximo rendimiento',
        category: 'performance',
        version: '1.2.3',
        author: 'Performance Team',
        downloads: 654,
        rating: 4.9,
        tags: ['performance', 'optimization', 'cache'],
        lastUpdated: new Date(Date.now() - 259200000),
        settings: [
          { key: 'CACHE_ENABLED', value: true },
          { key: 'MAX_CONNECTIONS', value: 1000 },
          { key: 'QUEUE_WORKERS', value: 8 }
        ]
      },
      {
        id: '4',
        name: 'Security Hardened',
        description: 'Configuración con máxima seguridad',
        category: 'security',
        version: '3.0.0',
        author: 'Security Team',
        downloads: 423,
        rating: 5.0,
        tags: ['security', 'hardening', 'compliance'],
        lastUpdated: new Date(Date.now() - 345600000),
        settings: [
          { key: 'ENABLE_2FA', value: true },
          { key: 'MAX_LOGIN_ATTEMPTS', value: 3 },
          { key: 'SESSION_TIMEOUT', value: 30 },
          { key: 'FORCE_HTTPS', value: true }
        ]
      }
    ]
    setConfigTemplates(mockTemplates)
  }

  const loadConfigurationBackups = async () => {
    const mockBackups: ConfigurationBackup[] = [
      {
        id: '1',
        name: 'Full System Backup - 2025-01-27',
        description: 'Backup completo antes del deploy v2.1.0',
        timestamp: new Date(Date.now() - 86400000),
        size: 2048576,
        sections: ['Database Configuration', 'Application Settings', 'Security & Authentication'],
        environment: 'production',
        createdBy: 'admin@metrica.com',
        checksum: 'sha256:abc123def456',
        encrypted: true
      },
      {
        id: '2',
        name: 'Security Config Backup',
        description: 'Backup de configuraciones de seguridad',
        timestamp: new Date(Date.now() - 259200000),
        size: 512000,
        sections: ['Security & Authentication'],
        environment: 'production',
        createdBy: 'security@metrica.com',
        checksum: 'sha256:def789ghi012',
        encrypted: true
      },
      {
        id: '3',
        name: 'Development Snapshot',
        description: 'Snapshot del entorno de desarrollo',
        timestamp: new Date(Date.now() - 432000000),
        size: 1536000,
        sections: ['Application Settings', 'Email & Notifications'],
        environment: 'development',
        createdBy: 'dev@metrica.com',
        checksum: 'sha256:ghi345jkl678',
        encrypted: false
      }
    ]
    setConfigBackups(mockBackups)
  }

  const loadEnvironments = async () => {
    const mockEnvironments: EnvironmentConfig[] = [
      {
        id: '1',
        name: 'Production',
        description: 'Entorno de producción',
        type: 'production',
        active: true,
        url: 'https://app.metrica.com',
        settings: {},
        variables: { NODE_ENV: 'production', PORT: '443' },
        secrets: ['JWT_SECRET', 'DB_PASSWORD', 'SMTP_PASSWORD'],
        lastSync: new Date(Date.now() - 300000),
        health: 'healthy',
        version: '2.1.0'
      },
      {
        id: '2',
        name: 'Staging',
        description: 'Entorno de pruebas',
        type: 'staging',
        active: true,
        url: 'https://staging.metrica.com',
        settings: {},
        variables: { NODE_ENV: 'staging', PORT: '443' },
        secrets: ['JWT_SECRET', 'DB_PASSWORD'],
        lastSync: new Date(Date.now() - 600000),
        health: 'warning',
        version: '2.1.0-beta'
      },
      {
        id: '3',
        name: 'Development',
        description: 'Entorno de desarrollo',
        type: 'development',
        active: true,
        url: 'http://localhost:9002',
        settings: {},
        variables: { NODE_ENV: 'development', PORT: '9002' },
        secrets: ['JWT_SECRET'],
        lastSync: new Date(Date.now() - 1800000),
        health: 'healthy',
        version: '2.2.0-dev'
      }
    ]
    setEnvironments(mockEnvironments)
  }

  const loadAuditLog = async () => {
    const mockAuditLog: ConfigurationAudit[] = [
      {
        id: '1',
        action: 'update',
        section: 'Security & Authentication',
        setting: 'ENABLE_2FA',
        oldValue: false,
        newValue: true,
        user: 'security@metrica.com',
        timestamp: new Date(Date.now() - 300000),
        ip: '192.168.1.100',
        userAgent: 'Chrome 120.0',
        success: true
      },
      {
        id: '2',
        action: 'backup',
        section: 'All',
        user: 'admin@metrica.com',
        timestamp: new Date(Date.now() - 86400000),
        ip: '192.168.1.101',
        userAgent: 'Firefox 121.0',
        success: true,
        reason: 'Pre-deployment backup'
      },
      {
        id: '3',
        action: 'update',
        section: 'Database Configuration',
        setting: 'DB_PORT',
        oldValue: 5432,
        newValue: 5433,
        user: 'dev@metrica.com',
        timestamp: new Date(Date.now() - 1800000),
        ip: '192.168.1.102',
        userAgent: 'Safari 17.0',
        success: false,
        reason: 'Invalid port range'
      }
    ]
    setAuditLog(mockAuditLog)
  }

  const handleSettingChange = (sectionId: string, settingId: string, value: any) => {
    setConfigSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            settings: section.settings.map(setting =>
              setting.id === settingId ? { ...setting, value } : setting
            )
          }
        : section
    ))
    setHasUnsavedChanges(true)
  }

  const handleSaveConfiguration = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasUnsavedChanges(false)
    setIsLoading(false)
  }

  const handleResetConfiguration = () => {
    setConfigSections(prev => prev.map(section => ({
      ...section,
      settings: section.settings.map(setting => ({
        ...setting,
        value: setting.defaultValue
      }))
    })))
    setHasUnsavedChanges(true)
  }

  const handleExportConfiguration = (format: string) => {
    console.log(`Exporting configuration in ${format} format`)
  }

  const handleImportConfiguration = () => {
    console.log('Importing configuration')
  }

  const handleCreateBackup = () => {
    console.log('Creating configuration backup')
  }

  const handleRestoreBackup = (backupId: string) => {
    console.log(`Restoring backup ${backupId}`)
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = configTemplates.find(t => t.id === templateId)
    if (template) {
      console.log(`Applying template: ${template.name}`)
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const validateSetting = (setting: ConfigurationSetting, value: any): string | null => {
    if (setting.required && (!value || value === '')) {
      return 'Este campo es requerido'
    }

    if (setting.validation) {
      const { min, max, pattern, options } = setting.validation
      
      if (setting.type === 'number') {
        const num = Number(value)
        if (min !== undefined && num < min) return `Valor mínimo: ${min}`
        if (max !== undefined && num > max) return `Valor máximo: ${max}`
      }
      
      if (setting.type === 'string' && pattern) {
        const regex = new RegExp(pattern)
        if (!regex.test(value)) return 'Formato inválido'
      }
      
      if (options && !options.includes(value)) {
        return `Valor debe ser uno de: ${options.join(', ')}`
      }
    }

    return null
  }

  const getSettingIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'url': return <Globe className="h-4 w-4" />
      case 'json': return <FileJson className="h-4 w-4" />
      case 'boolean': return <CheckCircle className="h-4 w-4" />
      case 'number': return <BarChart3 className="h-4 w-4" />
      case 'file': return <File className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getEnvironmentHealth = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const filteredSections = configSections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.settings.some(setting => 
                           setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           setting.key.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesCategory = filterCategory === 'all' || section.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const groupedSettings = (settings: ConfigurationSetting[]) => {
    return settings.reduce((groups, setting) => {
      const group = setting.group
      if (!groups[group]) groups[group] = []
      groups[group].push(setting)
      return groups
    }, {} as Record<string, ConfigurationSetting[]>)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration Manager</h1>
          <p className="text-muted-foreground">
            Gestión avanzada de configuración del sistema - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Cambios sin guardar
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleSaveConfiguration}
            disabled={!hasUnsavedChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button variant="outline" onClick={handleResetConfiguration}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar configuraciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Todas las categorías</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="application">Application</option>
                <option value="security">Security</option>
                <option value="communication">Communication</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="show-sensitive"
                  checked={showSensitive}
                  onCheckedChange={setShowSensitive}
                />
                <Label htmlFor="show-sensitive" className="text-sm">Mostrar valores sensibles</Label>
              </div>
              <select
                value={currentEnvironment}
                onChange={(e) => setCurrentEnvironment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredSections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>{section.name}</span>
                        <Badge variant="outline">{section.category}</Badge>
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">v{section.version}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Modificado {formatTimeAgo(section.lastModified)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupedSettings(section.settings)).map(([groupName, groupSettings]) => (
                      <div key={groupName} className="border rounded-lg">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto"
                          onClick={() => toggleGroup(`${section.id}-${groupName}`)}
                        >
                          <span className="font-medium capitalize">{groupName}</span>
                          {expandedGroups.has(`${section.id}-${groupName}`) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                        {expandedGroups.has(`${section.id}-${groupName}`) && (
                          <div className="p-4 pt-0 space-y-4">
                            {groupSettings.map((setting) => (
                              <div key={setting.id} className="grid gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getSettingIcon(setting.type)}
                                    <Label htmlFor={setting.id} className="font-medium">
                                      {setting.name}
                                    </Label>
                                    {setting.required && <span className="text-red-500">*</span>}
                                    {setting.deprecated && <Badge variant="destructive" className="text-xs">Deprecated</Badge>}
                                    {setting.restartRequired && <Badge variant="outline" className="text-xs">Restart Required</Badge>}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {setting.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{setting.description}</p>
                                <div className="grid gap-2">
                                  {setting.type === 'boolean' ? (
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={setting.id}
                                        checked={setting.value}
                                        onCheckedChange={(checked) => handleSettingChange(section.id, setting.id, checked)}
                                      />
                                      <Label htmlFor={setting.id} className="text-sm">
                                        {setting.value ? 'Enabled' : 'Disabled'}
                                      </Label>
                                    </div>
                                  ) : setting.validation?.options ? (
                                    <select
                                      id={setting.id}
                                      value={setting.value}
                                      onChange={(e) => handleSettingChange(section.id, setting.id, e.target.value)}
                                      className="px-3 py-2 border rounded-md bg-background"
                                    >
                                      {setting.validation.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : setting.type === 'password' ? (
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        id={setting.id}
                                        type={showSensitive ? 'text' : 'password'}
                                        value={showSensitive ? setting.value : '••••••••'}
                                        onChange={(e) => handleSettingChange(section.id, setting.id, e.target.value)}
                                        className={validationErrors[setting.id] ? 'border-red-500' : ''}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSensitive(!showSensitive)}
                                      >
                                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  ) : setting.type === 'json' ? (
                                    <Textarea
                                      id={setting.id}
                                      value={JSON.stringify(setting.value, null, 2)}
                                      onChange={(e) => {
                                        try {
                                          const parsed = JSON.parse(e.target.value)
                                          handleSettingChange(section.id, setting.id, parsed)
                                        } catch (error) {
                                          // Handle invalid JSON
                                        }
                                      }}
                                      rows={4}
                                      className={cn("font-mono text-sm", validationErrors[setting.id] && 'border-red-500')}
                                    />
                                  ) : (
                                    <Input
                                      id={setting.id}
                                      type={setting.type === 'number' ? 'number' : 
                                           setting.type === 'email' ? 'email' : 
                                           setting.type === 'url' ? 'url' : 'text'}
                                      value={setting.value}
                                      onChange={(e) => handleSettingChange(section.id, setting.id, 
                                        setting.type === 'number' ? Number(e.target.value) : e.target.value)}
                                      className={validationErrors[setting.id] ? 'border-red-500' : ''}
                                    />
                                  )}
                                  {validationErrors[setting.id] && (
                                    <p className="text-sm text-red-500">{validationErrors[setting.id]}</p>
                                  )}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Key: {setting.key}</span>
                                    <span>Default: {String(setting.defaultValue)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Environment Configuration</h2>
              <p className="text-muted-foreground">
                Gestión de configuraciones por entorno
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Entorno
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <Card key={env.id} className={cn(
                "cursor-pointer transition-all",
                selectedEnvironment === env.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedEnvironment(env.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        env.active ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <span>{env.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      {getEnvironmentHealth(env.health)}
                      <Badge variant="outline" className={cn(
                        env.type === 'production' && "border-red-500 text-red-700",
                        env.type === 'staging' && "border-yellow-500 text-yellow-700",
                        env.type === 'development' && "border-blue-500 text-blue-700"
                      )}>
                        {env.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{env.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">URL:</span>
                        <div className="font-mono text-xs break-all">{env.url}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <div className="font-medium">{env.version}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Variables:</span>
                        <div className="font-medium">{Object.keys(env.variables).length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Secrets:</span>
                        <div className="font-medium">{env.secrets.length}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last sync: {formatTimeAgo(env.lastSync)}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configuration Templates</h2>
              <p className="text-muted-foreground">
                Plantillas predefinidas de configuración
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plantillas..."
                  className="pl-8 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Plantilla
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {configTemplates.map((template) => (
              <Card key={template.id} className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedTemplate === template.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center text-xs text-yellow-500">
                        ★ {template.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-1 font-medium">{template.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Downloads:</span>
                        <span className="ml-1 font-medium">{template.downloads.toLocaleString()}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Author:</span>
                        <span className="ml-1 font-medium">{template.author}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="ml-1 text-xs">{formatTimeAgo(template.lastUpdated)}</span>
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="border-t pt-3 space-y-2">
                        <h4 className="font-medium">Settings Preview:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {template.settings.map((setting, index) => (
                            <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                              <span className="text-blue-600">{setting.key}</span>
                              <span className="text-muted-foreground">: </span>
                              <span className="text-green-600">{JSON.stringify(setting.value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleApplyTemplate(template.id)}>
                            <Download className="h-3 w-3 mr-1" />
                            Apply Template
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configuration Backups</h2>
              <p className="text-muted-foreground">
                Gestión de respaldos de configuración
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCreateBackup}>
                <Database className="h-4 w-4 mr-2" />
                Crear Backup
              </Button>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Restaurar Backup
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {configBackups.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium">{backup.name}</h3>
                        <p className="text-sm text-muted-foreground">{backup.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>{formatTimeAgo(backup.timestamp)}</span>
                          <span>•</span>
                          <span>{formatBytes(backup.size)}</span>
                          <span>•</span>
                          <span>{backup.environment}</span>
                          <span>•</span>
                          <span>{backup.sections.length} sections</span>
                          {backup.encrypted && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Lock className="h-3 w-3" />
                                <span>Encrypted</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {backup.sections.map(section => (
                            <Badge key={section} variant="outline" className="text-xs">{section}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Import/Export Configuration</h2>
              <p className="text-muted-foreground">
                Importar y exportar configuraciones del sistema
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>
                  Exportar configuraciones en diferentes formatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Formato de exportación</Label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                  >
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="env">Environment Variables</option>
                    <option value="docker">Docker Compose</option>
                  </select>
                </div>
                <div>
                  <Label>Secciones a exportar</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {configSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`export-${section.id}`}
                          className="rounded"
                          defaultChecked
                        />
                        <Label htmlFor={`export-${section.id}`} className="text-sm">
                          {section.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-sensitive"
                    className="rounded"
                  />
                  <Label htmlFor="include-sensitive" className="text-sm">
                    Incluir valores sensibles
                  </Label>
                </div>
                <Button className="w-full" onClick={() => handleExportConfiguration(exportFormat)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Configuración
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Configuration</CardTitle>
                <CardDescription>
                  Importar configuraciones desde archivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Archivo de configuración</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="import-file" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                          <span>Seleccionar archivo</span>
                          <input id="import-file" name="import-file" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">o arrastrar aquí</p>
                      </div>
                      <p className="text-xs text-gray-500">JSON, YAML, ENV hasta 10MB</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Modo de importación</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="merge-mode"
                        name="import-mode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={(e) => setImportMode(e.target.value as any)}
                      />
                      <Label htmlFor="merge-mode" className="text-sm">
                        Merge (fusionar)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="replace-mode"
                        name="import-mode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={(e) => setImportMode(e.target.value as any)}
                      />
                      <Label htmlFor="replace-mode" className="text-sm">
                        Replace (reemplazar)
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="validate-import"
                    className="rounded"
                    defaultChecked
                  />
                  <Label htmlFor="validate-import" className="text-sm">
                    Validar antes de importar
                  </Label>
                </div>
                <Button className="w-full" onClick={handleImportConfiguration}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Configuración
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Environment Variables</h2>
              <p className="text-muted-foreground">
                Gestión de variables de entorno y secretos
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Variable
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Variables</CardTitle>
                <CardDescription>
                  Variables de sistema y configuración global
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: 'NODE_ENV', value: 'production', type: 'system', secret: false },
                    { key: 'PORT', value: '3000', type: 'system', secret: false },
                    { key: 'DATABASE_URL', value: '••••••••••••', type: 'connection', secret: true },
                    { key: 'REDIS_URL', value: 'redis://localhost:6379', type: 'connection', secret: false },
                    { key: 'JWT_SECRET', value: '••••••••••••', type: 'security', secret: true },
                    { key: 'ENCRYPTION_KEY', value: '••••••••••••', type: 'security', secret: true }
                  ].map((variable, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {variable.secret ? <Key className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-green-500" />}
                        <div>
                          <p className="text-sm font-medium font-mono">{variable.key}</p>
                          <p className="text-xs text-muted-foreground">{variable.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{variable.value}</code>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configuration Audit Log</h2>
              <p className="text-muted-foreground">
                Registro de cambios en la configuración del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en audit log..."
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Log
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-2",
                          entry.success ? "bg-green-500" : "bg-red-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.action}
                            </Badge>
                            <span className="text-sm font-medium">{entry.section}</span>
                            {entry.setting && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <code className="text-xs bg-muted px-1 rounded">{entry.setting}</code>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            por <span className="font-medium">{entry.user}</span>
                          </p>
                          {entry.oldValue !== undefined && entry.newValue !== undefined && (
                            <div className="mt-2 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600">- {JSON.stringify(entry.oldValue)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600">+ {JSON.stringify(entry.newValue)}</span>
                              </div>
                            </div>
                          )}
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(entry.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.ip}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Advanced Settings</h2>
              <p className="text-muted-foreground">
                Configuración avanzada del sistema
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Herramientas de mantenimiento del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Configuration Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Configuration Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate All Configurations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Audit Configurations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development Tools</CardTitle>
                <CardDescription>
                  Herramientas para desarrolladores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Generate Configuration Schema
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileCode className="h-4 w-4 mr-2" />
                  Export Type Definitions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  Configuration CLI Access
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Api className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance & Monitoring</CardTitle>
                <CardDescription>
                  Monitoreo de rendimiento de configuraciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Configuration Load Time</p>
                    <p className="text-xs text-muted-foreground">Average time to load configs</p>
                  </div>
                  <Badge variant="outline">127ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cache Hit Rate</p>
                    <p className="text-xs text-muted-foreground">Configuration cache efficiency</p>
                  </div>
                  <Badge variant="outline" className="text-green-700">96.4%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Memory Usage</p>
                    <p className="text-xs text-muted-foreground">Configuration data in memory</p>
                  </div>
                  <Badge variant="outline">12.4 MB</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Integration</CardTitle>
                <CardDescription>
                  Integración con otros sistemas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">External Config Sources</p>
                    <p className="text-xs text-muted-foreground">AWS Parameter Store, HashiCorp Vault</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Config Sync</p>
                    <p className="text-xs text-muted-foreground">Automatic configuration synchronization</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Webhook Notifications</p>
                    <p className="text-xs text-muted-foreground">Notify on configuration changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}