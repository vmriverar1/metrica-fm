'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell,
  BellOff,
  Mail,
  MessageCircle,
  Phone,
  Smartphone,
  Globe,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Users,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Copy,
  Share2,
  ExternalLink,
  Archive,
  Bookmark,
  Star,
  Heart,
  Flag
} from 'lucide-react';

// Interfaces principales
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'reminder' | 'action_required';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  category: 'system' | 'user' | 'content' | 'security' | 'workflow' | 'maintenance' | 'marketing';
  channels: ('browser' | 'email' | 'sms' | 'push' | 'slack' | 'webhook' | 'discord' | 'teams')[];
  recipients: {
    users?: string[];
    roles?: string[];
    groups?: string[];
    emails?: string[];
    all?: boolean;
    conditions?: {
      department?: string[];
      location?: string[];
      status?: string[];
    };
  };
  sender: {
    id: string;
    name: string;
    type: 'user' | 'system' | 'workflow';
  };
  content: {
    html?: string;
    markdown?: string;
    template?: string;
    variables?: Record<string, any>;
    attachments?: {
      name: string;
      url: string;
      type: string;
      size: number;
    }[];
  };
  scheduling: {
    sendAt?: string;
    timezone?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
      interval: number;
      endDate?: string;
      customPattern?: string;
    };
  };
  tracking: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    bounced: number;
    unsubscribed: number;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'paused';
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  readBy?: {
    userId: string;
    readAt: string;
    channel: string;
  }[];
  actions?: {
    id: string;
    label: string;
    url: string;
    style: 'primary' | 'secondary' | 'danger';
  }[];
  metadata: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: Notification['type'];
  subject: string;
  content: {
    html: string;
    text: string;
    variables: {
      name: string;
      type: 'string' | 'number' | 'date' | 'url' | 'image';
      required: boolean;
      defaultValue?: any;
      description?: string;
    }[];
  };
  channels: Notification['channels'];
  isBuiltIn: boolean;
  isActive: boolean;
  usage: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  preview?: {
    desktop?: string;
    mobile?: string;
    email?: string;
  };
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: Notification['channels'][0];
  isEnabled: boolean;
  config: {
    // Email
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    
    // SMS
    sms?: {
      provider: 'twilio' | 'aws_sns' | 'custom';
      apiKey?: string;
      from?: string;
    };
    
    // Push notifications
    push?: {
      fcmServerKey?: string;
      apnsCertificate?: string;
      webPushKeys?: {
        publicKey: string;
        privateKey: string;
      };
    };
    
    // Slack
    slack?: {
      webhookUrl?: string;
      botToken?: string;
      defaultChannel?: string;
    };
    
    // Webhook
    webhook?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT';
      headers?: Record<string, string>;
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'api_key';
        credentials?: Record<string, string>;
      };
    };
  };
  rateLimiting: {
    enabled: boolean;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'custom';
    delays: number[];
  };
  lastStatus: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  metrics: {
    sent24h: number;
    failed24h: number;
    avgResponseTime: number;
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: {
    events: string[];
    conditions: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
    schedule?: {
      type: 'immediate' | 'delayed' | 'scheduled';
      delay?: number;
      time?: string;
      timezone?: string;
    };
  };
  actions: {
    type: 'send_notification' | 'send_email' | 'webhook' | 'create_task';
    config: any;
  }[];
  filters: {
    userRoles?: string[];
    departments?: string[];
    locations?: string[];
    excludeUsers?: string[];
  };
  cooldown?: {
    enabled: boolean;
    duration: number;
    perUser: boolean;
  };
  priority: Notification['priority'];
  createdBy: string;
  createdAt: string;
  executionCount: number;
  lastExecuted?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    browser: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  categories: {
    system: boolean;
    user: boolean;
    content: boolean;
    security: boolean;
    workflow: boolean;
    maintenance: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    exceptions: string[];
  };
  frequency: {
    instant: boolean;
    digest: boolean;
    digestFrequency: 'hourly' | 'daily' | 'weekly';
    digestTime: string;
  };
  unsubscribeToken: string;
  updatedAt: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  templates: NotificationTemplate[];
  channels: NotificationChannel[];
  rules: NotificationRule[];
  preferences: NotificationPreferences[];
  onNotificationsChange: (notifications: Notification[]) => void;
  onTemplatesChange: (templates: NotificationTemplate[]) => void;
  onChannelsChange: (channels: NotificationChannel[]) => void;
  onRulesChange: (rules: NotificationRule[]) => void;
  onPreferencesChange: (preferences: NotificationPreferences[]) => void;
  onSendNotification: (notification: Partial<Notification>) => Promise<void>;
  onTestChannel: (channelId: string) => Promise<boolean>;
  currentUser?: { id: string; name: string };
  readOnly?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  templates,
  channels,
  rules,
  preferences,
  onNotificationsChange,
  onTemplatesChange,
  onChannelsChange,
  onRulesChange,
  onPreferencesChange,
  onSendNotification,
  onTestChannel,
  currentUser,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [showComposer, setShowComposer] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Filtros y estadísticas
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
      const matchesChannel = filterChannel === 'all' || notification.channels.includes(filterChannel as any);
      return matchesSearch && matchesType && matchesStatus && matchesChannel;
    });
  }, [notifications, searchTerm, filterType, filterStatus, filterChannel]);

  const notificationStats = useMemo(() => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const scheduled = notifications.filter(n => n.status === 'scheduled').length;
    const failed = notifications.filter(n => n.status === 'failed').length;
    const totalSent = notifications.reduce((sum, n) => sum + n.tracking.sent, 0);
    const totalOpened = notifications.reduce((sum, n) => sum + n.tracking.opened, 0);
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    
    return {
      total,
      sent,
      scheduled,
      failed,
      totalSent,
      totalOpened,
      openRate
    };
  }, [notifications]);

  const channelHealth = useMemo(() => {
    const healthy = channels.filter(c => c.lastStatus === 'healthy').length;
    const total = channels.filter(c => c.isEnabled).length;
    return total > 0 ? Math.round((healthy / total) * 100) : 0;
  }, [channels]);

  // Handlers
  const handleSendNotification = useCallback(async (notification: Partial<Notification>) => {
    if (readOnly) return;
    
    try {
      await onSendNotification(notification);
      setShowComposer(false);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [onSendNotification, readOnly]);

  const handleTestChannel = useCallback(async (channelId: string) => {
    try {
      const result = await onTestChannel(channelId);
      return result;
    } catch (error) {
      console.error('Error testing channel:', error);
      return false;
    }
  }, [onTestChannel]);

  const handleBulkAction = useCallback(async (action: 'archive' | 'delete' | 'mark_read') => {
    if (bulkSelected.length === 0 || readOnly) return;
    
    try {
      const updatedNotifications = notifications.map(notification => {
        if (!bulkSelected.includes(notification.id)) return notification;
        
        switch (action) {
          case 'archive':
            return { ...notification, metadata: { ...notification.metadata, archived: true } };
          case 'mark_read':
            return {
              ...notification,
              readBy: [
                ...(notification.readBy || []),
                {
                  userId: currentUser?.id || 'system',
                  readAt: new Date().toISOString(),
                  channel: 'browser'
                }
              ]
            };
          default:
            return notification;
        }
      });
      
      if (action === 'delete') {
        const filtered = notifications.filter(n => !bulkSelected.includes(n.id));
        onNotificationsChange(filtered);
      } else {
        onNotificationsChange(updatedNotifications);
      }
      
      setBulkSelected([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  }, [bulkSelected, notifications, onNotificationsChange, currentUser, readOnly]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'announcement':
        return <Bell className="w-4 h-4 text-purple-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'action_required':
        return <Flag className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'browser':
        return <Bell className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Phone className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      case 'slack':
        return <MessageCircle className="w-4 h-4" />;
      case 'webhook':
        return <Globe className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
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

  // Simulated real-time updates
  useEffect(() => {
    if (!realtimeEnabled) return;
    
    const interval = setInterval(() => {
      // In a real implementation, this would connect to WebSocket or SSE
      console.log('Checking for new notifications...');
    }, 30000);
    
    return () => clearInterval(interval);
  }, [realtimeEnabled]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h2>
          <p className="text-sm text-gray-600">
            Gestión completa de notificaciones y comunicaciones
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={realtimeEnabled}
              onCheckedChange={setRealtimeEnabled}
            />
            <Label className="text-sm">Tiempo real</Label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComposer(true)}
            disabled={readOnly}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{notificationStats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{notificationStats.totalSent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Enviadas</p>
              </div>
              <Send className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{notificationStats.openRate}%</p>
                <p className="text-sm text-gray-600">Tasa de Apertura</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{channelHealth}%</p>
                <p className="text-sm text-gray-600">Canales OK</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="channels">Canales</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="announcement">Anuncio</SelectItem>
                  <SelectItem value="reminder">Recordatorio</SelectItem>
                  <SelectItem value="action_required">Acción Requerida</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="scheduled">Programadas</SelectItem>
                  <SelectItem value="sending">Enviando</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="failed">Fallidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkSelected.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {bulkSelected.length} notificación(es) seleccionada(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('mark_read')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Marcar leídas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('archive')}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <Checkbox
                      checked={bulkSelected.includes(notification.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelected(prev => [...prev, notification.id]);
                        } else {
                          setBulkSelected(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)} variant="outline">
                            {notification.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status === 'sent' ? 'Enviada' :
                           notification.status === 'sending' ? 'Enviando' :
                           notification.status === 'scheduled' ? 'Programada' :
                           notification.status === 'failed' ? 'Falló' :
                           notification.status === 'cancelled' ? 'Cancelada' :
                           notification.status === 'paused' ? 'Pausada' : 'Borrador'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{notification.tracking.sent} enviadas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{notification.tracking.opened} abiertas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.channels.map((channel, index) => (
                              <span key={index} className="flex items-center">
                                {getChannelIcon(channel)}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Por {notification.sender.name}</span>
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay notificaciones que coincidan con los filtros</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de Notificación</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">
                          Oficial
                        </Badge>
                      )}
                      <Badge variant={template.isActive ? 'default' : 'outline'} className="text-xs">
                        {template.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(template.type)}
                    <Badge variant="outline" className="capitalize text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.channels.map((channel) => (
                      <div key={channel} className="flex items-center gap-1 text-xs text-gray-600">
                        {getChannelIcon(channel)}
                        <span className="capitalize">{channel}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Variables:</span>
                    <span className="font-medium">{template.content.variables.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usos:</span>
                    <span className="font-medium">{template.usage}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={template.isBuiltIn || readOnly}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={readOnly}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Canales de Notificación</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Canal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.type)}
                      <div>
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                        <CardDescription className="capitalize">{channel.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={channel.isEnabled ? 'default' : 'secondary'}>
                        {channel.isEnabled ? 'Habilitado' : 'Deshabilitado'}
                      </Badge>
                      <Badge variant={
                        channel.lastStatus === 'healthy' ? 'default' :
                        channel.lastStatus === 'degraded' ? 'secondary' : 'destructive'
                      }>
                        {channel.lastStatus === 'healthy' ? '🟢' :
                         channel.lastStatus === 'degraded' ? '🟡' : '🔴'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Enviadas 24h:</span>
                      <p className="font-medium">{channel.metrics.sent24h}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fallidas 24h:</span>
                      <p className="font-medium">{channel.metrics.failed24h}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo respuesta:</span>
                      <p className="font-medium">{channel.metrics.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Límite/min:</span>
                      <p className="font-medium">
                        {channel.rateLimiting.enabled ? channel.rateLimiting.maxPerMinute : '∞'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      Revisado: {formatTimeAgo(channel.lastChecked)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChannel(channel.id)}
                      >
                        <Zap className="w-4 h-4" />
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

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reglas Automáticas</h3>
            <Button size="sm" disabled={readOnly}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Regla
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Badge className={getPriorityColor(rule.priority)} variant="outline">
                          {rule.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Triggers: {rule.triggers.events.length}</span>
                        <span>Acciones: {rule.actions.length}</span>
                        <span>Ejecutada: {rule.executionCount} veces</span>
                        {rule.lastExecuted && (
                          <span>Última: {formatTimeAgo(rule.lastExecuted)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => {
                          // Update rule active state
                        }}
                        disabled={readOnly}
                      />
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={readOnly}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {rules.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay reglas configuradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Preferencias de Usuario</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Las preferencias de notificación se pueden configurar globalmente o por usuario individual.
              Los usuarios pueden override estas configuraciones desde su perfil.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuración Global</CardTitle>
                <CardDescription>
                  Configuración predeterminada para todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Canales habilitados por defecto</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['browser', 'email', 'sms', 'push'].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Checkbox id={`global-${channel}`} defaultChecked />
                        <Label htmlFor={`global-${channel}`} className="text-sm capitalize">
                          {channel}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Categorías habilitadas</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {['system', 'user', 'content', 'security', 'workflow', 'maintenance', 'marketing'].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`global-cat-${category}`} 
                          defaultChecked={category !== 'marketing'} 
                        />
                        <Label htmlFor={`global-cat-${category}`} className="text-sm capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Horas de silencio por defecto</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="time" defaultValue="22:00" className="flex-1" />
                    <Input type="time" defaultValue="08:00" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estadísticas de Preferencias</CardTitle>
                <CardDescription>
                  Análisis de las preferencias de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Email habilitado</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Browser habilitado</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Push habilitado</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SMS habilitado</span>
                    <span className="font-medium">23%</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Horas silencio activas</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Digest habilitado</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marketing deshabilitado</span>
                    <span className="font-medium">62%</span>
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

export default NotificationCenter;