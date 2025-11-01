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
import { AlertCircle, Globe, Server, Database, Network, Shield, Zap, Clock, CheckCircle, XCircle, AlertTriangle, Download, Upload, Save, RefreshCw, Search, Filter, Plus, Edit, Trash2, Settings, Bell, Target, Bug, Wrench, Terminal, Code, Key, Lock, Unlock, Users, User, Mail, MessageSquare, Phone, Smartphone, Calendar, Timer, BarChart3, PieChart, LineChart, FileText, File, Folder, Archive, CloudDownload, CloudUpload, ExternalLink, Link2, Layers, Package, Component, Puzzle, GitBranch, GitCommit, Power, PowerOff, Play, Pause, SkipForward, Rewind, Volume2, VolumeX, Info, Star, Bookmark, Flag, Tag, Hash, AtSign, DollarSign, Percent, Minus, Plus as PlusIcon, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Activity, TrendingUp, TrendingDown, Eye, EyeOff, Route, Workflow, Gauge, Monitor, Cpu, Memory, HardDrive, Wifi, WifiOff, Api, Webhook, Rss, Copy } from 'lucide-react'
import { cn } from "@/lib/utils"

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
  description: string
  version: string
  status: 'active' | 'deprecated' | 'beta' | 'maintenance' | 'disabled'
  visibility: 'public' | 'private' | 'internal'
  category: string
  tags: string[]
  authentication: {
    required: boolean
    types: ('apikey' | 'bearer' | 'basic' | 'oauth2' | 'custom')[]
    scopes?: string[]
  }
  rateLimit: {
    enabled: boolean
    requests: number
    window: number
    burst?: number
    strategy: 'sliding' | 'fixed'
  }
  caching: {
    enabled: boolean
    ttl: number
    varyBy: string[]
    conditions?: string[]
  }
  monitoring: {
    enabled: boolean
    alerts: boolean
    logging: 'none' | 'errors' | 'all'
    tracing: boolean
  }
  metrics: {
    totalRequests: number
    avgResponseTime: number
    errorRate: number
    lastRequest: Date
    p95ResponseTime: number
    p99ResponseTime: number
    throughput: number
  }
  documentation: {
    summary: string
    description: string
    parameters: Array<{
      name: string
      type: string
      location: 'path' | 'query' | 'header' | 'body'
      required: boolean
      description: string
      example?: any
    }>
    responses: Array<{
      code: number
      description: string
      schema?: any
    }>
    examples: Array<{
      name: string
      request: any
      response: any
    }>
  }
  createdAt: Date
  updatedAt: Date
}

interface Gateway {
  id: string
  name: string
  description: string
  baseUrl: string
  environment: 'development' | 'staging' | 'production'
  status: 'healthy' | 'degraded' | 'down' | 'maintenance'
  version: string
  configuration: {
    timeout: number
    retries: number
    circuitBreaker: {
      enabled: boolean
      failureThreshold: number
      recoveryTimeout: number
    }
    loadBalancing: {
      strategy: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash'
      healthCheck: boolean
    }
    cors: {
      enabled: boolean
      origins: string[]
      methods: string[]
      headers: string[]
    }
    compression: {
      enabled: boolean
      level: number
      types: string[]
    }
  }
  endpoints: string[]
  metrics: {
    uptime: number
    totalRequests: number
    avgResponseTime: number
    errorRate: number
    activeConnections: number
    dataTransferred: number
  }
  lastHealthCheck: Date
}

interface APIKey {
  id: string
  name: string
  key: string
  description: string
  status: 'active' | 'revoked' | 'expired'
  permissions: {
    scopes: string[]
    endpoints: string[]
    rateLimit: {
      requests: number
      window: number
    }
  }
  usage: {
    totalRequests: number
    lastUsed: Date
    quota: number
    remaining: number
  }
  metadata: {
    createdBy: string
    createdAt: Date
    expiresAt?: Date
    lastRotated?: Date
    ipWhitelist?: string[]
    environment: string
  }
}

interface APILog {
  id: string
  timestamp: Date
  endpoint: string
  method: string
  path: string
  statusCode: number
  responseTime: number
  requestSize: number
  responseSize: number
  userAgent: string
  ipAddress: string
  apiKey?: string
  userId?: string
  error?: {
    code: string
    message: string
    stack?: string
  }
  headers: Record<string, string>
  queryParams: Record<string, any>
  requestBody?: any
  responseBody?: any
}

interface RateLimitRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number
  conditions: {
    endpoints?: string[]
    methods?: string[]
    apiKeys?: string[]
    ipAddresses?: string[]
    userAgents?: string[]
  }
  limits: {
    requests: number
    window: number
    burst?: number
    strategy: 'sliding' | 'fixed'
  }
  actions: {
    onExceeded: 'block' | 'throttle' | 'warn'
    responseCode: number
    responseMessage: string
    headers?: Record<string, string>
  }
  metrics: {
    triggered: number
    blocked: number
    lastTriggered?: Date
  }
}

interface APIAnalytics {
  id: string
  period: 'hour' | 'day' | 'week' | 'month'
  timestamp: Date
  metrics: {
    totalRequests: number
    uniqueUsers: number
    avgResponseTime: number
    errorRate: number
    throughput: number
    dataTransferred: number
    cacheHitRate: number
  }
  topEndpoints: Array<{
    endpoint: string
    requests: number
    avgResponseTime: number
    errorRate: number
  }>
  topUsers: Array<{
    apiKey: string
    requests: number
    errors: number
    dataTransferred: number
  }>
  errorAnalysis: Array<{
    statusCode: number
    count: number
    percentage: number
    topEndpoints: string[]
  }>
  geoDistribution: Array<{
    country: string
    requests: number
    percentage: number
  }>
}

interface Webhook {
  id: string
  name: string
  description: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  enabled: boolean
  events: string[]
  headers: Record<string, string>
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'signature'
    credentials?: Record<string, string>
    signatureHeader?: string
    secret?: string
  }
  retry: {
    enabled: boolean
    maxAttempts: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number
  }
  filtering: {
    enabled: boolean
    conditions: Array<{
      field: string
      operator: string
      value: any
    }>
  }
  metrics: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    avgDeliveryTime: number
    lastDelivery?: Date
  }
}

export default function APIGatewayManager() {
  const [activeTab, setActiveTab] = useState('gateways')
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [apiLogs, setApiLogs] = useState<APILog[]>([])
  const [rateLimitRules, setRateLimitRules] = useState<RateLimitRule[]>([])
  const [analytics, setAnalytics] = useState<APIAnalytics[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null)
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null)
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterEnvironment, setFilterEnvironment] = useState('all')
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(15)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    loadAPIData()
    if (autoRefresh) {
      const interval = setInterval(loadAPIData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadAPIData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadEndpoints(),
      loadGateways(),
      loadApiKeys(),
      loadApiLogs(),
      loadRateLimitRules(),
      loadAnalytics(),
      loadWebhooks()
    ])
    setIsLoading(false)
  }

  const loadEndpoints = async () => {
    const mockEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'User Authentication',
        path: '/api/v1/auth/login',
        method: 'POST',
        description: 'Authenticate user and return JWT token',
        version: '1.2.0',
        status: 'active',
        visibility: 'public',
        category: 'Authentication',
        tags: ['auth', 'login', 'jwt'],
        authentication: {
          required: false,
          types: []
        },
        rateLimit: {
          enabled: true,
          requests: 10,
          window: 60,
          burst: 3,
          strategy: 'sliding'
        },
        caching: {
          enabled: false,
          ttl: 0,
          varyBy: []
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: 'all',
          tracing: true
        },
        metrics: {
          totalRequests: 15847,
          avgResponseTime: 234,
          errorRate: 2.3,
          lastRequest: new Date(Date.now() - 300000),
          p95ResponseTime: 456,
          p99ResponseTime: 789,
          throughput: 12.4
        },
        documentation: {
          summary: 'User login endpoint',
          description: 'Authenticates a user with email and password, returns JWT token on success',
          parameters: [
            {
              name: 'email',
              type: 'string',
              location: 'body',
              required: true,
              description: 'User email address',
              example: 'user@example.com'
            },
            {
              name: 'password',
              type: 'string',
              location: 'body',
              required: true,
              description: 'User password',
              example: 'secretpassword'
            }
          ],
          responses: [
            {
              code: 200,
              description: 'Authentication successful',
              schema: { token: 'string', user: 'object' }
            },
            {
              code: 401,
              description: 'Invalid credentials'
            }
          ],
          examples: [
            {
              name: 'Success',
              request: { email: 'john@example.com', password: 'password123' },
              response: { token: 'jwt_token_here', user: { id: 1, email: 'john@example.com' } }
            }
          ]
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: '2',
        name: 'Get User Profile',
        path: '/api/v1/users/{id}',
        method: 'GET',
        description: 'Retrieve user profile information',
        version: '1.2.0',
        status: 'active',
        visibility: 'private',
        category: 'Users',
        tags: ['users', 'profile'],
        authentication: {
          required: true,
          types: ['bearer'],
          scopes: ['users:read']
        },
        rateLimit: {
          enabled: true,
          requests: 100,
          window: 60,
          strategy: 'sliding'
        },
        caching: {
          enabled: true,
          ttl: 300,
          varyBy: ['Authorization']
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: 'errors',
          tracing: true
        },
        metrics: {
          totalRequests: 8923,
          avgResponseTime: 156,
          errorRate: 1.8,
          lastRequest: new Date(Date.now() - 120000),
          p95ResponseTime: 234,
          p99ResponseTime: 456,
          throughput: 18.7
        },
        documentation: {
          summary: 'Get user profile',
          description: 'Returns detailed user profile information',
          parameters: [
            {
              name: 'id',
              type: 'integer',
              location: 'path',
              required: true,
              description: 'User ID',
              example: 123
            }
          ],
          responses: [
            {
              code: 200,
              description: 'User profile data'
            },
            {
              code: 404,
              description: 'User not found'
            }
          ],
          examples: []
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(Date.now() - 172800000)
      },
      {
        id: '3',
        name: 'Create Project',
        path: '/api/v1/projects',
        method: 'POST',
        description: 'Create a new project',
        version: '2.0.0',
        status: 'beta',
        visibility: 'private',
        category: 'Projects',
        tags: ['projects', 'create'],
        authentication: {
          required: true,
          types: ['bearer', 'apikey'],
          scopes: ['projects:create']
        },
        rateLimit: {
          enabled: true,
          requests: 20,
          window: 60,
          strategy: 'fixed'
        },
        caching: {
          enabled: false,
          ttl: 0,
          varyBy: []
        },
        monitoring: {
          enabled: true,
          alerts: true,
          logging: 'all',
          tracing: true
        },
        metrics: {
          totalRequests: 1234,
          avgResponseTime: 345,
          errorRate: 5.2,
          lastRequest: new Date(Date.now() - 600000),
          p95ResponseTime: 567,
          p99ResponseTime: 890,
          throughput: 3.2
        },
        documentation: {
          summary: 'Create new project',
          description: 'Creates a new project with the provided data',
          parameters: [
            {
              name: 'name',
              type: 'string',
              location: 'body',
              required: true,
              description: 'Project name',
              example: 'My Project'
            },
            {
              name: 'description',
              type: 'string',
              location: 'body',
              required: false,
              description: 'Project description'
            }
          ],
          responses: [
            {
              code: 201,
              description: 'Project created successfully'
            },
            {
              code: 400,
              description: 'Invalid project data'
            }
          ],
          examples: []
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(Date.now() - 259200000)
      }
    ]
    setEndpoints(mockEndpoints)
  }

  const loadGateways = async () => {
    const mockGateways: Gateway[] = [
      {
        id: '1',
        name: 'Production Gateway',
        description: 'Main production API gateway',
        baseUrl: 'https://api.metrica.com',
        environment: 'production',
        status: 'healthy',
        version: '2.1.0',
        configuration: {
          timeout: 30000,
          retries: 3,
          circuitBreaker: {
            enabled: true,
            failureThreshold: 5,
            recoveryTimeout: 60000
          },
          loadBalancing: {
            strategy: 'round_robin',
            healthCheck: true
          },
          cors: {
            enabled: true,
            origins: ['https://app.metrica.com', 'https://dashboard.metrica.com'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            headers: ['Content-Type', 'Authorization']
          },
          compression: {
            enabled: true,
            level: 6,
            types: ['application/json', 'text/plain']
          }
        },
        endpoints: ['1', '2', '3'],
        metrics: {
          uptime: 99.95,
          totalRequests: 25897,
          avgResponseTime: 187,
          errorRate: 1.2,
          activeConnections: 89,
          dataTransferred: 15.7e9
        },
        lastHealthCheck: new Date(Date.now() - 30000)
      },
      {
        id: '2',
        name: 'Staging Gateway',
        description: 'Staging environment API gateway',
        baseUrl: 'https://staging-api.metrica.com',
        environment: 'staging',
        status: 'degraded',
        version: '2.1.1-beta',
        configuration: {
          timeout: 15000,
          retries: 2,
          circuitBreaker: {
            enabled: true,
            failureThreshold: 3,
            recoveryTimeout: 30000
          },
          loadBalancing: {
            strategy: 'least_connections',
            healthCheck: true
          },
          cors: {
            enabled: true,
            origins: ['*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            headers: ['*']
          },
          compression: {
            enabled: false,
            level: 0,
            types: []
          }
        },
        endpoints: ['1', '2'],
        metrics: {
          uptime: 98.3,
          totalRequests: 5234,
          avgResponseTime: 234,
          errorRate: 3.8,
          activeConnections: 23,
          dataTransferred: 2.3e9
        },
        lastHealthCheck: new Date(Date.now() - 60000)
      },
      {
        id: '3',
        name: 'Development Gateway',
        description: 'Development environment API gateway',
        baseUrl: 'http://localhost:3001',
        environment: 'development',
        status: 'healthy',
        version: '2.2.0-dev',
        configuration: {
          timeout: 5000,
          retries: 1,
          circuitBreaker: {
            enabled: false,
            failureThreshold: 0,
            recoveryTimeout: 0
          },
          loadBalancing: {
            strategy: 'round_robin',
            healthCheck: false
          },
          cors: {
            enabled: true,
            origins: ['*'],
            methods: ['*'],
            headers: ['*']
          },
          compression: {
            enabled: false,
            level: 0,
            types: []
          }
        },
        endpoints: ['1', '2', '3'],
        metrics: {
          uptime: 95.2,
          totalRequests: 1567,
          avgResponseTime: 89,
          errorRate: 8.5,
          activeConnections: 5,
          dataTransferred: 892e6
        },
        lastHealthCheck: new Date(Date.now() - 120000)
      }
    ]
    setGateways(mockGateways)
  }

  const loadApiKeys = async () => {
    const mockApiKeys: APIKey[] = [
      {
        id: '1',
        name: 'Mobile App Key',
        key: 'ak_prod_1234567890abcdef',
        description: 'API key for mobile application',
        status: 'active',
        permissions: {
          scopes: ['users:read', 'projects:read', 'projects:create'],
          endpoints: ['/api/v1/users/*', '/api/v1/projects/*'],
          rateLimit: {
            requests: 1000,
            window: 3600
          }
        },
        usage: {
          totalRequests: 15847,
          lastUsed: new Date(Date.now() - 300000),
          quota: 1000000,
          remaining: 984153
        },
        metadata: {
          createdBy: 'admin@metrica.com',
          createdAt: new Date('2024-01-15'),
          expiresAt: new Date('2024-12-31'),
          environment: 'production',
          ipWhitelist: []
        }
      },
      {
        id: '2',
        name: 'Web Dashboard Key',
        key: 'ak_prod_abcdef1234567890',
        description: 'API key for web dashboard',
        status: 'active',
        permissions: {
          scopes: ['admin:read', 'admin:write'],
          endpoints: ['/api/v1/*'],
          rateLimit: {
            requests: 5000,
            window: 3600
          }
        },
        usage: {
          totalRequests: 8923,
          lastUsed: new Date(Date.now() - 120000),
          quota: 2000000,
          remaining: 1991077
        },
        metadata: {
          createdBy: 'admin@metrica.com',
          createdAt: new Date('2024-02-01'),
          environment: 'production',
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
        }
      },
      {
        id: '3',
        name: 'Integration Service Key',
        key: 'ak_prod_xyz9876543210def',
        description: 'API key for external integrations',
        status: 'revoked',
        permissions: {
          scopes: ['integrations:read', 'integrations:write'],
          endpoints: ['/api/v1/integrations/*'],
          rateLimit: {
            requests: 500,
            window: 3600
          }
        },
        usage: {
          totalRequests: 2341,
          lastUsed: new Date(Date.now() - 86400000),
          quota: 500000,
          remaining: 497659
        },
        metadata: {
          createdBy: 'integration@metrica.com',
          createdAt: new Date('2024-01-30'),
          expiresAt: new Date('2024-06-30'),
          environment: 'production'
        }
      }
    ]
    setApiKeys(mockApiKeys)
  }

  const loadApiLogs = async () => {
    const mockLogs: APILog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000),
        endpoint: 'User Authentication',
        method: 'POST',
        path: '/api/v1/auth/login',
        statusCode: 200,
        responseTime: 234,
        requestSize: 1024,
        responseSize: 2048,
        userAgent: 'MetricaApp/1.0 (iOS)',
        ipAddress: '192.168.1.100',
        apiKey: 'ak_prod_1234567890abcdef',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        },
        queryParams: {},
        requestBody: { email: 'user@example.com' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000),
        endpoint: 'Get User Profile',
        method: 'GET',
        path: '/api/v1/users/123',
        statusCode: 404,
        responseTime: 89,
        requestSize: 512,
        responseSize: 256,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '203.0.113.45',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User with ID 123 not found'
        },
        headers: {
          'Authorization': 'Bearer invalid_token'
        },
        queryParams: {}
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000),
        endpoint: 'Create Project',
        method: 'POST',
        path: '/api/v1/projects',
        statusCode: 201,
        responseTime: 456,
        requestSize: 2048,
        responseSize: 1536,
        userAgent: 'PostmanRuntime/7.32.3',
        ipAddress: '10.0.1.50',
        apiKey: 'ak_prod_abcdef1234567890',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ak_prod_abcdef1234567890'
        },
        queryParams: {},
        requestBody: {
          name: 'Test Project',
          description: 'A test project'
        }
      }
    ]
    setApiLogs(mockLogs)
  }

  const loadRateLimitRules = async () => {
    const mockRules: RateLimitRule[] = [
      {
        id: '1',
        name: 'Authentication Rate Limit',
        description: 'Limit login attempts to prevent brute force attacks',
        enabled: true,
        priority: 1,
        conditions: {
          endpoints: ['/api/v1/auth/login'],
          methods: ['POST']
        },
        limits: {
          requests: 10,
          window: 300,
          strategy: 'sliding'
        },
        actions: {
          onExceeded: 'block',
          responseCode: 429,
          responseMessage: 'Too many login attempts. Please try again later.',
          headers: { 'Retry-After': '300' }
        },
        metrics: {
          triggered: 23,
          blocked: 23,
          lastTriggered: new Date(Date.now() - 3600000)
        }
      },
      {
        id: '2',
        name: 'API Key Rate Limit',
        description: 'General rate limit for API key usage',
        enabled: true,
        priority: 2,
        conditions: {
          apiKeys: ['ak_prod_1234567890abcdef']
        },
        limits: {
          requests: 1000,
          window: 3600,
          burst: 50,
          strategy: 'sliding'
        },
        actions: {
          onExceeded: 'throttle',
          responseCode: 429,
          responseMessage: 'Rate limit exceeded for API key'
        },
        metrics: {
          triggered: 5,
          blocked: 0,
          lastTriggered: new Date(Date.now() - 86400000)
        }
      },
      {
        id: '3',
        name: 'Suspicious IP Rate Limit',
        description: 'Aggressive rate limiting for suspicious IP addresses',
        enabled: true,
        priority: 3,
        conditions: {
          ipAddresses: ['203.0.113.0/24']
        },
        limits: {
          requests: 10,
          window: 60,
          strategy: 'fixed'
        },
        actions: {
          onExceeded: 'block',
          responseCode: 403,
          responseMessage: 'Access denied'
        },
        metrics: {
          triggered: 156,
          blocked: 156,
          lastTriggered: new Date(Date.now() - 1800000)
        }
      }
    ]
    setRateLimitRules(mockRules)
  }

  const loadAnalytics = async () => {
    const mockAnalytics: APIAnalytics[] = [
      {
        id: '1',
        period: 'hour',
        timestamp: new Date(Date.now() - 3600000),
        metrics: {
          totalRequests: 2547,
          uniqueUsers: 189,
          avgResponseTime: 234,
          errorRate: 2.1,
          throughput: 0.71,
          dataTransferred: 15.7e6,
          cacheHitRate: 67.3
        },
        topEndpoints: [
          {
            endpoint: '/api/v1/auth/login',
            requests: 847,
            avgResponseTime: 234,
            errorRate: 1.2
          },
          {
            endpoint: '/api/v1/users/{id}',
            requests: 623,
            avgResponseTime: 156,
            errorRate: 0.8
          },
          {
            endpoint: '/api/v1/projects',
            requests: 345,
            avgResponseTime: 345,
            errorRate: 3.7
          }
        ],
        topUsers: [
          {
            apiKey: 'ak_prod_1234567890abcdef',
            requests: 1247,
            errors: 23,
            dataTransferred: 8.9e6
          },
          {
            apiKey: 'ak_prod_abcdef1234567890',
            requests: 892,
            errors: 12,
            dataTransferred: 5.2e6
          }
        ],
        errorAnalysis: [
          {
            statusCode: 404,
            count: 34,
            percentage: 64.2,
            topEndpoints: ['/api/v1/users/{id}']
          },
          {
            statusCode: 401,
            count: 19,
            percentage: 35.8,
            topEndpoints: ['/api/v1/auth/login']
          }
        ],
        geoDistribution: [
          {
            country: 'Peru',
            requests: 1523,
            percentage: 59.8
          },
          {
            country: 'United States',
            requests: 678,
            percentage: 26.6
          },
          {
            country: 'Colombia',
            requests: 346,
            percentage: 13.6
          }
        ]
      }
    ]
    setAnalytics(mockAnalytics)
  }

  const loadWebhooks = async () => {
    const mockWebhooks: Webhook[] = [
      {
        id: '1',
        name: 'User Registration Webhook',
        description: 'Triggered when a new user registers',
        url: 'https://external-service.com/webhooks/user-registration',
        method: 'POST',
        enabled: true,
        events: ['user.created', 'user.verified'],
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'webhook_secret_123'
        },
        authentication: {
          type: 'signature',
          signatureHeader: 'X-Signature',
          secret: 'webhook_signing_secret'
        },
        retry: {
          enabled: true,
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000
        },
        filtering: {
          enabled: true,
          conditions: [
            {
              field: 'user.country',
              operator: 'equals',
              value: 'PE'
            }
          ]
        },
        metrics: {
          totalDeliveries: 1247,
          successfulDeliveries: 1198,
          failedDeliveries: 49,
          avgDeliveryTime: 234,
          lastDelivery: new Date(Date.now() - 300000)
        }
      },
      {
        id: '2',
        name: 'Payment Webhook',
        description: 'Webhook for payment events',
        url: 'https://payment-processor.com/webhooks/payments',
        method: 'POST',
        enabled: true,
        events: ['payment.created', 'payment.completed', 'payment.failed'],
        headers: {
          'Content-Type': 'application/json'
        },
        authentication: {
          type: 'bearer',
          credentials: { token: 'webhook_bearer_token' }
        },
        retry: {
          enabled: true,
          maxAttempts: 5,
          backoffStrategy: 'linear',
          initialDelay: 2000
        },
        filtering: {
          enabled: false,
          conditions: []
        },
        metrics: {
          totalDeliveries: 2341,
          successfulDeliveries: 2298,
          failedDeliveries: 43,
          avgDeliveryTime: 456,
          lastDelivery: new Date(Date.now() - 120000)
        }
      }
    ]
    setWebhooks(mockWebhooks)
  }

  const handleCreateEndpoint = () => {
    console.log('Creating new API endpoint')
  }

  const handleTestEndpoint = (endpointId: string) => {
    console.log(`Testing endpoint: ${endpointId}`)
  }

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key =>
      key.id === keyId ? { ...key, status: 'revoked' } : key
    ))
  }

  const handleToggleWebhook = (webhookId: string, enabled: boolean) => {
    setWebhooks(prev => prev.map(webhook =>
      webhook.id === webhookId ? { ...webhook, enabled } : webhook
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'beta':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'deprecated':
      case 'maintenance':
        return <Clock className="h-4 w-4 text-cyan-500" />
      case 'disabled':
      case 'down':
      case 'revoked':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'border-blue-500 text-blue-700 bg-blue-50'
      case 'POST': return 'border-green-500 text-green-700 bg-green-50'
      case 'PUT': return 'border-cyan-500 text-cyan-700 bg-cyan-50'
      case 'DELETE': return 'border-red-500 text-red-700 bg-red-50'
      case 'PATCH': return 'border-purple-500 text-purple-700 bg-purple-50'
      default: return 'border-gray-500 text-gray-700 bg-gray-50'
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />
      case 'private': return <Lock className="h-4 w-4 text-red-500" />
      case 'internal': return <Shield className="h-4 w-4 text-blue-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
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

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || endpoint.status === filterStatus
    const matchesMethod = filterMethod === 'all' || endpoint.method === filterMethod
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const filteredGateways = gateways.filter(gateway => {
    const matchesSearch = gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gateway.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEnvironment = filterEnvironment === 'all' || gateway.environment === filterEnvironment
    
    return matchesSearch && matchesEnvironment
  })

  const activeEndpoints = endpoints.filter(e => e.status === 'active').length
  const totalRequests = endpoints.reduce((sum, e) => sum + e.metrics.totalRequests, 0)
  const avgResponseTime = endpoints.reduce((sum, e) => sum + e.metrics.avgResponseTime, 0) / endpoints.length
  const healthyGateways = gateways.filter(g => g.status === 'healthy').length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Gateway Manager</h1>
          <p className="text-muted-foreground">
            Gestión completa de APIs, endpoints y gateways - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{activeEndpoints} active endpoints</span>
          </Badge>
          <div className="flex items-center space-x-1">
            <Switch
              id="real-time"
              checked={realTimeMonitoring}
              onCheckedChange={setRealTimeMonitoring}
            />
            <Label htmlFor="real-time" className="text-sm">Real-time</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => loadAPIData()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Gateways</h2>
              <p className="text-muted-foreground">
                Gestión de gateways y configuración de entornos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gateways..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
              <Button onClick={handleCreateEndpoint}>
                <Plus className="h-4 w-4 mr-2" />
                New Gateway
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredGateways.map((gateway) => (
              <Card key={gateway.id} className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedGateway?.id === gateway.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedGateway(selectedGateway?.id === gateway.id ? null : gateway)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Server className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <CardDescription>{gateway.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(gateway.status)}
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        gateway.environment === 'production' && "border-red-500 text-red-700",
                        gateway.environment === 'staging' && "border-yellow-500 text-yellow-700",
                        gateway.environment === 'development' && "border-blue-500 text-blue-700"
                      )}>
                        {gateway.environment}
                      </Badge>
                      <Badge variant="outline" className="text-xs">v{gateway.version}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <code className="bg-muted px-2 py-1 rounded text-xs">{gateway.baseUrl}</code>
                    <span className="text-muted-foreground">{gateway.endpoints.length} endpoints</span>
                    <span className="text-muted-foreground">
                      Last check: {formatTimeAgo(gateway.lastHealthCheck)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">{gateway.metrics.uptime}%</p>
                        <Progress value={gateway.metrics.uptime} className="w-16 h-2" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requests</p>
                      <p className="text-lg font-semibold">{gateway.metrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="text-lg font-semibold">{gateway.metrics.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        gateway.metrics.errorRate > 5 ? "text-red-600" : "text-green-600"
                      )}>
                        {gateway.metrics.errorRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {selectedGateway?.id === gateway.id && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Configuration</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-muted-foreground">Timeout:</span> {gateway.configuration.timeout}ms</div>
                            <div><span className="text-muted-foreground">Retries:</span> {gateway.configuration.retries}</div>
                            <div><span className="text-muted-foreground">Load Balancing:</span> {gateway.configuration.loadBalancing.strategy}</div>
                            <div><span className="text-muted-foreground">Circuit Breaker:</span> {gateway.configuration.circuitBreaker.enabled ? 'Enabled' : 'Disabled'}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">CORS Configuration</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-muted-foreground">Enabled:</span> {gateway.configuration.cors.enabled ? 'Yes' : 'No'}</div>
                            <div><span className="text-muted-foreground">Origins:</span> {gateway.configuration.cors.origins.length}</div>
                            <div><span className="text-muted-foreground">Methods:</span> {gateway.configuration.cors.methods.join(', ')}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Additional Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Active Connections:</span>
                            <div className="font-medium">{gateway.metrics.activeConnections}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data Transferred:</span>
                            <div className="font-medium">{formatBytes(gateway.metrics.dataTransferred)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compression:</span>
                            <div className="font-medium">{gateway.configuration.compression.enabled ? 'Enabled' : 'Disabled'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Health Check
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Metrics
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
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

        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Endpoints</h2>
              <p className="text-muted-foreground">
                Gestión y monitoreo de endpoints de API
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="beta">Beta</option>
                <option value="deprecated">Deprecated</option>
                <option value="disabled">Disabled</option>
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <Button onClick={handleCreateEndpoint}>
                <Plus className="h-4 w-4 mr-2" />
                New Endpoint
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedEndpoint?.id === endpoint.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedEndpoint(selectedEndpoint?.id === endpoint.id ? null : endpoint)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={cn("text-xs font-mono", getMethodColor(endpoint.method))}>
                          {endpoint.method}
                        </Badge>
                        {getVisibilityIcon(endpoint.visibility)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{endpoint.name}</h3>
                          <Badge variant="outline" className="text-xs">{endpoint.category}</Badge>
                          <Badge variant="outline" className="text-xs">v{endpoint.version}</Badge>
                        </div>
                        <code className="text-sm bg-muted px-2 py-1 rounded mt-1 inline-block">
                          {endpoint.path}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Requests: {endpoint.metrics.totalRequests.toLocaleString()}</span>
                          <span>Avg: {endpoint.metrics.avgResponseTime}ms</span>
                          <span>Error: {endpoint.metrics.errorRate.toFixed(1)}%</span>
                          <span>Last: {formatTimeAgo(endpoint.metrics.lastRequest)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {endpoint.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(endpoint.status)}
                      <span className="text-sm capitalize">{endpoint.status}</span>
                    </div>
                  </div>

                  {selectedEndpoint?.id === endpoint.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Authentication & Security</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-muted-foreground">Authentication:</span>
                              {endpoint.authentication.required ? (
                                <div className="flex items-center space-x-1">
                                  <Lock className="h-3 w-3 text-green-500" />
                                  <span>Required</span>
                                  <div className="flex space-x-1 ml-2">
                                    {endpoint.authentication.types.map(type => (
                                      <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Unlock className="h-3 w-3 text-gray-500" />
                                  <span>Not required</span>
                                </div>
                              )}
                            </div>
                            {endpoint.authentication.scopes && endpoint.authentication.scopes.length > 0 && (
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-muted-foreground">Scopes:</span>
                                <div className="flex flex-wrap gap-1">
                                  {endpoint.authentication.scopes.map(scope => (
                                    <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Rate Limiting & Caching</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-muted-foreground">Rate Limit:</span>
                              {endpoint.rateLimit.enabled ? (
                                <span>
                                  {endpoint.rateLimit.requests} req/{endpoint.rateLimit.window}s
                                  {endpoint.rateLimit.burst && ` (burst: ${endpoint.rateLimit.burst})`}
                                </span>
                              ) : (
                                <span className="text-gray-500">Disabled</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-muted-foreground">Caching:</span>
                              {endpoint.caching.enabled ? (
                                <span>Enabled ({endpoint.caching.ttl}s TTL)</span>
                              ) : (
                                <span className="text-gray-500">Disabled</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Performance Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold">{endpoint.metrics.totalRequests.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Total Requests</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold">{endpoint.metrics.avgResponseTime}ms</div>
                            <div className="text-xs text-muted-foreground">Avg Response</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold">{endpoint.metrics.p95ResponseTime}ms</div>
                            <div className="text-xs text-muted-foreground">95th Percentile</div>
                          </div>
                          <div className="text-center p-3 border rounded">
                            <div className={cn(
                              "text-lg font-bold",
                              endpoint.metrics.errorRate > 5 ? "text-red-600" : "text-green-600"
                            )}>
                              {endpoint.metrics.errorRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Error Rate</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">API Documentation</h4>
                        <div className="space-y-2">
                          <p className="text-sm">{endpoint.documentation.description}</p>
                          {endpoint.documentation.parameters.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground font-medium">Parameters:</span>
                              <div className="mt-1 space-y-1">
                                {endpoint.documentation.parameters.slice(0, 3).map((param, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs">
                                    <code className="bg-muted px-1 rounded">{param.name}</code>
                                    <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                    <Badge variant={param.required ? "destructive" : "secondary"} className="text-xs">
                                      {param.required ? 'required' : 'optional'}
                                    </Badge>
                                    <span className="text-muted-foreground">{param.description}</span>
                                  </div>
                                ))}
                                {endpoint.documentation.parameters.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{endpoint.documentation.parameters.length - 3} more parameters
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm" onClick={() => handleTestEndpoint(endpoint.id)}>
                          <Play className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Documentation
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Keys</h2>
              <p className="text-muted-foreground">
                Gestión de claves de API y autenticación
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedApiKey?.id === apiKey.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedApiKey(selectedApiKey?.id === apiKey.id ? null : apiKey)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <Key className="h-5 w-5 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{apiKey.name}</h3>
                          <Badge variant="outline" className="text-xs">{apiKey.metadata.environment}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{apiKey.key}</code>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{apiKey.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Requests: {apiKey.usage.totalRequests.toLocaleString()}</span>
                          <span>Quota: {apiKey.usage.remaining.toLocaleString()} / {apiKey.usage.quota.toLocaleString()}</span>
                          <span>Last used: {formatTimeAgo(apiKey.usage.lastUsed)}</span>
                          {apiKey.metadata.expiresAt && (
                            <span>Expires: {apiKey.metadata.expiresAt.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(apiKey.status)}
                      <span className="text-sm capitalize">{apiKey.status}</span>
                    </div>
                  </div>

                  {selectedApiKey?.id === apiKey.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Permissions</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-muted-foreground">Scopes:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {apiKey.permissions.scopes.map(scope => (
                                  <Badge key={scope} variant="secondary" className="text-xs">{scope}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Rate Limit:</span>
                              <span className="ml-2 text-sm">
                                {apiKey.permissions.rateLimit.requests} req/{apiKey.permissions.rateLimit.window}s
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Endpoints:</span>
                              <div className="text-xs mt-1 space-y-1">
                                {apiKey.permissions.endpoints.slice(0, 3).map((endpoint, index) => (
                                  <code key={index} className="bg-muted px-1 rounded block">
                                    {endpoint}
                                  </code>
                                ))}
                                {apiKey.permissions.endpoints.length > 3 && (
                                  <span className="text-muted-foreground">
                                    +{apiKey.permissions.endpoints.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Usage Statistics</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Quota Usage</span>
                                <span>
                                  {((apiKey.usage.quota - apiKey.usage.remaining) / apiKey.usage.quota * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={(apiKey.usage.quota - apiKey.usage.remaining) / apiKey.usage.quota * 100} 
                                className="h-2 mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Created:</span>
                                <div className="font-medium text-xs">{apiKey.metadata.createdAt.toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Created by:</span>
                                <div className="font-medium text-xs">{apiKey.metadata.createdBy}</div>
                              </div>
                            </div>
                            {apiKey.metadata.ipWhitelist && apiKey.metadata.ipWhitelist.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground">IP Whitelist:</span>
                                <div className="text-xs mt-1">
                                  {apiKey.metadata.ipWhitelist.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rotate
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Usage Stats
                        </Button>
                        {apiKey.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleRevokeApiKey(apiKey.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Request Logs</h2>
              <p className="text-muted-foreground">
                Logs de peticiones y respuestas de la API
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
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

          <div className="space-y-2">
            {apiLogs.map((log) => (
              <Card key={log.id} className={cn(
                "cursor-pointer transition-all hover:shadow-sm",
                selectedLog?.id === log.id && "ring-2 ring-primary",
                log.statusCode >= 400 && "border-l-4 border-l-red-500"
              )} onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <Badge variant="outline" className={cn(
                        "text-xs font-mono",
                        getMethodColor(log.method)
                      )}>
                        {log.method}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm">{log.path}</code>
                          <Badge variant={log.statusCode >= 400 ? "destructive" : log.statusCode >= 300 ? "secondary" : "default"} className="text-xs">
                            {log.statusCode}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{formatTimeAgo(log.timestamp)}</span>
                          <span>{log.responseTime}ms</span>
                          <span>{log.ipAddress}</span>
                          {log.apiKey && <span>API Key: {log.apiKey.slice(0, 16)}...</span>}
                          <span>{formatBytes(log.requestSize)} → {formatBytes(log.responseSize)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-medium",
                        log.statusCode >= 400 && "text-red-600",
                        log.statusCode >= 200 && log.statusCode < 300 && "text-green-600"
                      )}>
                        {log.statusCode}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.responseTime}ms
                      </div>
                    </div>
                  </div>

                  {selectedLog?.id === log.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Request Details</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-muted-foreground">Endpoint:</span> {log.endpoint}</div>
                            <div><span className="text-muted-foreground">User Agent:</span> {log.userAgent}</div>
                            <div><span className="text-muted-foreground">Request Size:</span> {formatBytes(log.requestSize)}</div>
                            {log.userId && <div><span className="text-muted-foreground">User ID:</span> {log.userId}</div>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Response Details</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-muted-foreground">Status Code:</span> {log.statusCode}</div>
                            <div><span className="text-muted-foreground">Response Time:</span> {log.responseTime}ms</div>
                            <div><span className="text-muted-foreground">Response Size:</span> {formatBytes(log.responseSize)}</div>
                            {log.error && (
                              <div className="text-red-600">
                                <span className="font-medium">Error:</span> {log.error.code} - {log.error.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {Object.keys(log.headers).length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Headers</h4>
                          <div className="space-y-1">
                            {Object.entries(log.headers).slice(0, 5).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-2 text-xs">
                                <code className="bg-muted px-1 rounded">{key}</code>
                                <span className="text-muted-foreground">{value}</span>
                              </div>
                            ))}
                            {Object.keys(log.headers).length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{Object.keys(log.headers).length - 5} more headers
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {log.requestBody && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Request Body</h4>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.error && log.error.stack && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-red-600">Stack Trace</h4>
                          <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto max-h-32 border border-red-200">
                            {log.error.stack}
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

        <TabsContent value="rate-limits" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Rate Limit Rules</h2>
              <p className="text-muted-foreground">
                Configuración de límites de velocidad y throttling
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>

          <div className="space-y-4">
            {rateLimitRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch checked={rule.enabled} />
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Priority {rule.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Limits</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Requests:</span> {rule.limits.requests}</div>
                        <div><span className="text-muted-foreground">Window:</span> {rule.limits.window}s</div>
                        <div><span className="text-muted-foreground">Strategy:</span> {rule.limits.strategy}</div>
                        {rule.limits.burst && (
                          <div><span className="text-muted-foreground">Burst:</span> {rule.limits.burst}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Conditions</h4>
                      <div className="space-y-1 text-sm">
                        {rule.conditions.endpoints && (
                          <div><span className="text-muted-foreground">Endpoints:</span> {rule.conditions.endpoints.length}</div>
                        )}
                        {rule.conditions.methods && (
                          <div><span className="text-muted-foreground">Methods:</span> {rule.conditions.methods.join(', ')}</div>
                        )}
                        {rule.conditions.apiKeys && (
                          <div><span className="text-muted-foreground">API Keys:</span> {rule.conditions.apiKeys.length}</div>
                        )}
                        {rule.conditions.ipAddresses && (
                          <div><span className="text-muted-foreground">IP Addresses:</span> {rule.conditions.ipAddresses.length}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Actions</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">On Exceeded:</span> {rule.actions.onExceeded}</div>
                        <div><span className="text-muted-foreground">Response Code:</span> {rule.actions.responseCode}</div>
                        <div className="text-xs text-muted-foreground">{rule.actions.responseMessage}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Triggered:</span>
                          <span className="font-medium">{rule.metrics.triggered}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Blocked:</span>
                          <span className="font-medium">{rule.metrics.blocked}</span>
                        </div>
                        {rule.metrics.lastTriggered && (
                          <div className="flex justify-between text-sm">
                            <span>Last Triggered:</span>
                            <span className="font-medium text-xs">{formatTimeAgo(rule.metrics.lastTriggered)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Rule
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Test Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Analytics</h2>
              <p className="text-muted-foreground">
                Análisis detallado del uso y rendimiento de APIs
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
                <option value="30d">Last 30 Days</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {analytics.length > 0 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Requests', value: analytics[0].metrics.totalRequests.toLocaleString(), change: '+12.3%', positive: true },
                  { label: 'Unique Users', value: analytics[0].metrics.uniqueUsers.toString(), change: '+8.7%', positive: true },
                  { label: 'Avg Response Time', value: `${analytics[0].metrics.avgResponseTime}ms`, change: '-5.2%', positive: true },
                  { label: 'Error Rate', value: `${analytics[0].metrics.errorRate}%`, change: '+0.8%', positive: false }
                ].map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <div className={cn(
                        "text-xs flex items-center mt-1",
                        metric.positive ? "text-green-600" : "text-red-600"
                      )}>
                        {metric.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {metric.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Endpoints</CardTitle>
                    <CardDescription>Endpoints más utilizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics[0].topEndpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.endpoint}</code>
                            <div className="text-xs text-muted-foreground mt-1">
                              Avg: {endpoint.avgResponseTime}ms | Error: {endpoint.errorRate}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{endpoint.requests.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">requests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top API Keys</CardTitle>
                    <CardDescription>Claves de API más activas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics[0].topUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {user.apiKey.slice(0, 16)}...
                            </code>
                            <div className="text-xs text-muted-foreground mt-1">
                              Errors: {user.errors} | Data: {formatBytes(user.dataTransferred)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{user.requests.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">requests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Error Analysis</CardTitle>
                    <CardDescription>Análisis de códigos de error</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics[0].errorAnalysis.map((error, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">
                                {error.statusCode}
                              </Badge>
                              <span className="text-sm">{error.count} errors</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Top endpoint: {error.topEndpoints[0]}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{error.percentage.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">of errors</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Distribución por país</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics[0].geoDistribution.map((geo, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{geo.country}</span>
                            <Progress value={geo.percentage} className="w-full h-2 mt-1" />
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium">{geo.requests.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{geo.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Request Volume Trends</CardTitle>
                  <CardDescription>Tendencias de volumen de peticiones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-2">
                      <LineChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Request Volume Chart</p>
                      <p className="text-xs text-muted-foreground">Chart implementation placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Webhooks</h2>
              <p className="text-muted-foreground">
                Configuración de webhooks y notificaciones
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={webhook.enabled}
                        onCheckedChange={(enabled) => handleToggleWebhook(webhook.id, enabled)}
                      />
                      <div>
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <CardDescription>{webhook.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{webhook.method}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{webhook.url}</code>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Events</h4>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Authentication</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Type:</span> {webhook.authentication.type}</div>
                        {webhook.authentication.signatureHeader && (
                          <div><span className="text-muted-foreground">Signature:</span> {webhook.authentication.signatureHeader}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Retry Policy</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Max Attempts:</span> {webhook.retry.maxAttempts}</div>
                        <div><span className="text-muted-foreground">Strategy:</span> {webhook.retry.backoffStrategy}</div>
                        <div><span className="text-muted-foreground">Initial Delay:</span> {webhook.retry.initialDelay}ms</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Deliveries</p>
                      <p className="text-lg font-semibold">{webhook.metrics.totalDeliveries.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        (webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) > 0.95 ? "text-green-600" : "text-red-600"
                      )}>
                        {((webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                      <p className="text-lg font-semibold">{webhook.metrics.avgDeliveryTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Delivery</p>
                      <p className="text-lg font-semibold">
                        {webhook.metrics.lastDelivery ? formatTimeAgo(webhook.metrics.lastDelivery) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {webhook.filtering.enabled && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Filtering</h4>
                      <div className="space-y-1">
                        {webhook.filtering.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <code className="bg-muted px-1 rounded">{condition.field}</code>
                            <Badge variant="outline" className="text-xs">{condition.operator}</Badge>
                            <span>{condition.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Delivery Stats
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">API Gateway Settings</h2>
              <p className="text-muted-foreground">
                Configuración global del gateway de APIs
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configuración general del gateway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Monitoreo en tiempo real</p>
                  </div>
                  <Switch
                    checked={realTimeMonitoring}
                    onCheckedChange={setRealTimeMonitoring}
                  />
                </div>
                <div>
                  <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
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
                    <Label>Request Logging</Label>
                    <p className="text-sm text-muted-foreground">Registrar todas las peticiones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Error Tracking</Label>
                    <p className="text-sm text-muted-foreground">Seguimiento de errores</p>
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
                    <Label>HTTPS Only</Label>
                    <p className="text-sm text-muted-foreground">Forzar conexiones HTTPS</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Key Validation</Label>
                    <p className="text-sm text-muted-foreground">Validación de claves de API</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="max-request-size">Max Request Size (MB)</Label>
                  <Input
                    id="max-request-size"
                    type="number"
                    defaultValue={10}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="request-timeout">Request Timeout (ms)</Label>
                  <Input
                    id="request-timeout"
                    type="number"
                    defaultValue={30000}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>
                  Configuración global de rate limiting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Global Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Rate limiting global</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="global-rate-limit">Global Rate Limit (req/min)</Label>
                  <Input
                    id="global-rate-limit"
                    type="number"
                    defaultValue={10000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="burst-limit">Burst Limit</Label>
                  <Input
                    id="burst-limit"
                    type="number"
                    defaultValue={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rate-limit-window">Rate Limit Window (seconds)</Label>
                  <Input
                    id="rate-limit-window"
                    type="number"
                    defaultValue={60}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Configuración de rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Response Compression</Label>
                    <p className="text-sm text-muted-foreground">Comprimir respuestas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Response Caching</Label>
                    <p className="text-sm text-muted-foreground">Cache de respuestas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="cache-ttl">Default Cache TTL (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    defaultValue={300}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-connections">Max Concurrent Connections</Label>
                  <Input
                    id="max-connections"
                    type="number"
                    defaultValue={1000}
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