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
import { AlertCircle, Shield, Database, Activity, User, Settings, Clock, CheckCircle, XCircle, AlertTriangle, Download, Upload, Search, Filter, RefreshCw, FileText, Eye, EyeOff, Plus, Trash2, Edit, Calendar, Timer, BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Users, UserCheck, UserX, Lock, Unlock, Key, Globe, Server, Cpu, Memory, HardDrive, Network, Mail, MessageSquare, Bell, Smartphone, Workflow, GitBranch, GitCommit, Code, Terminal, Package, Layers, Component, Link2, ExternalLink, Power, PowerOff, Play, Pause, SkipForward, Rewind, Volume2, VolumeX, Wifi, WifiOff, Zap, Home, Folder, File, FileJson, FileCode, FileImage, Monitor, Gauge, Target, Bug, Wrench, Cog, Archive, CloudDownload, CloudUpload, HelpCircle, Info, Star, Bookmark, Flag, Tag, Hash, AtSign, DollarSign, Percent, Minus, Plus as PlusIcon, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface AuditLogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'critical' | 'debug'
  category: string
  action: string
  entity: string
  entityId?: string
  user: {
    id: string
    name: string
    email: string
    role: string
    ip: string
    userAgent: string
    sessionId: string
  }
  details: {
    before?: any
    after?: any
    metadata?: Record<string, any>
    context?: string
    duration?: number
    affectedRecords?: number
    errorMessage?: string
    stackTrace?: string
  }
  source: 'web' | 'api' | 'cli' | 'system' | 'cron' | 'webhook'
  success: boolean
  risk: 'low' | 'medium' | 'high' | 'critical'
  compliance: {
    regulation?: string[]
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
    retention?: number
  }
  correlationId?: string
  parentEventId?: string
}

interface LogFilter {
  dateFrom?: Date
  dateTo?: Date
  levels: string[]
  categories: string[]
  users: string[]
  sources: string[]
  riskLevels: string[]
  searchTerm: string
  successOnly?: boolean
  complianceOnly?: boolean
}

interface LogAnalytics {
  totalEvents: number
  eventsByLevel: Record<string, number>
  eventsByCategory: Record<string, number>
  eventsByUser: Record<string, number>
  eventsBySource: Record<string, number>
  riskDistribution: Record<string, number>
  trendsOverTime: Array<{
    date: Date
    count: number
    level: string
  }>
  topUsers: Array<{
    user: string
    count: number
    riskScore: number
  }>
  suspiciousActivities: AuditLogEntry[]
}

interface ComplianceReport {
  id: string
  name: string
  regulation: string
  period: { from: Date; to: Date }
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    category: string
    description: string
    recommendation: string
    affectedEvents: number
  }>
  metrics: {
    totalEvents: number
    complianceScore: number
    violations: number
    remediated: number
  }
  createdAt: Date
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
}

interface RetentionPolicy {
  id: string
  name: string
  description: string
  categories: string[]
  dataClassification: string[]
  retentionDays: number
  archiveEnabled: boolean
  archiveAfterDays: number
  deleteAfterDays: number
  compressionEnabled: boolean
  encryptionRequired: boolean
  active: boolean
  lastApplied?: Date
  recordsProcessed?: number
}

interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: {
    levels?: string[]
    categories?: string[]
    actions?: string[]
    users?: string[]
    riskLevels?: string[]
    timeWindow: number
    threshold: number
    aggregationType: 'count' | 'unique_users' | 'unique_ips' | 'duration'
  }
  notifications: {
    email: boolean
    webhook: boolean
    sms: boolean
    channels: string[]
  }
  actions: Array<{
    type: 'email' | 'webhook' | 'disable_user' | 'require_mfa' | 'escalate'
    config: Record<string, any>
  }>
  lastTriggered?: Date
  triggerCount: number
  falsePositives: number
}

export default function AuditLogManager() {
  const [activeTab, setActiveTab] = useState('logs')
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [analytics, setAnalytics] = useState<LogAnalytics | null>(null)
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [selectedLogEntry, setSelectedLogEntry] = useState<AuditLogEntry | null>(null)
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<LogFilter>({
    levels: [],
    categories: [],
    users: [],
    sources: [],
    riskLevels: [],
    searchTerm: ''
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [sortBy, setSortBy] = useState<'timestamp' | 'user' | 'action' | 'risk'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadAuditData()
    if (realTimeEnabled) {
      const interval = setInterval(loadAuditLogs, autoRefreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [realTimeEnabled, autoRefreshInterval])

  useEffect(() => {
    applyFilters()
  }, [auditLogs, filter, sortBy, sortOrder])

  const loadAuditData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadAuditLogs(),
      loadAnalytics(),
      loadComplianceReports(),
      loadRetentionPolicies(),
      loadAlertRules()
    ])
    setIsLoading(false)
  }

  const loadAuditLogs = async () => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000),
        level: 'info',
        category: 'authentication',
        action: 'user_login',
        entity: 'User',
        entityId: 'user-123',
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john.doe@metrica.com',
          role: 'admin',
          ip: '192.168.1.100',
          userAgent: 'Chrome 120.0',
          sessionId: 'sess_abc123'
        },
        details: {
          context: 'Login successful with 2FA',
          duration: 1250,
          metadata: { mfaUsed: true, provider: 'google' }
        },
        source: 'web',
        success: true,
        risk: 'low',
        compliance: {
          regulation: ['SOX', 'GDPR'],
          dataClassification: 'internal',
          retention: 365
        },
        correlationId: 'corr_001'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000),
        level: 'warning',
        category: 'data_access',
        action: 'sensitive_data_export',
        entity: 'Report',
        entityId: 'report-456',
        user: {
          id: 'user-456',
          name: 'Jane Smith',
          email: 'jane.smith@metrica.com',
          role: 'analyst',
          ip: '192.168.1.101',
          userAgent: 'Firefox 121.0',
          sessionId: 'sess_def456'
        },
        details: {
          context: 'Exported customer financial data',
          affectedRecords: 1250,
          metadata: { reportType: 'financial', format: 'xlsx' }
        },
        source: 'web',
        success: true,
        risk: 'medium',
        compliance: {
          regulation: ['SOX', 'PCI'],
          dataClassification: 'confidential',
          retention: 2555
        },
        correlationId: 'corr_002'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000),
        level: 'error',
        category: 'system',
        action: 'configuration_change',
        entity: 'Configuration',
        entityId: 'config-789',
        user: {
          id: 'user-789',
          name: 'Mike Johnson',
          email: 'mike.johnson@metrica.com',
          role: 'sysadmin',
          ip: '10.0.1.50',
          userAgent: 'CLI Tool 2.1.0',
          sessionId: 'sess_ghi789'
        },
        details: {
          before: { timeout: 300, retries: 3 },
          after: { timeout: 600, retries: 5 },
          context: 'Database connection timeout increased',
          errorMessage: 'Configuration validation failed',
          stackTrace: 'Error at line 45: Invalid timeout value'
        },
        source: 'cli',
        success: false,
        risk: 'high',
        compliance: {
          regulation: ['SOX'],
          dataClassification: 'restricted',
          retention: 2555
        },
        correlationId: 'corr_003'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1200000),
        level: 'critical',
        category: 'security',
        action: 'privilege_escalation',
        entity: 'User',
        entityId: 'user-999',
        user: {
          id: 'user-999',
          name: 'Unknown User',
          email: 'suspicious@external.com',
          role: 'guest',
          ip: '203.0.113.1',
          userAgent: 'Bot/1.0',
          sessionId: 'sess_sus001'
        },
        details: {
          context: 'Attempted to access admin panel without authorization',
          metadata: { attempts: 15, blockedByFirewall: true },
          errorMessage: 'Access denied - insufficient privileges'
        },
        source: 'api',
        success: false,
        risk: 'critical',
        compliance: {
          regulation: ['SOX', 'GDPR', 'HIPAA'],
          dataClassification: 'restricted',
          retention: 2555
        },
        correlationId: 'corr_004'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1800000),
        level: 'info',
        category: 'data_modification',
        action: 'record_update',
        entity: 'Project',
        entityId: 'proj-123',
        user: {
          id: 'user-555',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@metrica.com',
          role: 'manager',
          ip: '192.168.1.105',
          userAgent: 'Safari 17.0',
          sessionId: 'sess_jkl555'
        },
        details: {
          before: { status: 'draft', budget: 50000 },
          after: { status: 'approved', budget: 75000 },
          context: 'Project budget increased and status updated',
          affectedRecords: 1,
          metadata: { approvedBy: 'director', reason: 'scope_expansion' }
        },
        source: 'web',
        success: true,
        risk: 'medium',
        compliance: {
          regulation: ['SOX'],
          dataClassification: 'confidential',
          retention: 1825
        },
        correlationId: 'corr_005'
      }
    ]
    setAuditLogs(mockLogs)
  }

  const loadAnalytics = async () => {
    const mockAnalytics: LogAnalytics = {
      totalEvents: 15847,
      eventsByLevel: {
        info: 8923,
        warning: 3456,
        error: 2341,
        critical: 1127
      },
      eventsByCategory: {
        authentication: 4567,
        data_access: 3421,
        system: 2890,
        security: 2234,
        data_modification: 1876,
        configuration: 859
      },
      eventsByUser: {
        'john.doe@metrica.com': 2341,
        'jane.smith@metrica.com': 1987,
        'mike.johnson@metrica.com': 1654,
        'sarah.wilson@metrica.com': 1234
      },
      eventsBySource: {
        web: 7823,
        api: 4521,
        cli: 2103,
        system: 1156,
        cron: 244
      },
      riskDistribution: {
        low: 7456,
        medium: 4567,
        high: 2834,
        critical: 990
      },
      trendsOverTime: Array.from({ length: 24 }, (_, i) => ({
        date: new Date(Date.now() - (23 - i) * 3600000),
        count: Math.floor(Math.random() * 100) + 50,
        level: ['info', 'warning', 'error', 'critical'][Math.floor(Math.random() * 4)]
      })),
      topUsers: [
        { user: 'john.doe@metrica.com', count: 2341, riskScore: 3.2 },
        { user: 'jane.smith@metrica.com', count: 1987, riskScore: 4.1 },
        { user: 'mike.johnson@metrica.com', count: 1654, riskScore: 5.8 },
        { user: 'sarah.wilson@metrica.com', count: 1234, riskScore: 2.9 }
      ],
      suspiciousActivities: []
    }
    setAnalytics(mockAnalytics)
  }

  const loadComplianceReports = async () => {
    const mockReports: ComplianceReport[] = [
      {
        id: '1',
        name: 'SOX Compliance Report Q1 2025',
        regulation: 'SOX',
        period: {
          from: new Date('2025-01-01'),
          to: new Date('2025-03-31')
        },
        status: 'approved',
        findings: [
          {
            severity: 'medium',
            category: 'Access Control',
            description: 'Some users have excessive privileges',
            recommendation: 'Implement principle of least privilege',
            affectedEvents: 234
          },
          {
            severity: 'low',
            category: 'Data Retention',
            description: 'Some logs retained beyond policy',
            recommendation: 'Update retention policies',
            affectedEvents: 12
          }
        ],
        metrics: {
          totalEvents: 4567,
          complianceScore: 94.2,
          violations: 15,
          remediated: 12
        },
        createdAt: new Date('2025-04-01'),
        createdBy: 'compliance@metrica.com',
        approvedBy: 'legal@metrica.com',
        approvedAt: new Date('2025-04-05')
      },
      {
        id: '2',
        name: 'GDPR Data Processing Report',
        regulation: 'GDPR',
        period: {
          from: new Date('2025-01-01'),
          to: new Date('2025-01-31')
        },
        status: 'pending',
        findings: [
          {
            severity: 'high',
            category: 'Data Processing',
            description: 'Personal data processed without explicit consent',
            recommendation: 'Review consent management process',
            affectedEvents: 89
          }
        ],
        metrics: {
          totalEvents: 1234,
          complianceScore: 87.5,
          violations: 23,
          remediated: 18
        },
        createdAt: new Date('2025-02-01'),
        createdBy: 'privacy@metrica.com'
      }
    ]
    setComplianceReports(mockReports)
  }

  const loadRetentionPolicies = async () => {
    const mockPolicies: RetentionPolicy[] = [
      {
        id: '1',
        name: 'Standard Business Records',
        description: 'General business operation logs and records',
        categories: ['data_access', 'data_modification', 'system'],
        dataClassification: ['public', 'internal'],
        retentionDays: 365,
        archiveEnabled: true,
        archiveAfterDays: 90,
        deleteAfterDays: 365,
        compressionEnabled: true,
        encryptionRequired: false,
        active: true,
        lastApplied: new Date(Date.now() - 86400000),
        recordsProcessed: 15234
      },
      {
        id: '2',
        name: 'Financial & SOX Compliance',
        description: 'Financial records and SOX compliance data',
        categories: ['authentication', 'configuration', 'security'],
        dataClassification: ['confidential', 'restricted'],
        retentionDays: 2555,
        archiveEnabled: true,
        archiveAfterDays: 365,
        deleteAfterDays: 2555,
        compressionEnabled: true,
        encryptionRequired: true,
        active: true,
        lastApplied: new Date(Date.now() - 172800000),
        recordsProcessed: 8967
      },
      {
        id: '3',
        name: 'Security Incident Logs',
        description: 'Security incidents and breach investigation data',
        categories: ['security'],
        dataClassification: ['restricted'],
        retentionDays: 3650,
        archiveEnabled: true,
        archiveAfterDays: 730,
        deleteAfterDays: 3650,
        compressionEnabled: true,
        encryptionRequired: true,
        active: true,
        lastApplied: new Date(Date.now() - 259200000),
        recordsProcessed: 1456
      }
    ]
    setRetentionPolicies(mockPolicies)
  }

  const loadAlertRules = async () => {
    const mockRules: AlertRule[] = [
      {
        id: '1',
        name: 'Failed Login Attempts',
        description: 'Alert on multiple failed login attempts',
        enabled: true,
        conditions: {
          levels: ['warning', 'error'],
          categories: ['authentication'],
          actions: ['user_login'],
          timeWindow: 300,
          threshold: 5,
          aggregationType: 'count'
        },
        notifications: {
          email: true,
          webhook: false,
          sms: true,
          channels: ['security-team']
        },
        actions: [
          { type: 'email', config: { template: 'failed_login_alert' } },
          { type: 'disable_user', config: { duration: 1800 } }
        ],
        lastTriggered: new Date(Date.now() - 1800000),
        triggerCount: 23,
        falsePositives: 2
      },
      {
        id: '2',
        name: 'Privilege Escalation',
        description: 'Alert on privilege escalation attempts',
        enabled: true,
        conditions: {
          levels: ['warning', 'error', 'critical'],
          categories: ['security'],
          actions: ['privilege_escalation'],
          riskLevels: ['high', 'critical'],
          timeWindow: 60,
          threshold: 1,
          aggregationType: 'count'
        },
        notifications: {
          email: true,
          webhook: true,
          sms: true,
          channels: ['security-team', 'management']
        },
        actions: [
          { type: 'email', config: { template: 'privilege_escalation_alert', urgent: true } },
          { type: 'webhook', config: { url: 'https://hooks.metrica.com/security' } },
          { type: 'escalate', config: { to: 'security-manager' } }
        ],
        lastTriggered: new Date(Date.now() - 86400000),
        triggerCount: 5,
        falsePositives: 0
      },
      {
        id: '3',
        name: 'Unusual Data Access',
        description: 'Alert on unusual data access patterns',
        enabled: true,
        conditions: {
          categories: ['data_access'],
          timeWindow: 3600,
          threshold: 100,
          aggregationType: 'count'
        },
        notifications: {
          email: true,
          webhook: false,
          sms: false,
          channels: ['data-team']
        },
        actions: [
          { type: 'email', config: { template: 'unusual_data_access' } }
        ],
        triggerCount: 12,
        falsePositives: 3
      }
    ]
    setAlertRules(mockRules)
  }

  const applyFilters = () => {
    let filtered = auditLogs

    if (filter.dateFrom) {
      filtered = filtered.filter(log => log.timestamp >= filter.dateFrom!)
    }
    if (filter.dateTo) {
      filtered = filtered.filter(log => log.timestamp <= filter.dateTo!)
    }
    if (filter.levels.length > 0) {
      filtered = filtered.filter(log => filter.levels.includes(log.level))
    }
    if (filter.categories.length > 0) {
      filtered = filtered.filter(log => filter.categories.includes(log.category))
    }
    if (filter.users.length > 0) {
      filtered = filtered.filter(log => filter.users.includes(log.user.email))
    }
    if (filter.sources.length > 0) {
      filtered = filtered.filter(log => filter.sources.includes(log.source))
    }
    if (filter.riskLevels.length > 0) {
      filtered = filtered.filter(log => filter.riskLevels.includes(log.risk))
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(term) ||
        log.entity.toLowerCase().includes(term) ||
        log.user.name.toLowerCase().includes(term) ||
        log.user.email.toLowerCase().includes(term) ||
        (log.details.context && log.details.context.toLowerCase().includes(term))
      )
    }
    if (filter.successOnly) {
      filtered = filtered.filter(log => log.success)
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0
      switch (sortBy) {
        case 'timestamp':
          compareValue = a.timestamp.getTime() - b.timestamp.getTime()
          break
        case 'user':
          compareValue = a.user.name.localeCompare(b.user.name)
          break
        case 'action':
          compareValue = a.action.localeCompare(b.action)
          break
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          compareValue = riskOrder[a.risk] - riskOrder[b.risk]
          break
      }
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    setFilteredLogs(filtered)
  }

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting audit logs as ${format}`)
  }

  const handleCreateComplianceReport = () => {
    console.log('Creating new compliance report')
  }

  const handleApplyRetentionPolicy = (policyId: string) => {
    console.log(`Applying retention policy: ${policyId}`)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'debug': return <Bug className="h-4 w-4 text-gray-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 border-green-200 bg-green-50'
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'high': return 'text-cyan-600 border-cyan-200 bg-cyan-50'
      case 'critical': return 'text-red-600 border-red-200 bg-red-50'
      default: return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'web': return <Globe className="h-4 w-4" />
      case 'api': return <Code className="h-4 w-4" />
      case 'cli': return <Terminal className="h-4 w-4" />
      case 'system': return <Server className="h-4 w-4" />
      case 'cron': return <Clock className="h-4 w-4" />
      case 'webhook': return <Webhook className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
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

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Manager</h1>
          <p className="text-muted-foreground">
            Sistema completo de auditoría y compliance - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Switch
              id="real-time"
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <Label htmlFor="real-time" className="text-sm">Real-time</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => loadAuditLogs()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={filter.searchTerm}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-8 w-80"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border rounded-md bg-background text-sm"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
                className="px-3 py-1 border rounded-md bg-background text-sm"
              >
                <option value="timestamp-desc">Newest first</option>
                <option value="timestamp-asc">Oldest first</option>
                <option value="user-asc">User A-Z</option>
                <option value="action-asc">Action A-Z</option>
                <option value="risk-desc">Highest risk</option>
              </select>
            </div>
          </div>

          {showAdvancedFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div>
                  <Label>Date From</Label>
                  <Input
                    type="datetime-local"
                    value={filter.dateFrom ? filter.dateFrom.toISOString().slice(0, -1) : ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div>
                  <Label>Date To</Label>
                  <Input
                    type="datetime-local"
                    value={filter.dateTo ? filter.dateTo.toISOString().slice(0, -1) : ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      dateTo: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div>
                  <Label>Levels</Label>
                  <div className="space-y-1 mt-1">
                    {['info', 'warning', 'error', 'critical', 'debug'].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`level-${level}`}
                          checked={filter.levels.includes(level)}
                          onChange={(e) => {
                            const newLevels = e.target.checked 
                              ? [...filter.levels, level]
                              : filter.levels.filter(l => l !== level)
                            setFilter(prev => ({ ...prev, levels: newLevels }))
                          }}
                        />
                        <Label htmlFor={`level-${level}`} className="text-sm capitalize">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Sources</Label>
                  <div className="space-y-1 mt-1">
                    {['web', 'api', 'cli', 'system', 'cron'].map(source => (
                      <div key={source} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`source-${source}`}
                          checked={filter.sources.includes(source)}
                          onChange={(e) => {
                            const newSources = e.target.checked 
                              ? [...filter.sources, source]
                              : filter.sources.filter(s => s !== source)
                            setFilter(prev => ({ ...prev, sources: newSources }))
                          }}
                        />
                        <Label htmlFor={`source-${source}`} className="text-sm capitalize">{source}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Risk Levels</Label>
                  <div className="space-y-1 mt-1">
                    {['low', 'medium', 'high', 'critical'].map(risk => (
                      <div key={risk} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`risk-${risk}`}
                          checked={filter.riskLevels.includes(risk)}
                          onChange={(e) => {
                            const newRisks = e.target.checked 
                              ? [...filter.riskLevels, risk]
                              : filter.riskLevels.filter(r => r !== risk)
                            setFilter(prev => ({ ...prev, riskLevels: newRisks }))
                          }}
                        />
                        <Label htmlFor={`risk-${risk}`} className="text-sm capitalize">{risk}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {paginatedLogs.map((log) => (
              <Card key={log.id} className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                selectedLogEntry?.id === log.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedLogEntry(selectedLogEntry?.id === log.id ? null : log)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{log.action.replace(/_/g, ' ').toUpperCase()}</h3>
                          <Badge variant="outline" className="text-xs">{log.category}</Badge>
                          <Badge variant="outline" className={cn("text-xs", getRiskColor(log.risk))}>
                            {log.risk}
                          </Badge>
                          {!log.success && <Badge variant="destructive" className="text-xs">Failed</Badge>}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>{log.user.name} ({log.user.email})</span>
                          <span>•</span>
                          <span>{log.entity} {log.entityId && `#${log.entityId}`}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getSourceIcon(log.source)}
                            <span className="capitalize">{log.source}</span>
                          </div>
                        </div>
                        {log.details.context && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {log.details.context}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(log.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.ip}
                      </p>
                    </div>
                  </div>
                  
                  {selectedLogEntry?.id === log.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Event Details</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">Timestamp:</span> {log.timestamp.toISOString()}</div>
                            <div><span className="font-medium">Correlation ID:</span> {log.correlationId}</div>
                            <div><span className="font-medium">Session ID:</span> {log.user.sessionId}</div>
                            <div><span className="font-medium">User Agent:</span> {log.user.userAgent}</div>
                            {log.details.duration && (
                              <div><span className="font-medium">Duration:</span> {log.details.duration}ms</div>
                            )}
                            {log.details.affectedRecords && (
                              <div><span className="font-medium">Affected Records:</span> {log.details.affectedRecords}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Compliance</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">Regulations:</span> {log.compliance.regulation?.join(', ')}</div>
                            <div><span className="font-medium">Classification:</span> {log.compliance.dataClassification}</div>
                            <div><span className="font-medium">Retention:</span> {log.compliance.retention} days</div>
                          </div>
                        </div>
                      </div>
                      
                      {(log.details.before || log.details.after) && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Data Changes</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {log.details.before && (
                              <div>
                                <p className="text-xs text-red-600 font-medium">Before:</p>
                                <pre className="text-xs bg-red-50 p-2 rounded border border-red-200 overflow-x-auto">
                                  {JSON.stringify(log.details.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.details.after && (
                              <div>
                                <p className="text-xs text-green-600 font-medium">After:</p>
                                <pre className="text-xs bg-green-50 p-2 rounded border border-green-200 overflow-x-auto">
                                  {JSON.stringify(log.details.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {log.details.errorMessage && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-red-600">Error Information</h4>
                          <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
                            <p className="font-medium">{log.details.errorMessage}</p>
                            {log.details.stackTrace && (
                              <pre className="mt-2 text-xs overflow-x-auto">
                                {log.details.stackTrace}
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {log.details.metadata && Object.keys(log.details.metadata).length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Metadata</h4>
                          <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
                            {JSON.stringify(log.details.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Audit Analytics</h2>
              <p className="text-muted-foreground">
                Análisis y métricas de logs de auditoría
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          {analytics && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Critical Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{analytics.eventsByLevel.critical}</div>
                    <div className="flex items-center text-xs text-red-600">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -5% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">High Risk Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-600">{analytics.riskDistribution.high}</div>
                    <div className="flex items-center text-xs text-cyan-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +3% from last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(analytics.eventsByUser).length}</div>
                    <div className="flex items-center text-xs text-blue-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.eventsByLevel).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(level)}
                            <span className="capitalize">{level}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count.toLocaleString()}</div>
                            <div className="w-32 bg-muted rounded-full h-2 mt-1">
                              <div 
                                className={cn(
                                  "h-2 rounded-full",
                                  level === 'info' && "bg-blue-500",
                                  level === 'warning' && "bg-yellow-500",
                                  level === 'error' && "bg-red-500",
                                  level === 'critical' && "bg-red-600"
                                )}
                                style={{ width: `${(count / analytics.totalEvents) * 100}%` }}
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
                    <CardTitle>Events by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.eventsByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                          <div className="text-right">
                            <div className="font-medium">{count.toLocaleString()}</div>
                            <div className="w-32 bg-muted rounded-full h-2 mt-1">
                              <div 
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${(count / analytics.totalEvents) * 100}%` }}
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
                    <CardTitle>Top Users by Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topUsers.map((user, index) => (
                        <div key={user.user} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 text-center text-sm text-muted-foreground">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.user}</p>
                              <p className="text-xs text-muted-foreground">
                                Risk Score: {user.riskScore.toFixed(1)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{user.count.toLocaleString()}</div>
                            <div className={cn(
                              "text-xs px-1 rounded",
                              user.riskScore <= 3 && "text-green-600 bg-green-100",
                              user.riskScore > 3 && user.riskScore <= 5 && "text-yellow-600 bg-yellow-100",
                              user.riskScore > 5 && "text-red-600 bg-red-100"
                            )}>
                              {user.riskScore <= 3 ? 'Low' : user.riskScore <= 5 ? 'Medium' : 'High'} Risk
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.riskDistribution).map(([risk, count]) => (
                        <div key={risk} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={cn("text-xs", getRiskColor(risk))}>
                              {risk}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {((count / analytics.totalEvents) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Event Trends (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-2">
                      <LineChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Event Trends Chart</p>
                      <p className="text-xs text-muted-foreground">Chart implementation placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Compliance Reports</h2>
              <p className="text-muted-foreground">
                Reportes de cumplimiento normativo
              </p>
            </div>
            <Button onClick={handleCreateComplianceReport}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>

          <div className="space-y-4">
            {complianceReports.map((report) => (
              <Card key={report.id} className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                selectedReport?.id === report.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>{report.name}</span>
                        <Badge variant="outline" className={cn(
                          report.status === 'approved' && "border-green-500 text-green-700",
                          report.status === 'pending' && "border-yellow-500 text-yellow-700",
                          report.status === 'rejected' && "border-red-500 text-red-700"
                        )}>
                          {report.status}
                        </Badge>
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{report.regulation}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.period.from.toLocaleDateString()} - {report.period.to.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-lg font-semibold">{report.metrics.totalEvents.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance Score</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">{report.metrics.complianceScore}%</p>
                        <Progress value={report.metrics.complianceScore} className="w-16 h-2" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Violations</p>
                      <p className="text-lg font-semibold text-red-600">{report.metrics.violations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remediated</p>
                      <p className="text-lg font-semibold text-green-600">{report.metrics.remediated}</p>
                    </div>
                  </div>

                  {selectedReport?.id === report.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Findings</h4>
                        <div className="space-y-3">
                          {report.findings.map((finding, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge variant="outline" className={cn(
                                      finding.severity === 'low' && "border-green-500 text-green-700",
                                      finding.severity === 'medium' && "border-yellow-500 text-yellow-700",
                                      finding.severity === 'high' && "border-cyan-500 text-cyan-700",
                                      finding.severity === 'critical' && "border-red-500 text-red-700"
                                    )}>
                                      {finding.severity}
                                    </Badge>
                                    <span className="font-medium">{finding.category}</span>
                                  </div>
                                  <p className="text-sm mb-2">{finding.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Recommendation:</strong> {finding.recommendation}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Affected Events</p>
                                  <p className="font-semibold">{finding.affectedEvents}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Created by</p>
                          <p className="font-medium">{report.createdBy}</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(report.createdAt)}</p>
                        </div>
                        {report.approvedBy && (
                          <div>
                            <p className="text-sm text-muted-foreground">Approved by</p>
                            <p className="font-medium">{report.approvedBy}</p>
                            <p className="text-xs text-muted-foreground">{report.approvedAt && formatTimeAgo(report.approvedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Data Retention Policies</h2>
              <p className="text-muted-foreground">
                Gestión de políticas de retención de datos
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {retentionPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.active}
                        onCheckedChange={() => {}}
                      />
                      {policy.active ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Retention:</span>
                      <div className="font-medium">{policy.retentionDays} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Archive:</span>
                      <div className="font-medium">{policy.archiveAfterDays} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categories:</span>
                      <div className="font-medium">{policy.categories.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Classification:</span>
                      <div className="font-medium">{policy.dataClassification.length}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Features</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center space-x-1">
                        {policy.archiveEnabled ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                        <span>Archive</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {policy.compressionEnabled ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                        <span>Compress</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {policy.encryptionRequired ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                        <span>Encrypt</span>
                      </div>
                    </div>
                  </div>

                  {policy.lastApplied && policy.recordsProcessed && (
                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      Last applied: {formatTimeAgo(policy.lastApplied)} 
                      <br />
                      Records processed: {policy.recordsProcessed.toLocaleString()}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleApplyRetentionPolicy(policy.id)}>
                      <Zap className="h-3 w-3 mr-1" />
                      Apply Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Alert Rules</h2>
              <p className="text-muted-foreground">
                Reglas de alertas automáticas
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Alert Rule
            </Button>
          </div>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => {}}
                      />
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Triggers: {rule.triggerCount}</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {rule.lastTriggered ? formatTimeAgo(rule.lastTriggered) : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Conditions</h4>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Time Window:</span> {rule.conditions.timeWindow}s</div>
                        <div><span className="font-medium">Threshold:</span> {rule.conditions.threshold}</div>
                        <div><span className="font-medium">Type:</span> {rule.conditions.aggregationType}</div>
                        {rule.conditions.levels && (
                          <div><span className="font-medium">Levels:</span> {rule.conditions.levels.join(', ')}</div>
                        )}
                        {rule.conditions.categories && (
                          <div><span className="font-medium">Categories:</span> {rule.conditions.categories.join(', ')}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Notifications</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1">
                          {rule.notifications.email ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                          <span>Email</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {rule.notifications.webhook ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                          <span>Webhook</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {rule.notifications.sms ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                          <span>SMS</span>
                        </div>
                        <div><span className="font-medium">Channels:</span> {rule.notifications.channels.join(', ')}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Accuracy:</span>
                          <span className="font-medium">
                            {(((rule.triggerCount - rule.falsePositives) / rule.triggerCount) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>False Positives:</span>
                          <span className="font-medium text-red-600">{rule.falsePositives}</span>
                        </div>
                        <Progress 
                          value={((rule.triggerCount - rule.falsePositives) / rule.triggerCount) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Rule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Test Rule
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Export & Archive</h2>
              <p className="text-muted-foreground">
                Exportación y archivo de logs de auditoría
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Audit Logs</CardTitle>
                <CardDescription>
                  Exportar logs filtrados en diferentes formatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF Report</option>
                  </select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input type="date" />
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <Label>Include Fields</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['timestamp', 'user', 'action', 'entity', 'risk', 'compliance'].map(field => (
                      <div key={field} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`field-${field}`}
                          className="rounded"
                          defaultChecked
                        />
                        <Label htmlFor={`field-${field}`} className="text-sm capitalize">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleExport(exportFormat)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Archive Management</CardTitle>
                <CardDescription>
                  Gestión de archivos y respaldos históricos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">2024 Q4 Archive</p>
                      <p className="text-xs text-muted-foreground">Oct - Dec 2024 • 2.3M events</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Compressed</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">2024 Q3 Archive</p>
                      <p className="text-xs text-muted-foreground">Jul - Sep 2024 • 1.8M events</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Encrypted</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">2024 Q2 Archive</p>
                      <p className="text-xs text-muted-foreground">Apr - Jun 2024 • 2.1M events</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Cold Storage</Badge>
                      <Button variant="ghost" size="sm" disabled>
                        <CloudDownload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Archive className="h-4 w-4 mr-2" />
                  Create Archive
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Audit Settings</h2>
              <p className="text-muted-foreground">
                Configuración del sistema de auditoría
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configuración general del sistema de auditoría
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Monitoreo en tiempo real</p>
                  </div>
                  <Switch
                    checked={realTimeEnabled}
                    onCheckedChange={setRealTimeEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value))}
                    min="1"
                    max="60"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log Compression</Label>
                    <p className="text-sm text-muted-foreground">Comprimir logs automáticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Encrypt Sensitive Data</Label>
                    <p className="text-sm text-muted-foreground">Encriptar datos sensibles</p>
                  </div>
                  <Switch defaultChecked />
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
                  <Label htmlFor="batch-size">Log Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    defaultValue={1000}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de logs procesados por lote
                  </p>
                </div>
                <div>
                  <Label htmlFor="index-interval">Index Optimization Interval (hours)</Label>
                  <Input
                    id="index-interval"
                    type="number"
                    defaultValue={24}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cache-ttl">Cache TTL (minutes)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    defaultValue={15}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>
                  Configuración de almacenamiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storage-path">Primary Storage Path</Label>
                  <Input
                    id="storage-path"
                    defaultValue="/var/log/audit"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="archive-path">Archive Storage Path</Label>
                  <Input
                    id="archive-path"
                    defaultValue="/var/log/audit/archive"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-file-size">Max Log File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    defaultValue={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-files">Max Files per Directory</Label>
                  <Input
                    id="max-files"
                    type="number"
                    defaultValue={1000}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Herramientas de mantenimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database Indexes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rebuild Search Index
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Force Archive Old Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Data Integrity
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}