'use client';

import React from 'react';
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
  TrendingUp,
  ArrowRight,
  Plus,
  Settings,
  Mail,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

const NewsletterDashboard = () => {
  // Datos simulados
  const stats = {
    totalArticles: 45,
    publishedArticles: 38,
    draftArticles: 7,
    totalAuthors: 8,
    subscribers: 1250,
    monthlyViews: 8900
  };

  const recentArticles = [
    {
      id: 1,
      title: 'Innovaciones en Construcción Sostenible',
      author: 'Carlos Mendoza',
      category: 'Tecnología',
      status: 'Publicado',
      publishDate: '2025-08-18',
      views: 245,
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Gestión de Proyectos en Tiempos de Crisis',
      author: 'Ana Rodríguez',
      category: 'Gestión',
      status: 'Publicado',
      publishDate: '2025-08-15',
      views: 189,
      readTime: '7 min'
    },
    {
      id: 3,
      title: 'Tendencias Arquitectónicas 2025',
      author: 'Luis García',
      category: 'Arquitectura',
      status: 'Borrador',
      publishDate: '2025-08-20',
      views: 0,
      readTime: '6 min'
    },
    {
      id: 4,
      title: 'Certificaciones de Calidad ISO',
      author: 'María Torres',
      category: 'Calidad',
      status: 'Revisión',
      publishDate: '2025-08-22',
      views: 0,
      readTime: '4 min'
    }
  ];

  const categories = [
    { name: 'Tecnología', count: 12, growth: '+15%', color: '#2563eb' },
    { name: 'Gestión', count: 8, growth: '+8%', color: '#059669' },
    { name: 'Arquitectura', count: 10, growth: '+12%', color: '#7c3aed' },
    { name: 'Calidad', count: 6, growth: '+5%', color: '#ea580c' },
    { name: 'Sostenibilidad', count: 5, growth: '+20%', color: '#0891b2' },
    { name: 'Innovación', count: 4, growth: '+10%', color: '#dc2626' }
  ];

  const topAuthors = [
    { name: 'Carlos Mendoza', articles: 8, views: 1250, avatar: '👨‍💼' },
    { name: 'Ana Rodríguez', articles: 6, views: 980, avatar: '👩‍💼' },
    { name: 'Luis García', articles: 7, views: 890, avatar: '👨‍🎨' },
    { name: 'María Torres', articles: 5, views: 750, avatar: '👩‍🔬' }
  ];

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
          <h1 className="text-3xl font-bold text-[#003F6F]">Dashboard del Newsletter</h1>
          <p className="text-gray-600 mt-1">
            Gestión de artículos, autores y contenido del newsletter
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/json-crud/newsletter/articles">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Artículos
            </Button>
          </Link>
          <Link href="/admin/json-crud/newsletter/authors">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Autores
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artículos</p>
                <p className="text-3xl font-bold text-[#003F6F]">{stats.totalArticles}</p>
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
                <p className="text-3xl font-bold text-[#E84E0F]">{stats.publishedArticles}</p>
              </div>
              <Send className="h-12 w-12 text-[#E84E0F] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suscriptores</p>
                <p className="text-3xl font-bold text-green-600">{stats.subscribers.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vistas Mensuales</p>
                <p className="text-3xl font-bold text-purple-600">{stats.monthlyViews.toLocaleString()}</p>
              </div>
              <Eye className="h-12 w-12 text-purple-600 opacity-20" />
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
                {recentArticles.map((article) => (
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
                ))}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Authors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Autores Destacados
              </CardTitle>
              <Link href="/admin/json-crud/newsletter/authors">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Autores con mejor rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAuthors.map((author, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003F6F] text-white rounded-full flex items-center justify-center text-lg">
                      {author.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{author.name}</div>
                      <div className="text-sm text-gray-500">{author.articles} artículos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#E84E0F]">{author.views}</div>
                    <div className="text-xs text-gray-500">vistas totales</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/json-crud/newsletter/articles">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <FileText className="h-6 w-6" />
                  <span>Artículos</span>
                </Button>
              </Link>
              
              <Link href="/admin/json-crud/newsletter/authors">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <Users className="h-6 w-6" />
                  <span>Autores</span>
                </Button>
              </Link>
              
              <Link href="/admin/json-crud/newsletter/categories">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <BarChart3 className="h-6 w-6" />
                  <span>Categorías</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Plus className="h-6 w-6" />
                <span>Nuevo Artículo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rendimiento del Newsletter
          </CardTitle>
          <CardDescription>
            Estadísticas de engagement y crecimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600">Tasa de Apertura</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-sm text-gray-600">Tasa de Lectura</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">12%</div>
              <div className="text-sm text-gray-600">Tasa de Click</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3.2%</div>
              <div className="text-sm text-gray-600">Tasa de Conversión</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimas actividades en el sistema de newsletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Artículo publicado:</strong> Innovaciones en Construcción Sostenible</p>
                <p className="text-xs text-gray-500">Hace 3 horas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Nuevo suscriptor:</strong> 25 nuevos suscriptores esta semana</p>
                <p className="text-xs text-gray-500">Hace 6 horas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Artículo en revisión:</strong> Tendencias Arquitectónicas 2025</p>
                <p className="text-xs text-gray-500">Ayer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterDashboard;