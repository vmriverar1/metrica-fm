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
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Link2, Cloud, Database, Globe, Server, Shield, Zap, Clock, CheckCircle, XCircle, AlertTriangle, Download, Upload, Save, RotateCcw, Copy, Eye, EyeOff, Plus, Trash2, Edit, Search, Filter, RefreshCw, FileText, Code, Key, Lock, Unlock, Settings, Activity, TrendingUp, TrendingDown, Users, UserCheck, UserX, Mail, MessageSquare, Bell, Smartphone, Workflow, GitBranch, GitCommit, GitMerge, Package, Layers, Component, Puzzle, ExternalLink, Power, PowerOff, Play, Pause, SkipForward, Rewind, Volume2, VolumeX, Wifi, WifiOff, Monitor, Gauge, Target, Bug, Wrench, Cog, Archive, CloudDownload, CloudUpload, HelpCircle, Info, Star, Bookmark, Flag, Tag, Hash, AtSign, DollarSign, Percent, Minus, Plus as PlusIcon, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Terminal, Api, Webhook, Rss, Cpu, Memory, HardDrive, Network } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Integration {
  id: string
  name: string
  description: string
  type: 'api' | 'webhook' | 'database' | 'cloud' | 'messaging' | 'payment' | 'analytics' | 'crm' | 'erp' | 'custom'
  provider: string
  version: string
  status: 'active' | 'inactive' | 'error' | 'pending' | 'maintenance'
  health: 'healthy' | 'warning' | 'error' | 'unknown'
  lastSync: Date
  configuration: {
    endpoint?: string
    apiKey?: string
    username?: string
    password?: string
    token?: string
    database?: string
    host?: string
    port?: number
    ssl?: boolean
    timeout?: number
    retries?: number
    rateLimit?: number
    webhookUrl?: string
    secretKey?: string
    customHeaders?: Record<string, string>
    customParams?: Record<string, any>
  }
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    uptime: number
    dataTransferred: number
    lastRequestTime?: Date
    errorRate: number
  }
  security: {
    encrypted: boolean
    authenticated: boolean
    ipWhitelist?: string[]
    rateLimited: boolean
    logging: boolean
    auditEnabled: boolean
  }
  features: {
    realTimeSync: boolean
    batchProcessing: boolean
    dataValidation: boolean
    errorHandling: boolean
    retryMechanism: boolean
    caching: boolean
    compression: boolean
    monitoring: boolean
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface IntegrationTemplate {
  id: string
  name: string
  description: string
  type: string
  provider: string
  category: string
  configuration: Record<string, any>
  requiredFields: string[]
  optionalFields: string[]
  documentation: string
  rating: number
  downloads: number
  tags: string[]
  version: string
  author: string
  lastUpdated: Date
}

interface SyncJob {
  id: string
  integrationId: string
  integrationName: string
  type: 'import' | 'export' | 'sync' | 'backup'
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startedAt: Date
  completedAt?: Date
  duration?: number
  recordsProcessed: number
  recordsTotal?: number
  errorCount: number
  logs: Array<{
    timestamp: Date
    level: 'info' | 'warning' | 'error'
    message: string
    details?: any
  }>
  schedule?: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
    cronExpression?: string
    nextRun?: Date
  }
}

interface APIEndpoint {
  id: string
  integrationId: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
    defaultValue?: any
  }>
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2'
    location?: 'header' | 'query' | 'body'
    name?: string
  }
  rateLimit: {
    requests: number
    window: number
    enabled: boolean
  }
  caching: {
    enabled: boolean
    ttl: number
    key?: string
  }
  validation: {
    enabled: boolean
    schema?: any
  }
  monitoring: {
    enabled: boolean
    alerts: boolean
    logging: boolean
  }
  lastUsed?: Date
  usageCount: number
  averageResponseTime: number
}

interface WebhookEvent {
  id: string
  integrationId: string
  event: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  headers: Record<string, string>
  payload: any
  signature?: string
  timestamp: Date
  status: 'pending' | 'delivered' | 'failed' | 'retrying'
  attempts: number
  maxAttempts: number
  responseCode?: number
  responseBody?: string
  errorMessage?: string
  nextRetry?: Date
}

interface ConnectionTest {
  id: string
  integrationId: string
  timestamp: Date
  status: 'success' | 'failure'
  responseTime: number
  errorMessage?: string
  details?: any
}

export default function IntegrationManager() {
  const [activeTab, setActiveTab] = useState('integrations')
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [integrationTemplates, setIntegrationTemplates] = useState<IntegrationTemplate[]>([])
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([])
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null)
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showInactiveIntegrations, setShowInactiveIntegrations] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [showConfiguration, setShowConfiguration] = useState(false)

  useEffect(() => {
    loadIntegrationData()
    if (autoRefresh) {
      const interval = setInterval(loadIntegrationData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadIntegrationData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadIntegrations(),
      loadIntegrationTemplates(),
      loadSyncJobs(),
      loadApiEndpoints(),
      loadWebhookEvents(),
      loadConnectionTests()
    ])
    setIsLoading(false)
  }

  const loadIntegrations = async () => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Salesforce CRM',
        description: 'Integración con Salesforce para gestión de clientes y ventas',
        type: 'crm',
        provider: 'Salesforce',
        version: '1.2.0',
        status: 'active',
        health: 'healthy',
        lastSync: new Date(Date.now() - 1800000),
        configuration: {
          endpoint: 'https://metrica.my.salesforce.com/services/data/v58.0',
          token: '••••••••••••••••••••',
          ssl: true,
          timeout: 30000,
          retries: 3,
          rateLimit: 100
        },
        metrics: {
          totalRequests: 15847,
          successfulRequests: 15234,
          failedRequests: 613,
          averageResponseTime: 235,
          uptime: 99.2,
          dataTransferred: 2.4e9,
          lastRequestTime: new Date(Date.now() - 300000),
          errorRate: 3.87
        },
        security: {
          encrypted: true,
          authenticated: true,
          rateLimited: true,
          logging: true,
          auditEnabled: true
        },
        features: {
          realTimeSync: true,
          batchProcessing: true,
          dataValidation: true,
          errorHandling: true,
          retryMechanism: true,
          caching: true,
          compression: false,
          monitoring: true
        },
        tags: ['crm', 'sales', 'customers', 'production'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(Date.now() - 86400000),
        createdBy: 'admin@metrica.com'
      },
      {
        id: '2',
        name: 'AWS S3 Storage',
        description: 'Almacenamiento de archivos y backups en Amazon S3',
        type: 'cloud',
        provider: 'Amazon Web Services',
        version: '2.1.1',
        status: 'active',
        health: 'healthy',
        lastSync: new Date(Date.now() - 900000),
        configuration: {
          endpoint: 'https://s3.amazonaws.com',
          apiKey: '••••••••••••••••',
          ssl: true,
          timeout: 60000,
          retries: 5
        },
        metrics: {
          totalRequests: 8923,
          successfulRequests: 8901,
          failedRequests: 22,
          averageResponseTime: 156,
          uptime: 99.9,
          dataTransferred: 15.7e9,
          lastRequestTime: new Date(Date.now() - 180000),
          errorRate: 0.25
        },
        security: {
          encrypted: true,
          authenticated: true,
          rateLimited: false,
          logging: true,
          auditEnabled: true
        },
        features: {
          realTimeSync: false,
          batchProcessing: true,
          dataValidation: true,
          errorHandling: true,
          retryMechanism: true,
          caching: false,
          compression: true,
          monitoring: true
        },
        tags: ['cloud', 'storage', 'backup', 'production'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(Date.now() - 172800000),
        createdBy: 'devops@metrica.com'
      },
      {
        id: '3',
        name: 'PostgreSQL Database',
        description: 'Conexión principal a la base de datos PostgreSQL',
        type: 'database',
        provider: 'PostgreSQL',
        version: '15.2',
        status: 'active',
        health: 'warning',
        lastSync: new Date(Date.now() - 120000),
        configuration: {
          host: 'postgres.metrica.local',
          port: 5432,
          database: 'metrica_prod',
          username: 'metrica_app',
          password: '••••••••••••',
          ssl: true,
          timeout: 10000,
          retries: 3
        },
        metrics: {
          totalRequests: 45672,
          successfulRequests: 44891,
          failedRequests: 781,
          averageResponseTime: 45,
          uptime: 98.5,
          dataTransferred: 892e6,
          lastRequestTime: new Date(Date.now() - 30000),
          errorRate: 1.71
        },
        security: {
          encrypted: true,
          authenticated: true,
          ipWhitelist: ['10.0.0.0/8', '192.168.0.0/16'],
          rateLimited: false,
          logging: true,
          auditEnabled: true
        },
        features: {
          realTimeSync: true,
          batchProcessing: true,
          dataValidation: true,
          errorHandling: true,
          retryMechanism: true,
          caching: true,
          compression: false,
          monitoring: true
        },
        tags: ['database', 'postgresql', 'primary', 'production'],
        createdAt: new Date('2023-12-10'),
        updatedAt: new Date(Date.now() - 259200000),
        createdBy: 'dba@metrica.com'
      },
      {
        id: '4',
        name: 'Stripe Payments',
        description: 'Procesamiento de pagos y facturación',
        type: 'payment',
        provider: 'Stripe',
        version: '1.8.3',
        status: 'active',
        health: 'healthy',
        lastSync: new Date(Date.now() - 600000),
        configuration: {
          endpoint: 'https://api.stripe.com/v1',
          apiKey: '••••••••••••••••••••••••••••',
          webhookUrl: 'https://app.metrica.com/webhooks/stripe',
          secretKey: '••••••••••••••••',
          ssl: true,
          timeout: 15000,
          retries: 3
        },
        metrics: {
          totalRequests: 3456,
          successfulRequests: 3421,
          failedRequests: 35,
          averageResponseTime: 287,
          uptime: 99.8,
          dataTransferred: 125e6,
          lastRequestTime: new Date(Date.now() - 420000),
          errorRate: 1.01
        },
        security: {
          encrypted: true,
          authenticated: true,
          rateLimited: true,
          logging: true,
          auditEnabled: true
        },
        features: {
          realTimeSync: true,
          batchProcessing: false,
          dataValidation: true,
          errorHandling: true,
          retryMechanism: true,
          caching: false,
          compression: false,
          monitoring: true
        },
        tags: ['payment', 'stripe', 'billing', 'production'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(Date.now() - 432000000),
        createdBy: 'finance@metrica.com'
      },
      {
        id: '5',
        name: 'Slack Notifications',
        description: 'Notificaciones del sistema a canales de Slack',
        type: 'messaging',
        provider: 'Slack',
        version: '1.0.2',
        status: 'inactive',
        health: 'error',
        lastSync: new Date(Date.now() - 3600000),
        configuration: {
          webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          timeout: 5000,
          retries: 2
        },
        metrics: {
          totalRequests: 892,
          successfulRequests: 734,
          failedRequests: 158,
          averageResponseTime: 1234,
          uptime: 82.3,
          dataTransferred: 2.3e6,
          lastRequestTime: new Date(Date.now() - 3600000),
          errorRate: 17.7
        },
        security: {
          encrypted: true,
          authenticated: true,
          rateLimited: true,
          logging: true,
          auditEnabled: false
        },
        features: {
          realTimeSync: true,
          batchProcessing: false,
          dataValidation: false,
          errorHandling: true,
          retryMechanism: true,
          caching: false,
          compression: false,
          monitoring: false
        },
        tags: ['messaging', 'notifications', 'slack', 'staging'],
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date(Date.now() - 86400000),
        createdBy: 'devops@metrica.com'
      }
    ]
    setIntegrations(mockIntegrations)
  }

  const loadIntegrationTemplates = async () => {
    const mockTemplates: IntegrationTemplate[] = [
      {
        id: '1',
        name: 'REST API Integration',
        description: 'Plantilla genérica para integración con APIs REST',
        type: 'api',
        provider: 'Generic',
        category: 'API',
        configuration: {
          endpoint: '',
          method: 'GET',
          headers: {},
          authentication: 'none',
          timeout: 30000,
          retries: 3
        },
        requiredFields: ['endpoint'],
        optionalFields: ['headers', 'authentication', 'timeout', 'retries'],
        documentation: 'https://docs.metrica.com/integrations/rest-api',
        rating: 4.5,
        downloads: 1247,
        tags: ['api', 'rest', 'generic'],
        version: '1.0.0',
        author: 'Métrica Team',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Database Connection',
        description: 'Conexión a bases de datos SQL y NoSQL',
        type: 'database',
        provider: 'Generic',
        category: 'Database',
        configuration: {
          host: '',
          port: 5432,
          database: '',
          username: '',
          password: '',
          ssl: true,
          poolSize: 10
        },
        requiredFields: ['host', 'database', 'username', 'password'],
        optionalFields: ['port', 'ssl', 'poolSize'],
        documentation: 'https://docs.metrica.com/integrations/database',
        rating: 4.8,
        downloads: 2156,
        tags: ['database', 'sql', 'connection'],
        version: '2.1.0',
        author: 'Métrica Team',
        lastUpdated: new Date('2024-02-01')
      },
      {
        id: '3',
        name: 'Webhook Receiver',
        description: 'Recepción y procesamiento de webhooks',
        type: 'webhook',
        provider: 'Generic',
        category: 'Messaging',
        configuration: {
          url: '',
          secret: '',
          events: [],
          retryAttempts: 3,
          timeout: 10000
        },
        requiredFields: ['url'],
        optionalFields: ['secret', 'events', 'retryAttempts', 'timeout'],
        documentation: 'https://docs.metrica.com/integrations/webhooks',
        rating: 4.3,
        downloads: 892,
        tags: ['webhook', 'events', 'messaging'],
        version: '1.2.1',
        author: 'Métrica Team',
        lastUpdated: new Date('2024-03-01')
      }
    ]
    setIntegrationTemplates(mockTemplates)
  }

  const loadSyncJobs = async () => {
    const mockJobs: SyncJob[] = [
      {
        id: '1',
        integrationId: '1',
        integrationName: 'Salesforce CRM',
        type: 'sync',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3300000),
        duration: 300000,
        recordsProcessed: 1247,
        recordsTotal: 1247,
        errorCount: 0,
        logs: [
          {
            timestamp: new Date(Date.now() - 3600000),
            level: 'info',
            message: 'Starting sync job for Salesforce CRM'
          },
          {
            timestamp: new Date(Date.now() - 3300000),
            level: 'info',
            message: 'Sync job completed successfully'
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'hourly',
          nextRun: new Date(Date.now() + 1800000)
        }
      },
      {
        id: '2',
        integrationId: '2',
        integrationName: 'AWS S3 Storage',
        type: 'backup',
        status: 'running',
        progress: 65,
        startedAt: new Date(Date.now() - 1800000),
        recordsProcessed: 6500,
        recordsTotal: 10000,
        errorCount: 2,
        logs: [
          {
            timestamp: new Date(Date.now() - 1800000),
            level: 'info',
            message: 'Starting backup job'
          },
          {
            timestamp: new Date(Date.now() - 1200000),
            level: 'warning',
            message: 'Retrying failed upload for file: report_2024_01.pdf'
          },
          {
            timestamp: new Date(Date.now() - 600000),
            level: 'error',
            message: 'Failed to upload file: data_export_large.csv - Size limit exceeded'
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'daily',
          nextRun: new Date(Date.now() + 86400000)
        }
      },
      {
        id: '3',
        integrationId: '4',
        integrationName: 'Stripe Payments',
        type: 'import',
        status: 'failed',
        progress: 25,
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 6900000),
        duration: 300000,
        recordsProcessed: 125,
        recordsTotal: 500,
        errorCount: 15,
        logs: [
          {
            timestamp: new Date(Date.now() - 7200000),
            level: 'info',
            message: 'Starting import job for Stripe payments'
          },
          {
            timestamp: new Date(Date.now() - 6900000),
            level: 'error',
            message: 'Import job failed due to API rate limit exceeded'
          }
        ],
        schedule: {
          enabled: false,
          frequency: 'daily'
        }
      }
    ]
    setSyncJobs(mockJobs)
  }

  const loadApiEndpoints = async () => {
    const mockEndpoints: APIEndpoint[] = [
      {
        id: '1',
        integrationId: '1',
        name: 'Get Customers',
        method: 'GET',
        path: '/api/v1/customers',
        description: 'Retrieve customer list from CRM',
        parameters: [
          { name: 'limit', type: 'number', required: false, description: 'Maximum number of records', defaultValue: 100 },
          { name: 'offset', type: 'number', required: false, description: 'Pagination offset', defaultValue: 0 },
          { name: 'filter', type: 'string', required: false, description: 'Filter criteria' }
        ],
        authentication: {
          type: 'bearer',
          location: 'header'
        },
        rateLimit: {
          requests: 1000,
          window: 3600,
          enabled: true
        },
        caching: {
          enabled: true,
          ttl: 300
        },
        validation: {
          enabled: true
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: true
        },
        lastUsed: new Date(Date.now() - 300000),
        usageCount: 2341,
        averageResponseTime: 234
      },
      {
        id: '2',
        integrationId: '1',
        name: 'Create Customer',
        method: 'POST',
        path: '/api/v1/customers',
        description: 'Create new customer in CRM',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Customer name' },
          { name: 'email', type: 'string', required: true, description: 'Customer email' },
          { name: 'phone', type: 'string', required: false, description: 'Customer phone' },
          { name: 'company', type: 'string', required: false, description: 'Customer company' }
        ],
        authentication: {
          type: 'bearer',
          location: 'header'
        },
        rateLimit: {
          requests: 100,
          window: 3600,
          enabled: true
        },
        caching: {
          enabled: false,
          ttl: 0
        },
        validation: {
          enabled: true
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: true
        },
        lastUsed: new Date(Date.now() - 1800000),
        usageCount: 456,
        averageResponseTime: 567
      }
    ]
    setApiEndpoints(mockEndpoints)
  }

  const loadWebhookEvents = async () => {
    const mockEvents: WebhookEvent[] = [
      {
        id: '1',
        integrationId: '4',
        event: 'payment.succeeded',
        url: 'https://app.metrica.com/webhooks/stripe/payment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Stripe-Event': 'payment.succeeded' },
        payload: { id: 'pi_1234', amount: 5000, currency: 'usd', status: 'succeeded' },
        signature: 'sha256=abc123def456',
        timestamp: new Date(Date.now() - 300000),
        status: 'delivered',
        attempts: 1,
        maxAttempts: 3,
        responseCode: 200,
        responseBody: '{"status":"ok"}'
      },
      {
        id: '2',
        integrationId: '4',
        event: 'invoice.payment_failed',
        url: 'https://app.metrica.com/webhooks/stripe/invoice',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Stripe-Event': 'invoice.payment_failed' },
        payload: { id: 'in_5678', amount: 2500, currency: 'usd', status: 'payment_failed' },
        signature: 'sha256=def789ghi012',
        timestamp: new Date(Date.now() - 600000),
        status: 'failed',
        attempts: 3,
        maxAttempts: 3,
        responseCode: 500,
        responseBody: '{"error":"Internal server error"}',
        errorMessage: 'HTTP 500 - Internal server error'
      },
      {
        id: '3',
        integrationId: '5',
        event: 'notification.alert',
        url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: { text: 'Sistema de respaldo completado exitosamente', channel: '#alerts' },
        timestamp: new Date(Date.now() - 900000),
        status: 'retrying',
        attempts: 2,
        maxAttempts: 3,
        responseCode: 429,
        errorMessage: 'Rate limit exceeded',
        nextRetry: new Date(Date.now() + 300000)
      }
    ]
    setWebhookEvents(mockEvents)
  }

  const loadConnectionTests = async () => {
    const mockTests: ConnectionTest[] = [
      {
        id: '1',
        integrationId: '1',
        timestamp: new Date(Date.now() - 300000),
        status: 'success',
        responseTime: 234
      },
      {
        id: '2',
        integrationId: '2',
        timestamp: new Date(Date.now() - 600000),
        status: 'success',
        responseTime: 156
      },
      {
        id: '3',
        integrationId: '3',
        timestamp: new Date(Date.now() - 900000),
        status: 'success',
        responseTime: 45
      },
      {
        id: '4',
        integrationId: '5',
        timestamp: new Date(Date.now() - 1200000),
        status: 'failure',
        responseTime: 5000,
        errorMessage: 'Connection timeout'
      }
    ]
    setConnectionTests(mockTests)
  }

  const handleTestConnection = async (integrationId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log(`Testing connection for integration: ${integrationId}`)
    setIsLoading(false)
  }

  const handleCreateIntegration = () => {
    console.log('Creating new integration')
  }

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: enabled ? 'active' : 'inactive' }
        : integration
    ))
  }

  const handleSyncNow = (integrationId: string) => {
    console.log(`Starting sync for integration: ${integrationId}`)
  }

  const handleRetryJob = (jobId: string) => {
    console.log(`Retrying job: ${jobId}`)
  }

  const handleCancelJob = (jobId: string) => {
    console.log(`Cancelling job: ${jobId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'delivered':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
      case 'pending':
      case 'queued':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'running':
      case 'retrying':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'error':
      case 'failed':
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <Api className="h-4 w-4" />
      case 'webhook': return <Webhook className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'cloud': return <Cloud className="h-4 w-4" />
      case 'messaging': return <MessageSquare className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'analytics': return <BarChart3 className="h-4 w-4" />
      case 'crm': return <Users className="h-4 w-4" />
      case 'erp': return <Package className="h-4 w-4" />
      default: return <Link2 className="h-4 w-4" />
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
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

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || integration.type === filterType
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus
    const matchesInactive = showInactiveIntegrations || integration.status !== 'inactive'
    
    return matchesSearch && matchesType && matchesStatus && matchesInactive
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Manager</h1>
          <p className="text-muted-foreground">
            Gestión de integraciones externas y conectores - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => loadIntegrationData()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleCreateIntegration}>
            <Plus className="h-4 w-4 mr-2" />
            New Integration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sync-jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Types</option>
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="cloud">Cloud</option>
                <option value="crm">CRM</option>
                <option value="payment">Payment</option>
                <option value="messaging">Messaging</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="show-inactive"
                  checked={showInactiveIntegrations}
                  onCheckedChange={setShowInactiveIntegrations}
                />
                <Label htmlFor="show-inactive" className="text-sm">Show inactive</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className={cn(
                "cursor-pointer hover:shadow-lg transition-all",
                selectedIntegration?.id === integration.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedIntegration(selectedIntegration?.id === integration.id ? null : integration)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(integration.type)}
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{integration.name}</span>
                          <Badge variant="outline">{integration.provider}</Badge>
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(integration.status)}
                          <span className="text-sm capitalize">{integration.status}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getHealthIcon(integration.health)}
                          <span className="text-xs text-muted-foreground capitalize">{integration.health}</span>
                        </div>
                      </div>
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">{integration.metrics.uptime}%</p>
                        <Progress value={integration.metrics.uptime} className="w-16 h-2" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requests</p>
                      <p className="text-lg font-semibold">{integration.metrics.totalRequests.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Error rate: {integration.metrics.errorRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="text-lg font-semibold">{integration.metrics.averageResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Sync</p>
                      <p className="text-lg font-semibold">{formatTimeAgo(integration.lastSync)}</p>
                    </div>
                  </div>

                  {selectedIntegration?.id === integration.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-3">Configuration</h4>
                          <div className="space-y-2 text-sm">
                            {integration.configuration.endpoint && (
                              <div>
                                <span className="text-muted-foreground">Endpoint:</span>
                                <code className="ml-2 bg-muted px-1 rounded text-xs">
                                  {integration.configuration.endpoint}
                                </code>
                              </div>
                            )}
                            {integration.configuration.host && (
                              <div>
                                <span className="text-muted-foreground">Host:</span>
                                <code className="ml-2 bg-muted px-1 rounded text-xs">
                                  {integration.configuration.host}:{integration.configuration.port}
                                </code>
                              </div>
                            )}
                            {integration.configuration.database && (
                              <div>
                                <span className="text-muted-foreground">Database:</span>
                                <code className="ml-2 bg-muted px-1 rounded text-xs">
                                  {integration.configuration.database}
                                </code>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Timeout:</span>
                              <span className="ml-2">{integration.configuration.timeout}ms</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Retries:</span>
                              <span className="ml-2">{integration.configuration.retries}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Features</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(integration.features).map(([feature, enabled]) => (
                              <div key={feature} className="flex items-center space-x-2">
                                {enabled ? 
                                  <Check className="h-3 w-3 text-green-500" /> : 
                                  <X className="h-3 w-3 text-gray-400" />
                                }
                                <span className="capitalize text-xs">
                                  {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Security</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(integration.security).map(([security, enabled]) => (
                              <div key={security} className="flex items-center space-x-2">
                                {enabled ? 
                                  <Check className="h-3 w-3 text-green-500" /> : 
                                  <X className="h-3 w-3 text-gray-400" />
                                }
                                <span className="capitalize text-xs">
                                  {security.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Success Rate:</span>
                              <span className="ml-2 font-medium">
                                {((integration.metrics.successfulRequests / integration.metrics.totalRequests) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Data Transferred:</span>
                              <span className="ml-2 font-medium">{formatBytes(integration.metrics.dataTransferred)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Request:</span>
                              <span className="ml-2 font-medium">
                                {integration.metrics.lastRequestTime ? formatTimeAgo(integration.metrics.lastRequestTime) : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTestConnection(integration.id)
                          }}
                          disabled={isLoading}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Test Connection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSyncNow(integration.id)
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Sync Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowConfiguration(!showConfiguration)
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Logs
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Integration Templates</h2>
              <p className="text-muted-foreground">
                Plantillas predefinidas para crear nuevas integraciones
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrationTemplates.map((template) => (
              <Card key={template.id} className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedTemplate?.id === template.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center text-xs text-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      {template.rating.toFixed(1)}
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
                        <span className="text-muted-foreground">Downloads:</span>
                        <span className="ml-1 font-medium">{template.downloads.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-1 font-medium">{template.version}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Author:</span>
                        <span className="ml-1 font-medium">{template.author}</span>
                      </div>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <div className="border-t pt-3 space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Required Fields</h4>
                          <div className="space-y-1">
                            {template.requiredFields.map(field => (
                              <div key={field} className="text-xs flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">Required</Badge>
                                <code className="bg-muted px-1 rounded">{field}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Optional Fields</h4>
                          <div className="space-y-1">
                            {template.optionalFields.slice(0, 3).map(field => (
                              <div key={field} className="text-xs flex items-center space-x-1">
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                                <code className="bg-muted px-1 rounded">{field}</code>
                              </div>
                            ))}
                            {template.optionalFields.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{template.optionalFields.length - 3} more fields
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Docs
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

        <TabsContent value="sync-jobs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sync Jobs</h2>
              <p className="text-muted-foreground">
                Trabajos de sincronización e importación/exportación
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sync Job
            </Button>
          </div>

          <div className="space-y-4">
            {syncJobs.map((job) => (
              <Card key={job.id} className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                selectedJob?.id === job.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(job.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{job.integrationName}</h3>
                          <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            job.status === 'completed' && "border-green-500 text-green-700",
                            job.status === 'running' && "border-blue-500 text-blue-700",
                            job.status === 'failed' && "border-red-500 text-red-700",
                            job.status === 'queued' && "border-gray-500 text-gray-700"
                          )}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Started: {formatTimeAgo(job.startedAt)}</span>
                            {job.duration && <span>Duration: {formatDuration(job.duration)}</span>}
                            <span>Records: {job.recordsProcessed.toLocaleString()}{job.recordsTotal && ` / ${job.recordsTotal.toLocaleString()}`}</span>
                            {job.errorCount > 0 && <span className="text-red-600">Errors: {job.errorCount}</span>}
                          </div>
                          {job.status === 'running' && (
                            <div className="mt-2">
                              <Progress value={job.progress} className="w-full h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>{job.progress}% complete</span>
                                <span>ETA: ~{Math.round((100 - job.progress) * 2)}min</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'running' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelJob(job.id)
                          }}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRetryJob(job.id)
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedJob?.id === job.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {job.schedule && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Schedule</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Switch checked={job.schedule.enabled} />
                              <span className="capitalize">{job.schedule.frequency}</span>
                            </div>
                            {job.schedule.nextRun && (
                              <span className="text-muted-foreground">
                                Next run: {formatTimeAgo(job.schedule.nextRun)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recent Logs</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {job.logs.map((log, index) => (
                              <div key={index} className="flex items-start space-x-2 text-xs">
                                <span className="text-muted-foreground">
                                  {log.timestamp.toLocaleTimeString()}
                                </span>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  log.level === 'error' && "border-red-500 text-red-700",
                                  log.level === 'warning' && "border-yellow-500 text-yellow-700",
                                  log.level === 'info' && "border-blue-500 text-blue-700"
                                )}>
                                  {log.level}
                                </Badge>
                                <span className="flex-1">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-endpoints" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Endpoints</h2>
              <p className="text-muted-foreground">
                Gestión de endpoints y APIs expuestas
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Endpoint
            </Button>
          </div>

          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        endpoint.method === 'GET' && "border-green-500 text-green-700",
                        endpoint.method === 'POST' && "border-blue-500 text-blue-700",
                        endpoint.method === 'PUT' && "border-orange-500 text-orange-700",
                        endpoint.method === 'DELETE' && "border-red-500 text-red-700"
                      )}>
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{endpoint.name}</h3>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Usage: {endpoint.usageCount.toLocaleString()}</span>
                          <span>Avg Response: {endpoint.averageResponseTime}ms</span>
                          <span>Last Used: {endpoint.lastUsed ? formatTimeAgo(endpoint.lastUsed) : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {endpoint.rateLimit.enabled ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                        <span className="text-xs">Rate Limited</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {endpoint.caching.enabled ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                        <span className="text-xs">Cached</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Webhook Events</h2>
              <p className="text-muted-foreground">
                Eventos de webhooks enviados y recibidos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Failed
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {webhookEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{event.event}</h3>
                          <Badge variant="outline" className="text-xs">{event.method}</Badge>
                          {event.status === 'delivered' && event.responseCode && (
                            <Badge variant="outline" className="text-xs text-green-700">
                              {event.responseCode}
                            </Badge>
                          )}
                          {event.status === 'failed' && event.responseCode && (
                            <Badge variant="outline" className="text-xs text-red-700">
                              {event.responseCode}
                            </Badge>
                          )}
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                          {event.url}
                        </code>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>{formatTimeAgo(event.timestamp)}</span>
                          <span>Attempts: {event.attempts}/{event.maxAttempts}</span>
                          {event.signature && <span>Signed</span>}
                          {event.nextRetry && (
                            <span>Next retry: {formatTimeAgo(event.nextRetry)}</span>
                          )}
                        </div>
                        {event.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {event.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {event.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Integration Monitoring</h2>
              <p className="text-muted-foreground">
                Monitoreo y métricas de integraciones
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Active Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground">
                    of {integrations.length} total
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last week
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Average Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(integrations.reduce((sum, i) => sum + i.metrics.averageResponseTime, 0) / integrations.length)}ms
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -5% from last week
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(integrations.reduce((sum, i) => sum + i.metrics.errorRate, 0) / integrations.length).toFixed(2)}%
                  </div>
                  <div className="flex items-center text-xs text-red-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2% from last week
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getHealthIcon(integration.health)}
                          <div>
                            <p className="text-sm font-medium">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uptime: {integration.metrics.uptime}% | Errors: {integration.metrics.failedRequests}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          integration.health === 'healthy' && "border-green-500 text-green-700",
                          integration.health === 'warning' && "border-yellow-500 text-yellow-700",
                          integration.health === 'error' && "border-red-500 text-red-700"
                        )}>
                          {integration.health}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Connection Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectionTests.map((test) => {
                      const integration = integrations.find(i => i.id === test.integrationId)
                      return (
                        <div key={test.id} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <p className="text-sm font-medium">{integration?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(test.timestamp)} | {test.responseTime}ms
                              </p>
                            </div>
                          </div>
                          {test.errorMessage && (
                            <div className="text-xs text-red-600 max-w-32 truncate">
                              {test.errorMessage}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics (Last 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Performance Charts</p>
                    <p className="text-xs text-muted-foreground">Chart implementation placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Integration Settings</h2>
              <p className="text-muted-foreground">
                Configuración global de integraciones
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  Configuración general del sistema de integraciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-refresh Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Actualizar métricas automáticamente</p>
                  </div>
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
                <div>
                  <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    min="5"
                    max="300"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Connection Pooling</Label>
                    <p className="text-sm text-muted-foreground">Habilitar pooling de conexiones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Retries</Label>
                    <p className="text-sm text-muted-foreground">Reintentar automáticamente en fallos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configuración de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require SSL/TLS</Label>
                    <p className="text-sm text-muted-foreground">Forzar conexiones seguras</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Key Rotation</Label>
                    <p className="text-sm text-muted-foreground">Rotación automática de keys</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <Label htmlFor="token-expiry">Token Expiry (days)</Label>
                  <Input
                    id="token-expiry"
                    type="number"
                    defaultValue={90}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">Restringir por IP</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>
                  Configuración de rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-connections">Max Concurrent Connections</Label>
                  <Input
                    id="max-connections"
                    type="number"
                    defaultValue={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Default Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    defaultValue={30000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retry-attempts">Default Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    defaultValue={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rate-limit">Global Rate Limit (req/min)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    defaultValue={1000}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring & Alerts</CardTitle>
                <CardDescription>
                  Configuración de monitoreo y alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Health Check Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Monitoreo continuo de salud</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="health-interval">Health Check Interval (minutes)</Label>
                  <Input
                    id="health-interval"
                    type="number"
                    defaultValue={5}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Error Rate Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alertas por tasa de errores</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="error-threshold">Error Rate Threshold (%)</Label>
                  <Input
                    id="error-threshold"
                    type="number"
                    defaultValue={5}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}