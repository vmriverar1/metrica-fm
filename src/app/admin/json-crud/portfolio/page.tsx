'use client';

import React from 'react';
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

const PortfolioDashboard = () => {
  // Datos simulados
  const stats = {
    totalProjects: 82,
    activeProjects: 15,
    categories: 7,
    completedProjects: 67,
    monthlyGrowth: 12.5,
    averageRating: 4.8
  };

  const recentProjects = [
    {
      id: 1,
      title: 'Centro Educativo San Martín',
      category: 'Educación',
      status: 'En progreso',
      completion: 75,
      client: 'Ministerio de Educación',
      startDate: '2025-06-15'
    },
    {
      id: 2,
      title: 'Hospital Nacional del Callao',
      category: 'Salud',
      status: 'Completado',
      completion: 100,
      client: 'ESSALUD',
      startDate: '2024-12-01'
    },
    {
      id: 3,
      title: 'Torre Empresarial Lima',
      category: 'Oficinas',
      status: 'En progreso',
      completion: 45,
      client: 'Grupo Inmobiliario ABC',
      startDate: '2025-07-20'
    },
    {
      id: 4,
      title: 'Hotel Boutique Miraflores',
      category: 'Hotelería',
      status: 'Planificación',
      completion: 20,
      client: 'Turismo del Perú SA',
      startDate: '2025-08-10'
    }
  ];

  const categories = [
    { name: 'Educación', count: 12, color: '#2563eb', growth: '+8%' },
    { name: 'Salud', count: 8, color: '#dc2626', growth: '+5%' },
    { name: 'Oficinas', count: 15, color: '#7c3aed', growth: '+15%' },
    { name: 'Hotelería', count: 6, color: '#059669', growth: '+3%' },
    { name: 'Industria', count: 10, color: '#ea580c', growth: '+12%' },
    { name: 'Retail', count: 9, color: '#dc2626', growth: '+7%' },
    { name: 'Vivienda', count: 18, color: '#0891b2', growth: '+20%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      case 'Planificación': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <p className="text-3xl font-bold text-[#007bc4]">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-[#007bc4] opacity-20" />
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