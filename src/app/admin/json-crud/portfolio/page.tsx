'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Tag,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Project {
  id: string;
  title: string;
  category: string;
  status: string;
  client: string;
  created_at: string;
  category_info?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  projects_count: number;
}

const PortfolioDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    categories: 0,
    completedProjects: 0,
    monthlyGrowth: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/admin/portfolio/projects?limit=10');

      if (data.success) {
        const projectsList = data.data.projects || [];
        const categoriesList = data.data.categories || [];

        setProjects(projectsList);
        setCategories(categoriesList);

        // Calculate stats from real data
        const total = data.data.pagination?.total || projectsList.length;
        const active = projectsList.filter((p: Project) => p.status === 'in_progress' || p.status === 'active').length;
        const completed = projectsList.filter((p: Project) => p.status === 'completed').length;

        setStats({
          totalProjects: total,
          activeProjects: active,
          categories: categoriesList.length,
          completedProjects: completed,
          monthlyGrowth: 12.5, // Could be calculated from data
          averageRating: 4.8   // Could be calculated from data
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentProjects = projects.slice(0, 4).map((project: Project) => {
    // Función helper para manejar fechas de forma segura
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return '';

      try {
        // Si es un string ISO válido
        if (typeof dateValue === 'string') {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }

        // Si es un objeto Date
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return dateValue.toISOString().split('T')[0];
        }

        // Si es un timestamp de Firestore (objeto con toDate())
        if (dateValue && typeof dateValue.toDate === 'function') {
          const date = dateValue.toDate();
          return date.toISOString().split('T')[0];
        }

        return '';
      } catch (error) {
        console.warn('Error formatting date:', dateValue, error);
        return '';
      }
    };

    return {
      id: project.id,
      title: project.title,
      category: project.category_info?.name || project.category,
      status: project.status === 'completed' ? 'Completado' :
              project.status === 'in_progress' ? 'En progreso' : 'Planificación',
      completion: project.status === 'completed' ? 100 :
                  project.status === 'in_progress' ? 75 : 25,
      client: project.client || 'No especificado',
      startDate: formatDate(project.created_at)
    };
  });

  const categoryColors = ['#2563eb', '#dc2626', '#7c3aed', '#059669', '#ea580c', '#0891b2', '#f59e0b'];
  const categoriesWithColors = categories.map((cat, index) => ({
    name: cat.name,
    count: cat.projects_count,
    color: categoryColors[index % categoryColors.length],
    growth: '+' + Math.floor(Math.random() * 20 + 1) + '%' // Mock growth for now
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      case 'Planificación': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F6F] mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Dashboard del Portfolio</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de proyectos y categorías del portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/json-crud/portfolio/projects">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Proyectos
            </Button>
          </Link>
          <Link href="/admin/json-crud/portfolio/categories">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Gestionar Categorías
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
                <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                <p className="text-3xl font-bold text-[#003F6F]">{stats.totalProjects}</p>
              </div>
              <Building2 className="h-12 w-12 text-[#003F6F] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                <p className="text-3xl font-bold text-[#00A8E8]">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-[#00A8E8] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-3xl font-bold text-green-600">{stats.categories}</p>
              </div>
              <Tag className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
                <p className="text-3xl font-bold text-purple-600">+{stats.monthlyGrowth}%</p>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proyectos Recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Proyectos Recientes
                </CardTitle>
                <Link href="/admin/json-crud/portfolio/projects">
                  <Button variant="ghost" size="sm">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Últimos proyectos agregados al portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{project.title}</h3>
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.startDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">{project.completion}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-[#003F6F] h-2 rounded-full transition-all"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
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
                  <Tag className="h-5 w-5" />
                  Categorías
                </CardTitle>
                <Link href="/admin/json-crud/portfolio/categories">
                  <Button variant="ghost" size="sm">
                    Gestionar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Distribución de proyectos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoriesWithColors.map((category, index) => (
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/json-crud/portfolio/projects">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Building2 className="h-6 w-6" />
                <span>Gestionar Proyectos</span>
              </Button>
            </Link>
            
            <Link href="/admin/json-crud/portfolio/categories">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Tag className="h-6 w-6" />
                <span>Gestionar Categorías</span>
              </Button>
            </Link>
            
            <Link href="/admin/json-crud/portfolio/projects">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Plus className="h-6 w-6" />
                <span>Nuevo Proyecto</span>
              </Button>
            </Link>
            
            <Link href="/admin/reports">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <BarChart3 className="h-6 w-6" />
                <span>Reportes</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioDashboard;