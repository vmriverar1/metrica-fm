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
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Zap, Monitor, Cpu, Memory, HardDrive, Network, Database, Globe, Server, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Download, Upload, Save, RotateCcw, Copy, Eye, EyeOff, Plus, Trash2, Edit, Search, Filter, RefreshCw, FileText, Code, Key, Lock, Unlock, Settings, Activity, TrendingUp, TrendingDown, Users, UserCheck, UserX, Mail, MessageSquare, Bell, Smartphone, Workflow, GitBranch, GitCommit, GitMerge, Package, Layers, Component, Puzzle, ExternalLink, Power, PowerOff, Play, Pause, SkipForward, Rewind, Volume2, VolumeX, Wifi, WifiOff, Gauge, Target, Bug, Wrench, Cog, Archive, CloudDownload, CloudUpload, HelpCircle, Info, Star, Bookmark, Flag, Tag, Hash, AtSign, DollarSign, Percent, Minus, Plus as PlusIcon, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Terminal, Api, Webhook, Rss, BarChart, BarChart2, BarChart3, PieChart, LineChart, Timer, Stopwatch, FastForward, Maximize, Minimize, FlashIcon as Flash, Flame, TrendingUpIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface PerformanceMetric {
  id: string
  name: string
  category: 'system' | 'database' | 'network' | 'application' | 'user'
  currentValue: number
  previousValue: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: Date
  history: Array<{
    timestamp: Date
    value: number
  }>
}

interface OptimizationRule {
  id: string
  name: string
  description: string
  category: 'performance' | 'memory' | 'cpu' | 'database' | 'network' | 'cache'
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  condition: {
    metric: string
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number
    duration: number
  }
  action: {
    type: 'scale' | 'cleanup' | 'restart' | 'alert' | 'optimize' | 'cache'
    parameters: Record<string, any>
    autoExecute: boolean
  }
  schedule?: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly' | 'custom'
    cronExpression?: string
  }
  lastTriggered?: Date
  triggerCount: number
  successRate: number
}

interface SystemResource {
  id: string
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database'
  name: string
  current: {
    usage: number
    available: number
    total: number
  }
  limits: {
    warning: number
    critical: number
    maximum?: number
  }
  recommendations: string[]
  optimizations: Array<{
    type: string
    description: string
    impact: 'low' | 'medium' | 'high'
    effort: 'easy' | 'moderate' | 'complex'
    estimatedImprovement: number
  }>
  monitoring: {
    enabled: boolean
    interval: number
    alerts: boolean
  }
}

interface PerformanceProfile {
  id: string
  name: string
  description: string
  active: boolean
  settings: {
    cpuLimit: number
    memoryLimit: number
    diskIOLimit: number
    networkLimit: number
    connectionPoolSize: number
    cacheSize: number
    queryTimeout: number
    sessionTimeout: number
    maxConcurrentUsers: number
  }
  optimizations: string[]
  createdAt: Date
  lastApplied?: Date
  benchmarkResults?: {
    beforeScore: number
    afterScore: number
    improvement: number
  }
}

interface QueryOptimization {
  id: string
  query: string
  database: string
  executionTime: number
  frequency: number
  impact: 'low' | 'medium' | 'high'
  suggestions: Array<{
    type: 'index' | 'rewrite' | 'cache' | 'partition'
    description: string
    estimatedImprovement: number
    complexity: 'easy' | 'moderate' | 'complex'
  }>
  status: 'pending' | 'applied' | 'rejected'
  lastAnalyzed: Date
}

interface PerformanceAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'trend' | 'resource'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  metric: string
  currentValue: number
  thresholdValue?: number
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
  actions: Array<{
    type: string
    description: string
    executed: boolean
    result?: string
  }>
}

interface BenchmarkResult {
  id: string
  name: string
  type: 'load' | 'stress' | 'endurance' | 'spike' | 'volume'
  timestamp: Date
  duration: number
  configuration: {
    users: number
    requests: number
    rampUp: number
    thinkTime: number
  }
  results: {
    averageResponseTime: number
    throughput: number
    errorRate: number
    p95ResponseTime: number
    p99ResponseTime: number
    cpuUsage: number
    memoryUsage: number
    diskIO: number
    networkIO: number
  }
  status: 'completed' | 'failed' | 'running'
  recommendations: string[]
}

export default function PerformanceOptimizer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([])
  const [systemResources, setSystemResources] = useState<SystemResource[]>([])
  const [performanceProfiles, setPerformanceProfiles] = useState<PerformanceProfile[]>([])
  const [queryOptimizations, setQueryOptimizations] = useState<QueryOptimization[]>([])
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([])
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null)
  const [selectedRule, setSelectedRule] = useState<OptimizationRule | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<PerformanceProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [autoOptimization, setAutoOptimization] = useState(true)
  const [monitoringEnabled, setMonitoringEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    loadPerformanceData()
    if (monitoringEnabled) {
      const interval = setInterval(loadPerformanceData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [monitoringEnabled, refreshInterval])

  const loadPerformanceData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadPerformanceMetrics(),
      loadOptimizationRules(),
      loadSystemResources(),
      loadPerformanceProfiles(),
      loadQueryOptimizations(),
      loadPerformanceAlerts(),
      loadBenchmarkResults()
    ])
    setIsLoading(false)
  }

  const loadPerformanceMetrics = async () => {
    const mockMetrics: PerformanceMetric[] = [
      {
        id: '1',
        name: 'CPU Usage',
        category: 'system',
        currentValue: 73.2,
        previousValue: 68.5,
        unit: '%',
        threshold: { warning: 70, critical: 90 },
        trend: 'up',
        status: 'warning',
        lastUpdated: new Date(Date.now() - 30000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: Math.random() * 100
        }))
      },
      {
        id: '2',
        name: 'Memory Usage',
        category: 'system',
        currentValue: 85.7,
        previousValue: 82.3,
        unit: '%',
        threshold: { warning: 80, critical: 95 },
        trend: 'up',
        status: 'warning',
        lastUpdated: new Date(Date.now() - 45000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: 70 + Math.random() * 30
        }))
      },
      {
        id: '3',
        name: 'Disk I/O',
        category: 'system',
        currentValue: 156.8,
        previousValue: 134.2,
        unit: 'MB/s',
        threshold: { warning: 200, critical: 500 },
        trend: 'up',
        status: 'normal',
        lastUpdated: new Date(Date.now() - 60000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: 100 + Math.random() * 100
        }))
      },
      {
        id: '4',
        name: 'Response Time',
        category: 'application',
        currentValue: 234.5,
        previousValue: 189.3,
        unit: 'ms',
        threshold: { warning: 200, critical: 500 },
        trend: 'up',
        status: 'warning',
        lastUpdated: new Date(Date.now() - 15000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: 150 + Math.random() * 200
        }))
      },
      {
        id: '5',
        name: 'Database Connections',
        category: 'database',
        currentValue: 45,
        previousValue: 38,
        unit: 'connections',
        threshold: { warning: 80, critical: 100 },
        trend: 'up',
        status: 'normal',
        lastUpdated: new Date(Date.now() - 90000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: 20 + Math.random() * 60
        }))
      },
      {
        id: '6',
        name: 'Network Throughput',
        category: 'network',
        currentValue: 89.2,
        previousValue: 76.8,
        unit: 'Mbps',
        threshold: { warning: 800, critical: 950 },
        trend: 'up',
        status: 'normal',
        lastUpdated: new Date(Date.now() - 20000),
        history: Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (59 - i) * 60000),
          value: 50 + Math.random() * 100
        }))
      }
    ]
    setPerformanceMetrics(mockMetrics)
  }

  const loadOptimizationRules = async () => {
    const mockRules: OptimizationRule[] = [
      {
        id: '1',
        name: 'Auto Scale CPU',
        description: 'Automatically scale CPU resources when usage exceeds threshold',
        category: 'cpu',
        enabled: true,
        priority: 'high',
        condition: {
          metric: 'cpu_usage',
          operator: '>',
          value: 80,
          duration: 300
        },
        action: {
          type: 'scale',
          parameters: { scaleBy: 1.5, maxInstances: 10 },
          autoExecute: true
        },
        schedule: {
          enabled: false,
          frequency: 'hourly'
        },
        lastTriggered: new Date(Date.now() - 3600000),
        triggerCount: 23,
        successRate: 87.5
      },
      {
        id: '2',
        name: 'Memory Cleanup',
        description: 'Clean up unused memory objects and cache',
        category: 'memory',
        enabled: true,
        priority: 'medium',
        condition: {
          metric: 'memory_usage',
          operator: '>',
          value: 85,
          duration: 600
        },
        action: {
          type: 'cleanup',
          parameters: { type: 'memory', aggressiveness: 'moderate' },
          autoExecute: true
        },
        lastTriggered: new Date(Date.now() - 1800000),
        triggerCount: 15,
        successRate: 93.3
      },
      {
        id: '3',
        name: 'Database Connection Pool Optimization',
        description: 'Adjust database connection pool size based on load',
        category: 'database',
        enabled: true,
        priority: 'high',
        condition: {
          metric: 'db_connections',
          operator: '>',
          value: 70,
          duration: 180
        },
        action: {
          type: 'optimize',
          parameters: { poolSize: 'auto', maxConnections: 150 },
          autoExecute: false
        },
        triggerCount: 8,
        successRate: 75.0
      },
      {
        id: '4',
        name: 'Cache Prewarming',
        description: 'Preload frequently accessed data into cache',
        category: 'cache',
        enabled: true,
        priority: 'low',
        condition: {
          metric: 'cache_hit_rate',
          operator: '<',
          value: 80,
          duration: 900
        },
        action: {
          type: 'cache',
          parameters: { warmupQueries: ['popular_products', 'user_preferences'], timeout: 30000 },
          autoExecute: true
        },
        schedule: {
          enabled: true,
          frequency: 'daily'
        },
        triggerCount: 45,
        successRate: 94.4
      }
    ]
    setOptimizationRules(mockRules)
  }

  const loadSystemResources = async () => {
    const mockResources: SystemResource[] = [
      {
        id: '1',
        type: 'cpu',
        name: 'CPU Cores',
        current: { usage: 73.2, available: 26.8, total: 100 },
        limits: { warning: 70, critical: 90 },
        recommendations: [
          'Consider upgrading to higher CPU tier',
          'Optimize database queries to reduce CPU usage',
          'Implement query caching',
          'Review and optimize background processes'
        ],
        optimizations: [
          {
            type: 'Process Optimization',
            description: 'Identify and optimize CPU-intensive processes',
            impact: 'medium',
            effort: 'moderate',
            estimatedImprovement: 15
          },
          {
            type: 'Load Balancing',
            description: 'Distribute load across multiple instances',
            impact: 'high',
            effort: 'complex',
            estimatedImprovement: 35
          }
        ],
        monitoring: { enabled: true, interval: 30, alerts: true }
      },
      {
        id: '2',
        type: 'memory',
        name: 'RAM',
        current: { usage: 85.7, available: 14.3, total: 16384 },
        limits: { warning: 80, critical: 95, maximum: 32768 },
        recommendations: [
          'Increase available RAM',
          'Implement memory cleanup routines',
          'Optimize object lifecycle management',
          'Review memory leaks in application code'
        ],
        optimizations: [
          {
            type: 'Memory Cleanup',
            description: 'Implement automated memory cleanup',
            impact: 'medium',
            effort: 'easy',
            estimatedImprovement: 20
          },
          {
            type: 'Caching Strategy',
            description: 'Optimize caching to reduce memory usage',
            impact: 'high',
            effort: 'moderate',
            estimatedImprovement: 30
          }
        ],
        monitoring: { enabled: true, interval: 30, alerts: true }
      },
      {
        id: '3',
        type: 'disk',
        name: 'Storage',
        current: { usage: 67.8, available: 32.2, total: 1000 },
        limits: { warning: 80, critical: 95 },
        recommendations: [
          'Implement log rotation',
          'Archive old data',
          'Compress static assets',
          'Clean up temporary files'
        ],
        optimizations: [
          {
            type: 'Data Archival',
            description: 'Archive old data to cheaper storage',
            impact: 'high',
            effort: 'moderate',
            estimatedImprovement: 40
          },
          {
            type: 'Compression',
            description: 'Enable compression for logs and assets',
            impact: 'medium',
            effort: 'easy',
            estimatedImprovement: 25
          }
        ],
        monitoring: { enabled: true, interval: 300, alerts: true }
      },
      {
        id: '4',
        type: 'database',
        name: 'Database Performance',
        current: { usage: 45.2, available: 54.8, total: 100 },
        limits: { warning: 70, critical: 90 },
        recommendations: [
          'Add database indexes for slow queries',
          'Optimize connection pooling',
          'Implement query caching',
          'Consider database scaling'
        ],
        optimizations: [
          {
            type: 'Index Optimization',
            description: 'Create indexes for frequently used queries',
            impact: 'high',
            effort: 'moderate',
            estimatedImprovement: 45
          },
          {
            type: 'Query Optimization',
            description: 'Optimize slow-running queries',
            impact: 'medium',
            effort: 'complex',
            estimatedImprovement: 25
          }
        ],
        monitoring: { enabled: true, interval: 60, alerts: true }
      }
    ]
    setSystemResources(mockResources)
  }

  const loadPerformanceProfiles = async () => {
    const mockProfiles: PerformanceProfile[] = [
      {
        id: '1',
        name: 'High Performance',
        description: 'Optimized for maximum performance and speed',
        active: true,
        settings: {
          cpuLimit: 90,
          memoryLimit: 85,
          diskIOLimit: 500,
          networkLimit: 1000,
          connectionPoolSize: 100,
          cacheSize: 2048,
          queryTimeout: 30000,
          sessionTimeout: 7200,
          maxConcurrentUsers: 500
        },
        optimizations: ['aggressive_caching', 'connection_pooling', 'query_optimization'],
        createdAt: new Date('2024-01-15'),
        lastApplied: new Date(Date.now() - 86400000),
        benchmarkResults: {
          beforeScore: 7.2,
          afterScore: 8.9,
          improvement: 23.6
        }
      },
      {
        id: '2',
        name: 'Balanced',
        description: 'Balanced performance and resource usage',
        active: false,
        settings: {
          cpuLimit: 75,
          memoryLimit: 75,
          diskIOLimit: 300,
          networkLimit: 750,
          connectionPoolSize: 75,
          cacheSize: 1024,
          queryTimeout: 45000,
          sessionTimeout: 3600,
          maxConcurrentUsers: 300
        },
        optimizations: ['moderate_caching', 'connection_pooling'],
        createdAt: new Date('2024-02-01'),
        benchmarkResults: {
          beforeScore: 7.2,
          afterScore: 7.8,
          improvement: 8.3
        }
      },
      {
        id: '3',
        name: 'Resource Conservative',
        description: 'Minimize resource usage while maintaining functionality',
        active: false,
        settings: {
          cpuLimit: 60,
          memoryLimit: 60,
          diskIOLimit: 200,
          networkLimit: 500,
          connectionPoolSize: 50,
          cacheSize: 512,
          queryTimeout: 60000,
          sessionTimeout: 1800,
          maxConcurrentUsers: 150
        },
        optimizations: ['minimal_caching', 'resource_throttling'],
        createdAt: new Date('2024-03-01')
      }
    ]
    setPerformanceProfiles(mockProfiles)
  }

  const loadQueryOptimizations = async () => {
    const mockOptimizations: QueryOptimization[] = [
      {
        id: '1',
        query: 'SELECT * FROM users WHERE created_at > ? ORDER BY id DESC LIMIT 100',
        database: 'primary',
        executionTime: 2850,
        frequency: 1247,
        impact: 'high',
        suggestions: [
          {
            type: 'index',
            description: 'Add composite index on (created_at, id)',
            estimatedImprovement: 75,
            complexity: 'easy'
          },
          {
            type: 'rewrite',
            description: 'Use specific column selection instead of SELECT *',
            estimatedImprovement: 25,
            complexity: 'easy'
          }
        ],
        status: 'pending',
        lastAnalyzed: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        query: 'SELECT COUNT(*) FROM orders WHERE status IN (?, ?, ?) AND customer_id = ?',
        database: 'primary',
        executionTime: 1450,
        frequency: 892,
        impact: 'medium',
        suggestions: [
          {
            type: 'index',
            description: 'Add index on (customer_id, status)',
            estimatedImprovement: 60,
            complexity: 'easy'
          },
          {
            type: 'cache',
            description: 'Cache frequent customer order counts',
            estimatedImprovement: 85,
            complexity: 'moderate'
          }
        ],
        status: 'applied',
        lastAnalyzed: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        query: 'UPDATE products SET views = views + 1 WHERE id = ?',
        database: 'primary',
        executionTime: 890,
        frequency: 3456,
        impact: 'high',
        suggestions: [
          {
            type: 'rewrite',
            description: 'Batch updates or use async processing',
            estimatedImprovement: 70,
            complexity: 'moderate'
          },
          {
            type: 'cache',
            description: 'Use Redis for view counting',
            estimatedImprovement: 90,
            complexity: 'complex'
          }
        ],
        status: 'pending',
        lastAnalyzed: new Date(Date.now() - 1800000)
      }
    ]
    setQueryOptimizations(mockOptimizations)
  }

  const loadPerformanceAlerts = async () => {
    const mockAlerts: PerformanceAlert[] = [
      {
        id: '1',
        type: 'threshold',
        severity: 'warning',
        title: 'High CPU Usage Detected',
        message: 'CPU usage has exceeded 70% threshold for the past 5 minutes',
        metric: 'cpu_usage',
        currentValue: 73.2,
        thresholdValue: 70,
        timestamp: new Date(Date.now() - 300000),
        acknowledged: false,
        resolved: false,
        actions: [
          {
            type: 'scale',
            description: 'Auto-scale CPU resources',
            executed: false
          }
        ]
      },
      {
        id: '2',
        type: 'anomaly',
        severity: 'error',
        title: 'Memory Usage Spike',
        message: 'Unusual memory usage pattern detected - 30% increase in 2 minutes',
        metric: 'memory_usage',
        currentValue: 85.7,
        timestamp: new Date(Date.now() - 600000),
        acknowledged: true,
        resolved: false,
        actions: [
          {
            type: 'cleanup',
            description: 'Execute memory cleanup',
            executed: true,
            result: 'Reduced memory usage by 12%'
          }
        ]
      },
      {
        id: '3',
        type: 'trend',
        severity: 'warning',
        title: 'Response Time Degradation',
        message: 'Response time has been trending upward over the past hour',
        metric: 'response_time',
        currentValue: 234.5,
        thresholdValue: 200,
        timestamp: new Date(Date.now() - 900000),
        acknowledged: false,
        resolved: false,
        actions: [
          {
            type: 'optimize',
            description: 'Run query optimization',
            executed: false
          }
        ]
      }
    ]
    setPerformanceAlerts(mockAlerts)
  }

  const loadBenchmarkResults = async () => {
    const mockResults: BenchmarkResult[] = [
      {
        id: '1',
        name: 'Load Test - Peak Hours Simulation',
        type: 'load',
        timestamp: new Date(Date.now() - 86400000),
        duration: 1800,
        configuration: {
          users: 500,
          requests: 10000,
          rampUp: 300,
          thinkTime: 2000
        },
        results: {
          averageResponseTime: 245,
          throughput: 156.7,
          errorRate: 2.3,
          p95ResponseTime: 450,
          p99ResponseTime: 890,
          cpuUsage: 78.5,
          memoryUsage: 82.1,
          diskIO: 234.5,
          networkIO: 89.2
        },
        status: 'completed',
        recommendations: [
          'Optimize database queries to reduce response time',
          'Implement connection pooling',
          'Consider horizontal scaling for peak loads'
        ]
      },
      {
        id: '2',
        name: 'Stress Test - System Limits',
        type: 'stress',
        timestamp: new Date(Date.now() - 172800000),
        duration: 3600,
        configuration: {
          users: 1000,
          requests: 50000,
          rampUp: 600,
          thinkTime: 1000
        },
        results: {
          averageResponseTime: 456,
          throughput: 234.5,
          errorRate: 8.7,
          p95ResponseTime: 1200,
          p99ResponseTime: 2300,
          cpuUsage: 95.2,
          memoryUsage: 91.8,
          diskIO: 456.7,
          networkIO: 167.3
        },
        status: 'completed',
        recommendations: [
          'System approached limits at 1000 concurrent users',
          'Memory cleanup needed under high load',
          'Consider auto-scaling at 800 users'
        ]
      }
    ]
    setBenchmarkResults(mockResults)
  }

  const handleRunOptimization = async (ruleId: string) => {
    setIsOptimizing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(`Running optimization rule: ${ruleId}`)
    setIsOptimizing(false)
  }

  const handleApplyProfile = async (profileId: string) => {
    setIsLoading(true)
    setPerformanceProfiles(prev => prev.map(profile => ({
      ...profile,
      active: profile.id === profileId,
      lastApplied: profile.id === profileId ? new Date() : profile.lastApplied
    })))
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const handleRunBenchmark = () => {
    console.log('Running performance benchmark')
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setPerformanceAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const handleResolveAlert = (alertId: string) => {
    setPerformanceAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  const getMetricStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />
      default: return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="h-4 w-4" />
      case 'memory': return <Memory className="h-4 w-4" />
      case 'disk': return <HardDrive className="h-4 w-4" />
      case 'network': return <Network className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600 border-green-200 bg-green-50'
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'high': return 'text-red-600 border-red-200 bg-red-50'
      default: return 'text-gray-600 border-gray-200 bg-gray-50'
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const filteredAlerts = performanceAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    return matchesSearch && matchesSeverity
  })

  const activeProfile = performanceProfiles.find(p => p.active)
  const unacknowledgedAlerts = performanceAlerts.filter(a => !a.acknowledged).length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Optimizer</h1>
          <p className="text-muted-foreground">
            Optimización y monitoreo avanzado de rendimiento - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unacknowledgedAlerts > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{unacknowledgedAlerts} alerts</span>
            </Badge>
          )}
          <div className="flex items-center space-x-1">
            <Switch
              id="monitoring"
              checked={monitoringEnabled}
              onCheckedChange={setMonitoringEnabled}
            />
            <Label htmlFor="monitoring" className="text-sm">Real-time</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => loadPerformanceData()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleRunBenchmark}>
            <Gauge className="h-4 w-4 mr-2" />
            Run Benchmark
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="queries">Query Optimization</TabsTrigger>
          <TabsTrigger value="alerts">Alerts {unacknowledgedAlerts > 0 && <Badge className="ml-1 h-4 w-4 p-0 text-xs">{unacknowledgedAlerts}</Badge>}</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {performanceMetrics.slice(0, 6).map((metric) => (
              <Card key={metric.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    {getMetricStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.currentValue.toFixed(1)} {metric.unit}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className={cn(
                      "font-medium",
                      metric.currentValue > metric.previousValue ? "text-red-600" : "text-green-600"
                    )}>
                      {metric.currentValue > metric.previousValue ? '+' : ''}
                      {(((metric.currentValue - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
                    </span>
                    <span className="ml-2">{formatTimeAgo(metric.lastUpdated)}</span>
                  </div>
                  <Progress 
                    value={metric.category === 'system' ? metric.currentValue : (metric.currentValue / metric.threshold.critical) * 100} 
                    className={cn(
                      "mt-2 h-2",
                      metric.status === 'critical' && "bg-red-100 [&>div]:bg-red-500",
                      metric.status === 'warning' && "bg-yellow-100 [&>div]:bg-yellow-500"
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Active Optimizations</span>
                </CardTitle>
                <CardDescription>
                  Reglas de optimización activas y su rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationRules.filter(rule => rule.enabled).slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          rule.enabled ? "bg-green-500" : "bg-gray-400"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Triggered {rule.triggerCount} times | {rule.successRate.toFixed(1)}% success
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        rule.priority === 'critical' && "border-red-500 text-red-700",
                        rule.priority === 'high' && "border-orange-500 text-orange-700",
                        rule.priority === 'medium' && "border-yellow-500 text-yellow-700",
                        rule.priority === 'low' && "border-blue-500 text-blue-700"
                      )}>
                        {rule.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('optimization')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Optimizations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>System Resources</span>
                </CardTitle>
                <CardDescription>
                  Estado actual de recursos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemResources.map((resource) => (
                    <div key={resource.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource.type)}
                          <span className="text-sm font-medium capitalize">{resource.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {resource.current.usage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={resource.current.usage}
                        className={cn(
                          "h-2",
                          resource.current.usage > resource.limits.critical && "bg-red-100 [&>div]:bg-red-500",
                          resource.current.usage > resource.limits.warning && resource.current.usage <= resource.limits.critical && "bg-yellow-100 [&>div]:bg-yellow-500"
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Warning: {resource.limits.warning}%</span>
                        <span>Critical: {resource.limits.critical}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('resources')}>
                  <Monitor className="h-4 w-4 mr-2" />
                  View Resource Details
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Performance Profile</CardTitle>
                <CardDescription>
                  Perfil de rendimiento actualmente aplicado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{activeProfile.name}</h3>
                      <Badge variant="outline" className="text-green-700 border-green-500">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activeProfile.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">CPU Limit:</span>
                        <span className="ml-2 font-medium">{activeProfile.settings.cpuLimit}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory Limit:</span>
                        <span className="ml-2 font-medium">{activeProfile.settings.memoryLimit}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache Size:</span>
                        <span className="ml-2 font-medium">{activeProfile.settings.cacheSize}MB</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Users:</span>
                        <span className="ml-2 font-medium">{activeProfile.settings.maxConcurrentUsers}</span>
                      </div>
                    </div>
                    {activeProfile.benchmarkResults && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Performance Improvement:</p>
                        <p className="text-lg font-semibold text-green-600">
                          +{activeProfile.benchmarkResults.improvement.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active performance profile</p>
                )}
                <Button className="w-full mt-4" onClick={() => setActiveTab('profiles')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profiles
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Alertas de rendimiento recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceAlerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border",
                      !alert.acknowledged && "bg-muted/50"
                    )}>
                      {getMetricStatusIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('alerts')}>
                  <Bell className="h-4 w-4 mr-2" />
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Performance Metrics</h2>
              <p className="text-muted-foreground">
                Métricas detalladas de rendimiento del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id} className={cn(
                "cursor-pointer transition-all",
                selectedMetric?.id === metric.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedMetric(selectedMetric?.id === metric.id ? null : metric)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getMetricStatusIcon(metric.status)}
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="capitalize">{metric.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {metric.currentValue.toFixed(1)} {metric.unit}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        {getTrendIcon(metric.trend)}
                        <span className={cn(
                          metric.currentValue > metric.previousValue ? "text-red-600" : "text-green-600"
                        )}>
                          {(((metric.currentValue - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Warning Threshold</span>
                      <span>{metric.threshold.warning} {metric.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Critical Threshold</span>
                      <span>{metric.threshold.critical} {metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.currentValue / metric.threshold.critical) * 100} 
                      className={cn(
                        "h-3",
                        metric.status === 'critical' && "bg-red-100 [&>div]:bg-red-500",
                        metric.status === 'warning' && "bg-yellow-100 [&>div]:bg-yellow-500"
                      )}
                    />
                    
                    {selectedMetric?.id === metric.id && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-3">Performance History ({timeRange})</h4>
                        <div className="h-32 bg-muted rounded flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <LineChart className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">Chart: {metric.name} over time</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current:</span>
                            <div className="font-semibold">{metric.currentValue.toFixed(1)} {metric.unit}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Average:</span>
                            <div className="font-semibold">
                              {(metric.history.reduce((sum, h) => sum + h.value, 0) / metric.history.length).toFixed(1)} {metric.unit}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Peak:</span>
                            <div className="font-semibold">
                              {Math.max(...metric.history.map(h => h.value)).toFixed(1)} {metric.unit}
                            </div>
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

        <TabsContent value="optimization" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Optimization Rules</h2>
              <p className="text-muted-foreground">
                Reglas automáticas de optimización del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="auto-optimization"
                  checked={autoOptimization}
                  onCheckedChange={setAutoOptimization}
                />
                <Label htmlFor="auto-optimization" className="text-sm">Auto-optimization</Label>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {optimizationRules.map((rule) => (
              <Card key={rule.id} className={cn(
                "cursor-pointer transition-all",
                selectedRule?.id === rule.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedRule(selectedRule?.id === rule.id ? null : rule)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        rule.priority === 'critical' && "border-red-500 text-red-700",
                        rule.priority === 'high' && "border-orange-500 text-orange-700",
                        rule.priority === 'medium' && "border-yellow-500 text-yellow-700",
                        rule.priority === 'low' && "border-blue-500 text-blue-700"
                      )}>
                        {rule.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{rule.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Condition</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.condition.metric} {rule.condition.operator} {rule.condition.value} for {rule.condition.duration}s
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Action</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {rule.action.type} {rule.action.autoExecute ? '(Auto)' : '(Manual)'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Performance</h4>
                      <div className="text-sm">
                        <div>Triggered: {rule.triggerCount} times</div>
                        <div>Success Rate: {rule.successRate.toFixed(1)}%</div>
                        {rule.lastTriggered && (
                          <div className="text-xs text-muted-foreground">
                            Last: {formatTimeAgo(rule.lastTriggered)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedRule?.id === rule.id && (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Action Parameters</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <pre>{JSON.stringify(rule.action.parameters, null, 2)}</pre>
                        </div>
                      </div>
                      
                      {rule.schedule && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Schedule</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Switch checked={rule.schedule.enabled} />
                              <span className="capitalize">{rule.schedule.frequency}</span>
                            </div>
                            {rule.schedule.cronExpression && (
                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {rule.schedule.cronExpression}
                              </code>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRunOptimization(rule.id)
                          }}
                          disabled={isOptimizing}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          {isOptimizing ? 'Running...' : 'Run Now'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Logs
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Resources</h2>
              <p className="text-muted-foreground">
                Análisis y optimización de recursos del sistema
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </Button>
          </div>

          <div className="grid gap-6">
            {systemResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <CardDescription>
                          {resource.current.usage.toFixed(1)}% used of {resource.current.total.toLocaleString()} {resource.type === 'memory' ? 'MB' : resource.type === 'cpu' ? 'cores' : 'GB'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {resource.current.usage.toFixed(1)}%
                      </div>
                      <div className={cn(
                        "text-sm",
                        resource.current.usage > resource.limits.critical && "text-red-600",
                        resource.current.usage > resource.limits.warning && resource.current.usage <= resource.limits.critical && "text-yellow-600",
                        resource.current.usage <= resource.limits.warning && "text-green-600"
                      )}>
                        {resource.current.usage > resource.limits.critical ? 'Critical' :
                         resource.current.usage > resource.limits.warning ? 'Warning' : 'Normal'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Usage</span>
                      <span>{resource.current.usage.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={resource.current.usage}
                      className={cn(
                        "h-3",
                        resource.current.usage > resource.limits.critical && "bg-red-100 [&>div]:bg-red-500",
                        resource.current.usage > resource.limits.warning && resource.current.usage <= resource.limits.critical && "bg-yellow-100 [&>div]:bg-yellow-500"
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Warning: {resource.limits.warning}%</span>
                      <span>Critical: {resource.limits.critical}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {resource.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Available Optimizations</h4>
                    <div className="space-y-3">
                      {resource.optimizations.map((optimization, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{optimization.type}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={cn("text-xs", getImpactColor(optimization.impact))}>
                                {optimization.impact} impact
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {optimization.effort}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{optimization.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">
                              Est. improvement: {optimization.estimatedImprovement}%
                            </span>
                            <Button size="sm" variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              Apply
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
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Performance Profiles</h2>
              <p className="text-muted-foreground">
                Perfiles predefinidos de configuración de rendimiento
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {performanceProfiles.map((profile) => (
              <Card key={profile.id} className={cn(
                "cursor-pointer transition-all",
                profile.active && "ring-2 ring-green-500",
                selectedProfile?.id === profile.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedProfile(selectedProfile?.id === profile.id ? null : profile)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    {profile.active && <Badge className="bg-green-500">Active</Badge>}
                  </div>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">CPU Limit:</span>
                      <div className="font-medium">{profile.settings.cpuLimit}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory Limit:</span>
                      <div className="font-medium">{profile.settings.memoryLimit}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cache Size:</span>
                      <div className="font-medium">{profile.settings.cacheSize}MB</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Users:</span>
                      <div className="font-medium">{profile.settings.maxConcurrentUsers}</div>
                    </div>
                  </div>

                  {profile.benchmarkResults && (
                    <div className="pt-3 border-t">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Performance Improvement</p>
                        <p className="text-2xl font-bold text-green-600">
                          +{profile.benchmarkResults.improvement.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.benchmarkResults.beforeScore.toFixed(1)} → {profile.benchmarkResults.afterScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfile?.id === profile.id && (
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Detailed Settings</h4>
                        <div className="grid gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Disk I/O Limit:</span>
                            <span>{profile.settings.diskIOLimit} MB/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network Limit:</span>
                            <span>{profile.settings.networkLimit} Mbps</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Connection Pool:</span>
                            <span>{profile.settings.connectionPoolSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Query Timeout:</span>
                            <span>{profile.settings.queryTimeout}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Session Timeout:</span>
                            <span>{profile.settings.sessionTimeout}s</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Optimizations</h4>
                        <div className="flex flex-wrap gap-1">
                          {profile.optimizations.map(opt => (
                            <Badge key={opt} variant="secondary" className="text-xs">
                              {opt.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {!profile.active && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyProfile(profile.id)
                        }}
                        disabled={isLoading}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Apply Profile
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Clone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Query Optimization</h2>
              <p className="text-muted-foreground">
                Análisis y optimización de consultas de base de datos
              </p>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze Queries
            </Button>
          </div>

          <div className="space-y-4">
            {queryOptimizations.map((query) => (
              <Card key={query.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Query Optimization #{query.id}</CardTitle>
                      <CardDescription>
                        Database: {query.database} | Execution: {query.executionTime}ms | Frequency: {query.frequency}/day
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        getImpactColor(query.impact)
                      )}>
                        {query.impact} impact
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        query.status === 'applied' && "border-green-500 text-green-700",
                        query.status === 'pending' && "border-yellow-500 text-yellow-700",
                        query.status === 'rejected' && "border-red-500 text-red-700"
                      )}>
                        {query.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Query</h4>
                    <code className="block bg-muted p-3 rounded text-sm overflow-x-auto">
                      {query.query}
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">Optimization Suggestions</h4>
                    <div className="space-y-3">
                      {query.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">{suggestion.type}</Badge>
                              <span className="font-medium text-sm">{suggestion.description}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-green-600 font-medium">
                                {suggestion.estimatedImprovement}% faster
                              </span>
                              <Badge variant="outline" className="text-xs">{suggestion.complexity}</Badge>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Apply Suggestion
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>Last analyzed: {formatTimeAgo(query.lastAnalyzed)}</span>
                    <span>Potential impact: {query.impact}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Performance Alerts</h2>
              <p className="text-muted-foreground">
                Alertas y notificaciones de rendimiento
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "transition-all",
                !alert.acknowledged && "border-l-4 border-l-red-500 bg-red-50/50",
                alert.resolved && "opacity-60"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getMetricStatusIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{alert.title}</h3>
                          {!alert.acknowledged && <Badge variant="destructive" className="text-xs">New</Badge>}
                          {alert.resolved && <Badge variant="outline" className="text-xs">Resolved</Badge>}
                          <Badge variant="outline" className="text-xs capitalize">{alert.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Metric: {alert.metric}</span>
                          <span>Current: {alert.currentValue.toFixed(1)}</span>
                          {alert.thresholdValue && <span>Threshold: {alert.thresholdValue.toFixed(1)}</span>}
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                        
                        {alert.actions.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-xs mb-2">Actions</h4>
                            <div className="space-y-1">
                              {alert.actions.map((action, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                  {action.executed ? 
                                    <Check className="h-3 w-3 text-green-500" /> : 
                                    <Clock className="h-3 w-3 text-gray-400" />
                                  }
                                  <span>{action.description}</span>
                                  {action.result && (
                                    <span className="text-green-600">({action.result})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  No performance alerts found matching your criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Performance Benchmarks</h2>
              <p className="text-muted-foreground">
                Pruebas de rendimiento y resultados históricos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              <Button onClick={handleRunBenchmark}>
                <Play className="h-4 w-4 mr-2" />
                Run Benchmark
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {benchmarkResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <CardDescription>
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)} test | 
                        Duration: {formatDuration(result.duration)} | 
                        {formatTimeAgo(result.timestamp)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      result.status === 'completed' && "border-green-500 text-green-700",
                      result.status === 'failed' && "border-red-500 text-red-700",
                      result.status === 'running' && "border-blue-500 text-blue-700"
                    )}>
                      {result.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Test Configuration</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Virtual Users:</span>
                        <div className="font-medium">{result.configuration.users.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Requests:</span>
                        <div className="font-medium">{result.configuration.requests.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ramp-up Time:</span>
                        <div className="font-medium">{result.configuration.rampUp}s</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Think Time:</span>
                        <div className="font-medium">{result.configuration.thinkTime}ms</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Performance Results</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Avg Response Time</p>
                          <p className="text-2xl font-bold">{result.results.averageResponseTime}ms</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Throughput</p>
                          <p className="text-2xl font-bold">{result.results.throughput} req/s</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Error Rate</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            result.results.errorRate > 5 ? "text-red-600" : "text-green-600"
                          )}>
                            {result.results.errorRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">95th Percentile</p>
                          <p className="text-2xl font-bold">{result.results.p95ResponseTime}ms</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">CPU Usage</p>
                          <p className="text-2xl font-bold">{result.results.cpuUsage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Memory Usage</p>
                          <p className="text-2xl font-bold">{result.results.memoryUsage.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}