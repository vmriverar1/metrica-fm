/**
 * Página de status del Blog System
 * URL: http://localhost:9003/blog-status
 */

import { BlogService } from '@/lib/blog-service';
import { Suspense } from 'react';

async function BlogStatusContent() {
  const [systemInfo, stats, categories, authors, recentPosts] = await Promise.all([
    BlogService.getSystemInfo(),
    BlogService.getStats(),
    BlogService.getCategories(),
    BlogService.getAuthors(),
    BlogService.getPosts({ limit: 5 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Blog System Status
            </h1>
            <p className="text-orange-100">
              Estado completo del sistema híbrido de blog
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
                <p className="text-green-700 text-sm">Blog funcionando correctamente</p>
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
                  📚 {systemInfo.dataSource.toUpperCase()}
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

            {/* Blog Stats */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Estadísticas del Blog</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalPosts}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Autores Activos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalAuthors}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Categorías</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalCategories}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageReadingTime}min</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Total Visualizaciones</p>
                  <p className="text-lg font-bold text-indigo-600">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Categories Dashboard */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📁 Dashboard de Categorías</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-5 h-5 rounded-full mr-3" 
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        ></div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                          <p className="text-sm text-gray-500">/{category.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-lg font-bold">
                          {category.count}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">posts</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      <code className="bg-gray-100 px-2 py-1 rounded">slug: {category.slug}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authors Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">👥 Equipo Editorial</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authors.map((author) => (
                  <div key={author.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <img 
                        src={author.avatar} 
                        alt={author.name}
                        className="w-16 h-16 rounded-full mr-4 border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{author.name}</h3>
                        <p className="text-sm text-orange-600 font-medium">{author.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{author.bio}</p>
                    <div className="flex gap-2">
                      {author.email && (
                        <a 
                          href={`mailto:${author.email}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          📧 Email
                        </a>
                      )}
                      {author.linkedin && (
                        <a 
                          href={author.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📝 Posts Recientes</h2>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                          {post.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        📂 <span className="ml-1 capitalize">{post.category.replace('-', ' ')}</span>
                      </span>
                      <span className="flex items-center">
                        ✍️ <span className="ml-1">{post.author.name}</span>
                      </span>
                      <span className="flex items-center">
                        🕐 <span className="ml-1">{post.readingTime} min</span>
                      </span>
                      <span className="flex items-center">
                        📅 <span className="ml-1">{post.publishedAt.toLocaleDateString()}</span>
                      </span>
                      {post.views && (
                        <span className="flex items-center">
                          👁️ <span className="ml-1">{post.views.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 6).map((tag, index) => (
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

            {/* Popular Tags */}
            {stats.popularTags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🏷️ Tags Populares</h2>
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex flex-wrap gap-3">
                    {stats.popularTags.slice(0, 15).map((tagData, index) => (
                      <span 
                        key={tagData.tag} 
                        className={`px-3 py-2 rounded-full text-sm font-medium ${
                          index < 3 ? 'bg-orange-100 text-orange-800' :
                          index < 6 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        #{tagData.tag} ({tagData.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Technical Info */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">🔧 Información Técnica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">API Endpoints de Blog</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/blog_posts</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/blog_categories</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-green-400">GET</span> <span className="text-gray-300">{systemInfo.apiEndpoint}/items/authors</span>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <span className="text-blue-400">LOCAL</span> <span className="text-gray-300">/types/blog.ts (15 posts)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-3">Servicios Blog Disponibles</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getCategories()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getPosts(filters)
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getPostBySlug()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.searchPosts()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getAuthors()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getRelatedPosts()
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      BlogService.getStats()
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
                  href="/blog" 
                  className="p-3 bg-orange-100 text-orange-700 rounded-lg text-center hover:bg-orange-200 transition-colors text-sm font-medium"
                >
                  📝 Blog Principal
                </a>
                <a 
                  href="/test-blog" 
                  className="p-3 bg-green-100 text-green-700 rounded-lg text-center hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  🧪 Test Blog
                </a>
                <a 
                  href="/portfolio-status" 
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  📊 Portfolio Status
                </a>
                <a 
                  href="http://localhost:8055/admin" 
                  target="_blank"
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  ⚙️ Admin Panel
                </a>
                <a 
                  href="/blog-status" 
                  className="p-3 bg-green-100 text-green-700 rounded-lg text-center hover:bg-green-200 transition-colors text-sm font-medium"
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
          <div className="bg-gradient-to-r from-orange-600 to-purple-600 px-8 py-6">
            <div className="h-8 bg-orange-500 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-orange-400 rounded w-1/2 animate-pulse"></div>
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

export default function BlogStatusPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BlogStatusContent />
    </Suspense>
  );
}