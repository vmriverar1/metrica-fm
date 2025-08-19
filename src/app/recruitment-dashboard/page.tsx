/**
 * FASE 5: Dashboard de Reclutamiento
 * URL: http://localhost:9003/recruitment-dashboard
 * 
 * Dashboard completo para gestión de aplicaciones laborales.
 * Interface principal para reclutadores y hiring managers.
 */

'use client';

import { useState } from 'react';
import { useApplicationsService, useRecruitmentStats } from '@/hooks/useApplicationsService';
import { ApplicationStatus, ApplicationPriority } from '@/types/careers';

export default function RecruitmentDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'analytics' | 'candidates'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');

  const applicationsResult = useApplicationsService({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    limit: 50
  });

  const statsResult = useRecruitmentStats();

  const { applications, loading, systemInfo, updateStatus, scoreApplication } = applicationsResult;
  const { stats } = statsResult;

  // Filter applications by selected status
  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interview: 'bg-orange-100 text-orange-800',
      assessment: 'bg-indigo-100 text-indigo-800',
      'final-review': 'bg-pink-100 text-pink-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-emerald-100 text-emerald-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: ApplicationPriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority];
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    await updateStatus(applicationId, newStatus, `Estado actualizado a ${newStatus}`);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 rounded-lg p-6 h-24"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 rounded-t-lg">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Dashboard de Reclutamiento
            </h1>
            <p className="text-blue-100">
              Gestión completa de aplicaciones y proceso de selección
            </p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                💼 Fuente: {systemInfo.dataSource.toUpperCase()}
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                🔄 Última actualización: {systemInfo.lastRefresh?.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 py-4 border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '📈 Resumen', count: applications.length },
                { id: 'applications', label: '📋 Aplicaciones', count: applications.length },
                { id: 'analytics', label: '📊 Analytics', count: null },
                { id: 'candidates', label: '👥 Candidatos', count: applications.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    📧
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aplicaciones Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.applications.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    📈
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.applications.thisMonth}</p>
                    <p className={`text-sm ${stats.applications.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.applications.growth >= 0 ? '+' : ''}{stats.applications.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    🎯
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.performance.conversionRates.overallConversion.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    ⏱️
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.performance.averageTimeToHire}d</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications by Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Aplicaciones por Estado</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.applications.byStatus).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(status as ApplicationStatus)}`}>
                      {status}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sources */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔗 Fuentes Principales</h2>
              <div className="space-y-3">
                {stats.candidates.topSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800 capitalize">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                        {source.count} aplicaciones
                      </span>
                      <span className="text-green-600 text-sm font-medium">
                        {source.conversionRate.toFixed(1)}% conversión
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {selectedTab === 'applications' && (
          <div className="space-y-6">
            {/* Status Filter */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtrar por Estado</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas ({applications.length})
                </button>
                {Object.entries(stats?.applications.byStatus || {}).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as ApplicationStatus)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  📋 Aplicaciones ({filteredApplications.length})
                </h2>
              </div>
              <div className="divide-y">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.candidateInfo.firstName} {application.candidateInfo.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(application.priority)}`}>
                            {application.priority}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium mb-2">{application.jobTitle}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📧 {application.candidateInfo.email}</span>
                          <span>📍 {application.candidateInfo.location.city}</span>
                          <span>📅 {application.submittedAt.toLocaleDateString()}</span>
                          <span>👁️ {application.viewCount} vistas</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {application.score && (
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">{application.score.overall}</span>
                            <span className="text-sm text-gray-500">/100</span>
                          </div>
                        )}
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusUpdate(application.id, e.target.value as ApplicationStatus)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="submitted">Enviada</option>
                          <option value="reviewing">Revisando</option>
                          <option value="shortlisted">Preseleccionada</option>
                          <option value="interview">Entrevista</option>
                          <option value="assessment">Evaluación</option>
                          <option value="final-review">Revisión Final</option>
                          <option value="approved">Aprobada</option>
                          <option value="rejected">Rechazada</option>
                          <option value="hired">Contratada</option>
                        </select>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-gray-500">Fuente</span>
                        <p className="font-medium capitalize">{application.source}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Documentos</span>
                        <p className="font-medium">{application.documents.length} archivos</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Asignado a</span>
                        <p className="font-medium">{application.assignedTo?.recruiterName || 'Sin asignar'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Tiempo en etapa</span>
                        <p className="font-medium">{application.timeInStage} días</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {application.score && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Puntuación Detallada</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                          <div className="text-center">
                            <span className="block text-gray-500">Experiencia</span>
                            <span className="font-medium">{application.score.experience}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500">Skills</span>
                            <span className="font-medium">{application.score.skills}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500">Educación</span>
                            <span className="font-medium">{application.score.education}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500">Cultural</span>
                            <span className="font-medium">{application.score.cultural}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500">Requisitos</span>
                            <span className="font-medium">{application.score.requirements}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-gray-500">General</span>
                            <span className="font-bold text-green-600">{application.score.overall}</span>
                          </div>
                        </div>
                        {application.score.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            "{application.score.notes}"
                          </p>
                        )}
                      </div>
                    )}

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
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Analytics Completo</h2>
              <p className="text-gray-600">
                Dashboard de analytics completo en desarrollo. 
                Ver estadísticas básicas en la pestaña "Resumen".
              </p>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {selectedTab === 'candidates' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Base de Candidatos</h2>
              <p className="text-gray-600">
                Vista de candidatos y perfiles en desarrollo.
                Ver aplicaciones individuales en la pestaña "Aplicaciones".
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}