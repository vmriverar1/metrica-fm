'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Crown,
  Shield,
  Users,
  Settings,
  Database,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Server,
  HardDrive,
  Cpu,
  Memory,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Globe,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  FileText,
  Folder,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Info,
  Warning,
  AlertCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Loader2,
  ExternalLink,
  Home,
  Building,
  MapPin,
  Phone,
  Target,
  Layers,
  Grid,
  List,
  PieChart,
  LineChart,
  AreaChart
} from 'lucide-react'

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  services: {
    name: string
    status: 'online' | 'offline' | 'degraded'
    uptime: number
    responseTime: number
    errorRate: number
  }[]
  infrastructure: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  security: {
    threats: number
    vulnerabilities: number
    lastScan: Date
    complianceScore: number
  }
}

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  sessionsToday: number
  avgSessionDuration: number
  topLocations: { country: string; users: number }[]
  deviceBreakdown: { type: string; percentage: number }[]
  userGrowth: { period: string; users: number }[]
}

interface SystemMetrics {
  requests: {
    total: number
    successful: number
    failed: number
    avgResponseTime: number
    peakRpm: number
  }
  database: {
    connections: number
    queries: number
    slowQueries: number
    cacheHitRate: number
    storage: { used: number; total: number }
  }
  security: {
    blockedAttacks: number
    suspiciousActivity: number
    failedLogins: number
    dataBreaches: number
  }
}

interface AdminActivity {
  id: string
  adminId: string
  adminName: string
  action: string
  resource: string
  details: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'pending'
  impact: 'low' | 'medium' | 'high' | 'critical'
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
  assignedTo?: string
}

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'system' | 'users' | 'security' | 'maintenance'
  enabled: boolean
  action: () => void
}

interface AdminStats {
  totalAdmins: number
  activeAdmins: number
  onlineAdmins: number
  recentActions: number
  permissions: {
    superAdmin: number
    admin: number
    moderator: number
    support: number
  }
}

export default function MasterAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    services: [],
    infrastructure: { cpu: 0, memory: 0, disk: 0, network: 0 },
    security: { threats: 0, vulnerabilities: 0, lastScan: new Date(), complianceScore: 0 }
  })
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    sessionsToday: 0,
    avgSessionDuration: 0,
    topLocations: [],
    deviceBreakdown: [],
    userGrowth: []
  })
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    requests: { total: 0, successful: 0, failed: 0, avgResponseTime: 0, peakRpm: 0 },
    database: { connections: 0, queries: 0, slowQueries: 0, cacheHitRate: 0, storage: { used: 0, total: 0 } },
    security: { blockedAttacks: 0, suspiciousActivity: 0, failedLogins: 0, dataBreaches: 0 }
  })
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    onlineAdmins: 0,
    recentActions: 0,
    permissions: { superAdmin: 0, admin: 0, moderator: 0, support: 0 }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [viewMode, setViewMode] = useState<'cards' | 'detailed' | 'compact'>('cards')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [alertFilter, setAlertFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const quickActions: QuickAction[] = [
    {
      id: 'system-restart',
      name: 'Restart Services',
      description: 'Restart critical system services',
      icon: RefreshCw,
      category: 'system',
      enabled: true,
      action: () => console.log('Restarting services...')
    },
    {
      id: 'maintenance-mode',
      name: 'Maintenance Mode',
      description: 'Enable system maintenance mode',
      icon: Settings,
      category: 'maintenance',
      enabled: true,
      action: () => console.log('Enabling maintenance mode...')
    },
    {
      id: 'security-scan',
      name: 'Security Scan',
      description: 'Run immediate security vulnerability scan',
      icon: Shield,
      category: 'security',
      enabled: true,
      action: () => console.log('Starting security scan...')
    },
    {
      id: 'backup-system',
      name: 'System Backup',
      description: 'Create full system backup',
      icon: Database,
      category: 'maintenance',
      enabled: true,
      action: () => console.log('Starting system backup...')
    },
    {
      id: 'clear-cache',
      name: 'Clear Cache',
      description: 'Clear all application caches',
      icon: Trash2,
      category: 'system',
      enabled: true,
      action: () => console.log('Clearing caches...')
    },
    {
      id: 'user-cleanup',
      name: 'User Cleanup',
      description: 'Clean up inactive user accounts',
      icon: Users,
      category: 'users',
      enabled: true,
      action: () => console.log('Cleaning up users...')
    }
  ]

  const loadSystemHealth = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockHealth: SystemHealth = {
        overall: Math.random() > 0.8 ? 'warning' : 'healthy',
        services: [
          {
            name: 'Web Server',
            status: 'online',
            uptime: 99.98,
            responseTime: 145,
            errorRate: 0.02
          },
          {
            name: 'Database',
            status: 'online',
            uptime: 99.95,
            responseTime: 23,
            errorRate: 0.01
          },
          {
            name: 'Cache Service',
            status: 'online',
            uptime: 99.99,
            responseTime: 5,
            errorRate: 0.001
          },
          {
            name: 'Background Jobs',
            status: Math.random() > 0.9 ? 'degraded' : 'online',
            uptime: 98.5,
            responseTime: 1200,
            errorRate: 1.5
          },
          {
            name: 'File Storage',
            status: 'online',
            uptime: 99.97,
            responseTime: 89,
            errorRate: 0.03
          },
          {
            name: 'Email Service',
            status: 'online',
            uptime: 99.2,
            responseTime: 340,
            errorRate: 0.8
          }
        ],
        infrastructure: {
          cpu: Math.floor(Math.random() * 30) + 15,
          memory: Math.floor(Math.random() * 40) + 30,
          disk: Math.floor(Math.random() * 25) + 45,
          network: Math.floor(Math.random() * 20) + 10
        },
        security: {
          threats: Math.floor(Math.random() * 5),
          vulnerabilities: Math.floor(Math.random() * 8) + 2,
          lastScan: new Date(Date.now() - Math.random() * 86400000),
          complianceScore: Math.floor(Math.random() * 15) + 85
        }
      }
      
      setSystemHealth(mockHealth)
    } catch (error) {
      console.error('Error loading system health:', error)
    }
  }, [])

  const loadUserMetrics = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const mockUserMetrics: UserMetrics = {
        totalUsers: 15847,
        activeUsers: 3421,
        newUsers: 127,
        sessionsToday: 8934,
        avgSessionDuration: 18.5,
        topLocations: [
          { country: 'Peru', users: 8934 },
          { country: 'Colombia', users: 2156 },
          { country: 'Chile', users: 1847 },
          { country: 'Ecuador', users: 1234 },
          { country: 'Bolivia', users: 876 }
        ],
        deviceBreakdown: [
          { type: 'Desktop', percentage: 45.6 },
          { type: 'Mobile', percentage: 38.2 },
          { type: 'Tablet', percentage: 16.2 }
        ],
        userGrowth: [
          { period: 'Jan', users: 12500 },
          { period: 'Feb', users: 13200 },
          { period: 'Mar', users: 13800 },
          { period: 'Apr', users: 14500 },
          { period: 'May', users: 15100 },
          { period: 'Jun', users: 15847 }
        ]
      }
      
      setUserMetrics(mockUserMetrics)
    } catch (error) {
      console.error('Error loading user metrics:', error)
    }
  }, [])

  const loadSystemMetrics = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const mockSystemMetrics: SystemMetrics = {
        requests: {
          total: 2456789,
          successful: 2398234,
          failed: 58555,
          avgResponseTime: 287,
          peakRpm: 15420
        },
        database: {
          connections: 145,
          queries: 89234567,
          slowQueries: 234,
          cacheHitRate: 94.7,
          storage: { used: 1.2, total: 2.0 }
        },
        security: {
          blockedAttacks: 1247,
          suspiciousActivity: 89,
          failedLogins: 456,
          dataBreaches: 0
        }
      }
      
      setSystemMetrics(mockSystemMetrics)
    } catch (error) {
      console.error('Error loading system metrics:', error)
    }
  }, [])

  const loadAdminActivities = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockActivities: AdminActivity[] = [
        {
          id: '1',
          adminId: 'admin_001',
          adminName: 'John Smith',
          action: 'User Account Disabled',
          resource: 'User Management',
          details: 'Disabled user account: user@example.com due to suspicious activity',
          timestamp: new Date(Date.now() - 300000),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/118.0.0.0',
          status: 'success',
          impact: 'medium'
        },
        {
          id: '2',
          adminId: 'admin_002',
          adminName: 'Sarah Connor',
          action: 'System Configuration Updated',
          resource: 'System Settings',
          details: 'Updated security policy settings: password complexity requirements',
          timestamp: new Date(Date.now() - 900000),
          ipAddress: '192.168.1.101',
          userAgent: 'Firefox/119.0',
          status: 'success',
          impact: 'high'
        },
        {
          id: '3',
          adminId: 'admin_003',
          adminName: 'Mike Johnson',
          action: 'Database Backup Created',
          resource: 'Database Management',
          details: 'Created full database backup: backup_20240120_143022.sql',
          timestamp: new Date(Date.now() - 1800000),
          ipAddress: '192.168.1.102',
          userAgent: 'Chrome/118.0.0.0',
          status: 'success',
          impact: 'low'
        },
        {
          id: '4',
          adminId: 'admin_001',
          adminName: 'John Smith',
          action: 'API Key Revoked',
          resource: 'API Management',
          details: 'Revoked API key: sk_live_xxx...xxx for security reasons',
          timestamp: new Date(Date.now() - 3600000),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/118.0.0.0',
          status: 'success',
          impact: 'medium'
        },
        {
          id: '5',
          adminId: 'admin_004',
          adminName: 'Lisa Anderson',
          action: 'Security Scan Initiated',
          resource: 'Security Center',
          details: 'Started comprehensive security vulnerability scan',
          timestamp: new Date(Date.now() - 7200000),
          ipAddress: '192.168.1.103',
          userAgent: 'Safari/17.0',
          status: 'success',
          impact: 'low'
        }
      ]
      
      setAdminActivities(mockActivities)
    } catch (error) {
      console.error('Error loading admin activities:', error)
    }
  }, [])

  const loadSystemAlerts = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High CPU Usage',
          message: 'CPU usage has exceeded 85% for the last 15 minutes',
          source: 'Infrastructure Monitor',
          timestamp: new Date(Date.now() - 900000),
          acknowledged: false,
          resolved: false
        },
        {
          id: '2',
          type: 'error',
          title: 'Failed Login Attempts',
          message: 'Multiple failed login attempts detected from IP: 203.0.113.45',
          source: 'Security Monitor',
          timestamp: new Date(Date.now() - 1800000),
          acknowledged: true,
          resolved: false,
          assignedTo: 'Security Team'
        },
        {
          id: '3',
          type: 'info',
          title: 'Scheduled Backup Complete',
          message: 'Daily database backup completed successfully',
          source: 'Backup Service',
          timestamp: new Date(Date.now() - 3600000),
          acknowledged: true,
          resolved: true
        },
        {
          id: '4',
          type: 'critical',
          title: 'Service Degradation',
          message: 'Background job processing service showing degraded performance',
          source: 'Service Monitor',
          timestamp: new Date(Date.now() - 5400000),
          acknowledged: false,
          resolved: false
        },
        {
          id: '5',
          type: 'warning',
          title: 'Disk Space Warning',
          message: 'Disk usage on /var/log partition has reached 78%',
          source: 'Storage Monitor',
          timestamp: new Date(Date.now() - 7200000),
          acknowledged: true,
          resolved: false,
          assignedTo: 'DevOps Team'
        }
      ]
      
      setSystemAlerts(mockAlerts)
    } catch (error) {
      console.error('Error loading system alerts:', error)
    }
  }, [])

  const loadAdminStats = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockStats: AdminStats = {
        totalAdmins: 24,
        activeAdmins: 18,
        onlineAdmins: 7,
        recentActions: 156,
        permissions: {
          superAdmin: 3,
          admin: 8,
          moderator: 9,
          support: 4
        }
      }
      
      setAdminStats(mockStats)
    } catch (error) {
      console.error('Error loading admin stats:', error)
    }
  }, [])

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          loadSystemHealth(),
          loadUserMetrics(),
          loadSystemMetrics(),
          loadAdminActivities(),
          loadSystemAlerts(),
          loadAdminStats()
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [loadSystemHealth, loadUserMetrics, loadSystemMetrics, loadAdminActivities, loadSystemAlerts, loadAdminStats])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSystemHealth()
        loadUserMetrics()
        loadSystemMetrics()
        loadAdminActivities()
        loadSystemAlerts()
      }, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, loadSystemHealth, loadUserMetrics, loadSystemMetrics, loadAdminActivities, loadSystemAlerts])

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
      case 'offline': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <Badge variant="outline" className={colors[impact as keyof typeof colors]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)}
      </Badge>
    )
  }

  const filteredAlerts = systemAlerts.filter(alert => {
    const matchesType = alertFilter === 'all' || alert.type === alertFilter
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleAcknowledgeAlert = (alertId: string) => {
    setSystemAlerts(alerts => 
      alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
  }

  const handleResolveAlert = (alertId: string) => {
    setSystemAlerts(alerts => 
      alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true, acknowledged: true }
          : alert
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Crown className="h-8 w-8 text-yellow-600" />
            <span>Master Admin Panel</span>
          </h2>
          <p className="text-muted-foreground">
            Comprehensive system overview and administrative controls
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm">View:</Label>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'detailed' | 'compact')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">Cards</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Refresh:</Label>
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              loadSystemHealth()
              loadUserMetrics()
              loadSystemMetrics()
              loadAdminActivities()
              loadSystemAlerts()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${getHealthColor(systemHealth.overall)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon(systemHealth.overall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealth.overall}</div>
            <p className="text-xs text-muted-foreground">
              {systemHealth.services.filter(s => s.status === 'online').length}/{systemHealth.services.length} services online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{userMetrics.newUsers} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.infrastructure.cpu}%</div>
            <p className="text-xs text-muted-foreground">
              CPU usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.security.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Compliance score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="users">Users & Sessions</TabsTrigger>
          <TabsTrigger value="security">Security Center</TabsTrigger>
          <TabsTrigger value="activities">Admin Activities</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="controls">Quick Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>System Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    systemHealth.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getHealthIcon(service.status)}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.responseTime}ms avg response
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{service.uptime}%</div>
                          <div className="text-xs text-muted-foreground">uptime</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Requests (24h)</span>
                      <span>{systemMetrics.requests.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Success Rate</span>
                      <span>{((systemMetrics.requests.successful / systemMetrics.requests.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(systemMetrics.requests.successful / systemMetrics.requests.total) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Cache Hit Rate</span>
                      <span>{systemMetrics.database.cacheHitRate}%</span>
                    </div>
                    <Progress value={systemMetrics.database.cacheHitRate} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Used</span>
                      <span>{systemMetrics.database.storage.used}TB / {systemMetrics.database.storage.total}TB</span>
                    </div>
                    <Progress value={(systemMetrics.database.storage.used / systemMetrics.database.storage.total) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Administrator Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{adminStats.totalAdmins}</div>
                  <div className="text-sm text-muted-foreground">Total Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{adminStats.onlineAdmins}</div>
                  <div className="text-sm text-muted-foreground">Online Now</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{adminStats.recentActions}</div>
                  <div className="text-sm text-muted-foreground">Recent Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{adminStats.permissions.superAdmin}</div>
                  <div className="text-sm text-muted-foreground">Super Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">{adminStats.permissions.admin}</div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.infrastructure.cpu}%</div>
                <Progress value={systemHealth.infrastructure.cpu} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemHealth.infrastructure.cpu < 70 ? 'Normal' : 'High usage'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Memory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.infrastructure.memory}%</div>
                <Progress value={systemHealth.infrastructure.memory} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  8.2GB / 16GB used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.infrastructure.disk}%</div>
                <Progress value={systemHealth.infrastructure.disk} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  1.4TB / 2TB used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.infrastructure.network}%</div>
                <Progress value={systemHealth.infrastructure.network} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  145 Mbps avg
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Connections</span>
                    <Badge variant="outline">{systemMetrics.database.connections}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Queries (24h)</span>
                    <Badge variant="outline">{systemMetrics.database.queries.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Slow Queries</span>
                    <Badge variant="outline" className="text-yellow-600">{systemMetrics.database.slowQueries}</Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache Hit Rate</span>
                      <span>{systemMetrics.database.cacheHitRate}%</span>
                    </div>
                    <Progress value={systemMetrics.database.cacheHitRate} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blocked Attacks (24h)</span>
                    <Badge variant="outline" className="text-red-600">{systemMetrics.security.blockedAttacks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Suspicious Activity</span>
                    <Badge variant="outline" className="text-yellow-600">{systemMetrics.security.suspiciousActivity}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Logins</span>
                    <Badge variant="outline" className="text-cyan-600">{systemMetrics.security.failedLogins}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Breaches</span>
                    <Badge variant="outline" className={systemMetrics.security.dataBreaches === 0 ? 'text-green-600' : 'text-red-600'}>
                      {systemMetrics.security.dataBreaches}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userMetrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{userMetrics.newUsers} new users today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userMetrics.sessionsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {userMetrics.avgSessionDuration.toFixed(1)} min avg duration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userMetrics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Users currently online
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userMetrics.topLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{location.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{location.users.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((location.users / userMetrics.totalUsers) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userMetrics.deviceBreakdown.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {device.type === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.type === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.type === 'Tablet' && <Tablet className="h-4 w-4" />}
                          <span>{device.type}</span>
                        </div>
                        <span>{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{systemHealth.security.threats}</div>
                <p className="text-xs text-muted-foreground">
                  Detected threats
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                <Shield className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{systemHealth.security.vulnerabilities}</div>
                <p className="text-xs text-muted-foreground">
                  Known vulnerabilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemHealth.security.complianceScore}%</div>
                <Progress value={systemHealth.security.complianceScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {systemHealth.security.lastScan.toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor((Date.now() - systemHealth.security.lastScan.getTime()) / (1000 * 60 * 60))} hours ago
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Events (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Blocked Attacks</span>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      {systemMetrics.security.blockedAttacks}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Suspicious Activity</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      {systemMetrics.security.suspiciousActivity}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm">Failed Logins</span>
                    </div>
                    <Badge variant="outline" className="text-cyan-600">
                      {systemMetrics.security.failedLogins}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Data Breaches</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {systemMetrics.security.dataBreaches}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Run Security Scan
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Update Security Policies
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Security Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Threats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Admin Activities</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.adminName}</div>
                          <div className="text-sm text-muted-foreground">{activity.adminId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {activity.details}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.resource}</TableCell>
                      <TableCell>{getImpactBadge(activity.impact)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {activity.timestamp.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={activity.status === 'success' ? 'text-green-600' : 'text-red-600'}
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Alert Settings
            </Button>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant="outline" className={
                            alert.type === 'critical' ? 'text-red-600' :
                            alert.type === 'error' ? 'text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }>
                            {alert.type}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-green-600">
                              Acknowledged
                            </Badge>
                          )}
                          {alert.resolved && (
                            <Badge variant="outline" className="text-gray-600">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Source: {alert.source}</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                          {alert.assignedTo && <span>Assigned to: {alert.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{action.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {action.category}
                      </Badge>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={action.enabled ? 'text-green-600' : 'text-gray-600'}
                    >
                      {action.enabled ? 'Available' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled={!action.enabled}
                    onClick={action.action}
                  >
                    Execute Action
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform bulk operations across multiple system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart All Services
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Full System Backup
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Audit
                  </Button>
                </div>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    User Data Export
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    System Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Reset Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}