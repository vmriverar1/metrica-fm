'use client';

import React from 'react';
import { useCareersAdmin } from '@/hooks/useCareersAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Building2,
  Users,
  Calendar,
  Eye,
  ArrowRight,
  Plus,
  BarChart3,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const CareersDashboard = () => {
  const {
    jobs,
    departments,
    jobsLoading,
    departmentsLoading,
    jobsError,
    departmentsError,
    globalLoading
  } = useCareersAdmin();

  // Calcular estadísticas
  const activeJobs = jobs.filter(job => job.status === 'active');
  const draftJobs = jobs.filter(job => job.status === 'draft');
  const featuredJobs = jobs.filter(job => job.featured);
  const activeDepartments = departments.filter(dept => dept.active);

  const displayStats = {
    totalJobs: jobs.length,
    activeJobs: activeJobs.length,
    draftJobs: draftJobs.length,
    totalDepartments: activeDepartments.length,
    featuredJobs: featuredJobs.length,
    applicationsThisMonth: 0 // Por implementar
  };

  // Trabajos recientes
  const recentJobs = jobs.slice(0, 10).map((job) => ({
    id: job.id,
    title: job.title,
    department: job.departmentId, // Temporalmente mostrar ID
    category: job.category,
    type: job.type,
    level: job.level,
    status: job.status,
    location: job.location,
    remote: job.remote,
    featured: job.featured,
    urgent: job.urgent,
    postedDate: job.postedAt,
    deadline: job.deadline
  }));

  // Departamentos con conteo de trabajos
  const departmentStats = departments.map((dept) => ({
    name: dept.name,
    count: jobs.filter(job => job.departmentId === dept.id).length,
    activeCount: jobs.filter(job => job.departmentId === dept.id && job.status === 'active').length,
    color: dept.color
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'paused': return 'Pausado';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'T. Completo';
      case 'part-time': return 'M. Tiempo';
      case 'contract': return 'Contrato';
      case 'internship': return 'Prácticas';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#003F6F]">Dashboard de Careers</h1>
            <Badge variant="default">🔥 Firestore</Badge>
          </div>
          <p className="text-gray-600 mt-1">
            Gestión de trabajos, departamentos y postulaciones
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trabajos</p>
                <p className="text-3xl font-bold text-[#003F6F]">{jobsLoading ? '...' : displayStats.totalJobs}</p>
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
                <p className="text-3xl font-bold text-[#00A8E8]">{jobsLoading ? '...' : displayStats.activeJobs}</p>
              </div>
              <Eye className="h-12 w-12 text-[#00A8E8] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departamentos</p>
                <p className="text-3xl font-bold text-green-600">{departmentsLoading ? '...' : displayStats.totalDepartments}</p>
              </div>
              <Building2 className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-4 gap-4">
            <Link href="/admin/json-crud/careers/jobs">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Briefcase className="h-6 w-6" />
                <span>Ver Trabajos</span>
              </Button>
            </Link>

            <Link href="/admin/json-crud/careers/departments">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Building2 className="h-6 w-6" />
                <span>Ver Departamentos</span>
              </Button>
            </Link>

            <Link href="/admin/json-crud/careers/jobs/new">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Plus className="h-6 w-6" />
                <span>Crear Trabajo</span>
              </Button>
            </Link>

            <Button variant="outline" className="h-20 flex-col gap-2 w-full" disabled>
              <Users className="h-6 w-6" />
              <span>Aplicaciones</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay trabajos disponibles</p>
                    <p className="text-sm">Los trabajos aparecerán aquí cuando se carguen desde Firestore</p>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{job.title}</h3>
                        {job.featured && <Badge variant="default">Destacado</Badge>}
                        {job.urgent && <Badge variant="destructive">Urgente</Badge>}
                        <Badge variant="outline">{getTypeLabel(job.type)}</Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {typeof job.location === 'object' && job.location
                            ? `${job.location.city || ''}, ${job.location.state || job.location.country || ''}`
                            : job.location || 'Sin ubicación'
                          } {(job.remote || (job.location && job.location.remote_allowed)) && '(Remoto)'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {job.postedDate
                            ? (job.postedDate.toDate ? job.postedDate.toDate() : new Date(job.postedDate)).toLocaleDateString('es-ES')
                            : 'Sin fecha'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#003F6F]">
                        {job.deadline
                          ? Math.ceil(((job.deadline.toDate ? job.deadline.toDate() : new Date(job.deadline)).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' días'
                          : 'Sin límite'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.deadline ? 'restantes' : ''}
                      </div>
                    </div>
                  </div>
                  ))
                )}
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
                  <Building2 className="h-5 w-5" />
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
                {departmentStats.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay departamentos</p>
                  </div>
                ) : (
                  departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{dept.count}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {dept.activeCount} activos
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareersDashboard;