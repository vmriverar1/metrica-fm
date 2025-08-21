'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Database,
  HardDrive,
  Cloud,
  Download,
  Upload,
  Save,
  RotateCcw,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Activity,
  Archive,
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music,
  RefreshCw,
  Play,
  Pause,
  Square,
  FastForward,
  Shield,
  Key,
  Lock,
  Unlock,
  Server,
  Globe,
  Wifi,
  WifiOff,
  Timer,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  History,
  Copy,
  Share2,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

// Interfaces principales
export interface BackupJob {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential' | 'snapshot';
  source: {
    type: 'database' | 'files' | 'application' | 'system' | 'custom';
    location: string;
    includes: string[];
    excludes: string[];
    compression: boolean;
    encryption: boolean;
  };
  destination: {
    type: 'local' | 'aws_s3' | 'google_cloud' | 'azure' | 'ftp' | 'sftp' | 'custom';
    location: string;
    credentials?: {
      accessKey?: string;
      secretKey?: string;
      bucket?: string;
      region?: string;
      endpoint?: string;
    };
    retention: {
      days: number;
      maxBackups: number;
      archiveAfter?: number;
    };
  };
  schedule: {
    enabled: boolean;
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    time?: string;
    days?: number[];
    timezone: string;
    cron?: string;
  };
  options: {
    compression: {
      enabled: boolean;
      algorithm: 'gzip' | 'bzip2' | 'lzma' | 'lz4';
      level: number;
    };
    encryption: {
      enabled: boolean;
      algorithm: 'AES256' | 'AES128' | 'ChaCha20';
      key?: string;
      keyFile?: string;
    };
    verification: {
      enabled: boolean;
      checksum: 'md5' | 'sha1' | 'sha256' | 'sha512';
      testRestore: boolean;
    };
    notifications: {
      onSuccess: boolean;
      onFailure: boolean;
      onWarning: boolean;
      recipients: string[];
    };
  };
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  duration?: number;
  size?: number;
  progress?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  averageSize: number;
}

export interface BackupExecution {
  id: string;
  jobId: string;
  jobName: string;
  type: BackupJob['type'];
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'warning';
  startTime: string;
  endTime?: string;
  duration?: number;
  size?: number;
  compressedSize?: number;
  filesCount?: number;
  progress: number;
  currentOperation?: string;
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    details?: any;
  }[];
  metrics: {
    throughput: number;
    compressionRatio: number;
    errorCount: number;
    warningCount: number;
    skippedFiles: number;
  };
  location: string;
  checksum?: string;
  verificationStatus?: 'pending' | 'passed' | 'failed' | 'skipped';
  triggeredBy: 'schedule' | 'manual' | 'api' | 'workflow';
  errorMessage?: string;
  warningMessages?: string[];
}

export interface BackupStorage {
  id: string;
  name: string;
  type: 'local' | 'aws_s3' | 'google_cloud' | 'azure' | 'ftp' | 'sftp' | 'custom';
  location: string;
  config: {
    endpoint?: string;
    region?: string;
    bucket?: string;
    path?: string;
    credentials?: Record<string, string>;
    ssl?: boolean;
    port?: number;
  };
  status: 'online' | 'offline' | 'error' | 'testing';
  capacity: {
    total: number;
    used: number;
    available: number;
  };
  performance: {
    uploadSpeed: number;
    downloadSpeed: number;
    latency: number;
    availability: number;
  };
  metrics: {
    backupsCount: number;
    totalSize: number;
    oldestBackup: string;
    newestBackup: string;
    averageBackupSize: number;
  };
  retention: {
    defaultDays: number;
    maxBackups: number;
    autoCleanup: boolean;
    archiveAfterDays?: number;
  };
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLog: boolean;
    redundancy: number;
  };
  isDefault: boolean;
  lastHealthCheck: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupRestore {
  id: string;
  backupExecutionId: string;
  backupJobName: string;
  type: 'full' | 'partial' | 'point_in_time' | 'test';
  destination: {
    type: 'original' | 'custom' | 'temporary';
    location?: string;
  };
  options: {
    overwrite: boolean;
    mergeMode: 'replace' | 'merge' | 'preserve';
    verification: boolean;
    rollback: boolean;
  };
  filters: {
    filePatterns?: string[];
    excludePatterns?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  status: 'preparing' | 'running' | 'completed' | 'failed' | 'cancelled' | 'verifying';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  currentOperation?: string;
  filesRestored: number;
  filesSkipped: number;
  errors: string[];
  warnings: string[];
  restoredSize: number;
  verificationResult?: 'passed' | 'failed' | 'warning';
  initiatedBy: string;
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
}

interface BackupManagerProps {
  jobs: BackupJob[];
  executions: BackupExecution[];
  storages: BackupStorage[];
  restores: BackupRestore[];
  onJobsChange: (jobs: BackupJob[]) => void;
  onStoragesChange: (storages: BackupStorage[]) => void;
  onJobCreate: (job: Partial<BackupJob>) => Promise<BackupJob>;
  onJobUpdate: (id: string, updates: Partial<BackupJob>) => Promise<void>;
  onJobDelete: (id: string) => Promise<void>;
  onJobRun: (jobId: string) => Promise<BackupExecution>;
  onJobStop: (executionId: string) => Promise<void>;
  onRestore: (executionId: string, options: Partial<BackupRestore>) => Promise<BackupRestore>;
  onStorageTest: (storageId: string) => Promise<boolean>;
  currentUser?: { id: string; name: string };
  readOnly?: boolean;
}

const BackupManager: React.FC<BackupManagerProps> = ({
  jobs,
  executions,
  storages,
  restores,
  onJobsChange,
  onStoragesChange,
  onJobCreate,
  onJobUpdate,
  onJobDelete,
  onJobRun,
  onJobStop,
  onRestore,
  onStorageTest,
  currentUser,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<BackupExecution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});

  // Estadísticas y métricas
  const jobStats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(j => j.isActive).length;
    const running = executions.filter(e => e.status === 'running').length;
    const failed = jobs.filter(j => j.status === 'failed').length;
    const totalBackups = jobs.reduce((sum, j) => sum + j.executionCount, 0);
    const successRate = jobs.length > 0 
      ? Math.round(jobs.reduce((sum, j) => sum + (j.successCount / (j.executionCount || 1) * 100), 0) / jobs.length)
      : 0;
    
    return {
      total,
      active,
      running,
      failed,
      totalBackups,
      successRate
    };
  }, [jobs, executions]);

  const storageStats = useMemo(() => {
    const totalCapacity = storages.reduce((sum, s) => sum + s.capacity.total, 0);
    const totalUsed = storages.reduce((sum, s) => sum + s.capacity.used, 0);
    const usagePercent = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
    const onlineCount = storages.filter(s => s.status === 'online').length;
    
    return {
      totalCapacity,
      totalUsed,
      usagePercent,
      onlineCount,
      totalStorages: storages.length
    };
  }, [storages]);

  const recentExecutions = useMemo(() => {
    return executions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10);
  }, [executions]);

  // Handlers
  const handleJobRun = useCallback(async (jobId: string) => {
    if (isRunning[jobId] || readOnly) return;
    
    setIsRunning(prev => ({ ...prev, [jobId]: true }));
    
    try {
      await onJobRun(jobId);
    } catch (error) {
      console.error('Error running backup job:', error);
    } finally {
      setIsRunning(prev => ({ ...prev, [jobId]: false }));
    }
  }, [isRunning, onJobRun, readOnly]);

  const handleJobStop = useCallback(async (executionId: string) => {
    try {
      await onJobStop(executionId);
    } catch (error) {
      console.error('Error stopping backup job:', error);
    }
  }, [onJobStop]);

  const handleStorageTest = useCallback(async (storageId: string) => {
    try {
      const result = await onStorageTest(storageId);
      return result;
    } catch (error) {
      console.error('Error testing storage:', error);
      return false;
    }
  }, [onStorageTest]);

  const getJobTypeIcon = (type: BackupJob['type']) => {
    switch (type) {
      case 'full':
        return <Database className="w-4 h-4" />;
      case 'incremental':
        return <TrendingUp className="w-4 h-4" />;
      case 'differential':
        return <BarChart3 className="w-4 h-4" />;
      case 'snapshot':
        return <Camera className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStorageIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <HardDrive className="w-4 h-4" />;
      case 'aws_s3':
      case 'google_cloud':
      case 'azure':
        return <Cloud className="w-4 h-4" />;
      case 'ftp':
      case 'sftp':
        return <Server className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Backups</h2>
          <p className="text-sm text-gray-600">
            Sistema completo de respaldos y recuperación de datos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateJob(true)}
            disabled={readOnly}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Backup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{jobStats.total}</p>
                <p className="text-sm text-gray-600">Jobs de Backup</p>
              </div>
              <Archive className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {jobStats.active} activos
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{jobStats.successRate}%</p>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {jobStats.totalBackups} total
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatBytes(storageStats.totalUsed)}</p>
                <p className="text-sm text-gray-600">Usado</p>
              </div>
              <HardDrive className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Progress value={storageStats.usagePercent} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {storageStats.usagePercent}% de {formatBytes(storageStats.totalCapacity)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{storageStats.onlineCount}</p>
                <p className="text-sm text-gray-600">Storages Online</p>
              </div>
              <Cloud className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                de {storageStats.totalStorages} total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
          <TabsTrigger value="storages">Almacenamiento</TabsTrigger>
          <TabsTrigger value="restore">Restaurar</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="running">Ejecutando</SelectItem>
                  <SelectItem value="failed">Fallidos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="differential">Diferencial</SelectItem>
                  <SelectItem value="snapshot">Snapshot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getJobTypeIcon(job.type)}
                      <div>
                        <CardTitle className="text-base">{job.name}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.isActive ? 'default' : 'secondary'}>
                        {job.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status === 'completed' ? 'OK' :
                         job.status === 'failed' ? 'Error' :
                         job.status === 'running' ? 'Ejecutando' : job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <p className="font-medium capitalize">{job.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Origen:</span>
                      <p className="font-medium capitalize">{job.source.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Destino:</span>
                      <p className="font-medium capitalize">{job.destination.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Frecuencia:</span>
                      <p className="font-medium capitalize">{job.schedule.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{job.successCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span>{job.failureCount}</span>
                      </div>
                      {job.averageSize > 0 && (
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-blue-500" />
                          <span>{formatBytes(job.averageSize)}</span>
                        </div>
                      )}
                    </div>
                    
                    {job.options.encryption.enabled && (
                      <Lock className="w-3 h-3 text-yellow-500" title="Encriptado" />
                    )}
                  </div>
                  
                  {job.lastRun && (
                    <p className="text-xs text-gray-500">
                      Último: {formatTimeAgo(job.lastRun)}
                      {job.duration && ` (${formatDuration(job.duration)})`}
                    </p>
                  )}
                  
                  {job.nextRun && job.schedule.enabled && (
                    <p className="text-xs text-gray-500">
                      Próximo: {new Date(job.nextRun).toLocaleString()}
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={job.isActive}
                        onCheckedChange={(checked) => {
                          // Update job active state
                        }}
                        disabled={readOnly}
                        size="sm"
                      />
                      <Label className="text-xs">Activo</Label>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {job.status !== 'running' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJobRun(job.id)}
                          disabled={isRunning[job.id] || readOnly}
                        >
                          {isRunning[job.id] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={readOnly}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ejecuciones Recientes</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(execution.status)}
                      <div>
                        <p className="text-sm font-medium">{execution.jobName}</p>
                        <p className="text-sm text-gray-600">
                          {execution.type} backup • {execution.triggeredBy}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{new Date(execution.startTime).toLocaleString()}</span>
                          {execution.duration && (
                            <span>Duración: {formatDuration(execution.duration)}</span>
                          )}
                          {execution.size && (
                            <span>Tamaño: {formatBytes(execution.size)}</span>
                          )}
                          {execution.compressedSize && execution.size && (
                            <span>
                              Compresión: {Math.round(((execution.size - execution.compressedSize) / execution.size) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {execution.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <Progress value={execution.progress} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">{execution.progress}%</span>
                        </div>
                      )}
                      
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status === 'completed' ? 'Completado' :
                         execution.status === 'failed' ? 'Error' :
                         execution.status === 'running' ? 'Ejecutando' :
                         execution.status === 'warning' ? 'Advertencia' : execution.status}
                      </Badge>
                      
                      {execution.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRestoreModal(true);
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {recentExecutions.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay ejecuciones recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storages Tab */}
        <TabsContent value="storages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Almacenamiento de Backups</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Storage
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storages.map((storage) => (
              <Card key={storage.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStorageIcon(storage.type)}
                      <div>
                        <CardTitle className="text-base">{storage.name}</CardTitle>
                        <CardDescription className="capitalize">{storage.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {storage.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Predeterminado
                        </Badge>
                      )}
                      <Badge variant={
                        storage.status === 'online' ? 'default' :
                        storage.status === 'testing' ? 'secondary' :
                        storage.status === 'offline' ? 'outline' : 'destructive'
                      }>
                        {storage.status === 'online' ? '🟢 Online' :
                         storage.status === 'offline' ? '🔴 Offline' :
                         storage.status === 'testing' ? '🟡 Testing' : '❌ Error'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uso del almacenamiento</span>
                      <span>{Math.round((storage.capacity.used / storage.capacity.total) * 100)}%</span>
                    </div>
                    <Progress value={(storage.capacity.used / storage.capacity.total) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatBytes(storage.capacity.used)} usado</span>
                      <span>{formatBytes(storage.capacity.available)} disponible</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Backups:</span>
                      <p className="font-medium">{storage.metrics.backupsCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tamaño total:</span>
                      <p className="font-medium">{formatBytes(storage.metrics.totalSize)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Upload:</span>
                      <p className="font-medium">{storage.performance.uploadSpeed} MB/s</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Disponibilidad:</span>
                      <p className="font-medium">{storage.performance.availability}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {storage.security.encryption && (
                        <Lock className="w-3 h-3" title="Encriptado" />
                      )}
                      {storage.security.redundancy > 1 && (
                        <Shield className="w-3 h-3" title={`Redundancia ${storage.security.redundancy}x`} />
                      )}
                      {storage.retention.autoCleanup && (
                        <Timer className="w-3 h-3" title="Auto-cleanup habilitado" />
                      )}
                    </div>
                    <span>Revisado: {formatTimeAgo(storage.lastHealthCheck)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {storage.metrics.oldestBackup && 
                        `Más antiguo: ${formatTimeAgo(storage.metrics.oldestBackup)}`
                      }
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStorageTest(storage.id)}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={readOnly}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Restore Tab */}
        <TabsContent value="restore" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Restaurar Backups</h3>
            <Button size="sm" disabled={readOnly}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Nueva Restauración
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La restauración de datos es una operación crítica. Asegúrate de hacer un backup 
              del estado actual antes de proceder con cualquier restauración.
            </AlertDescription>
          </Alert>

          {/* Recent Restores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Restauraciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restores.map((restore) => (
                  <div key={restore.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(restore.status)}
                      <div>
                        <p className="text-sm font-medium">{restore.backupJobName}</p>
                        <p className="text-sm text-gray-600">
                          {restore.type} restore • Por {restore.initiatedBy}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{new Date(restore.startTime).toLocaleString()}</span>
                          {restore.duration && (
                            <span>Duración: {formatDuration(restore.duration)}</span>
                          )}
                          <span>Archivos: {restore.filesRestored}</span>
                          {restore.restoredSize > 0 && (
                            <span>Tamaño: {formatBytes(restore.restoredSize)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {restore.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <Progress value={restore.progress} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">{restore.progress}%</span>
                        </div>
                      )}
                      
                      <Badge className={getStatusColor(restore.status)}>
                        {restore.status === 'completed' ? 'Completado' :
                         restore.status === 'failed' ? 'Error' :
                         restore.status === 'running' ? 'Ejecutando' :
                         restore.status === 'verifying' ? 'Verificando' : restore.status}
                      </Badge>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {restores.length === 0 && (
                <div className="text-center py-8">
                  <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay restauraciones recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Monitor de Backups</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="animate-pulse">
                🟢 En vivo
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Running Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backups en Ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              {executions.filter(e => e.status === 'running').length > 0 ? (
                <div className="space-y-4">
                  {executions
                    .filter(e => e.status === 'running')
                    .map((execution) => (
                      <div key={execution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium">{execution.jobName}</h4>
                            <p className="text-sm text-gray-600">
                              Iniciado: {new Date(execution.startTime).toLocaleString()}
                            </p>
                            {execution.currentOperation && (
                              <p className="text-sm text-blue-600">
                                {execution.currentOperation}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {execution.type} backup
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobStop(execution.id)}
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>{execution.progress}%</span>
                          </div>
                          <Progress value={execution.progress} className="h-3" />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-600">Throughput:</span>
                            <p className="font-medium">{execution.metrics.throughput} MB/s</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Archivos:</span>
                            <p className="font-medium">{execution.filesCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tamaño:</span>
                            <p className="font-medium">{formatBytes(execution.size || 0)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Compresión:</span>
                            <p className="font-medium">{execution.metrics.compressionRatio || 0}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay backups ejecutándose actualmente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Jobs activos</span>
                    <span className="font-medium text-green-600">{jobStats.active}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jobs ejecutando</span>
                    <span className="font-medium text-blue-600">{jobStats.running}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jobs fallidos</span>
                    <span className="font-medium text-red-600">{jobStats.failed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storages online</span>
                    <span className="font-medium text-green-600">{storageStats.onlineCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimas 24h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completados</span>
                    <span className="text-sm font-medium text-green-600">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fallidos</span>
                    <span className="text-sm font-medium text-red-600">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total datos</span>
                    <span className="text-sm font-medium">127 GB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tasa de éxito</span>
                    <span className="text-sm font-bold text-green-600">96.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Storage AWS S3 con 85% de uso
                    </AlertDescription>
                  </Alert>
                  <div className="text-center text-sm text-gray-500">
                    No hay más alertas críticas
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackupManager;