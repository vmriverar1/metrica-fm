'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Settings,
  Building
} from 'lucide-react';
import Link from 'next/link';

const CareersDashboard = () => {
  // Datos simulados
  const stats = {
    totalJobs: 15,
    activeJobs: 8,
    departments: 6,
    applications: 127,
    hiredThisMonth: 3,
    averageTimeToHire: 18
  };

  const recentJobs = [
    {
      id: 1,
      title: 'Ingeniero de Proyectos Senior',
      department: 'Ingeniería',
      location: 'Lima, Perú',
      type: 'Tiempo Completo',
      status: 'Activo',
      applications: 23,
      postedDate: '2025-08-15',
      salary: 'S/ 8,000 - S/ 12,000'
    },
    {
      id: 2,
      title: 'Arquitecto Especialista',
      department: 'Diseño',
      location: 'Lima, Perú',
      type: 'Tiempo Completo',
      status: 'Activo',
      applications: 18,
      postedDate: '2025-08-12',
      salary: 'S/ 7,500 - S/ 10,500'
    },
    {
      id: 3,
      title: 'Project Manager',
      department: 'Gestión',
      location: 'Lima, Perú',
      type: 'Tiempo Completo',
      status: 'En Proceso',
      applications: 31,
      postedDate: '2025-08-08',
      salary: 'S/ 9,000 - S/ 13,000'
    },
    {
      id: 4,
      title: 'Analista de Costos',
      department: 'Finanzas',
      location: 'Lima, Perú',
      type: 'Medio Tiempo',
      status: 'Cerrado',
      applications: 15,
      postedDate: '2025-08-01',
      salary: 'S/ 4,500 - S/ 6,000'
    }
  ];

  const departments = [
    { name: 'Ingeniería', jobsCount: 4, applicationsCount: 45, color: '#2563eb' },
    { name: 'Arquitectura', jobsCount: 3, applicationsCount: 28, color: '#7c3aed' },
    { name: 'Gestión', jobsCount: 2, applicationsCount: 35, color: '#059669' },
    { name: 'Finanzas', jobsCount: 2, applicationsCount: 12, color: '#ea580c' },
    { name: 'Recursos Humanos', jobsCount: 1, applicationsCount: 5, color: '#dc2626' },
    { name: 'Marketing', jobsCount: 1, applicationsCount: 8, color: '#0891b2' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Cerrado': return 'bg-gray-100 text-gray-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Tiempo Completo': return 'bg-blue-50 text-blue-700';
      case 'Medio Tiempo': return 'bg-green-50 text-green-700';
      case 'Contrato': return 'bg-orange-50 text-orange-700';
      case 'Freelance': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Dashboard de Carreras</h1>
          <p className="text-gray-600 mt-1">
            Gestión de ofertas laborales y departamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/json-crud/careers/jobs">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Trabajos
            </Button>
          </Link>
          <Link href="/admin/json-crud/careers/departments">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Departamentos
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
                <p className="text-sm font-medium text-gray-600">Total Trabajos</p>
                <p className="text-3xl font-bold text-[#003F6F]">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-12 w-12 text-[#003F6F] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trabajos Activos</p>
                <p className="text-3xl font-bold text-[#E84E0F]">{stats.activeJobs}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-[#E84E0F] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aplicaciones</p>
                <p className="text-3xl font-bold text-green-600">{stats.applications}</p>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contratados</p>
                <p className="text-3xl font-bold text-purple-600">{stats.hiredThisMonth}</p>
                <p className="text-xs text-gray-500">Este mes</p>
              </div>
              <Building className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trabajos Recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Trabajos Recientes
                </CardTitle>
                <Link href="/admin/json-crud/careers/jobs">
                  <Button variant="ghost" size="sm">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Últimas ofertas laborales publicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{job.title}</h3>
                        <Badge className={getJobTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.postedDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-[#003F6F]">{job.salary}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-[#E84E0F]">{job.applications}</div>
                      <div className="text-sm text-gray-500">aplicaciones</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departamentos */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Departamentos
                </CardTitle>
                <Link href="/admin/json-crud/careers/departments">
                  <Button variant="ghost" size="sm">
                    Gestionar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Distribución de trabajos por departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-[#003F6F]">{dept.jobsCount}</div>
                        <div className="text-xs text-gray-500">trabajos</div>
                      </div>
                      <div className="w-px h-8 bg-gray-300 mx-2" />
                      <div className="text-center">
                        <div className="font-medium text-[#E84E0F]">{dept.applicationsCount}</div>
                        <div className="text-xs text-gray-500">postulantes</div>
                      </div>
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
            <Link href="/admin/json-crud/careers/jobs">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Briefcase className="h-6 w-6" />
                <span>Gestionar Trabajos</span>
              </Button>
            </Link>
            
            <Link href="/admin/json-crud/careers/departments">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Users className="h-6 w-6" />
                <span>Departamentos</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <Plus className="h-6 w-6" />
              <span>Nuevo Trabajo</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <Clock className="h-6 w-6" />
              <span>Reportes</span>
            </Button>
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
            Últimas actividades en el sistema de carreras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Nueva aplicación</strong> para Ingeniero de Proyectos Senior</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Trabajo publicado:</strong> Arquitecto Especialista</p>
                <p className="text-xs text-gray-500">Hace 5 horas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm"><strong>Candidato contratado:</strong> Ana García para Project Manager</p>
                <p className="text-xs text-gray-500">Ayer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareersDashboard;