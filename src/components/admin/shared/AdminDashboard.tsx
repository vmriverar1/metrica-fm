'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, TrendingUp, TrendingDown, Users, FileText, Settings, Database, Zap, Bell, Shield, BarChart3, Activity, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Filter, Search, RefreshCw, Download, Upload, Eye, Edit, Trash2, Plus, MoreVertical, ChevronRight, ChevronDown, Home, Grid3X3, List, PieChart, LineChart, BarChart, Folder, FileVideo, FileImage, FileAudio, File, Cloud, HardDrive, Wifi, WifiOff, Server, Cpu, Memory, MonitorSpeaker, Volume2, VolumeX, Lock, Unlock, UserCheck, UserX, Mail, MessageSquare, Phone, Smartphone } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SystemMetrics {
  id: string
  name: string
  value: number
  unit: string
  change: number
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: Date
}

interface QuickAction {
  id: string
  name: string
  description: string
  icon: any
  category: string
  onClick: () => void
  disabled?: boolean
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: string
}

interface DashboardWidget {
  id: string
  name: string
  type: 'chart' | 'metric' | 'list' | 'status'
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
  data?: any
  refreshInterval?: number
}

interface UserActivity {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  timestamp: Date
  ip: string
  userAgent: string
  success: boolean
  details?: string
}

interface SystemStatus {
  id: string
  service: string
  status: 'online' | 'offline' | 'maintenance' | 'degraded'
  uptime: number
  responseTime: number
  lastCheck: Date
  url?: string
  version?: string
}

interface ResourceUsage {
  id: string
  type: 'cpu' | 'memory' | 'disk' | 'network'
  current: number
  maximum: number
  unit: string
  threshold: number
  history: Array<{ timestamp: Date; value: number }>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<SystemMetrics[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([])
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [darkMode, setDarkMode] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false)
  const [gridLayout, setGridLayout] = useState(true)

  useEffect(() => {
    loadDashboardData()
    setupAutoRefresh()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadDashboardData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadSystemMetrics(),
      loadQuickActions(),
      loadSystemAlerts(),
      loadDashboardWidgets(),
      loadUserActivities(),
      loadSystemStatus(),
      loadResourceUsage()
    ])
    setLastRefresh(new Date())
    setIsLoading(false)
  }

  const loadSystemMetrics = async () => {
    const mockMetrics: SystemMetrics[] = [
      {
        id: '1',
        name: 'Total Users',
        value: 1247,
        unit: 'users',
        change: 12.5,
        status: 'normal',
        lastUpdated: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        name: 'Active Sessions',
        value: 89,
        unit: 'sessions',
        change: -3.2,
        status: 'normal',
        lastUpdated: new Date(Date.now() - 60000)
      },
      {
        id: '3',
        name: 'System Load',
        value: 67.8,
        unit: '%',
        change: 8.1,
        status: 'warning',
        lastUpdated: new Date(Date.now() - 30000)
      },
      {
        id: '4',
        name: 'Storage Used',
        value: 85.2,
        unit: '%',
        change: 2.3,
        status: 'warning',
        lastUpdated: new Date(Date.now() - 120000)
      },
      {
        id: '5',
        name: 'API Requests',
        value: 15678,
        unit: 'req/h',
        change: 25.8,
        status: 'normal',
        lastUpdated: new Date(Date.now() - 90000)
      },
      {
        id: '6',
        name: 'Error Rate',
        value: 2.1,
        unit: '%',
        change: -15.3,
        status: 'critical',
        lastUpdated: new Date(Date.now() - 45000)
      }
    ]
    setMetrics(mockMetrics)
  }

  const loadQuickActions = async () => {
    const mockActions: QuickAction[] = [
      {
        id: '1',
        name: 'User Management',
        description: 'Manage users and permissions',
        icon: Users,
        category: 'users',
        onClick: () => setActiveTab('users')
      },
      {
        id: '2',
        name: 'System Analytics',
        description: 'View system performance metrics',
        icon: BarChart3,
        category: 'analytics',
        onClick: () => setActiveTab('analytics')
      },
      {
        id: '3',
        name: 'Media Library',
        description: 'Manage multimedia files',
        icon: Folder,
        category: 'media',
        onClick: () => setActiveTab('media')
      },
      {
        id: '4',
        name: 'Workflow Automation',
        description: 'Configure automated processes',
        icon: Zap,
        category: 'workflows',
        onClick: () => setActiveTab('workflows')
      },
      {
        id: '5',
        name: 'Notification Center',
        description: 'Manage system notifications',
        icon: Bell,
        category: 'notifications',
        onClick: () => setActiveTab('notifications')
      },
      {
        id: '6',
        name: 'Backup Management',
        description: 'Configure system backups',
        icon: Database,
        category: 'backups',
        onClick: () => setActiveTab('backups')
      },
      {
        id: '7',
        name: 'System Settings',
        description: 'Configure system parameters',
        icon: Settings,
        category: 'settings',
        onClick: () => setActiveTab('settings')
      },
      {
        id: '8',
        name: 'Security Audit',
        description: 'Review security logs',
        icon: Shield,
        category: 'security',
        onClick: () => setActiveTab('security')
      }
    ]
    setQuickActions(mockActions)
  }

  const loadSystemAlerts = async () => {
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'System CPU usage has exceeded 80% for the last 10 minutes',
        timestamp: new Date(Date.now() - 600000),
        read: false,
        category: 'performance'
      },
      {
        id: '2',
        type: 'error',
        title: 'Backup Failed',
        message: 'Daily backup job failed due to insufficient storage space',
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        category: 'backups'
      },
      {
        id: '3',
        type: 'info',
        title: 'New User Registration',
        message: '15 new users registered in the last hour',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        category: 'users'
      },
      {
        id: '4',
        type: 'success',
        title: 'Security Update Applied',
        message: 'Security patch v2.1.3 has been successfully applied',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        category: 'security'
      },
      {
        id: '5',
        type: 'warning',
        title: 'Storage Space Low',
        message: 'Available storage space is below 20%',
        timestamp: new Date(Date.now() - 900000),
        read: false,
        category: 'storage'
      }
    ]
    setSystemAlerts(mockAlerts)
  }

  const loadDashboardWidgets = async () => {
    const mockWidgets: DashboardWidget[] = [
      {
        id: '1',
        name: 'System Overview',
        type: 'metric',
        position: { x: 0, y: 0, w: 2, h: 1 },
        visible: true,
        refreshInterval: 30
      },
      {
        id: '2',
        name: 'Performance Chart',
        type: 'chart',
        position: { x: 2, y: 0, w: 2, h: 2 },
        visible: true,
        refreshInterval: 60
      },
      {
        id: '3',
        name: 'User Activity',
        type: 'list',
        position: { x: 0, y: 1, w: 2, h: 2 },
        visible: true,
        refreshInterval: 15
      },
      {
        id: '4',
        name: 'System Status',
        type: 'status',
        position: { x: 4, y: 0, w: 1, h: 1 },
        visible: true,
        refreshInterval: 10
      }
    ]
    setDashboardWidgets(mockWidgets)
  }

  const loadUserActivities = async () => {
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId: 'user-123',
        userName: 'John Doe',
        action: 'User Login',
        module: 'Authentication',
        timestamp: new Date(Date.now() - 300000),
        ip: '192.168.1.100',
        userAgent: 'Chrome 120.0',
        success: true
      },
      {
        id: '2',
        userId: 'user-456',
        userName: 'Jane Smith',
        action: 'File Upload',
        module: 'Media Library',
        timestamp: new Date(Date.now() - 600000),
        ip: '192.168.1.101',
        userAgent: 'Firefox 121.0',
        success: true,
        details: 'Uploaded presentation.pdf (2.3MB)'
      },
      {
        id: '3',
        userId: 'user-789',
        userName: 'Mike Johnson',
        action: 'Workflow Creation',
        module: 'Workflows',
        timestamp: new Date(Date.now() - 900000),
        ip: '192.168.1.102',
        userAgent: 'Safari 17.0',
        success: false,
        details: 'Failed to create workflow: Invalid configuration'
      },
      {
        id: '4',
        userId: 'user-321',
        userName: 'Sarah Wilson',
        action: 'Backup Execution',
        module: 'Backups',
        timestamp: new Date(Date.now() - 1200000),
        ip: '192.168.1.103',
        userAgent: 'Edge 120.0',
        success: true,
        details: 'Full backup completed successfully (15.7GB)'
      }
    ]
    setUserActivities(mockActivities)
  }

  const loadSystemStatus = async () => {
    const mockStatus: SystemStatus[] = [
      {
        id: '1',
        service: 'Web Server',
        status: 'online',
        uptime: 99.95,
        responseTime: 127,
        lastCheck: new Date(Date.now() - 30000),
        url: 'https://api.metrica.com',
        version: 'v2.1.3'
      },
      {
        id: '2',
        service: 'Database',
        status: 'online',
        uptime: 99.87,
        responseTime: 89,
        lastCheck: new Date(Date.now() - 45000),
        version: 'PostgreSQL 15.2'
      },
      {
        id: '3',
        service: 'File Storage',
        status: 'degraded',
        uptime: 98.23,
        responseTime: 456,
        lastCheck: new Date(Date.now() - 60000),
        url: 'https://storage.metrica.com',
        version: 'MinIO v2023.12.01'
      },
      {
        id: '4',
        service: 'Email Service',
        status: 'online',
        uptime: 99.99,
        responseTime: 234,
        lastCheck: new Date(Date.now() - 120000),
        version: 'Postfix 3.6'
      },
      {
        id: '5',
        service: 'Background Jobs',
        status: 'maintenance',
        uptime: 0,
        responseTime: 0,
        lastCheck: new Date(Date.now() - 300000),
        version: 'Redis Queue v4.2'
      }
    ]
    setSystemStatus(mockStatus)
  }

  const loadResourceUsage = async () => {
    const mockUsage: ResourceUsage[] = [
      {
        id: '1',
        type: 'cpu',
        current: 67.8,
        maximum: 100,
        unit: '%',
        threshold: 80,
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          value: Math.random() * 100
        }))
      },
      {
        id: '2',
        type: 'memory',
        current: 12.4,
        maximum: 16,
        unit: 'GB',
        threshold: 14,
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          value: Math.random() * 16
        }))
      },
      {
        id: '3',
        type: 'disk',
        current: 850.2,
        maximum: 1000,
        unit: 'GB',
        threshold: 900,
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          value: 800 + Math.random() * 200
        }))
      },
      {
        id: '4',
        type: 'network',
        current: 156.7,
        maximum: 1000,
        unit: 'Mbps',
        threshold: 800,
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          value: Math.random() * 1000
        }))
      }
    ]
    setResourceUsage(mockUsage)
  }

  const setupAutoRefresh = () => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData()
      }, refreshInterval * 1000)

      return () => clearInterval(interval)
    }
  }

  const handleRefreshData = () => {
    loadDashboardData()
  }

  const handleMarkAlertAsRead = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const handleDismissAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleToggleWidget = (widgetId: string) => {
    setDashboardWidgets(prev => prev.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    ))
  }

  const handleExportData = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data in ${format} format`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return 'text-green-500'
      case 'warning':
      case 'degraded':
        return 'text-yellow-500'
      case 'error':
      case 'critical':
      case 'offline':
        return 'text-red-500'
      case 'maintenance':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="h-4 w-4" />
      case 'memory':
        return <Memory className="h-4 w-4" />
      case 'disk':
        return <HardDrive className="h-4 w-4" />
      case 'network':
        return <Wifi className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
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

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const filteredMetrics = metrics.filter(metric => 
    metric.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAlerts = systemAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory
    const matchesAlertFilter = !showOnlyAlerts || !alert.read
    
    return matchesSearch && matchesCategory && matchesAlertFilter
  })

  const unreadAlertsCount = systemAlerts.filter(alert => !alert.read).length

  return (
    <div className={cn("space-y-6 p-6", darkMode && "dark")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de administración centralizado - Fase 3
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Última actualización: {formatTimeAgo(lastRefresh)}</span>
          </Badge>
          <div className="flex items-center space-x-1">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="alerts">Alerts {unreadAlertsCount > 0 && <Badge className="ml-1 h-4 w-4 p-0 text-xs">{unreadAlertsCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metrics.slice(0, 6).map((metric) => (
              <Card key={metric.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()} {metric.unit}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={metric.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="ml-2">{formatTimeAgo(metric.lastUpdated)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Accesos rápidos a funciones administrativas
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-3 justify-start"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.name}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>System Alerts</span>
                  {unreadAlertsCount > 0 && (
                    <Badge className="ml-2">{unreadAlertsCount}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Alertas y notificaciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {systemAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-lg border",
                          !alert.read && "bg-muted/50"
                        )}
                      >
                        {getStatusIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(alert.timestamp)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAlertAsRead(alert.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {systemAlerts.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setActiveTab('alerts')}
                  >
                    Ver todas las alertas ({systemAlerts.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>
                  Estado de los servicios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="text-sm font-medium">{service.service}</p>
                          <p className="text-xs text-muted-foreground">
                            Uptime: {service.uptime}% | Response: {service.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(service.status)}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Resource Usage</span>
                </CardTitle>
                <CardDescription>
                  Uso de recursos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceUsage.map((resource) => (
                    <div key={resource.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource.type)}
                          <span className="text-sm font-medium capitalize">{resource.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {resource.current} / {resource.maximum} {resource.unit}
                        </span>
                      </div>
                      <Progress
                        value={(resource.current / resource.maximum) * 100}
                        className={cn(
                          "h-2",
                          resource.current > resource.threshold && "bg-red-100"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Metrics</h2>
              <p className="text-muted-foreground">
                Métricas detalladas del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar métricas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={() => setGridLayout(!gridLayout)}>
                {gridLayout ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className={cn(
            "grid gap-4",
            gridLayout ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredMetrics.map((metric) => (
              <Card 
                key={metric.id}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all",
                  selectedMetric === metric.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">
                      {metric.value.toLocaleString()} <span className="text-lg text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={metric.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatTimeAgo(metric.lastUpdated)}
                      </span>
                    </div>
                    {selectedMetric === metric.id && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="h-20 bg-muted rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Mini chart placeholder</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className="ml-1" variant="outline">{metric.status}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Update:</span>
                            <span className="ml-1">{formatTimeAgo(metric.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Monitoring</h2>
              <p className="text-muted-foreground">
                Monitor en tiempo real de servicios y recursos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="time-range">Rango de tiempo:</Label>
                <select
                  id="time-range"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 border rounded-md bg-background"
                >
                  <option value="1h">1 hora</option>
                  <option value="6h">6 horas</option>
                  <option value="24h">24 horas</option>
                  <option value="7d">7 días</option>
                  <option value="30d">30 días</option>
                </select>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Status</CardTitle>
                <CardDescription>Estado actual de todos los servicios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {systemStatus.map((service) => (
                    <div key={service.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{service.service}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(service.status)}
                          <Badge variant="outline" className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <div className="font-medium">{service.uptime}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Response:</span>
                          <div className="font-medium">{service.responseTime}ms</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Version:</span>
                          <div className="font-medium text-xs">{service.version}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check:</span>
                          <div className="font-medium text-xs">{formatTimeAgo(service.lastCheck)}</div>
                        </div>
                      </div>
                      {service.url && (
                        <div className="pt-2 border-t">
                          <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                            {service.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage Trends</CardTitle>
                  <CardDescription>Tendencias de uso de recursos en las últimas {selectedTimeRange}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resourceUsage.map((resource) => (
                      <div key={resource.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(resource.type)}
                            <span className="font-medium capitalize">{resource.type}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {resource.current} / {resource.maximum} {resource.unit}
                          </div>
                        </div>
                        <Progress 
                          value={(resource.current / resource.maximum) * 100}
                          className={cn(
                            "h-3",
                            resource.current > resource.threshold && "bg-red-100 [&>div]:bg-red-500"
                          )}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0 {resource.unit}</span>
                          <span>Threshold: {resource.threshold} {resource.unit}</span>
                          <span>{resource.maximum} {resource.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Métricas de rendimiento del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-2">
                      <BarChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Performance Chart</p>
                      <p className="text-xs text-muted-foreground">Chart implementation placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">User Activities</h2>
              <p className="text-muted-foreground">
                Registro de actividades de usuarios del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={() => handleExportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Actividades recientes de usuarios en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.userName}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{activity.action}</span>
                        <span>•</span>
                        <span>{activity.module}</span>
                      </div>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.details}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                        <span>IP: {activity.ip}</span>
                        <span>•</span>
                        <span>{activity.userAgent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Alerts</h2>
              <p className="text-muted-foreground">
                Gestión de alertas y notificaciones del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-only-unread"
                  checked={showOnlyAlerts}
                  onCheckedChange={setShowOnlyAlerts}
                />
                <Label htmlFor="show-only-unread" className="text-sm">Solo no leídas</Label>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border rounded-md bg-background"
              >
                <option value="all">Todas las categorías</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="backups">Backups</option>
                <option value="users">Users</option>
                <option value="storage">Storage</option>
              </select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "transition-all",
                !alert.read && "border-l-4 border-l-primary bg-muted/20"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{alert.title}</h3>
                          {!alert.read && <Badge className="text-xs">NEW</Badge>}
                          <Badge variant="outline" className="text-xs">{alert.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                          <span>•</span>
                          <span className="capitalize">{alert.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAlertAsRead(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  No se encontraron alertas que coincidan con los filtros actuales.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="widgets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Widgets</h2>
              <p className="text-muted-foreground">
                Configuración y gestión de widgets del dashboard
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Widget
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardWidgets.map((widget) => (
              <Card key={widget.id} className={cn(
                "cursor-pointer transition-all",
                !widget.visible && "opacity-50",
                selectedWidget === widget.id && "ring-2 ring-primary"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{widget.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={widget.visible}
                        onCheckedChange={() => handleToggleWidget(widget.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge variant="outline" className="ml-1 text-xs">{widget.type}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Posición:</span>
                        <span className="ml-1 text-xs">
                          {widget.position.x},{widget.position.y}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tamaño:</span>
                        <span className="ml-1 text-xs">
                          {widget.position.w}x{widget.position.h}
                        </span>
                      </div>
                      {widget.refreshInterval && (
                        <div>
                          <span className="text-muted-foreground">Refresh:</span>
                          <span className="ml-1 text-xs">{widget.refreshInterval}s</span>
                        </div>
                      )}
                    </div>
                    <div className="h-20 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Widget Preview</span>
                    </div>
                    {selectedWidget === widget.id && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
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

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Reports</h2>
              <p className="text-muted-foreground">
                Generación y gestión de reportes del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Reporte
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>
                  Reportes rápidos predefinidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Reporte de Uso de Sistema (Última Semana)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Métricas de Rendimiento (Último Mes)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Actividad de Usuarios (Últimos 30 días)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Reporte de Seguridad (Trimestral)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Estado de Backups (Mensual)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription>
                  Crear reportes personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Nombre del Reporte</Label>
                  <Input id="report-name" placeholder="Mi reporte personalizado" />
                </div>
                <div>
                  <Label htmlFor="report-type">Tipo de Reporte</Label>
                  <select id="report-type" className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="performance">Performance</option>
                    <option value="usage">Usage</option>
                    <option value="security">Security</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="date-range">Rango de Fechas</Label>
                  <select id="date-range" className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="90d">Últimos 90 días</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <select id="format" className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                Historial de reportes generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          System Performance Report - {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated {formatTimeAgo(new Date(Date.now() - i * 86400000))} • 2.3 MB • PDF
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Settings</h2>
              <p className="text-muted-foreground">
                Configuración del dashboard y preferencias
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configuración general del dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Habilitar tema oscuro</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Vista compacta del dashboard</p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh-setting">Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Actualización automática de datos</p>
                  </div>
                  <Switch
                    id="auto-refresh-setting"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configuración de notificaciones y alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Recibir alertas por email</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notificaciones push en navegador</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alertas sonoras</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <Label htmlFor="alert-threshold">Alert Threshold</Label>
                  <select id="alert-threshold" className="w-full px-3 py-2 border rounded-md bg-background mt-1">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Only</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export Settings</CardTitle>
                <CardDescription>
                  Configuración de exportación de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-format">Default Export Format</Label>
                  <select id="default-format" className="w-full px-3 py-2 border rounded-md bg-background mt-1">
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select id="date-format" className="w-full px-3 py-2 border rounded-md bg-background mt-1">
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select id="timezone" className="w-full px-3 py-2 border rounded-md bg-background mt-1">
                    <option value="America/Lima">America/Lima (UTC-5)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Herramientas de mantenimiento del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Configuration
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Dashboard to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}