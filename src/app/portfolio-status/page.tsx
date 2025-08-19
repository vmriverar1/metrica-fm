/**
 * Página de status del Portfolio System
 * URL: http://localhost:9003/portfolio-status
 */

import { PortfolioService } from '@/lib/portfolio-service';
import { Suspense } from 'react';

async function PortfolioStatusContent() {
  const [systemInfo, stats, categories, featuredProjects] = await Promise.all([
    PortfolioService.getSystemInfo(),
    PortfolioService.getStats(),
    PortfolioService.getCategories(),
    PortfolioService.getProjects({ featured: true, limit: 5 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Portfolio System Status
            </h1>
            <p className="text-blue-100">
              Estado completo del sistema de portfolio híbrido
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
                <p className="text-green-700 text-sm">Todo funcionando correctamente</p>
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
                  📡 {systemInfo.dataSource.toUpperCase()}
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

            {/* Portfolio Stats */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Estadísticas del Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Total Proyectos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Proyectos Destacados</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.featuredProjects}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Categorías</p>
                  <p className="text-3xl font-bold text-green-600">{stats.categories}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Última Actualización</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stats.latestUpdate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📁 Categorías Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        ></div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                        {category.count} proyectos
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>Slug: </span>
                      <code className="bg-gray-100 px-1 rounded">{category.slug}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">⭐ Proyectos Destacados</h2>
              <div className="space-y-4">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{project.title}</h3>
                        <p className="text-gray-600">{project.shortDescription}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Destacado
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        📂 <span className="ml-1 capitalize">{project.category}</span>
                      </span>
                      <span className="flex items-center">
                        📍 <span className="ml-1">{project.location.city}</span>
                      </span>
                      <span className="flex items-center">
                        🔗 <a href={project.url} className="ml-1 text-blue-500 hover:underline">{project.url}</a>
                      </span>
                      <span className="flex items-center">
                        📅 <span className="ml-1">{project.completedAt.toLocaleDateString()}</span>
                      </span>
                    </div>
                    {project.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/project_categories</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/projects</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-blue-400">LOCAL</span> <span className="text-gray-300">/types/portfolio.ts</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Servicios Disponibles</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      PortfolioService.getCategories()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      PortfolioService.getProjects()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      PortfolioService.getProjectBySlug()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      PortfolioService.searchProjects()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      PortfolioService.getStats()
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-4">🔗 Enlaces de Navegación</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <a 
                  href="/portfolio" 
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  📋 Portfolio Principal
                </a>
                <a 
                  href="/test-directus" 
                  className="p-3 bg-green-100 text-green-700 rounded-lg text-center hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  🧪 Test Directus
                </a>
                <a 
                  href="http://localhost:8055/admin" 
                  target="_blank"
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  ⚙️ Admin Panel
                </a>
                <a 
                  href="/portfolio-status" 
                  className="p-3 bg-orange-100 text-orange-700 rounded-lg text-center hover:bg-orange-200 transition-colors text-sm font-medium"
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
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

export default function PortfolioStatusPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PortfolioStatusContent />
    </Suspense>
  );
}