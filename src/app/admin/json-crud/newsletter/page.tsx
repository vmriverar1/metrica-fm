'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useNewsletterAdmin';
import { useBlogSystemInfo } from '@/hooks/useBlogService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PenTool,
  FileText,
  Users,
  Send,
  Eye,
  Calendar,
  ArrowRight,
  Plus,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

const NewsletterDashboard = () => {
  // Obtener datos reales de Firestore
  const {
    stats,
    articulos,
    autores,
    categorias,
    loadingStats,
    loadingArticulos,
    errorArticulos
  } = useDashboard();


  const { systemInfo } = useBlogSystemInfo();

  const displayStats = {
    totalArticles: stats?.total_articles || 0,
    publishedArticles: stats?.total_articles || 0, // Por ahora usar total_articles
    draftArticles: 0, // Por calcular
    totalAuthors: stats?.total_authors || 0,
    subscribers: 1250, // Mantener simulado por ahora
    monthlyViews: 8900  // Mantener simulado por ahora
  };

  // Convertir artículos de Firestore a formato del componente
  const recentArticles = articulos.slice(0, 10).map((articulo) => {
    return {
      id: articulo.id,
      title: articulo.title || 'Sin título',
      author: articulo.author?.name || 'Autor desconocido',
      category: articulo.category?.name || 'Sin categoría',
      status: articulo.status === 'published' ? 'Publicado' :
              articulo.status === 'draft' ? 'Borrador' : 'Publicado',
      publishDate: articulo.published_date?.toDate?.()?.toISOString().split('T')[0] ||
                   articulo.published_at?.toDate?.()?.toISOString().split('T')[0] ||
                   new Date().toISOString().split('T')[0],
      views: articulo.views || 0,
      readTime: `${articulo.reading_time || 5} min`
    };
  });

  // Convertir categorías de Firestore a formato del componente
  const categories = categorias.map((categoria) => ({
    name: categoria.name,
    count: categoria.articles_count || 0,
    growth: '+0%', // Por implementar cálculo de crecimiento
    color: categoria.color || '#2563eb'
  }));


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publicado': return 'bg-green-100 text-green-800';
      case 'Borrador': return 'bg-yellow-100 text-yellow-800';
      case 'Revisión': return 'bg-blue-100 text-blue-800';
      case 'Archivado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#003F6F]">Dashboard del Newsletter</h1>
            {systemInfo && (
              <Badge variant={systemInfo.directusAvailable ? "default" : "secondary"}>
                {systemInfo.directusAvailable ? "🔥 Firestore" : "📁 Local"}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Gestión de artículos, autores y contenido del newsletter
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artículos</p>
                <p className="text-3xl font-bold text-[#003F6F]">{loadingStats ? '...' : displayStats.totalArticles}</p>
              </div>
              <FileText className="h-12 w-12 text-[#003F6F] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-3xl font-bold text-[#00A8E8]">{loadingStats ? '...' : displayStats.publishedArticles}</p>
              </div>
              <Send className="h-12 w-12 text-[#00A8E8] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suscriptores</p>
                <p className="text-3xl font-bold text-green-600">{displayStats.subscribers.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Link href="/admin/json-crud/newsletter/articles">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <FileText className="h-6 w-6" />
                  <span>Ver Artículos</span>
                </Button>
              </Link>
              
              <Link href="/admin/json-crud/newsletter/authors">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <Users className="h-6 w-6" />
                  <span>Ver Autores</span>
                </Button>
              </Link>
              
              <Link href="/admin/json-crud/newsletter/categories">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <BarChart3 className="h-6 w-6" />
                  <span>Ver Categorías</span>
                </Button>
              </Link>
              
              <Link href="/admin/json-crud/newsletter/articles/new">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <Plus className="h-6 w-6" />
                  <span>Crear Artículo</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artículos Recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Artículos Recientes
                </CardTitle>
                <Link href="/admin/json-crud/newsletter/articles">
                  <Button variant="ghost" size="sm">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Últimos artículos creados o editados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay artículos disponibles</p>
                    <p className="text-sm">Los artículos aparecerán aquí cuando se carguen desde Firestore</p>
                  </div>
                ) : (
                  recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{article.title}</h3>
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <PenTool className="h-4 w-4" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publishDate).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views} vistas
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#003F6F]">{article.readTime}</div>
                      <div className="text-xs text-gray-500">lectura</div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categorías */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Categorías
                </CardTitle>
                <Link href="/admin/json-crud/newsletter/categories">
                  <Button variant="ghost" size="sm">
                    Gestionar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Distribución de artículos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category.count}</Badge>
                      <span className="text-xs text-green-600 font-medium">
                        {category.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDashboard;