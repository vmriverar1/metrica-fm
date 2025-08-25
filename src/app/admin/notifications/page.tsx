/**
 * Sistema de Gestión de Notificaciones
 * URL: http://localhost:9003/admin/notifications
 * 
 * Página para gestionar notificaciones del sistema, ver actividad reciente,
 * y configurar tipos de notificaciones habilitadas.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Search,
  Filter,
  Download,
  Settings,
  Trash2,
  MoreVertical,
  Circle,
  CheckCircle2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'new_subscriber' | 'new_contact' | 'user_activity' | 'system_alerts';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'read' | 'unread';
  relatedId: string | null;
  relatedType: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  readAt: Date | null;
  actionUrl: string | null;
}

interface NotificationSettings {
  maxNotifications: number;
  autoMarkReadAfterDays: number;
  enabledNotifications: Record<string, boolean>;
  priorities: Record<string, {
    name: string;
    color: string;
    icon: string;
  }>;
  types: Record<string, {
    name: string;
    description: string;
    icon: string;
    defaultPriority: string;
  }>;
}

interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  thisWeekCount: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

interface NotificationData {
  notifications: Notification[];
  settings: NotificationSettings;
  stats: NotificationStats;
}

function NotificationsPage() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      const data = await response.json();
      
      // Convertir fechas de string a Date
      const notificationsWithDates = data.notifications.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        readAt: n.readAt ? new Date(n.readAt) : null
      }));
      
      setNotificationData({
        ...data,
        notifications: notificationsWithDates
      });
      setError(null);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    if (!notificationData) return [];

    return notificationData.notifications.filter(notification => {
      // Filtro de texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower) ||
          notification.type.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Filtro de estado
      if (statusFilter !== 'all' && notification.status !== statusFilter) {
        return false;
      }

      // Filtro de tipo
      if (typeFilter !== 'all' && notification.type !== typeFilter) {
        return false;
      }

      // Filtro de prioridad
      if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [notificationData, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const handleMarkAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const promises = notificationIds.map(id => 
        fetch(`/api/admin/notifications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read' })
        })
      );
      
      await Promise.all(promises);
      await loadNotifications();
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Error marcando como leídas:', err);
    }
  }, [loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      await loadNotifications();
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  }, [loadNotifications]);

  const handleDeleteNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      const promises = notificationIds.map(id => 
        fetch(`/api/admin/notifications/${id}`, {
          method: 'DELETE'
        })
      );
      
      await Promise.all(promises);
      await loadNotifications();
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Error eliminando notificaciones:', err);
    }
  }, [loadNotifications]);

  const exportNotifications = useCallback(() => {
    if (!filteredNotifications.length) return;

    const csvContent = [
      'ID,Tipo,Título,Mensaje,Prioridad,Estado,Fecha Creación,Fecha Lectura',
      ...filteredNotifications.map(notification => [
        notification.id,
        notification.type,
        `"${notification.title}"`,
        `"${notification.message}"`,
        notification.priority,
        notification.status,
        notification.createdAt.toISOString(),
        notification.readAt?.toISOString() || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notificaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredNotifications]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_subscriber': return <User className="w-4 h-4" />;
      case 'new_contact': return <MessageSquare className="w-4 h-4" />;
      case 'user_activity': return <Clock className="w-4 h-4" />;
      case 'system_alerts': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Notificaciones" description="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Notificaciones" description="Error al cargar datos">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadNotifications}>Reintentar</Button>
        </div>
      </AdminLayout>
    );
  }

  if (!notificationData) return null;

  return (
    <AdminLayout 
      title="Gestión de Notificaciones" 
      description={`${notificationData.stats.totalNotifications} notificaciones • ${notificationData.stats.unreadCount} sin leer`}
      actions={
        <div className="flex space-x-2">
          <Button
            onClick={exportNotifications}
            variant="outline"
            size="sm"
            disabled={!filteredNotifications.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={notificationData.stats.unreadCount === 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      }
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notificationData.stats.totalNotifications}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sin leer</p>
              <p className="text-2xl font-bold text-red-600">{notificationData.stats.unreadCount}</p>
            </div>
            <Circle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hoy</p>
              <p className="text-2xl font-bold text-green-600">{notificationData.stats.todayCount}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Esta semana</p>
              <p className="text-2xl font-bold text-purple-600">{notificationData.stats.thisWeekCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="unread">Sin leer</option>
                <option value="read">Leídas</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="new_subscriber">Suscripciones</option>
                <option value="new_contact">Contactos</option>
                <option value="user_activity">Actividad</option>
                <option value="system_alerts">Alertas</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Acciones en lote */}
        {selectedNotifications.size > 0 && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedNotifications.size} notificación(es) seleccionada(s)
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAsRead(Array.from(selectedNotifications))}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Marcar como leídas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteNotifications(Array.from(selectedNotifications))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500">No se encontraron notificaciones con los filtros aplicados.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors ${notification.status === 'unread' ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedNotifications);
                      if (e.target.checked) {
                        newSelected.add(notification.id);
                      } else {
                        newSelected.delete(notification.id);
                      }
                      setSelectedNotifications(newSelected);
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Icono de tipo */}
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'high' ? 'Alta' : notification.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          
                          <span className="text-xs text-gray-500">
                            {notification.createdAt.toLocaleDateString()} {notification.createdAt.toLocaleTimeString()}
                          </span>
                          
                          {notification.status === 'unread' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Sin leer
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estado y acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(notification.actionUrl!, '_blank')}
                          >
                            Ver detalles
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationsPage;