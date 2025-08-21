/**
 * Dashboard Principal del Sistema JSON CRUD
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Briefcase,
  PenTool,
  TrendingUp,
  Users,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit3,
  Plus,
  Search,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  pages: number;
  portfolio: {
    projects: number;
    categories: number;
  };
  careers: {
    jobs: number;
    departments: number;
    active_jobs: number;
  };
  newsletter: {
    articles: number;
    authors: number;
    categories: number;
    published_articles: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  title: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simular datos del dashboard (en producción vendrían de APIs)
      setStats({
        pages: 5,
        portfolio: {
          projects: 12,
          categories: 4
        },
        careers: {
          jobs: 8,
          departments: 5,
          active_jobs: 6
        },
        newsletter: {
          articles: 26,
          authors: 5,
          categories: 4,
          published_articles: 20
        }
      });

      // Actividad reciente simulada
      setRecentActivity([
        {
          id: '1',
          type: 'create',
          resource: 'portfolio-project',
          title: 'Nuevo proyecto: Torre Empresarial Norte',
          user: 'Carlos Mendoza',
          timestamp: '2025-01-20T10:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'update',
          resource: 'career-job',
          title: 'Actualización: Ingeniero Civil Senior',
          user: 'Ana Torres',
          timestamp: '2025-01-20T09:15:00Z',
          status: 'success'
        },
        {
          id: '3',
          type: 'create',
          resource: 'newsletter-article',
          title: 'Nuevo artículo: Innovaciones en BIM 2025',
          user: 'María Fernández',
          timestamp: '2025-01-19T16:45:00Z',
          status: 'success'
        },
        {
          id: '4',
          type: 'update',
          resource: 'portfolio-category',
          title: 'Actualización: Categoría Comercial',
          user: 'Luis Hernández',
          timestamp: '2025-01-19T14:20:00Z',
          status: 'success'
        },
        {
          id: '5',
          type: 'delete',
          resource: 'career-job',
          title: 'Eliminación: Posición cerrada - Arquitecto Junior',
          user: 'Ana Torres',
          timestamp: '2025-01-19T11:10:00Z',
          status: 'warning'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'update': return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'delete': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'hace menos de 1 hora';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido, {user?.firstName}. Administra todo el contenido JSON desde aquí.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Páginas Estáticas */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Páginas Estáticas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pages || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/json-crud/pages" className="font-medium text-cyan-700 hover:text-cyan-900">
                Ver páginas
              </Link>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Portfolio
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.portfolio.projects || 0} proyectos
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {stats?.portfolio.categories || 0} categorías
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/json-crud/portfolio/projects" className="font-medium text-cyan-700 hover:text-cyan-900">
                Gestionar portfolio
              </Link>
            </div>
          </div>
        </div>

        {/* Carreras */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Carreras
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.careers.active_jobs || 0} activos
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {stats?.careers.jobs || 0} total trabajos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/json-crud/careers/jobs" className="font-medium text-cyan-700 hover:text-cyan-900">
                Gestionar trabajos
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PenTool className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Newsletter
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.newsletter.published_articles || 0} publicados
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {stats?.newsletter.articles || 0} total artículos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/json-crud/newsletter/articles" className="font-medium text-cyan-700 hover:text-cyan-900">
                Gestionar artículos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              href="/admin/json-crud/portfolio/projects?action=create"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Nuevo Proyecto</span>
            </Link>
            <Link
              href="/admin/json-crud/careers/jobs?action=create"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-700 font-medium">Nueva Oferta Laboral</span>
            </Link>
            <Link
              href="/admin/json-crud/newsletter/articles?action=create"
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-purple-700 font-medium">Nuevo Artículo</span>
            </Link>
            <Link
              href="/admin/json-crud/search"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700 font-medium">Búsqueda Global</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">APIs JSON CRUD</span>
              <span className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sistema de Archivos</span>
              <span className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Respaldos</span>
              <span className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Actualizados
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última sincronización</span>
              <span className="text-sm text-gray-500">hace 2 min</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas Rápidas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contenido total</span>
              <span className="text-sm font-medium text-gray-900">
                {(stats?.pages || 0) + (stats?.portfolio.projects || 0) + (stats?.careers.jobs || 0) + (stats?.newsletter.articles || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última actividad</span>
              <span className="text-sm text-gray-500">hace 30 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usuario activo</span>
              <span className="text-sm font-medium text-gray-900">{user?.firstName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rol</span>
              <span className="text-sm font-medium text-gray-900">{user?.role.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      por {activity.user} • {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm">
            <Link href="/admin/json-crud/activity" className="font-medium text-cyan-700 hover:text-cyan-900">
              Ver toda la actividad →
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      <SystemHealth />
    </div>
  );
}