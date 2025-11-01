/**
 * FASE 6: Dashboard Administrativo Principal
 * URL: http://localhost:9003/admin/dashboard
 * 
 * Dashboard principal para administradores del sistema.
 * Incluye métricas, accesos rápidos y gestión empresarial.
 */

'use client';

import { useAuth } from '@/components/auth';
import { signOut } from '@/lib/firebase-auth';
import { useApplicationsService, useRecruitmentStats } from '@/hooks/useApplicationsService';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Settings,
  UserPlus,
  Mail,
  Calendar
} from 'lucide-react';

function AdminDashboard() {
  const { user } = useAuth();
  const { applications, systemInfo } = useApplicationsService({ limit: 5 });
  const { stats, loading } = useRecruitmentStats();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  // No necesitamos verificar auth aquí - AdminLayout/ProtectedRoute ya se encarga

  const quickStats = [
    {
      title: 'Total Aplicaciones',
      value: stats?.applications?.total || 0,
      change: stats?.applications?.growth || 0,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Este Mes',
      value: stats?.applications?.thisMonth || 0,
      change: 0,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Tasa Conversión',
      value: `${stats?.performance?.conversionRates?.overallConversion?.toFixed(1) || 0}%`,
      change: 0,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Usuarios Activos',
      value: 3, // Basado en usuarios de ejemplo
      change: 0,
      icon: Users,
      color: 'cyan'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'application',
      message: 'Nueva aplicación para Director de Proyectos Senior',
      user: 'María García',
      time: '2 horas atrás',
      status: 'new'
    },
    {
      id: '2',
      type: 'status',
      message: 'Aplicación movida a entrevista',
      user: 'Carmen López',
      time: '4 horas atrás',
      status: 'updated'
    },
    {
      id: '3',
      type: 'user',
      message: 'Nuevo reclutador agregado al sistema',
      user: 'Sistema',
      time: '1 día atrás',
      status: 'success'
    },
    {
      id: '4',
      type: 'report',
      message: 'Reporte mensual generado',
      user: 'Sistema Automático',
      time: '2 días atrás',
      status: 'info'
    }
  ];


  return (
    <AdminLayout
      title="Panel de Administración"
      description={`Bienvenido, ${user?.displayName || user?.email || 'Administrador'}`}
      actions={
        <Button
          onClick={() => window.open('/recruitment-dashboard', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Dashboard Reclutamiento
        </Button>
      }
    >
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== 0 && (
                    <p className={`text-sm ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'new' ? 'bg-blue-100' :
                        activity.status === 'updated' ? 'bg-yellow-100' :
                        activity.status === 'success' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'application' && <FileText className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'status' && <TrendingUp className="w-4 h-4 text-yellow-600" />}
                        {activity.type === 'user' && <UserPlus className="w-4 h-4 text-green-600" />}
                        {activity.type === 'report' && <BarChart3 className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button type="button" className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                    Ver toda la actividad →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => window.open('/admin/users', '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Gestionar Usuarios</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.open('/admin/subscriptions', '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Gestionar Suscripciones</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => window.open('/admin/reports', '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Generar Reportes</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => window.open('/admin/settings', '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Configuración</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => window.open('/admin/notifications', '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Notificaciones</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications Preview */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Aplicaciones Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.slice(0, 5).map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidateInfo.firstName} {application.candidateInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{application.candidateInfo.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.jobTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === 'hired' ? 'bg-green-100 text-green-800' :
                          application.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.score ? (
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">{application.score.overall}</span>/100
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin evaluar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.submittedAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => window.open('/recruitment-dashboard', '_blank')}
                className="text-blue-600 text-sm hover:text-blue-700 font-medium"
              >
                Ver todas las aplicaciones →
              </button>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}

export default AdminDashboard;