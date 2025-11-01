'use client';

import React, { useState, useMemo } from 'react';
import { useJobs, useDepartments } from '@/hooks/useCareersAdmin';
import { JobPosting, Department } from '@/types/careers';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
  Building,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

export default function JobsPage() {
  const router = useRouter();
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    remove: removeJob,
    refresh: refreshJobs
  } = useJobs();
  const {
    departments,
    loading: departmentsLoading
  } = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<JobPosting | null>(null);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || job.departmentId === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [jobs, searchTerm, statusFilter, departmentFilter]);

  // Get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Sin asignar';
  };

  // Status labels
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'paused': return 'Pausado';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle delete job
  const handleDeleteJob = async (job: JobPosting) => {
    try {
      const result = await removeJob(job.id);
      if (result.exito) {
        setDeleteConfirm(null);
        refreshJobs();
      } else {
        console.error('Error deleting job:', result.mensaje);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Gestión de Trabajos</h1>
          <p className="text-gray-600 mt-1">
            Administra las ofertas laborales y posiciones abiertas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Link href="/admin/json-crud/careers/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Trabajo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar trabajos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredJobs.length} trabajos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Trabajos
          </CardTitle>
          <CardDescription>
            Lista de todas las ofertas laborales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Cargando trabajos...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay trabajos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'No se encontraron trabajos con los filtros aplicados'
                  : 'Comienza creando tu primer trabajo'}
              </p>
              <div className="mt-6">
                <Link href="/admin/json-crud/careers/jobs/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Trabajo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                        {job.featured && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        {job.urgent && <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {getDepartmentName(job.departmentId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {typeof job.location === 'object' && job.location
                            ? `${job.location.city || ''}, ${job.location.state || job.location.country || ''}`
                            : job.location || 'Sin ubicación'
                          } {(job.remote || (job.location && job.location.remote_allowed)) && '(Remoto)'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {job.postedAt
                            ? (job.postedAt.toDate ? job.postedAt.toDate() : new Date(job.postedAt)).toLocaleDateString('es-ES')
                            : 'Sin fecha'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/json-crud/careers/jobs/new?id=${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(job)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{deleteConfirm?.title}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteJob(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}