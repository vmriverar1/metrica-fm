/**
 * Página de test para verificar integración híbrida Directus
 * URL: http://localhost:9002/test-directus
 */

import { PortfolioHybridService } from '@/lib/portfolio-hybrid';

export default async function TestDirectusPage() {
  // Test del sistema híbrido
  const systemStatus = await PortfolioHybridService.getSystemStatus();
  const categories = await PortfolioHybridService.getCategories();
  const projects = await PortfolioHybridService.getProjects({ limit: 3 });
  const featuredProjects = await PortfolioHybridService.getProjects({ featured: true, limit: 2 });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Test Integración Directus
          </h1>

          {/* Status del Sistema */}
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Status del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Directus Disponible</p>
                <p className={`font-bold ${systemStatus.directusAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                  {systemStatus.directusAvailable ? '✅ SÍ' : '⚠️ NO (usando fallback)'}
                </p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Fuente de Datos</p>
                <p className="font-bold text-blue-600">
                  📡 {systemStatus.dataSource.toUpperCase()}
                </p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Última Verificación</p>
                <p className="font-bold text-gray-700">
                  {systemStatus.lastCheck.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">📁 Categorías ({categories.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div 
                    className="w-4 h-4 rounded-full mb-2" 
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  ></div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.slug}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proyectos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">🏗️ Proyectos ({projects.length})</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-4 bg-white border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                    {project.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{project.shortDescription}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📂 {project.category}</span>
                    <span>📍 {project.location.city}</span>
                    <span>🔗 /{project.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proyectos Destacados */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">⭐ Proyectos Destacados ({featuredProjects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProjects.map((project) => (
                <div key={project.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{project.shortDescription}</p>
                  <div className="text-xs text-gray-500">
                    {project.category} • {project.location.city}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información de Desarrollo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🛠️ Información de Desarrollo</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Sistema híbrido funcionando</li>
              <li>✅ Fallback automático a datos locales</li>
              <li>✅ No rompe funcionalidad existente</li>
              <li>✅ Transición gradual a Directus</li>
              <li>📡 Directus URL: http://localhost:8055</li>
              <li>🔗 Admin Panel: http://localhost:8055/admin</li>
            </ul>
          </div>

          {/* Enlaces útiles */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">🔗 Enlaces Útiles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a 
                href="/portfolio" 
                className="p-2 bg-blue-100 text-blue-700 rounded text-center hover:bg-blue-200 transition-colors"
              >
                📋 Portfolio
              </a>
              <a 
                href="http://localhost:8055" 
                target="_blank"
                className="p-2 bg-green-100 text-green-700 rounded text-center hover:bg-green-200 transition-colors"
              >
                📡 Directus API
              </a>
              <a 
                href="http://localhost:8055/admin" 
                target="_blank"
                className="p-2 bg-purple-100 text-purple-700 rounded text-center hover:bg-purple-200 transition-colors"
              >
                ⚙️ Admin Panel
              </a>
              <a 
                href="/test-directus" 
                className="p-2 bg-orange-100 text-orange-700 rounded text-center hover:bg-orange-200 transition-colors"
              >
                🔄 Refresh Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}