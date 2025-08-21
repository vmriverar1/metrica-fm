'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Database,
  Upload,
  Download,
  RefreshCw,
  Play,
  Pause,
  Square,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Users,
  FileType,
  ArrowRight,
  Copy,
  Trash2,
  Edit,
  Eye,
  Save,
  X,
  Plus,
  Loader2,
  CheckCheck,
  AlertCircle,
  Info,
  Target,
  Zap,
  Shield,
  Activity,
  Code,
  GitBranch,
  HardDrive,
  Network
} from 'lucide-react'

interface MigrationJob {
  id: string
  name: string
  description: string
  source: {
    type: 'database' | 'file' | 'api' | 'cloud'
    connection: string
    config: Record<string, any>
  }
  destination: {
    type: 'database' | 'file' | 'api' | 'cloud'
    connection: string
    config: Record<string, any>
  }
  transformations: MigrationTransformation[]
  schedule: {
    enabled: boolean
    type: 'once' | 'recurring'
    cronExpression?: string
    nextRun?: Date
  }
  status: 'draft' | 'active' | 'running' | 'completed' | 'failed' | 'paused'
  metrics: {
    totalRecords: number
    processedRecords: number
    successfulRecords: number
    failedRecords: number
    startTime?: Date
    endTime?: Date
    duration?: number
    throughput: number
  }
  validation: {
    enabled: boolean
    rules: ValidationRule[]
    failureAction: 'continue' | 'stop' | 'retry'
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastRunBy?: string
}

interface MigrationTransformation {
  id: string
  name: string
  type: 'map' | 'filter' | 'aggregate' | 'join' | 'split' | 'custom'
  config: {
    sourceField?: string
    targetField?: string
    expression?: string
    conditions?: Record<string, any>
    script?: string
  }
  order: number
  enabled: boolean
}

interface ValidationRule {
  id: string
  name: string
  field: string
  type: 'required' | 'format' | 'range' | 'unique' | 'custom'
  config: Record<string, any>
  severity: 'error' | 'warning' | 'info'
}

interface MigrationLog {
  id: string
  jobId: string
  timestamp: Date
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  details?: Record<string, any>
  recordId?: string
  source?: string
}

interface DataSource {
  id: string
  name: string
  type: 'database' | 'file' | 'api' | 'cloud'
  connection: string
  config: {
    host?: string
    port?: number
    database?: string
    username?: string
    password?: string
    ssl?: boolean
    path?: string
    endpoint?: string
    apiKey?: string
    region?: string
    bucket?: string
  }
  schema?: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  lastTested?: Date
  createdAt: Date
}

interface MigrationTemplate {
  id: string
  name: string
  description: string
  category: 'database' | 'file' | 'api' | 'cloud' | 'custom'
  sourceType: string
  destinationType: string
  transformations: MigrationTransformation[]
  validationRules: ValidationRule[]
  config: Record<string, any>
  usage: number
  createdAt: Date
}

interface MigrationMetrics {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  failedJobs: number
  totalRecordsProcessed: number
  avgProcessingTime: number
  throughputTrend: Array<{ date: Date; value: number }>
  errorRate: number
  successRate: number
}

export default function DataMigrationManager() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [migrationTemplates, setMigrationTemplates] = useState<MigrationTemplate[]>([])
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([])
  const [migrationMetrics, setMigrationMetrics] = useState<MigrationMetrics>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalRecordsProcessed: 0,
    avgProcessingTime: 0,
    throughputTrend: [],
    errorRate: 0,
    successRate: 0
  })

  const [selectedJob, setSelectedJob] = useState<MigrationJob | null>(null)
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<MigrationTemplate | null>(null)
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false)
  const [isCreateSourceDialogOpen, setIsCreateSourceDialogOpen] = useState(false)
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const [newJob, setNewJob] = useState<Partial<MigrationJob>>({
    name: '',
    description: '',
    source: { type: 'database', connection: '', config: {} },
    destination: { type: 'database', connection: '', config: {} },
    transformations: [],
    schedule: { enabled: false, type: 'once' },
    validation: { enabled: true, rules: [], failureAction: 'stop' }
  })

  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    name: '',
    type: 'database',
    connection: '',
    config: {}
  })

  const [newTemplate, setNewTemplate] = useState<Partial<MigrationTemplate>>({
    name: '',
    description: '',
    category: 'database',
    sourceType: 'database',
    destinationType: 'database',
    transformations: [],
    validationRules: [],
    config: {}
  })

  const loadMigrationJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockJobs: MigrationJob[] = [
        {
          id: '1',
          name: 'Customer Data Migration',
          description: 'Migrate customer data from legacy system to new CRM',
          source: {
            type: 'database',
            connection: 'legacy-mysql',
            config: { host: 'legacy.db.com', port: 3306, database: 'customers' }
          },
          destination: {
            type: 'database',
            connection: 'crm-postgres',
            config: { host: 'crm.db.com', port: 5432, database: 'crm_prod' }
          },
          transformations: [
            {
              id: 't1',
              name: 'Map Customer Fields',
              type: 'map',
              config: { sourceField: 'customer_name', targetField: 'full_name' },
              order: 1,
              enabled: true
            }
          ],
          schedule: { enabled: true, type: 'once', nextRun: new Date() },
          status: 'completed',
          metrics: {
            totalRecords: 50000,
            processedRecords: 50000,
            successfulRecords: 49800,
            failedRecords: 200,
            startTime: new Date('2024-01-15T10:00:00Z'),
            endTime: new Date('2024-01-15T12:30:00Z'),
            duration: 9000,
            throughput: 5.56
          },
          validation: {
            enabled: true,
            rules: [],
            failureAction: 'continue'
          },
          createdAt: new Date('2024-01-10T09:00:00Z'),
          updatedAt: new Date('2024-01-15T12:30:00Z'),
          createdBy: 'john.doe@company.com',
          lastRunBy: 'migration.service@company.com'
        },
        {
          id: '2',
          name: 'Product Catalog Sync',
          description: 'Daily sync of product catalog from ERP to e-commerce platform',
          source: {
            type: 'api',
            connection: 'erp-api',
            config: { endpoint: 'https://erp.company.com/api/v2/products', apiKey: 'masked' }
          },
          destination: {
            type: 'api',
            connection: 'ecommerce-api',
            config: { endpoint: 'https://shop.company.com/api/products', apiKey: 'masked' }
          },
          transformations: [
            {
              id: 't2',
              name: 'Price Formatting',
              type: 'custom',
              config: { script: 'price = parseFloat(price).toFixed(2)' },
              order: 1,
              enabled: true
            }
          ],
          schedule: {
            enabled: true,
            type: 'recurring',
            cronExpression: '0 2 * * *',
            nextRun: new Date()
          },
          status: 'active',
          metrics: {
            totalRecords: 15000,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            throughput: 0
          },
          validation: {
            enabled: true,
            rules: [
              {
                id: 'v1',
                name: 'Required SKU',
                field: 'sku',
                type: 'required',
                config: {},
                severity: 'error'
              }
            ],
            failureAction: 'stop'
          },
          createdAt: new Date('2024-01-08T14:00:00Z'),
          updatedAt: new Date('2024-01-20T08:00:00Z'),
          createdBy: 'jane.smith@company.com'
        },
        {
          id: '3',
          name: 'Log Data Archive',
          description: 'Archive old log data to cloud storage',
          source: {
            type: 'database',
            connection: 'logs-postgres',
            config: { host: 'logs.db.com', port: 5432, database: 'application_logs' }
          },
          destination: {
            type: 'cloud',
            connection: 's3-archive',
            config: { region: 'us-east-1', bucket: 'company-log-archive' }
          },
          transformations: [
            {
              id: 't3',
              name: 'Date Filter',
              type: 'filter',
              config: { conditions: { created_at: { $lt: '2024-01-01' } } },
              order: 1,
              enabled: true
            }
          ],
          schedule: { enabled: false, type: 'once' },
          status: 'running',
          metrics: {
            totalRecords: 1000000,
            processedRecords: 650000,
            successfulRecords: 649500,
            failedRecords: 500,
            startTime: new Date('2024-01-20T20:00:00Z'),
            throughput: 180.56
          },
          validation: {
            enabled: false,
            rules: [],
            failureAction: 'continue'
          },
          createdAt: new Date('2024-01-18T16:00:00Z'),
          updatedAt: new Date('2024-01-20T20:00:00Z'),
          createdBy: 'admin@company.com',
          lastRunBy: 'archive.service@company.com'
        }
      ]
      
      setMigrationJobs(mockJobs)
    } catch (error) {
      console.error('Error loading migration jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadDataSources = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockSources: DataSource[] = [
        {
          id: '1',
          name: 'Legacy MySQL',
          type: 'database',
          connection: 'legacy-mysql',
          config: {
            host: 'legacy.db.company.com',
            port: 3306,
            database: 'legacy_system',
            username: 'migration_user'
          },
          status: 'active',
          lastTested: new Date('2024-01-20T09:00:00Z'),
          createdAt: new Date('2024-01-05T10:00:00Z')
        },
        {
          id: '2',
          name: 'CRM PostgreSQL',
          type: 'database',
          connection: 'crm-postgres',
          config: {
            host: 'crm.db.company.com',
            port: 5432,
            database: 'crm_production',
            username: 'crm_admin'
          },
          status: 'active',
          lastTested: new Date('2024-01-20T08:30:00Z'),
          createdAt: new Date('2024-01-05T11:00:00Z')
        },
        {
          id: '3',
          name: 'ERP API',
          type: 'api',
          connection: 'erp-api',
          config: {
            endpoint: 'https://erp.company.com/api/v2',
            apiKey: 'sk_live_xxxxxxxxxxxx'
          },
          status: 'active',
          lastTested: new Date('2024-01-20T07:45:00Z'),
          createdAt: new Date('2024-01-08T14:00:00Z')
        },
        {
          id: '4',
          name: 'S3 Archive Storage',
          type: 'cloud',
          connection: 's3-archive',
          config: {
            region: 'us-east-1',
            bucket: 'company-data-archive',
            apiKey: 'AKIA...'
          },
          status: 'active',
          lastTested: new Date('2024-01-19T18:00:00Z'),
          createdAt: new Date('2024-01-12T09:00:00Z')
        }
      ]
      
      setDataSources(mockSources)
    } catch (error) {
      console.error('Error loading data sources:', error)
    }
  }, [])

  const loadMigrationTemplates = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockTemplates: MigrationTemplate[] = [
        {
          id: '1',
          name: 'Database to Database Migration',
          description: 'Standard template for migrating data between databases',
          category: 'database',
          sourceType: 'database',
          destinationType: 'database',
          transformations: [
            {
              id: 't1',
              name: 'Field Mapping',
              type: 'map',
              config: {},
              order: 1,
              enabled: true
            }
          ],
          validationRules: [
            {
              id: 'v1',
              name: 'Data Type Validation',
              field: '*',
              type: 'format',
              config: {},
              severity: 'warning'
            }
          ],
          config: {
            batchSize: 1000,
            parallelConnections: 4
          },
          usage: 15,
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          id: '2',
          name: 'API Data Sync',
          description: 'Template for synchronizing data via REST APIs',
          category: 'api',
          sourceType: 'api',
          destinationType: 'database',
          transformations: [
            {
              id: 't2',
              name: 'JSON Transformation',
              type: 'custom',
              config: { script: 'JSON.parse(data)' },
              order: 1,
              enabled: true
            }
          ],
          validationRules: [
            {
              id: 'v2',
              name: 'Required Fields Check',
              field: 'id',
              type: 'required',
              config: {},
              severity: 'error'
            }
          ],
          config: {
            rateLimiting: true,
            retryPolicy: 'exponential'
          },
          usage: 8,
          createdAt: new Date('2024-01-05T00:00:00Z')
        }
      ]
      
      setMigrationTemplates(mockTemplates)
    } catch (error) {
      console.error('Error loading migration templates:', error)
    }
  }, [])

  const loadMigrationLogs = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const mockLogs: MigrationLog[] = [
        {
          id: '1',
          jobId: '1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          level: 'info',
          message: 'Migration job started',
          details: { totalRecords: 50000 }
        },
        {
          id: '2',
          jobId: '1',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          level: 'info',
          message: 'Processed 25000 records',
          details: { progress: 50 }
        },
        {
          id: '3',
          jobId: '1',
          timestamp: new Date('2024-01-15T11:15:00Z'),
          level: 'warning',
          message: 'Data validation failed for some records',
          details: { failedRecords: 200 }
        },
        {
          id: '4',
          jobId: '1',
          timestamp: new Date('2024-01-15T12:30:00Z'),
          level: 'info',
          message: 'Migration job completed successfully',
          details: { processedRecords: 50000, successRate: 99.6 }
        }
      ]
      
      setMigrationLogs(mockLogs)
    } catch (error) {
      console.error('Error loading migration logs:', error)
    }
  }, [])

  const loadMigrationMetrics = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockMetrics: MigrationMetrics = {
        totalJobs: 15,
        activeJobs: 3,
        completedJobs: 10,
        failedJobs: 2,
        totalRecordsProcessed: 2500000,
        avgProcessingTime: 3600,
        throughputTrend: [
          { date: new Date('2024-01-15'), value: 850 },
          { date: new Date('2024-01-16'), value: 920 },
          { date: new Date('2024-01-17'), value: 1100 },
          { date: new Date('2024-01-18'), value: 980 },
          { date: new Date('2024-01-19'), value: 1250 },
          { date: new Date('2024-01-20'), value: 1180 }
        ],
        errorRate: 0.8,
        successRate: 97.5
      }
      
      setMigrationMetrics(mockMetrics)
    } catch (error) {
      console.error('Error loading migration metrics:', error)
    }
  }, [])

  useEffect(() => {
    loadMigrationJobs()
    loadDataSources()
    loadMigrationTemplates()
    loadMigrationLogs()
    loadMigrationMetrics()
  }, [loadMigrationJobs, loadDataSources, loadMigrationTemplates, loadMigrationLogs, loadMigrationMetrics])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMigrationJobs()
        loadMigrationMetrics()
        loadMigrationLogs()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, loadMigrationJobs, loadMigrationMetrics, loadMigrationLogs])

  const handleCreateJob = () => {
    const job: MigrationJob = {
      id: Date.now().toString(),
      name: newJob.name || '',
      description: newJob.description || '',
      source: newJob.source || { type: 'database', connection: '', config: {} },
      destination: newJob.destination || { type: 'database', connection: '', config: {} },
      transformations: newJob.transformations || [],
      schedule: newJob.schedule || { enabled: false, type: 'once' },
      status: 'draft',
      metrics: {
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        throughput: 0
      },
      validation: newJob.validation || { enabled: true, rules: [], failureAction: 'stop' },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current.user@company.com'
    }
    
    setMigrationJobs([...migrationJobs, job])
    setNewJob({
      name: '',
      description: '',
      source: { type: 'database', connection: '', config: {} },
      destination: { type: 'database', connection: '', config: {} },
      transformations: [],
      schedule: { enabled: false, type: 'once' },
      validation: { enabled: true, rules: [], failureAction: 'stop' }
    })
    setIsCreateJobDialogOpen(false)
  }

  const handleCreateSource = () => {
    const source: DataSource = {
      id: Date.now().toString(),
      name: newSource.name || '',
      type: newSource.type || 'database',
      connection: newSource.connection || '',
      config: newSource.config || {},
      status: 'active',
      createdAt: new Date()
    }
    
    setDataSources([...dataSources, source])
    setNewSource({
      name: '',
      type: 'database',
      connection: '',
      config: {}
    })
    setIsCreateSourceDialogOpen(false)
  }

  const handleCreateTemplate = () => {
    const template: MigrationTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name || '',
      description: newTemplate.description || '',
      category: newTemplate.category || 'database',
      sourceType: newTemplate.sourceType || 'database',
      destinationType: newTemplate.destinationType || 'database',
      transformations: newTemplate.transformations || [],
      validationRules: newTemplate.validationRules || [],
      config: newTemplate.config || {},
      usage: 0,
      createdAt: new Date()
    }
    
    setMigrationTemplates([...migrationTemplates, template])
    setNewTemplate({
      name: '',
      description: '',
      category: 'database',
      sourceType: 'database',
      destinationType: 'database',
      transformations: [],
      validationRules: [],
      config: {}
    })
    setIsCreateTemplateDialogOpen(false)
  }

  const handleStartJob = (jobId: string) => {
    setMigrationJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running', metrics: { ...job.metrics, startTime: new Date() } }
          : job
      )
    )
  }

  const handlePauseJob = (jobId: string) => {
    setMigrationJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'paused' }
          : job
      )
    )
  }

  const handleStopJob = (jobId: string) => {
    setMigrationJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', metrics: { ...job.metrics, endTime: new Date() } }
          : job
      )
    )
  }

  const handleDeleteJob = (jobId: string) => {
    setMigrationJobs(jobs => jobs.filter(job => job.id !== jobId))
  }

  const filteredJobs = migrationJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesType = typeFilter === 'all' || job.source.type === typeFilter || job.destination.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />
      case 'active': return <CheckCheck className="h-4 w-4 text-green-500" />
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <Badge variant="outline" className={variants[status] || variants.draft}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-4 w-4" />
      case 'file': return <FileText className="h-4 w-4" />
      case 'api': return <Network className="h-4 w-4" />
      case 'cloud': return <HardDrive className="h-4 w-4" />
      default: return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Migration Manager</h2>
          <p className="text-muted-foreground">
            Manage data migrations, transformations, and ETL processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label className="text-sm">Auto-refresh</Label>
          </div>
          <Button onClick={() => loadMigrationJobs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationMetrics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {migrationMetrics.activeJobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {migrationMetrics.totalRecordsProcessed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {migrationMetrics.successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(migrationMetrics.avgProcessingTime / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Per job completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationMetrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              {migrationMetrics.failedJobs} failed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="jobs">Migration Jobs</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="transformations">Transformations</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search migration jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateJobDialogOpen} onOpenChange={setIsCreateJobDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Migration Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Migration Job</DialogTitle>
                  <DialogDescription>
                    Configure a new data migration job with source, destination, and transformation rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-name">Job Name</Label>
                      <Input
                        id="job-name"
                        placeholder="Customer Data Migration"
                        value={newJob.name}
                        onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Description</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Describe the migration purpose..."
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select 
                        value={newJob.source?.type} 
                        onValueChange={(value) => setNewJob({ 
                          ...newJob, 
                          source: { 
                            ...newJob.source, 
                            type: value as 'database' | 'file' | 'api' | 'cloud' 
                          } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Connection string or identifier"
                        value={newJob.source?.connection}
                        onChange={(e) => setNewJob({ 
                          ...newJob, 
                          source: { ...newJob.source, connection: e.target.value } 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Select 
                        value={newJob.destination?.type} 
                        onValueChange={(value) => setNewJob({ 
                          ...newJob, 
                          destination: { 
                            ...newJob.destination, 
                            type: value as 'database' | 'file' | 'api' | 'cloud' 
                          } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Connection string or identifier"
                        value={newJob.destination?.connection}
                        onChange={(e) => setNewJob({ 
                          ...newJob, 
                          destination: { ...newJob.destination, connection: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newJob.schedule?.enabled}
                      onCheckedChange={(checked) => setNewJob({
                        ...newJob,
                        schedule: { ...newJob.schedule, enabled: checked }
                      })}
                    />
                    <Label>Enable Scheduling</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateJobDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateJob}>
                    Create Job
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source → Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-muted-foreground mt-2">Loading migration jobs...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Database className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">No migration jobs found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.name}</div>
                            <div className="text-sm text-muted-foreground">{job.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(job.source.type)}
                              <span className="text-sm">{job.source.type}</span>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(job.destination.type)}
                              <span className="text-sm">{job.destination.type}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>
                          {job.status === 'running' || job.status === 'completed' ? (
                            <div className="space-y-1">
                              <Progress 
                                value={(job.metrics.processedRecords / job.metrics.totalRecords) * 100}
                                className="w-24"
                              />
                              <div className="text-xs text-muted-foreground">
                                {job.metrics.processedRecords.toLocaleString()} / {job.metrics.totalRecords.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {job.metrics.startTime ? job.metrics.startTime.toLocaleDateString() : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {job.lastRunBy ? `by ${job.lastRunBy.split('@')[0]}` : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {job.status === 'draft' || job.status === 'paused' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartJob(job.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {job.status === 'running' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePauseJob(job.id)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {job.status === 'running' || job.status === 'paused' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStopJob(job.id)}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Data Sources</h3>
            <Dialog open={isCreateSourceDialogOpen} onOpenChange={setIsCreateSourceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Data Source</DialogTitle>
                  <DialogDescription>
                    Configure a new data source connection for migrations.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="source-name">Source Name</Label>
                    <Input
                      id="source-name"
                      placeholder="Production MySQL"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select 
                      value={newSource.type} 
                      onValueChange={(value) => setNewSource({ 
                        ...newSource, 
                        type: value as 'database' | 'file' | 'api' | 'cloud' 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-connection">Connection String</Label>
                    <Input
                      id="source-connection"
                      placeholder="mysql://user:pass@host:port/db"
                      value={newSource.connection}
                      onChange={(e) => setNewSource({ ...newSource, connection: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateSourceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSource}>
                    Add Source
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getTypeIcon(source.type)}
                      <span>{source.name}</span>
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={source.status === 'active' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
                    >
                      {source.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {source.type.charAt(0).toUpperCase() + source.type.slice(1)} Connection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Connection:</span>
                      <div className="text-muted-foreground truncate">{source.connection}</div>
                    </div>
                    {source.lastTested && (
                      <div className="text-sm">
                        <span className="font-medium">Last Tested:</span>
                        <div className="text-muted-foreground">{source.lastTested.toLocaleDateString()}</div>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Created:</span>
                      <div className="text-muted-foreground">{source.createdAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      Test Connection
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Migration Templates</h3>
            <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Migration Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable template for common migration patterns.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="Database Migration Template"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newTemplate.category} 
                        onValueChange={(value) => setNewTemplate({ 
                          ...newTemplate, 
                          category: value as 'database' | 'file' | 'api' | 'cloud' | 'custom' 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      placeholder="Describe the template usage..."
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source Type</Label>
                      <Select 
                        value={newTemplate.sourceType} 
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, sourceType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Destination Type</Label>
                      <Select 
                        value={newTemplate.destinationType} 
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, destinationType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {migrationTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(template.sourceType)}
                        <span className="text-sm">{template.sourceType}</span>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(template.destinationType)}
                        <span className="text-sm">{template.destinationType}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.transformations.length} transformations,{' '}
                      {template.validationRules.length} validation rules
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Used {template.usage} times
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transformations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Transformations</CardTitle>
              <CardDescription>
                Configure data transformation rules and mappings for migrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Select a migration job to configure its transformations, or create transformation templates for reuse.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Field Mapping</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Map source fields to destination fields with optional renaming and type conversion.
                      </p>
                      <Button variant="outline" size="sm">Configure Mapping</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Filter className="h-4 w-4" />
                        <span>Data Filtering</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Filter records based on conditions and criteria before migration.
                      </p>
                      <Button variant="outline" size="sm">Setup Filters</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>Custom Scripts</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Write custom transformation logic using JavaScript or SQL scripts.
                      </p>
                      <Button variant="outline" size="sm">Create Script</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
              <CardDescription>
                Configure validation rules to ensure data quality during migrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Data validation helps maintain data integrity and quality during migration processes.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Required Fields</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ensure required fields are not null or empty.
                      </p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <FileType className="h-4 w-4" />
                        <span>Format Validation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Validate data formats like emails, dates, and numbers.
                      </p>
                      <Button variant="outline" size="sm">Setup Rules</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Range Checks</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Validate numeric ranges and string length limits.
                      </p>
                      <Button variant="outline" size="sm">Set Ranges</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Uniqueness</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Check for duplicate values in unique fields.
                      </p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Execution Logs</CardTitle>
                  <CardDescription>
                    View detailed logs from migration job executions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="warning">Warnings</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {migrationLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="mt-0.5">
                      {log.level === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      {log.level === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {log.level === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                      {log.level === 'debug' && <Code className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {migrationJobs.find(j => j.id === log.jobId)?.name || 'Unknown Job'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.message}</p>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground">
                            Show details
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Real-time Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {migrationJobs.filter(job => job.status === 'running').map((job) => (
                    <div key={job.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{job.name}</span>
                        <Badge variant="outline" className="text-blue-600">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      </div>
                      <Progress 
                        value={(job.metrics.processedRecords / job.metrics.totalRecords) * 100}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{job.metrics.processedRecords.toLocaleString()} processed</span>
                        <span>{job.metrics.throughput.toFixed(1)} records/sec</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{migrationMetrics.successRate}%</span>
                    </div>
                    <Progress value={migrationMetrics.successRate} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span>{migrationMetrics.errorRate}%</span>
                    </div>
                    <Progress value={migrationMetrics.errorRate} className="mt-1" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Avg. Throughput: {migrationMetrics.throughputTrend.slice(-1)[0]?.value.toFixed(1)} records/sec
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  Configure global migration settings and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-batch-size">Default Batch Size</Label>
                  <Input
                    id="default-batch-size"
                    type="number"
                    placeholder="1000"
                    defaultValue="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-retries">Maximum Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    placeholder="3"
                    defaultValue="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Default Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="3600"
                    defaultValue="3600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="parallel-processing" defaultChecked />
                  <Label htmlFor="parallel-processing">Enable Parallel Processing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="detailed-logging" defaultChecked />
                  <Label htmlFor="detailed-logging">Detailed Logging</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure alerts and notifications for migration events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="success-notifications" defaultChecked />
                  <Label htmlFor="success-notifications">Job Success Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="failure-notifications" defaultChecked />
                  <Label htmlFor="failure-notifications">Job Failure Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="warning-notifications" />
                  <Label htmlFor="warning-notifications">Warning Notifications</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>
                Configure security settings and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="encrypt-data" defaultChecked />
                    <Label htmlFor="encrypt-data">Encrypt Data in Transit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="audit-logging" defaultChecked />
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="data-masking" />
                    <Label htmlFor="data-masking">Enable Data Masking</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Log Retention (days)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      placeholder="90"
                      defaultValue="90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compliance-mode">Compliance Mode</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="gdpr">GDPR Compliant</SelectItem>
                        <SelectItem value="hipaa">HIPAA Compliant</SelectItem>
                        <SelectItem value="sox">SOX Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedJob.name}</DialogTitle>
              <DialogDescription>{selectedJob.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Source</h4>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(selectedJob.source.type)}
                      <span className="font-medium">{selectedJob.source.type}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedJob.source.connection}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Destination</h4>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(selectedJob.destination.type)}
                      <span className="font-medium">{selectedJob.destination.type}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedJob.destination.connection}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Metrics</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedJob.metrics.totalRecords.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedJob.metrics.processedRecords.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedJob.metrics.successfulRecords.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedJob.metrics.failedRecords.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </div>

              {selectedJob.transformations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Transformations</h4>
                  <div className="space-y-2">
                    {selectedJob.transformations.map((transform) => (
                      <div key={transform.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{transform.type}</Badge>
                            <span className="font-medium">{transform.name}</span>
                          </div>
                          <Badge variant={transform.enabled ? "default" : "secondary"}>
                            {transform.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}