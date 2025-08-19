/**
 * FASE 6: Performance Dashboard
 * URL: http://localhost:9002/performance-dashboard
 * 
 * Dashboard completo para monitoreo de performance y optimización.
 * Incluye Web Vitals, cache stats, bundle analysis y recomendaciones.
 */

'use client';

import { useState } from 'react';
import { usePerformanceMonitoring, useWebVitals } from '@/hooks/usePerformanceService';
import {
  Activity,
  Zap,
  TrendingUp,
  Database,
  Package,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Monitor,
  BarChart3,
  Clock,
  Gauge,
  HardDrive,
  Network,
  Eye,
  Settings,
  Download
} from 'lucide-react';

export default function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'cache' | 'bundle' | 'recommendations'>('overview');
  
  const performanceData = usePerformanceMonitoring({
    enableMonitoring: true,
    enableAutoOptimization: true,
    refreshInterval: 15000
  });

  const webVitals = useWebVitals();

  const {
    metrics,
    cacheStats,
    bundleAnalysis,
    score,
    status,
    recommendations,
    isMonitoring,
    refreshData,
    clearCaches
  } = performanceData;

  // Calculate summary stats
  const summaryStats = [
    {
      title: 'Performance Score',
      value: score,
      suffix: '/100',
      icon: Gauge,
      color: score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red',
      description: `Estado: ${status}`
    },
    {
      title: 'Web Vitals Score',
      value: webVitals.score,
      suffix: '/100',
      icon: TrendingUp,
      color: webVitals.score >= 80 ? 'green' : webVitals.score >= 60 ? 'yellow' : 'red',
      description: 'Core Web Vitals'
    },
    {
      title: 'Cache Hit Rate',
      value: Object.values(cacheStats).length > 0 
        ? Math.round(Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.hitRate, 0) / Object.values(cacheStats).length * 100)
        : 0,
      suffix: '%',
      icon: Database,
      color: 'blue',
      description: 'Eficiencia de cache'
    },
    {
      title: 'Bundle Size',
      value: bundleAnalysis ? Math.round(bundleAnalysis.gzippedSize / 1024) : 0,
      suffix: ' KB',
      icon: Package,
      color: 'purple',
      description: 'Tamaño comprimido'
    }
  ];

  const vitalsData = [
    {
      name: 'Largest Contentful Paint',
      value: webVitals.lcp ? Math.round(webVitals.lcp) : 0,
      unit: 'ms',
      status: !webVitals.lcp ? 'unknown' : webVitals.lcp <= 2500 ? 'good' : webVitals.lcp <= 4000 ? 'needs-improvement' : 'poor',
      description: 'Tiempo hasta el contenido principal'
    },
    {
      name: 'First Input Delay',
      value: webVitals.fid ? Math.round(webVitals.fid) : 0,
      unit: 'ms',
      status: !webVitals.fid ? 'unknown' : webVitals.fid <= 100 ? 'good' : webVitals.fid <= 300 ? 'needs-improvement' : 'poor',
      description: 'Retraso en primera interacción'
    },
    {
      name: 'Cumulative Layout Shift',
      value: webVitals.cls ? Math.round(webVitals.cls * 1000) / 1000 : 0,
      unit: '',
      status: !webVitals.cls ? 'unknown' : webVitals.cls <= 0.1 ? 'good' : webVitals.cls <= 0.25 ? 'needs-improvement' : 'poor',
      description: 'Estabilidad visual de la página'
    },
    {
      name: 'First Contentful Paint',
      value: webVitals.fcp ? Math.round(webVitals.fcp) : 0,
      unit: 'ms',
      status: !webVitals.fcp ? 'unknown' : webVitals.fcp <= 1800 ? 'good' : webVitals.fcp <= 3000 ? 'needs-improvement' : 'poor',
      description: 'Tiempo hasta primer contenido'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-7 h-7 text-blue-600" />
                Performance Dashboard
              </h1>
              <p className="text-gray-600">
                Monitoreo y optimización de rendimiento en tiempo real
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isMonitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMonitoring ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {isMonitoring ? 'Monitoreando' : 'Inactivo'}
              </div>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <button
                onClick={clearCaches}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar Cache
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Resumen', icon: Monitor },
                { id: 'vitals', name: 'Web Vitals', icon: Zap },
                { id: 'cache', name: 'Cache', icon: Database },
                { id: 'bundle', name: 'Bundle', icon: Package },
                { id: 'recommendations', name: 'Recomendaciones', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stat.value)}`}>
                    {stat.value}{stat.suffix}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Score */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Performance Score
              </h3>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}
                </div>
                <div className="text-gray-500 mb-4">de 100 puntos</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'excellent' ? 'bg-green-100 text-green-800' :
                  status === 'good' ? 'bg-blue-100 text-blue-800' :
                  status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status === 'excellent' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {status === 'good' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {(status === 'needs-improvement' || status === 'poor') && <AlertTriangle className="w-4 h-4 mr-1" />}
                  {status === 'excellent' ? 'Excelente' :
                   status === 'good' ? 'Bueno' :
                   status === 'needs-improvement' ? 'Necesita Mejoras' :
                   'Deficiente'}
                </div>
              </div>
            </div>

            {/* System Resources */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Recursos del Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Memoria Cache</span>
                  </div>
                  <span className="text-sm font-medium">
                    {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + (stats.totalMemory || 0), 0) / 1024 / 1024 < 1
                      ? Math.round(Object.values(cacheStats).reduce((sum: number, stats: any) => sum + (stats.totalMemory || 0), 0) / 1024) + ' KB'
                      : Math.round(Object.values(cacheStats).reduce((sum: number, stats: any) => sum + (stats.totalMemory || 0), 0) / 1024 / 1024) + ' MB'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Requests Cached</span>
                  </div>
                  <span className="text-sm font-medium">
                    {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.size, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Total Requests</span>
                  </div>
                  <span className="text-sm font-medium">
                    {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.totalRequests, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vitalsData.map((vital, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{vital.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vital.status)}`}>
                      {vital.status === 'good' ? 'Bueno' :
                       vital.status === 'needs-improvement' ? 'Mejorable' :
                       vital.status === 'poor' ? 'Deficiente' : 'Sin datos'}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(vital.value)} mb-2`}>
                    {vital.value}{vital.unit}
                  </div>
                  <p className="text-sm text-gray-500">{vital.description}</p>
                </div>
              ))}
            </div>

            {/* Web Vitals Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Tendencia de Web Vitals</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de tendencias disponible en integración completa</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="space-y-6">
            {/* Cache Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Hit Rate Total</h3>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(cacheStats).length > 0 
                    ? Math.round(Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.hitRate, 0) / Object.values(cacheStats).length * 100)
                    : 0}%
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Entries Totales</h3>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.size, 0)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Evictions</h3>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.evictions, 0)}
                </div>
              </div>
            </div>

            {/* Cache Details */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Detalles de Cache por Tipo</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de Cache
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hit Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Memoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(cacheStats).map(([name, stats]: [string, any]) => (
                      <tr key={name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900 capitalize">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            stats.hitRate >= 0.8 ? 'bg-green-100 text-green-800' :
                            stats.hitRate >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(stats.hitRate * 100)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.totalMemory ? Math.round(stats.totalMemory / 1024) + ' KB' : '0 KB'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stats.totalRequests}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bundle' && (
          <div className="space-y-6">
            {bundleAnalysis && (
              <>
                {/* Bundle Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Tamaño Total</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(bundleAnalysis.totalSize / 1024 / 1024 * 10) / 10} MB
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Gzipped</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(bundleAnalysis.gzippedSize / 1024)} KB
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold">Duplicados</h3>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {bundleAnalysis.duplicates.length}
                    </div>
                  </div>
                </div>

                {/* Chunks Analysis */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Análisis de Chunks</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {bundleAnalysis.chunks.map((chunk, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{chunk.name}</h4>
                            <span className="text-sm text-gray-500">
                              {Math.round(chunk.size / 1024)} KB
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((chunk.size / bundleAnalysis.totalSize) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Módulos: {chunk.modules.slice(0, 3).join(', ')}
                            {chunk.modules.length > 3 && ` +${chunk.modules.length - 3} más`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Priority Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Recomendaciones de Optimización
                </h3>
              </div>
              <div className="p-6">
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">¡No hay recomendaciones pendientes!</p>
                    <p className="text-sm text-gray-500">Tu aplicación está optimizada.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Mejores Prácticas Implementadas</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Cache Inteligente', implemented: true },
                    { name: 'Lazy Loading', implemented: true },
                    { name: 'Code Splitting', implemented: false },
                    { name: 'Image Optimization', implemented: true },
                    { name: 'Bundle Analysis', implemented: true },
                    { name: 'Web Vitals Monitoring', implemented: true },
                    { name: 'Prefetching', implemented: true },
                    { name: 'Service Worker', implemented: false }
                  ].map((practice, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      {practice.implemented ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className={`text-sm ${practice.implemented ? 'text-green-700' : 'text-yellow-700'}`}>
                        {practice.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}