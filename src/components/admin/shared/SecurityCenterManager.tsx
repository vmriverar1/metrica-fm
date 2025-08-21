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
import { AlertCircle, Shield, Eye, EyeOff, Lock, Unlock, Key, UserCheck, UserX, AlertTriangle, CheckCircle, XCircle, Clock, Activity, TrendingUp, TrendingDown, Download, Upload, Save, RefreshCw, Search, Filter, Plus, Edit, Trash2, Settings, Bell, Zap, Target, Bug, Wrench, Terminal, Code, Globe, Server, Database, Network, Wifi, WifiOff, Monitor, Cpu, Memory, HardDrive, Users, User, Mail, MessageSquare, Phone, Smartphone, Calendar, Timer, BarChart3, PieChart, LineChart, FileText, File, Folder, Archive, CloudDownload, CloudUpload, ExternalLink, Link2, Layers, Package, Component, Puzzle, GitBranch, GitCommit, Power, PowerOff, Play, Pause, SkipForward, Rewind, Volume2, VolumeX, Info, Star, Bookmark, Flag, Tag, Hash, AtSign, DollarSign, Percent, Minus, Plus as PlusIcon, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Fingerprint, ShieldCheck, ShieldAlert, ShieldX, Scan, ScanLine, Crosshair, Radar, SecurityIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SecurityEvent {
  id: string
  type: 'authentication' | 'authorization' | 'data_access' | 'network' | 'malware' | 'vulnerability' | 'policy_violation' | 'suspicious_activity'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  source: {
    ip: string
    userAgent?: string
    userId?: string
    userName?: string
    location?: string
  }
  target: {
    resource: string
    endpoint?: string
    method?: string
  }
  timestamp: Date
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  evidence: Array<{
    type: 'log' | 'file' | 'network' | 'screenshot'
    description: string
    data?: any
  }>
  mitigation: Array<{
    action: string
    timestamp: Date
    result: 'success' | 'failed' | 'pending'
  }>
  riskScore: number
  assignedTo?: string
  tags: string[]
}

interface SecurityPolicy {
  id: string
  name: string
  category: 'access_control' | 'data_protection' | 'network_security' | 'compliance' | 'incident_response'
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  rules: Array<{
    id: string
    condition: string
    action: 'allow' | 'deny' | 'alert' | 'log' | 'quarantine'
    parameters: Record<string, any>
  }>
  compliance: string[]
  lastUpdated: Date
  violationCount: number
  enforcementRate: number
}

interface Vulnerability {
  id: string
  cve?: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cvssScore: number
  category: 'injection' | 'broken_auth' | 'sensitive_data' | 'xxe' | 'broken_access' | 'security_misconfig' | 'xss' | 'insecure_deserialization' | 'known_vulnerabilities' | 'insufficient_logging'
  affected: {
    systems: string[]
    components: string[]
    versions: string[]
  }
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'wont_fix'
  discoveredAt: Date
  lastSeen: Date
  patchAvailable: boolean
  exploitPublic: boolean
  assignedTo?: string
  remediation: {
    steps: string[]
    estimatedTime: number
    priority: number
  }
}

interface SecurityScan {
  id: string
  type: 'vulnerability' | 'penetration' | 'compliance' | 'malware' | 'configuration'
  name: string
  target: {
    type: 'network' | 'application' | 'database' | 'server' | 'endpoint'
    identifier: string
  }
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startedAt: Date
  completedAt?: Date
  duration?: number
  findings: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    cronExpression?: string
    nextRun?: Date
  }
  configuration: Record<string, any>
  results?: any
}

interface ComplianceFramework {
  id: string
  name: string
  version: string
  description: string
  active: boolean
  controls: Array<{
    id: string
    title: string
    description: string
    category: string
    status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed'
    evidence: string[]
    lastAssessed: Date
    assessedBy: string
    notes?: string
    remediation?: string[]
  }>
  complianceScore: number
  lastAssessment: Date
  nextAssessment: Date
  assessor: string
}

interface ThreatIntelligence {
  id: string
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
  value: string
  category: 'malware' | 'phishing' | 'botnet' | 'spam' | 'suspicious'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  source: string
  firstSeen: Date
  lastSeen: Date
  description: string
  tags: string[]
  blocklisted: boolean
  whitelisted: boolean
  associatedEvents: string[]
}

interface SecurityMetric {
  id: string
  name: string
  category: 'threat_detection' | 'incident_response' | 'vulnerability_management' | 'compliance' | 'access_control'
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  target?: number
  lastUpdated: Date
}

interface SecurityUser {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  lastLogin: Date
  failedAttempts: number
  locked: boolean
  mfaEnabled: boolean
  riskScore: number
  anomalousActivities: number
  accessPattern: 'normal' | 'suspicious' | 'anomalous'
  devices: Array<{
    id: string
    type: string
    trusted: boolean
    lastSeen: Date
  }>
}

export default function SecurityCenterManager() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([])
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([])
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([])
  const [securityUsers, setSecurityUsers] = useState<SecurityUser[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [autoResponse, setAutoResponse] = useState(false)
  const [threatDetection, setThreatDetection] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)

  useEffect(() => {
    loadSecurityData()
    if (realTimeMonitoring) {
      const interval = setInterval(loadSecurityData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [realTimeMonitoring, refreshInterval])

  const loadSecurityData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadSecurityEvents(),
      loadSecurityPolicies(),
      loadVulnerabilities(),
      loadSecurityScans(),
      loadComplianceFrameworks(),
      loadThreatIntelligence(),
      loadSecurityMetrics(),
      loadSecurityUsers()
    ])
    setIsLoading(false)
  }

  const loadSecurityEvents = async () => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'authentication',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        description: 'User attempted to login 15 times with incorrect credentials',
        source: {
          ip: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          userId: 'user-789',
          userName: 'suspicious.user@external.com',
          location: 'Unknown'
        },
        target: {
          resource: '/api/auth/login',
          endpoint: 'POST /auth/login',
          method: 'POST'
        },
        timestamp: new Date(Date.now() - 300000),
        status: 'investigating',
        evidence: [
          {
            type: 'log',
            description: 'Authentication log entries showing failed attempts',
            data: { attempts: 15, timespan: '5 minutes' }
          },
          {
            type: 'network',
            description: 'IP geolocation and reputation data'
          }
        ],
        mitigation: [
          {
            action: 'IP temporarily blocked',
            timestamp: new Date(Date.now() - 120000),
            result: 'success'
          },
          {
            action: 'User account locked',
            timestamp: new Date(Date.now() - 60000),
            result: 'success'
          }
        ],
        riskScore: 8.5,
        assignedTo: 'security@metrica.com',
        tags: ['brute-force', 'authentication', 'external']
      },
      {
        id: '2',
        type: 'data_access',
        severity: 'critical',
        title: 'Unauthorized Data Export',
        description: 'Large volume of sensitive data was exported outside business hours',
        source: {
          ip: '192.168.1.105',
          userId: 'user-456',
          userName: 'jane.smith@metrica.com',
          location: 'Lima, Peru'
        },
        target: {
          resource: 'Customer Database',
          endpoint: 'GET /api/customers/export'
        },
        timestamp: new Date(Date.now() - 1800000),
        status: 'open',
        evidence: [
          {
            type: 'log',
            description: 'Database access logs showing bulk export',
            data: { records: 15000, time: '02:30 AM' }
          },
          {
            type: 'file',
            description: 'Generated export file with customer data'
          }
        ],
        mitigation: [
          {
            action: 'Data access temporarily suspended',
            timestamp: new Date(Date.now() - 900000),
            result: 'success'
          }
        ],
        riskScore: 9.2,
        tags: ['data-exfiltration', 'insider-threat', 'sensitive-data']
      },
      {
        id: '3',
        type: 'vulnerability',
        severity: 'high',
        title: 'SQL Injection Attempt Detected',
        description: 'Malicious SQL injection payload detected in web request',
        source: {
          ip: '198.51.100.23',
          userAgent: 'sqlmap/1.6.12',
          location: 'Unknown'
        },
        target: {
          resource: 'Search Endpoint',
          endpoint: 'GET /api/search',
          method: 'GET'
        },
        timestamp: new Date(Date.now() - 3600000),
        status: 'resolved',
        evidence: [
          {
            type: 'log',
            description: 'Web application firewall logs',
            data: { payload: "' UNION SELECT * FROM users--" }
          }
        ],
        mitigation: [
          {
            action: 'Request blocked by WAF',
            timestamp: new Date(Date.now() - 3600000),
            result: 'success'
          },
          {
            action: 'IP added to blocklist',
            timestamp: new Date(Date.now() - 3300000),
            result: 'success'
          }
        ],
        riskScore: 7.8,
        tags: ['sql-injection', 'web-attack', 'automated']
      },
      {
        id: '4',
        type: 'malware',
        severity: 'medium',
        title: 'Suspicious File Upload',
        description: 'File with suspicious characteristics uploaded to system',
        source: {
          ip: '192.168.1.87',
          userId: 'user-123',
          userName: 'john.doe@metrica.com',
          location: 'Lima, Peru'
        },
        target: {
          resource: 'File Upload Service',
          endpoint: 'POST /api/upload'
        },
        timestamp: new Date(Date.now() - 7200000),
        status: 'investigating',
        evidence: [
          {
            type: 'file',
            description: 'Uploaded file with suspicious hash',
            data: { filename: 'document.pdf.exe', hash: 'a1b2c3d4e5f6' }
          }
        ],
        mitigation: [
          {
            action: 'File quarantined',
            timestamp: new Date(Date.now() - 6900000),
            result: 'success'
          },
          {
            action: 'Virus scan initiated',
            timestamp: new Date(Date.now() - 6600000),
            result: 'pending'
          }
        ],
        riskScore: 6.4,
        tags: ['malware', 'file-upload', 'suspicious']
      }
    ]
    setSecurityEvents(mockEvents)
  }

  const loadSecurityPolicies = async () => {
    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Strong Authentication Policy',
        category: 'access_control',
        description: 'Enforce strong authentication requirements including MFA',
        enabled: true,
        severity: 'high',
        rules: [
          {
            id: '1-1',
            condition: 'login_attempt AND mfa_disabled',
            action: 'deny',
            parameters: { message: 'MFA required for authentication' }
          },
          {
            id: '1-2',
            condition: 'password_strength < 8',
            action: 'alert',
            parameters: { threshold: 8, notification: true }
          }
        ],
        compliance: ['SOX', 'ISO27001', 'GDPR'],
        lastUpdated: new Date(Date.now() - 86400000),
        violationCount: 23,
        enforcementRate: 97.2
      },
      {
        id: '2',
        name: 'Data Classification Protection',
        category: 'data_protection',
        description: 'Protect sensitive data based on classification levels',
        enabled: true,
        severity: 'critical',
        rules: [
          {
            id: '2-1',
            condition: 'data_classification = "confidential" AND external_access',
            action: 'deny',
            parameters: { log: true, alert: true }
          },
          {
            id: '2-2',
            condition: 'bulk_export AND after_hours',
            action: 'alert',
            parameters: { threshold: 1000, approval_required: true }
          }
        ],
        compliance: ['GDPR', 'HIPAA', 'PCI'],
        lastUpdated: new Date(Date.now() - 172800000),
        violationCount: 7,
        enforcementRate: 99.1
      },
      {
        id: '3',
        name: 'Network Security Controls',
        category: 'network_security',
        description: 'Control network access and monitor suspicious activity',
        enabled: true,
        severity: 'high',
        rules: [
          {
            id: '3-1',
            condition: 'source_ip NOT IN whitelist AND admin_endpoint',
            action: 'deny',
            parameters: { block_duration: 3600 }
          },
          {
            id: '3-2',
            condition: 'failed_attempts > 5 IN 5_minutes',
            action: 'quarantine',
            parameters: { duration: 1800, notify: true }
          }
        ],
        compliance: ['ISO27001', 'NIST'],
        lastUpdated: new Date(Date.now() - 259200000),
        violationCount: 156,
        enforcementRate: 94.8
      }
    ]
    setSecurityPolicies(mockPolicies)
  }

  const loadVulnerabilities = async () => {
    const mockVulnerabilities: Vulnerability[] = [
      {
        id: '1',
        cve: 'CVE-2024-0001',
        title: 'SQL Injection in Search Module',
        description: 'Improper input validation allows SQL injection attacks in search functionality',
        severity: 'high',
        cvssScore: 8.1,
        category: 'injection',
        affected: {
          systems: ['Web Application', 'API Gateway'],
          components: ['Search Module', 'Query Builder'],
          versions: ['v2.1.0', 'v2.1.1', 'v2.1.2']
        },
        status: 'in_progress',
        discoveredAt: new Date(Date.now() - 86400000),
        lastSeen: new Date(Date.now() - 3600000),
        patchAvailable: true,
        exploitPublic: false,
        assignedTo: 'security-team@metrica.com',
        remediation: {
          steps: [
            'Update to version 2.1.3 or later',
            'Implement parameterized queries',
            'Add input validation',
            'Conduct security testing'
          ],
          estimatedTime: 8,
          priority: 1
        }
      },
      {
        id: '2',
        title: 'Weak JWT Secret Configuration',
        description: 'JWT tokens are signed with a weak secret key, allowing potential forgery',
        severity: 'medium',
        cvssScore: 6.5,
        category: 'broken_auth',
        affected: {
          systems: ['Authentication Service'],
          components: ['JWT Handler'],
          versions: ['v1.8.0', 'v1.8.1']
        },
        status: 'open',
        discoveredAt: new Date(Date.now() - 172800000),
        lastSeen: new Date(Date.now() - 86400000),
        patchAvailable: false,
        exploitPublic: false,
        remediation: {
          steps: [
            'Generate new strong JWT secret',
            'Update configuration',
            'Invalidate existing tokens',
            'Notify users to re-login'
          ],
          estimatedTime: 4,
          priority: 2
        }
      },
      {
        id: '3',
        cve: 'CVE-2024-0045',
        title: 'Cross-Site Scripting (XSS) in Dashboard',
        description: 'Stored XSS vulnerability in dashboard comments allows code execution',
        severity: 'high',
        cvssScore: 7.3,
        category: 'xss',
        affected: {
          systems: ['Web Application'],
          components: ['Dashboard', 'Comment System'],
          versions: ['v3.2.0', 'v3.2.1']
        },
        status: 'assigned',
        discoveredAt: new Date(Date.now() - 259200000),
        lastSeen: new Date(Date.now() - 7200000),
        patchAvailable: true,
        exploitPublic: true,
        assignedTo: 'frontend-team@metrica.com',
        remediation: {
          steps: [
            'Sanitize user input',
            'Implement Content Security Policy',
            'Update to patched version',
            'Test XSS protection'
          ],
          estimatedTime: 6,
          priority: 1
        }
      }
    ]
    setVulnerabilities(mockVulnerabilities)
  }

  const loadSecurityScans = async () => {
    const mockScans: SecurityScan[] = [
      {
        id: '1',
        type: 'vulnerability',
        name: 'Weekly Vulnerability Scan',
        target: {
          type: 'network',
          identifier: '192.168.1.0/24'
        },
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 82800000),
        duration: 3600,
        findings: {
          total: 23,
          critical: 2,
          high: 7,
          medium: 9,
          low: 5
        },
        schedule: {
          enabled: true,
          frequency: 'weekly',
          nextRun: new Date(Date.now() + 518400000)
        },
        configuration: {
          scanType: 'comprehensive',
          ports: 'all',
          excludeHosts: ['192.168.1.1', '192.168.1.2']
        }
      },
      {
        id: '2',
        type: 'penetration',
        name: 'Web Application Pentest',
        target: {
          type: 'application',
          identifier: 'https://app.metrica.com'
        },
        status: 'running',
        progress: 65,
        startedAt: new Date(Date.now() - 7200000),
        findings: {
          total: 8,
          critical: 1,
          high: 2,
          medium: 3,
          low: 2
        },
        configuration: {
          testType: 'owasp_top10',
          authentication: true,
          crawlDepth: 3
        }
      },
      {
        id: '3',
        type: 'compliance',
        name: 'PCI DSS Compliance Scan',
        target: {
          type: 'server',
          identifier: 'payment-server-01'
        },
        status: 'scheduled',
        progress: 0,
        startedAt: new Date(Date.now() + 86400000),
        findings: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        schedule: {
          enabled: true,
          frequency: 'monthly',
          nextRun: new Date(Date.now() + 86400000)
        },
        configuration: {
          standard: 'PCI_DSS_v4.0',
          scope: 'payment_processing'
        }
      }
    ]
    setSecurityScans(mockScans)
  }

  const loadComplianceFrameworks = async () => {
    const mockFrameworks: ComplianceFramework[] = [
      {
        id: '1',
        name: 'ISO 27001:2022',
        version: '2022',
        description: 'Information Security Management System standard',
        active: true,
        controls: [
          {
            id: 'A.5.1',
            title: 'Information Security Policy',
            description: 'Management direction and support for information security',
            category: 'Organizational Controls',
            status: 'compliant',
            evidence: ['Security Policy Document v2.1', 'Board Approval Minutes'],
            lastAssessed: new Date(Date.now() - 2592000000),
            assessedBy: 'compliance@metrica.com',
            notes: 'Policy updated and approved by board'
          },
          {
            id: 'A.8.1',
            title: 'User Access Management',
            description: 'Ensure authorized user access and prevent unauthorized access',
            category: 'People Controls',
            status: 'partial',
            evidence: ['Access Control Matrix', 'User Review Reports'],
            lastAssessed: new Date(Date.now() - 1296000000),
            assessedBy: 'security@metrica.com',
            notes: 'Some privileged accounts need review',
            remediation: ['Review privileged access', 'Update access matrix']
          }
        ],
        complianceScore: 87.5,
        lastAssessment: new Date(Date.now() - 2592000000),
        nextAssessment: new Date(Date.now() + 7776000000),
        assessor: 'External Auditor LLC'
      },
      {
        id: '2',
        name: 'SOX (Sarbanes-Oxley)',
        version: '2023',
        description: 'Financial reporting and internal controls compliance',
        active: true,
        controls: [
          {
            id: 'SOX-001',
            title: 'Financial Data Access Controls',
            description: 'Controls over access to financial systems and data',
            category: 'IT General Controls',
            status: 'compliant',
            evidence: ['Access Control Reports', 'Segregation of Duties Matrix'],
            lastAssessed: new Date(Date.now() - 1296000000),
            assessedBy: 'internal-audit@metrica.com'
          },
          {
            id: 'SOX-002',
            title: 'Change Management Controls',
            description: 'Controls over system changes affecting financial reporting',
            category: 'IT General Controls',
            status: 'non_compliant',
            evidence: [],
            lastAssessed: new Date(Date.now() - 1296000000),
            assessedBy: 'internal-audit@metrica.com',
            notes: 'Change approval process needs strengthening',
            remediation: ['Implement formal change approval', 'Document change procedures']
          }
        ],
        complianceScore: 72.3,
        lastAssessment: new Date(Date.now() - 1296000000),
        nextAssessment: new Date(Date.now() + 5184000000),
        assessor: 'Internal Audit Team'
      }
    ]
    setComplianceFrameworks(mockFrameworks)
  }

  const loadThreatIntelligence = async () => {
    const mockThreats: ThreatIntelligence[] = [
      {
        id: '1',
        type: 'ip',
        value: '203.0.113.45',
        category: 'malware',
        severity: 'high',
        confidence: 95,
        source: 'Threat Feed Alpha',
        firstSeen: new Date(Date.now() - 86400000),
        lastSeen: new Date(Date.now() - 300000),
        description: 'IP address associated with botnet command and control',
        tags: ['botnet', 'c2', 'malware'],
        blocklisted: true,
        whitelisted: false,
        associatedEvents: ['1', '3']
      },
      {
        id: '2',
        type: 'domain',
        value: 'malicious-site.example.com',
        category: 'phishing',
        severity: 'medium',
        confidence: 87,
        source: 'Phishing Database',
        firstSeen: new Date(Date.now() - 172800000),
        lastSeen: new Date(Date.now() - 86400000),
        description: 'Domain hosting phishing campaign targeting financial institutions',
        tags: ['phishing', 'financial', 'campaign'],
        blocklisted: true,
        whitelisted: false,
        associatedEvents: []
      },
      {
        id: '3',
        type: 'hash',
        value: 'a1b2c3d4e5f6789012345678901234567890abcd',
        category: 'malware',
        severity: 'critical',
        confidence: 99,
        source: 'Malware Intelligence',
        firstSeen: new Date(Date.now() - 259200000),
        lastSeen: new Date(Date.now() - 7200000),
        description: 'SHA1 hash of known banking trojan',
        tags: ['trojan', 'banking', 'credential-theft'],
        blocklisted: true,
        whitelisted: false,
        associatedEvents: ['4']
      }
    ]
    setThreatIntelligence(mockThreats)
  }

  const loadSecurityMetrics = async () => {
    const mockMetrics: SecurityMetric[] = [
      {
        id: '1',
        name: 'Threat Detection Rate',
        category: 'threat_detection',
        value: 94.2,
        previousValue: 91.8,
        unit: '%',
        trend: 'up',
        status: 'good',
        target: 95,
        lastUpdated: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        name: 'Mean Time to Detection (MTTD)',
        category: 'incident_response',
        value: 12.3,
        previousValue: 15.7,
        unit: 'minutes',
        trend: 'down',
        status: 'good',
        target: 15,
        lastUpdated: new Date(Date.now() - 600000)
      },
      {
        id: '3',
        name: 'Critical Vulnerabilities',
        category: 'vulnerability_management',
        value: 3,
        previousValue: 7,
        unit: 'count',
        trend: 'down',
        status: 'warning',
        target: 0,
        lastUpdated: new Date(Date.now() - 900000)
      },
      {
        id: '4',
        name: 'Compliance Score',
        category: 'compliance',
        value: 87.5,
        previousValue: 85.2,
        unit: '%',
        trend: 'up',
        status: 'good',
        target: 90,
        lastUpdated: new Date(Date.now() - 1200000)
      },
      {
        id: '5',
        name: 'Failed Login Attempts',
        category: 'access_control',
        value: 234,
        previousValue: 189,
        unit: 'count',
        trend: 'up',
        status: 'warning',
        lastUpdated: new Date(Date.now() - 180000)
      }
    ]
    setSecurityMetrics(mockMetrics)
  }

  const loadSecurityUsers = async () => {
    const mockUsers: SecurityUser[] = [
      {
        id: '1',
        username: 'john.doe',
        email: 'john.doe@metrica.com',
        roles: ['admin', 'security_analyst'],
        permissions: ['read_all', 'write_security', 'manage_users'],
        lastLogin: new Date(Date.now() - 3600000),
        failedAttempts: 0,
        locked: false,
        mfaEnabled: true,
        riskScore: 2.1,
        anomalousActivities: 0,
        accessPattern: 'normal',
        devices: [
          {
            id: 'device-1',
            type: 'Desktop - Windows',
            trusted: true,
            lastSeen: new Date(Date.now() - 3600000)
          }
        ]
      },
      {
        id: '2',
        username: 'jane.smith',
        email: 'jane.smith@metrica.com',
        roles: ['analyst'],
        permissions: ['read_financial', 'export_data'],
        lastLogin: new Date(Date.now() - 1800000),
        failedAttempts: 2,
        locked: false,
        mfaEnabled: false,
        riskScore: 6.8,
        anomalousActivities: 3,
        accessPattern: 'suspicious',
        devices: [
          {
            id: 'device-2',
            type: 'Mobile - iPhone',
            trusted: true,
            lastSeen: new Date(Date.now() - 1800000)
          },
          {
            id: 'device-3',
            type: 'Desktop - Unknown',
            trusted: false,
            lastSeen: new Date(Date.now() - 7200000)
          }
        ]
      },
      {
        id: '3',
        username: 'suspicious.user',
        email: 'suspicious.user@external.com',
        roles: ['guest'],
        permissions: ['read_public'],
        lastLogin: new Date(Date.now() - 300000),
        failedAttempts: 15,
        locked: true,
        mfaEnabled: false,
        riskScore: 9.5,
        anomalousActivities: 8,
        accessPattern: 'anomalous',
        devices: [
          {
            id: 'device-4',
            type: 'Unknown',
            trusted: false,
            lastSeen: new Date(Date.now() - 300000)
          }
        ]
      }
    ]
    setSecurityUsers(mockUsers)
  }

  const handleRunScan = (scanId: string) => {
    console.log(`Starting security scan: ${scanId}`)
  }

  const handleResolveEvent = (eventId: string) => {
    setSecurityEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, status: 'resolved' } : event
    ))
  }

  const handleAssignVulnerability = (vulnId: string, assignee: string) => {
    setVulnerabilities(prev => prev.map(vuln =>
      vuln.id === vulnId ? { ...vuln, assignedTo: assignee, status: 'assigned' } : vuln
    ))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 border-red-200 bg-red-50'
      case 'high': return 'text-red-500 border-red-200 bg-red-50'
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'low': return 'text-blue-600 border-blue-200 bg-blue-50'
      default: return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'scheduled':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'investigating':
      case 'assigned':
      case 'in_progress':
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'resolved':
      case 'completed':
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'false_positive':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'failed':
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return <Key className="h-4 w-4" />
      case 'authorization': return <Shield className="h-4 w-4" />
      case 'data_access': return <Database className="h-4 w-4" />
      case 'network': return <Network className="h-4 w-4" />
      case 'malware': return <Bug className="h-4 w-4" />
      case 'vulnerability': return <ShieldAlert className="h-4 w-4" />
      case 'policy_violation': return <AlertTriangle className="h-4 w-4" />
      case 'suspicious_activity': return <Eye className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
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

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesType = filterType === 'all' || event.type === filterType
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesType
  })

  const openEvents = securityEvents.filter(e => e.status === 'open').length
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length
  const highRiskUsers = securityUsers.filter(u => u.riskScore > 7).length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Center Manager</h1>
          <p className="text-muted-foreground">
            Centro de seguridad y compliance integral - Fase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {openEvents > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{openEvents} open events</span>
            </Badge>
          )}
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
            onClick={() => loadSecurityData()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="scans">Security Scans</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="threats">Threat Intel</TabsTrigger>
          <TabsTrigger value="users">User Security</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {securityMetrics.map((metric) => (
              <Card key={metric.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className={cn(
                        "h-3 w-3",
                        metric.category === 'vulnerability_management' ? "text-red-500" : "text-green-500"
                      )} />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className={cn(
                        "h-3 w-3",
                        metric.category === 'vulnerability_management' ? "text-green-500" : "text-red-500"
                      )} />
                    ) : (
                      <Minus className="h-3 w-3 text-gray-500" />
                    )}
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      metric.status === 'good' && "bg-green-500",
                      metric.status === 'warning' && "bg-yellow-500",
                      metric.status === 'critical' && "bg-red-500"
                    )} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className={cn(
                      "font-medium",
                      metric.value > metric.previousValue ? 
                        (metric.category === 'vulnerability_management' ? "text-red-600" : "text-green-600") : 
                        (metric.category === 'vulnerability_management' ? "text-green-600" : "text-red-600")
                    )}>
                      {metric.value > metric.previousValue ? '+' : ''}
                      {(((metric.value - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
                    </span>
                    <span className="ml-2">{formatTimeAgo(metric.lastUpdated)}</span>
                  </div>
                  {metric.target && (
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className={cn(
                        "mt-2 h-2",
                        metric.status === 'critical' && "bg-red-100 [&>div]:bg-red-500",
                        metric.status === 'warning' && "bg-yellow-100 [&>div]:bg-yellow-500",
                        metric.status === 'good' && "bg-green-100 [&>div]:bg-green-500"
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Recent Security Events</span>
                  {openEvents > 0 && (
                    <Badge variant="destructive" className="ml-2">{openEvents}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Eventos de seguridad recientes que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {securityEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg border",
                        event.status === 'open' && "bg-red-50 border-red-200"
                      )}>
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.type)}
                          {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{event.type.replace(/_/g, ' ')}</Badge>
                            <Badge variant="outline" className={cn("text-xs", getSeverityColor(event.severity))}>
                              {event.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</span>
                          </div>
                        </div>
                        {getStatusIcon(event.status)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button className="w-full mt-4" onClick={() => setActiveTab('events')}>
                  <Shield className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Critical Vulnerabilities</span>
                  {criticalVulns > 0 && (
                    <Badge variant="destructive" className="ml-2">{criticalVulns}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Vulnerabilidades críticas que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').slice(0, 4).map((vuln) => (
                    <div key={vuln.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      {getSeverityIcon(vuln.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{vuln.title}</p>
                        <p className="text-xs text-muted-foreground">
                          CVSS: {vuln.cvssScore} | {vuln.category.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(vuln.severity))}>
                            {vuln.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{vuln.status.replace(/_/g, ' ')}</Badge>
                          {vuln.exploitPublic && (
                            <Badge variant="destructive" className="text-xs">Public Exploit</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('vulnerabilities')}>
                  <Bug className="h-4 w-4 mr-2" />
                  View All Vulnerabilities
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="h-5 w-5" />
                  <span>Security Scans</span>
                </CardTitle>
                <CardDescription>Estado de escaneos de seguridad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="text-sm font-medium">{scan.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{scan.type} scan</p>
                          {scan.status === 'running' && (
                            <Progress value={scan.progress} className="w-32 h-1 mt-1" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{scan.findings.total}</p>
                        <p className="text-xs text-muted-foreground">findings</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('scans')}>
                  <Target className="h-4 w-4 mr-2" />
                  Manage Scans
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>High Risk Users</span>
                  {highRiskUsers > 0 && (
                    <Badge variant="destructive" className="ml-2">{highRiskUsers}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Usuarios con patrones de riesgo elevado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityUsers.filter(u => u.riskScore > 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          user.accessPattern === 'normal' && "bg-green-500",
                          user.accessPattern === 'suspicious' && "bg-yellow-500",
                          user.accessPattern === 'anomalous' && "bg-red-500"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Risk: {user.riskScore.toFixed(1)} | {user.anomalousActivities} anomalies
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {user.locked && <Lock className="h-3 w-3 text-red-500" />}
                        {!user.mfaEnabled && <Key className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('users')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  View User Security
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Compliance Status</span>
                </CardTitle>
                <CardDescription>Estado de frameworks de compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceFrameworks.map((framework) => (
                    <div key={framework.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{framework.name}</p>
                        <span className="text-sm text-muted-foreground">
                          {framework.complianceScore.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={framework.complianceScore}
                        className={cn(
                          "h-2",
                          framework.complianceScore >= 90 && "bg-green-100 [&>div]:bg-green-500",
                          framework.complianceScore >= 70 && framework.complianceScore < 90 && "bg-yellow-100 [&>div]:bg-yellow-500",
                          framework.complianceScore < 70 && "bg-red-100 [&>div]:bg-red-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab('compliance')}>
                  <Shield className="h-4 w-4 mr-2" />
                  View Compliance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Security Events</h2>
              <p className="text-muted-foreground">
                Eventos de seguridad y incidentes del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
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
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedEvent?.id === event.id && "ring-2 ring-primary",
                event.status === 'open' && "border-l-4 border-l-red-500"
              )} onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.type)}
                        {getSeverityIcon(event.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{event.title}</h3>
                          <Badge variant="outline" className="text-xs">{event.type.replace(/_/g, ' ')}</Badge>
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(event.severity))}>
                            {event.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Risk: {event.riskScore.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Source: {event.source.ip}</span>
                          {event.source.userName && <span>User: {event.source.userName}</span>}
                          <span>Target: {event.target.resource}</span>
                          <span>{formatTimeAgo(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(event.status)}
                        <span className="text-sm capitalize">{event.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent?.id === event.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Source Information</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-muted-foreground">IP Address:</span> {event.source.ip}</div>
                            {event.source.userName && (
                              <div><span className="text-muted-foreground">User:</span> {event.source.userName}</div>
                            )}
                            {event.source.userAgent && (
                              <div><span className="text-muted-foreground">User Agent:</span> {event.source.userAgent}</div>
                            )}
                            {event.source.location && (
                              <div><span className="text-muted-foreground">Location:</span> {event.source.location}</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Target Information</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-muted-foreground">Resource:</span> {event.target.resource}</div>
                            {event.target.endpoint && (
                              <div><span className="text-muted-foreground">Endpoint:</span> {event.target.endpoint}</div>
                            )}
                            {event.target.method && (
                              <div><span className="text-muted-foreground">Method:</span> {event.target.method}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {event.evidence.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Evidence</h4>
                          <div className="space-y-2">
                            {event.evidence.map((evidence, index) => (
                              <div key={index} className="flex items-start space-x-2 text-sm">
                                <Badge variant="outline" className="text-xs">{evidence.type}</Badge>
                                <span>{evidence.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.mitigation.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Mitigation Actions</h4>
                          <div className="space-y-2">
                            {event.mitigation.map((action, index) => (
                              <div key={index} className="flex items-start space-x-2 text-sm">
                                {action.result === 'success' ? 
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> :
                                  action.result === 'failed' ?
                                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" /> :
                                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                }
                                <div>
                                  <div>{action.action}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatTimeAgo(action.timestamp)} • {action.result}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-4 border-t">
                        {event.status === 'open' && (
                          <Button size="sm" onClick={() => handleResolveEvent(event.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <User className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Vulnerability Management</h2>
              <p className="text-muted-foreground">
                Gestión y seguimiento de vulnerabilidades del sistema
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Vulnerability
            </Button>
          </div>

          <div className="space-y-4">
            {vulnerabilities.map((vuln) => (
              <Card key={vuln.id} className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedVulnerability?.id === vuln.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedVulnerability(selectedVulnerability?.id === vuln.id ? null : vuln)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      {getSeverityIcon(vuln.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{vuln.title}</h3>
                          {vuln.cve && <Badge variant="outline" className="text-xs">{vuln.cve}</Badge>}
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(vuln.severity))}>
                            {vuln.severity} • {vuln.cvssScore}
                          </Badge>
                          {vuln.exploitPublic && (
                            <Badge variant="destructive" className="text-xs">Public Exploit</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Category: {vuln.category.replace(/_/g, ' ')}</span>
                          <span>Discovered: {formatTimeAgo(vuln.discoveredAt)}</span>
                          <span>Systems: {vuln.affected.systems.length}</span>
                          {vuln.assignedTo && <span>Assigned: {vuln.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(vuln.status)}
                      <span className="text-sm capitalize">{vuln.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {selectedVulnerability?.id === vuln.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Affected Systems</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground text-xs">Systems:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {vuln.affected.systems.map(system => (
                                  <Badge key={system} variant="secondary" className="text-xs">{system}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Components:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {vuln.affected.components.map(component => (
                                  <Badge key={component} variant="secondary" className="text-xs">{component}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Versions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {vuln.affected.versions.map(version => (
                                  <Badge key={version} variant="outline" className="text-xs">{version}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Remediation Plan</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Priority:</span>
                              <Badge variant={vuln.remediation.priority === 1 ? "destructive" : "outline"} className="text-xs">
                                P{vuln.remediation.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Est. Time:</span>
                              <span>{vuln.remediation.estimatedTime} hours</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Patch Available:</span>
                              {vuln.patchAvailable ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-muted-foreground text-xs">Steps:</span>
                            <ol className="text-xs mt-1 space-y-1">
                              {vuln.remediation.steps.map((step, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-muted-foreground">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 border-t">
                        {vuln.status === 'open' && (
                          <Button size="sm" onClick={() => handleAssignVulnerability(vuln.id, 'security@metrica.com')}>
                            <User className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export Details
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scans" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Security Scans</h2>
              <p className="text-muted-foreground">
                Configuración y gestión de escaneos de seguridad
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </div>

          <div className="space-y-4">
            {securityScans.map((scan) => (
              <Card key={scan.id} className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedScan?.id === scan.id && "ring-2 ring-primary"
              )} onClick={() => setSelectedScan(selectedScan?.id === scan.id ? null : scan)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      {getStatusIcon(scan.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{scan.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">{scan.type}</Badge>
                          <Badge variant="outline" className="text-xs">{scan.target.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Target: {scan.target.identifier}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Started: {formatTimeAgo(scan.startedAt)}</span>
                          {scan.duration && <span>Duration: {Math.floor(scan.duration / 60)}min</span>}
                          <span>Findings: {scan.findings.total}</span>
                        </div>
                        {scan.status === 'running' && (
                          <div className="mt-2">
                            <Progress value={scan.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{scan.progress}% complete</span>
                              <span>ETA: ~{Math.round((100 - scan.progress) * 2)}min</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm capitalize">{scan.status}</span>
                      {scan.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleRunScan(scan.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedScan?.id === scan.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Findings Summary</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Critical:</span>
                              <Badge variant={scan.findings.critical > 0 ? "destructive" : "outline"} className="text-xs">
                                {scan.findings.critical}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">High:</span>
                              <Badge variant={scan.findings.high > 0 ? "destructive" : "outline"} className="text-xs">
                                {scan.findings.high}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Medium:</span>
                              <Badge variant={scan.findings.medium > 0 ? "outline" : "secondary"} className="text-xs">
                                {scan.findings.medium}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Low:</span>
                              <Badge variant="secondary" className="text-xs">
                                {scan.findings.low}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Configuration</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(scan.configuration).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                                <span className="ml-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {scan.schedule && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Schedule</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Switch checked={scan.schedule.enabled} />
                              <span className="capitalize">{scan.schedule.frequency}</span>
                            </div>
                            {scan.schedule.nextRun && (
                              <span className="text-muted-foreground">
                                Next run: {formatTimeAgo(scan.schedule.nextRun)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
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

        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Security Policies</h2>
              <p className="text-muted-foreground">
                Políticas de seguridad y reglas de enforcement
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>

          <div className="space-y-4">
            {securityPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch checked={policy.enabled} />
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <CardDescription>{policy.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={cn("text-xs", getSeverityColor(policy.severity))}>
                        {policy.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{policy.category.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Enforcement Rate</h4>
                      <div className="text-2xl font-bold">{policy.enforcementRate.toFixed(1)}%</div>
                      <Progress value={policy.enforcementRate} className="h-2 mt-1" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Violations</h4>
                      <div className="text-2xl font-bold">{policy.violationCount}</div>
                      <div className="text-xs text-muted-foreground">Total violations</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Compliance</h4>
                      <div className="flex flex-wrap gap-1">
                        {policy.compliance.map(comp => (
                          <Badge key={comp} variant="secondary" className="text-xs">{comp}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Policy Rules ({policy.rules.length})</h4>
                    <div className="space-y-2">
                      {policy.rules.slice(0, 3).map((rule) => (
                        <div key={rule.id} className="p-2 border rounded text-sm">
                          <div className="flex items-center justify-between">
                            <code className="bg-muted px-2 py-1 rounded text-xs">{rule.condition}</code>
                            <Badge variant="outline" className="text-xs capitalize">{rule.action}</Badge>
                          </div>
                        </div>
                      ))}
                      {policy.rules.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{policy.rules.length - 3} more rules
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Policy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Violations
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Compliance Management</h2>
              <p className="text-muted-foreground">
                Frameworks de compliance y controles de seguridad
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Framework
            </Button>
          </div>

          <div className="space-y-6">
            {complianceFrameworks.map((framework) => (
              <Card key={framework.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{framework.name}</CardTitle>
                      <CardDescription>{framework.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{framework.complianceScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Progress value={framework.complianceScore} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>Target: 90%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Assessment Info</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Last Assessment:</span> {formatTimeAgo(framework.lastAssessment)}</div>
                        <div><span className="text-muted-foreground">Next Assessment:</span> {formatTimeAgo(framework.nextAssessment)}</div>
                        <div><span className="text-muted-foreground">Assessor:</span> {framework.assessor}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Control Status</h4>
                      <div className="space-y-1">
                        {['compliant', 'partial', 'non_compliant', 'not_assessed'].map(status => {
                          const count = framework.controls.filter(c => c.status === status).length
                          return (
                            <div key={status} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                              <Badge variant="outline" className="text-xs">{count}</Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Actions Required</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-red-600">
                          {framework.controls.filter(c => c.status === 'non_compliant').length} non-compliant controls
                        </div>
                        <div className="text-yellow-600">
                          {framework.controls.filter(c => c.status === 'partial').length} partial controls
                        </div>
                        <div className="text-gray-600">
                          {framework.controls.filter(c => c.status === 'not_assessed').length} pending assessment
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">Key Controls</h4>
                    <div className="space-y-2">
                      {framework.controls.slice(0, 3).map((control) => (
                        <div key={control.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{control.id}</span>
                              <span className="text-sm">{control.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(control.status)}
                              <span className="text-sm capitalize">{control.status.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{control.description}</p>
                          {control.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Notes:</span> {control.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View All Controls
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Assessment Report
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Threat Intelligence</h2>
              <p className="text-muted-foreground">
                Inteligencia de amenazas e indicadores de compromiso
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import IOCs
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Indicator
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {threatIntelligence.map((threat) => (
              <Card key={threat.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      {getSeverityIcon(threat.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium font-mono">{threat.value}</h3>
                          <Badge variant="outline" className="text-xs uppercase">{threat.type}</Badge>
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(threat.severity))}>
                            {threat.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {threat.confidence}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{threat.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Source: {threat.source}</span>
                          <span>First seen: {formatTimeAgo(threat.firstSeen)}</span>
                          <span>Last seen: {formatTimeAgo(threat.lastSeen)}</span>
                          {threat.associatedEvents.length > 0 && (
                            <span>{threat.associatedEvents.length} events</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {threat.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {threat.blocklisted && (
                        <Badge variant="destructive" className="text-xs">Blocked</Badge>
                      )}
                      {threat.whitelisted && (
                        <Badge variant="outline" className="text-xs">Whitelisted</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">User Security</h2>
              <p className="text-muted-foreground">
                Análisis de seguridad y comportamiento de usuarios
              </p>
            </div>
            <Button>
              <UserCheck className="h-4 w-4 mr-2" />
              Security Review
            </Button>
          </div>

          <div className="space-y-4">
            {securityUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        user.accessPattern === 'normal' && "bg-green-100",
                        user.accessPattern === 'suspicious' && "bg-yellow-100",
                        user.accessPattern === 'anomalous' && "bg-red-100"
                      )}>
                        <User className={cn(
                          "h-4 w-4",
                          user.accessPattern === 'normal' && "text-green-600",
                          user.accessPattern === 'suspicious' && "text-yellow-600",
                          user.accessPattern === 'anomalous' && "text-red-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium">{user.username}</h3>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                          {user.locked && <Lock className="h-4 w-4 text-red-500" />}
                          {!user.mfaEnabled && <Key className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Last login: {formatTimeAgo(user.lastLogin)}</span>
                          <span>Failed attempts: {user.failedAttempts}</span>
                          <span>Risk score: {user.riskScore.toFixed(1)}</span>
                          <span>Anomalies: {user.anomalousActivities}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        user.accessPattern === 'normal' && "border-green-500 text-green-700",
                        user.accessPattern === 'suspicious' && "border-yellow-500 text-yellow-700",
                        user.accessPattern === 'anomalous' && "border-red-500 text-red-700"
                      )}>
                        {user.accessPattern}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Permissions</h4>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">{permission}</Badge>
                          ))}
                          {user.permissions.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Devices ({user.devices.length})</h4>
                        <div className="space-y-1">
                          {user.devices.map(device => (
                            <div key={device.id} className="flex items-center justify-between text-xs">
                              <span>{device.type}</span>
                              <div className="flex items-center space-x-1">
                                {device.trusted ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className="text-muted-foreground">
                                  {formatTimeAgo(device.lastSeen)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Activity
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="h-4 w-4 mr-1" />
                        Security Actions
                      </Button>
                      {user.riskScore > 7 && (
                        <Button size="sm" variant="destructive">
                          <Lock className="h-4 w-4 mr-1" />
                          Lock Account
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}