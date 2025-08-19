/**
 * Página de status del Careers System
 * URL: http://localhost:9003/careers-status
 */

import { CareersService } from '@/lib/careers-service';
import { Suspense } from 'react';

async function CareersStatusContent() {
  const [systemInfo, stats, categories, benefits, recentJobs] = await Promise.all([
    CareersService.getSystemInfo(),
    CareersService.getStats(),
    CareersService.getCategories(),
    CareersService.getBenefits(),
    CareersService.getJobs({ limit: 5 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Careers System Status
            </h1>
            <p className="text-blue-100">
              Estado completo del sistema híbrido de careers/jobs
            </p>
          </div>

          <div className="p-8">
            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <h3 className="font-semibold text-green-800">Sistema Status</h3>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">✅ OPERACIONAL</p>
                <p className="text-green-700 text-sm">Careers funcionando correctamente</p>
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
                  💼 {systemInfo.dataSource.toUpperCase()}
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
                  <h3 className="font-semibold text-purple-800">Última Verificación</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  🕐 {systemInfo.lastCheck.toLocaleTimeString()}
                </p>
                <p className="text-purple-700 text-sm">
                  {systemInfo.lastCheck.toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Careers Stats */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Estadísticas de Careers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Posiciones Activas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalPositions}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Categorías</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalCategories}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Total Aplicaciones</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalApplications}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Salario Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">S/ {stats.averageSalary.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Categories Dashboard */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📁 Dashboard de Categorías</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">{category.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                          <p className="text-sm text-gray-500">/{category.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-lg font-bold">
                          {category.count}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">posiciones</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      ></div>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">color: {category.color}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">🎁 Paquete de Beneficios</h2>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <div className={`p-2 rounded-lg mr-3 ${
                          benefit.category === 'compensation' ? 'bg-green-100 text-green-600' :
                          benefit.category === 'health' ? 'bg-red-100 text-red-600' :
                          benefit.category === 'development' ? 'bg-blue-100 text-blue-600' :
                          benefit.category === 'time-off' ? 'bg-yellow-100 text-yellow-600' :
                          benefit.category === 'culture' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <span className="font-bold text-sm">
                            {benefit.category.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{benefit.title}</h3>
                          <p className="text-xs text-gray-500 mb-2 capitalize">{benefit.category.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                      {benefit.icon && (
                        <div className="text-xs text-gray-400 bg-white rounded px-2 py-1">
                          Icon: {benefit.icon}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Job Postings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">💼 Posiciones Recientes</h2>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                          {job.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              ⭐ Destacado
                            </span>
                          )}
                          {job.urgent && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              🚨 Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📂</span>
                        <span className="capitalize">{job.category.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">🏢</span>
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📍</span>
                        <span>{job.location.city}, {job.location.region}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">💼</span>
                        <span className="capitalize">{job.type.replace('-', ' ')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📊</span>
                        <span className="capitalize">{job.level}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📅</span>
                        <span>{job.postedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">👥</span>
                        <span>{job.applicantCount || 0} aplicaciones</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">👁️</span>
                        <span>{job.viewCount || 0} vistas</span>
                      </div>
                    </div>

                    {job.salary && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                        <div className="flex items-center text-green-800">
                          <span className="mr-2">💰</span>
                          <span className="font-semibold">
                            S/ {job.salary.min.toLocaleString()} - S/ {job.salary.max.toLocaleString()}
                            <span className="text-sm ml-1">({job.salary.period})</span>
                            {job.salary.negotiable && (
                              <span className="text-xs ml-2 bg-green-200 px-2 py-1 rounded">Negociable</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">🎯</span>
                        <span>{job.experience} años de experiencia</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📋</span>
                        <span>{job.requirements.length} requisitos</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">🎁</span>
                        <span>{job.benefits.length} beneficios</span>
                      </div>
                    </div>

                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 6).map((tag, index) => (
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

            {/* Location and Benefits Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Top Locations */}
              {stats.topLocations.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">📍 Ubicaciones Principales</h2>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="space-y-3">
                      {stats.topLocations.map((location, index) => (
                        <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800">{location.location}</span>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {location.count} posiciones
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Benefits */}
              {stats.popularBenefits.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">🏆 Beneficios Populares</h2>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="space-y-3">
                      {stats.popularBenefits.slice(0, 6).map((benefit, index) => (
                        <div key={benefit.benefit} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">{benefit.benefit}</span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {benefit.count} posiciones
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Info */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">🔧 Información Técnica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">API Endpoints de Careers</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/job_postings</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/job_categories</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/job_benefits</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/job_applications</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-blue-400">LOCAL</span> <span className="text-gray-300">/types/careers.ts (3 jobs + 6 benefits)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Servicios Careers Disponibles</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getCategories()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getJobs(filters)
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getJobBySlug()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.searchJobs()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getBenefits()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getRelatedJobs()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getStats()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      CareersService.getSystemInfo()
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
                  href="/careers" 
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  💼 Careers Principal
                </a>
                <a 
                  href="/test-careers" 
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  🧪 Test Careers
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
                  href="/careers-status" 
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  🔄 Refresh Status
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="h-8 bg-blue-500 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-blue-400 rounded w-1/2 animate-pulse"></div>
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

export default function CareersStatusPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CareersStatusContent />
    </Suspense>
  );
}