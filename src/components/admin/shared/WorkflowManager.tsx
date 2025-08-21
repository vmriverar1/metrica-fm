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
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  ArrowRight,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Zap,
  GitBranch,
  Timer,
  Target,
  MessageCircle,
  Mail,
  Phone,
  Webhook,
  Code,
  Database,
  Globe,
  FileText,
  Image,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Interfaces principales
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'webhook' | 'delay' | 'condition' | 'action' | 'transform';
  position: { x: number; y: number };
  config: {
    // Approval step
    approvers?: string[];
    approvalType?: 'any' | 'all' | 'majority';
    autoApprove?: boolean;
    timeout?: number;
    
    // Notification step
    recipients?: string[];
    template?: string;
    channels?: ('email' | 'sms' | 'push' | 'slack' | 'webhook')[];
    
    // Webhook step
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    payload?: string;
    retries?: number;
    
    // Delay step
    duration?: number;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    
    // Condition step
    conditions?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
      value: any;
      logic?: 'and' | 'or';
    }[];
    
    // Action step
    action?: string;
    parameters?: Record<string, any>;
    
    // Transform step
    transformations?: {
      field: string;
      operation: 'set' | 'append' | 'remove' | 'calculate';
      value: any;
    }[];
  };
  connections: {
    success?: string;
    failure?: string;
    timeout?: string;
    condition?: Record<string, string>;
  };
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  executionTime?: number;
  lastRun?: string;
  errorMessage?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'user' | 'system' | 'custom' | 'integration';
  version: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  trigger: {
    type: 'manual' | 'schedule' | 'webhook' | 'event' | 'file_upload' | 'form_submit';
    config: {
      // Schedule trigger
      cron?: string;
      timezone?: string;
      
      // Webhook trigger
      endpoint?: string;
      method?: string;
      authentication?: 'none' | 'basic' | 'bearer' | 'api_key';
      
      // Event trigger
      events?: string[];
      conditions?: any[];
      
      // File upload trigger
      fileTypes?: string[];
      folder?: string;
      
      // Form submit trigger
      formId?: string;
    };
  };
  steps: WorkflowStep[];
  variables: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    defaultValue?: any;
    required?: boolean;
    description?: string;
  }[];
  settings: {
    maxExecutionTime: number;
    retryAttempts: number;
    retryDelay: number;
    enableLogging: boolean;
    notifyOnError: boolean;
    errorRecipients: string[];
    parallelExecution: boolean;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
  permissions: {
    read: string[];
    execute: string[];
    modify: string[];
    delete: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: string;
  triggerData?: any;
  currentStep?: string;
  completedSteps: string[];
  failedSteps: string[];
  stepExecutions: {
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: string;
    endTime?: string;
    duration?: number;
    input?: any;
    output?: any;
    errorMessage?: string;
    retryCount?: number;
  }[];
  variables: Record<string, any>;
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    stepId?: string;
    data?: any;
  }[];
  result?: any;
  errorMessage?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  workflow: Partial<Workflow>;
  isBuiltIn: boolean;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number;
}

interface WorkflowManagerProps {
  workflows: Workflow[];
  executions: WorkflowExecution[];
  templates: WorkflowTemplate[];
  onWorkflowsChange: (workflows: Workflow[]) => void;
  onWorkflowExecute: (workflowId: string, data?: any) => Promise<WorkflowExecution>;
  onWorkflowStop: (executionId: string) => Promise<void>;
  onWorkflowCreate: (workflow: Partial<Workflow>) => Promise<Workflow>;
  onWorkflowUpdate: (id: string, updates: Partial<Workflow>) => Promise<void>;
  onWorkflowDelete: (id: string) => Promise<void>;
  onTemplateUse: (templateId: string) => Promise<Workflow>;
  currentUser?: { id: string; name: string };
  readOnly?: boolean;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows,
  executions,
  templates,
  onWorkflowsChange,
  onWorkflowExecute,
  onWorkflowStop,
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowDelete,
  onTemplateUse,
  currentUser,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState<Record<string, boolean>>({});

  // Filtros y estadísticas
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [workflows, searchTerm, filterCategory, filterStatus]);

  const recentExecutions = useMemo(() => {
    return executions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 20);
  }, [executions]);

  const workflowStats = useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter(w => w.status === 'active').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
    const avgSuccessRate = workflows.length > 0 
      ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length 
      : 0;
    
    return {
      total,
      active,
      totalExecutions,
      avgSuccessRate: Math.round(avgSuccessRate)
    };
  }, [workflows]);

  // Handlers
  const handleWorkflowExecute = useCallback(async (workflowId: string) => {
    if (isExecuting[workflowId] || readOnly) return;
    
    setIsExecuting(prev => ({ ...prev, [workflowId]: true }));
    
    try {
      const execution = await onWorkflowExecute(workflowId);
      console.log('Workflow executed:', execution);
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(prev => ({ ...prev, [workflowId]: false }));
    }
  }, [isExecuting, onWorkflowExecute, readOnly]);

  const handleWorkflowStop = useCallback(async (executionId: string) => {
    try {
      await onWorkflowStop(executionId);
    } catch (error) {
      console.error('Error stopping workflow:', error);
    }
  }, [onWorkflowStop]);

  const handleTemplateUse = useCallback(async (templateId: string) => {
    if (readOnly) return;
    
    try {
      const workflow = await onTemplateUse(templateId);
      setSelectedWorkflow(workflow);
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Error using template:', error);
    }
  }, [onTemplateUse, readOnly]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-500" />;
      case 'timeout':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'integration':
        return <Globe className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <Users className="w-4 h-4" />;
      case 'notification':
        return <Mail className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      case 'delay':
        return <Timer className="w-4 h-4" />;
      case 'condition':
        return <GitBranch className="w-4 h-4" />;
      case 'action':
        return <Zap className="w-4 h-4" />;
      case 'transform':
        return <Code className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Workflows</h2>
          <p className="text-sm text-gray-600">
            Automatización de procesos y tareas del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            disabled={readOnly}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{workflowStats.total}</p>
                <p className="text-sm text-gray-600">Total Workflows</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{workflowStats.active}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{workflowStats.totalExecutions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Ejecuciones</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{workflowStats.avgSuccessRate}%</p>
                <p className="text-sm text-gray-600">Éxito Promedio</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="content">Contenido</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="integration">Integración</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(workflow.category)}
                      <div>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status === 'active' ? 'Activo' :
                         workflow.status === 'inactive' ? 'Inactivo' :
                         workflow.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pasos:</span>
                    <span className="font-medium">{workflow.steps.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ejecuciones:</span>
                    <span className="font-medium">{workflow.executionCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Éxito:</span>
                    <span className="font-medium">{workflow.successRate}%</span>
                  </div>
                  
                  {workflow.averageExecutionTime > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tiempo promedio:</span>
                      <span className="font-medium">{formatDuration(workflow.averageExecutionTime)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {workflow.trigger.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        v{workflow.version}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {workflow.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWorkflowExecute(workflow.id)}
                          disabled={isExecuting[workflow.id] || readOnly}
                        >
                          {isExecuting[workflow.id] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorkflow(workflow)}
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
                  
                  {workflow.lastExecuted && (
                    <p className="text-xs text-gray-500 mt-2">
                      Última ejecución: {new Date(workflow.lastExecuted).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay workflows que coincidan con los filtros</p>
            </div>
          )}
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
                {recentExecutions.map((execution) => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="text-sm font-medium">{workflow?.name || 'Unknown Workflow'}</p>
                          <p className="text-sm text-gray-600">
                            Iniciado por {execution.triggeredBy}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Inicio: {new Date(execution.startTime).toLocaleString()}</span>
                            {execution.duration && (
                              <span>Duración: {formatDuration(execution.duration)}</span>
                            )}
                            <span>Pasos: {execution.completedSteps.length}/{workflow?.steps.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          execution.status === 'completed' ? 'default' :
                          execution.status === 'failed' ? 'destructive' :
                          execution.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {execution.status === 'completed' ? 'Completado' :
                           execution.status === 'failed' ? 'Error' :
                           execution.status === 'running' ? 'Ejecutando' :
                           execution.status === 'cancelled' ? 'Cancelado' : 'Timeout'}
                        </Badge>
                        
                        {execution.status === 'running' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWorkflowStop(execution.id)}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExecution(execution)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {recentExecutions.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay ejecuciones recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de Workflows</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{template.icon}</div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="capitalize text-xs">
                        {template.difficulty === 'beginner' ? 'Principiante' :
                         template.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </Badge>
                      {template.isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">
                          Oficial
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Popularidad:</span>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div 
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.round(template.popularity / 20) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({template.popularity})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="font-medium">{template.estimatedSetupTime} min</span>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleTemplateUse(template.id)}
                    disabled={readOnly}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Monitor en Tiempo Real</h3>
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

          {/* Running Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflows en Ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              {executions.filter(e => e.status === 'running').length > 0 ? (
                <div className="space-y-4">
                  {executions
                    .filter(e => e.status === 'running')
                    .map((execution) => {
                      const workflow = workflows.find(w => w.id === execution.workflowId);
                      const progress = workflow ? 
                        (execution.completedSteps.length / workflow.steps.length) * 100 : 0;
                      
                      return (
                        <div key={execution.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">{workflow?.name}</h4>
                              <p className="text-sm text-gray-600">
                                Ejecutándose desde {new Date(execution.startTime).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">En ejecución</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWorkflowStop(execution.id)}
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progreso</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500">
                              Paso actual: {execution.currentStep || 'Iniciando...'}
                            </p>
                          </div>
                          
                          {execution.stepExecutions && execution.stepExecutions.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium mb-2">Estados de los Pasos</h5>
                              <div className="flex flex-wrap gap-2">
                                {execution.stepExecutions.map((stepExec, index) => (
                                  <div
                                    key={stepExec.stepId}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                      stepExec.status === 'completed' ? 'bg-green-500 text-white' :
                                      stepExec.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                                      stepExec.status === 'failed' ? 'bg-red-500 text-white' :
                                      stepExec.status === 'skipped' ? 'bg-gray-300 text-gray-600' :
                                      'bg-gray-200 text-gray-400'
                                    }`}
                                    title={workflow?.steps.find(s => s.id === stepExec.stepId)?.name}
                                  >
                                    {index + 1}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay workflows ejecutándose actualmente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rendimiento del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Memoria</span>
                    <span>62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Cola de trabajos</span>
                    <span>12</span>
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
                    <span className="text-sm text-gray-600">Exitosas</span>
                    <span className="text-sm font-medium text-green-600">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fallidas</span>
                    <span className="text-sm font-medium text-red-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Canceladas</span>
                    <span className="text-sm font-medium text-yellow-600">1</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tasa de éxito</span>
                    <span className="text-sm font-bold text-green-600">97.0%</span>
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
                      Workflow "Backup Daily" falló 2 veces
                    </AlertDescription>
                  </Alert>
                  <div className="text-center text-sm text-gray-500">
                    No hay más alertas
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

export default WorkflowManager;