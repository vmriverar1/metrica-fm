/**
 * FASE 5: Test Applications System
 * URL: http://localhost:9003/test-applications
 * 
 * Página de testing para el sistema completo de aplicaciones laborales.
 * Equivalente a test-careers, test-blog para aplicaciones.
 */

import { ApplicationsService } from '@/lib/applications-service';
import { NotificationsService } from '@/lib/notifications-service';
import { Suspense } from 'react';

async function ApplicationsTestContent() {
  const [
    systemInfo,
    allApplications,
    recruitmentStats,
    recruiters,
    notifications,
    templates
  ] = await Promise.all([
    ApplicationsService.getSystemInfo(),
    ApplicationsService.getApplications({ limit: 10 }),
    ApplicationsService.getRecruitmentStats(),
    ApplicationsService.getRecruiters(),
    NotificationsService.getNotificationsForRecruiter('rec-001', 10),
    NotificationsService.getTemplates()
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              🧪 Applications System Test
            </h1>
            <p className="text-purple-100">
              Prueba completa del sistema híbrido de aplicaciones y reclutamiento
            </p>
          </div>

          <div className="p-8">
            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <h3 className="font-semibold text-green-800">Applications System Status</h3>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">✅ ACTIVO</p>
                <p className="text-green-700 text-sm">Sistema híbrido de aplicaciones funcionando</p>
              </div>

              <div className={`border rounded-lg p-6 ${
                systemInfo.directusAvailable 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    systemInfo.directusAvailable ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></div>
                  <h3 className={`font-semibold ${
                    systemInfo.directusAvailable ? 'text-blue-800' : 'text-orange-800'
                  }`}>
                    Fuente de Datos
                  </h3>
                </div>
                <p className={`text-2xl font-bold mb-2 ${
                  systemInfo.directusAvailable ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  📊 {systemInfo.dataSource.toUpperCase()}
                </p>
                <p className={`text-sm ${
                  systemInfo.directusAvailable ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {systemInfo.directusAvailable 
                    ? 'Usando Directus CMS' 
                    : 'Usando datos locales (fallback)'}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-purple-800">Versión del Sistema</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  🚀 v{systemInfo.version}
                </p>
                <p className="text-purple-700 text-sm">
                  Última verificación: {systemInfo.lastCheck.toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Applications Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📋 Resumen de Aplicaciones</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Total Aplicaciones</p>
                  <p className="text-3xl font-bold text-blue-600">{recruitmentStats.applications.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                  <p className="text-3xl font-bold text-green-600">{recruitmentStats.applications.thisMonth}</p>
                  <p className={`text-sm ${recruitmentStats.applications.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recruitmentStats.applications.growth >= 0 ? '+' : ''}{recruitmentStats.applications.growth.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {recruitmentStats.performance.conversionRates.overallConversion.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">{recruitmentStats.performance.averageTimeToHire}d</p>
                </div>
              </div>
            </div>

            {/* Applications by Status */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📊 Aplicaciones por Estado</h2>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(recruitmentStats.applications.byStatus).map(([status, count]) => (
                    <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize mb-2">{status.replace('-', ' ')}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / recruitmentStats.applications.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📝 Aplicaciones Recientes</h2>
              <div className="space-y-4">
                {allApplications.map((application) => (
                  <div key={application.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-800">
                            {application.candidateInfo.firstName} {application.candidateInfo.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            application.status === 'hired' ? 'bg-green-100 text-green-800' :
                            application.status === 'interview' ? 'bg-orange-100 text-orange-800' :
                            application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                            application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {application.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            application.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            application.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {application.priority}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium mb-2">{application.jobTitle}</p>
                      </div>
                      {application.score && (
                        <div className="text-right">
                          <span className="text-3xl font-bold text-green-600">{application.score.overall}</span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📧</span>
                        <span>{application.candidateInfo.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📍</span>
                        <span>{application.candidateInfo.location.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📅</span>
                        <span>{application.submittedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">👁️</span>
                        <span>{application.viewCount} vistas</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">🔗</span>
                        <span className="capitalize">{application.source}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📄</span>
                        <span>{application.documents.length} documentos</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">👤</span>
                        <span>{application.assignedTo?.recruiterName || 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">⏱️</span>
                        <span>{application.timeInStage} días en etapa</span>
                      </div>
                    </div>

                    {/* Score Details */}
                    {application.score && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Puntuación Detallada</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Experiencia</span>
                            <span className="font-bold text-lg text-blue-600">{application.score.experience}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Skills</span>
                            <span className="font-bold text-lg text-green-600">{application.score.skills}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Educación</span>
                            <span className="font-bold text-lg text-purple-600">{application.score.education}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Cultural</span>
                            <span className="font-bold text-lg text-orange-600">{application.score.cultural}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Requisitos</span>
                            <span className="font-bold text-lg text-red-600">{application.score.requirements}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500 mb-1">Total</span>
                            <span className="font-bold text-xl text-gray-900">{application.score.overall}</span>
                          </div>
                        </div>
                        {application.score.notes && (
                          <p className="mt-3 text-sm text-gray-600 italic">
                            "{application.score.notes}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Activity Timeline */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline de Actividades</h4>
                      <div className="space-y-2">
                        {application.activities.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-center text-sm text-gray-600">
                            <span className="mr-3">
                              {activity.type === 'status-change' ? '🔄' :
                               activity.type === 'interview-scheduled' ? '📅' :
                               activity.type === 'score-updated' ? '📊' :
                               activity.type === 'document-uploaded' ? '📄' : '📝'}
                            </span>
                            <span>{activity.description}</span>
                            <span className="ml-auto text-gray-400">
                              {activity.performedAt.toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {application.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {application.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiters Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">👥 Equipo de Reclutamiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recruiters.map((recruiter) => (
                  <div key={recruiter.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold text-lg">
                          {recruiter.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{recruiter.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{recruiter.role.replace('-', ' ')}</p>
                        <p className="text-xs text-gray-500">{recruiter.department}</p>
                      </div>
                      <div className="text-right">
                        <span className={`w-3 h-3 rounded-full inline-block ${
                          new Date().getTime() - recruiter.lastActive.getTime() < 300000 ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().getTime() - recruiter.lastActive.getTime() < 300000 ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">📧</span>
                        <span>{recruiter.email}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <span className="mr-2">🌍</span>
                        <span>{recruiter.timezone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        <span>Desde {recruiter.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Permissions Summary */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">Permisos:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(recruiter.permissions).filter(([_, value]) => value).map(([perm, _]) => (
                          <span key={perm} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                            {perm.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Testing */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">🔔 Sistema de Notificaciones</h2>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Templates Disponibles</h3>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{template.name}</span>
                          <span className={`w-2 h-2 rounded-full ${template.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Notificaciones Recientes</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-gray-500">
                            {notification.createdAt.toLocaleDateString()} - {notification.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Estadísticas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total enviadas:</span>
                        <span className="font-medium">{notifications.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pendientes:</span>
                        <span className="font-medium text-orange-600">
                          {notifications.filter(n => n.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Entregadas:</span>
                        <span className="font-medium text-green-600">
                          {notifications.filter(n => n.status === 'delivered' || n.status === 'sent').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">🔧 Información Técnica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">API Endpoints</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/job_applications</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-blue-400">POST</span> <span className="text-gray-300">/api/applications/status</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-yellow-400">PUT</span> <span className="text-gray-300">/api/applications/score</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-purple-400">WS</span> <span className="text-gray-300">/api/notifications/stream</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Servicios Disponibles</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      ApplicationsService.getApplications()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      ApplicationsService.updateStatus()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      ApplicationsService.scoreApplication()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      ApplicationsService.getRecruitmentStats()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      NotificationsService.sendNotification()
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-4">🔗 Enlaces de Navegación</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <a 
                  href="/recruitment-dashboard" 
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  📊 Dashboard
                </a>
                <a 
                  href="/careers-status" 
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  💼 Careers Status
                </a>
                <a 
                  href="/blog-status" 
                  className="p-3 bg-orange-100 text-orange-700 rounded-lg text-center hover:bg-orange-200 transition-colors text-sm font-medium"
                >
                  📝 Blog Status
                </a>
                <a 
                  href="/portfolio-status" 
                  className="p-3 bg-green-100 text-green-700 rounded-lg text-center hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  🎨 Portfolio Status
                </a>
                <a 
                  href="/test-applications" 
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  🔄 Refresh Test
                </a>
                <a 
                  href="/" 
                  className="p-3 bg-gray-100 text-gray-700 rounded-lg text-center hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  🏠 Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <div className="h-8 bg-purple-500 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-purple-400 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestApplicationsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ApplicationsTestContent />
    </Suspense>
  );
}