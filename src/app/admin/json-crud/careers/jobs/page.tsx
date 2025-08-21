/**
 * Gestión de Trabajos/Empleos - Careers
 */

'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import {
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
import DataTable, { Column, TableAction, FilterOption } from '@/components/admin/DataTable';
import DynamicForm, { FormField, FormGroup } from '@/components/admin/DynamicForm';

interface Job {
  id: string;
  title: string;
  slug: string;
  category: string;
  department: string;
  location: {
    city: string;
    region: string;
    country: string;
    remote: boolean;
    hybrid: boolean;
    address: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'junior' | 'mid' | 'senior' | 'director';
  status: 'active' | 'paused' | 'closed' | 'draft';
  experience_years: number;
  featured: boolean;
  urgent: boolean;
  posted_date: string;
  deadline: string;
  short_description: string;
  full_description: string;
  key_responsibilities: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
    negotiable: boolean;
  };
  tags: string[];
  applicant_count: number;
  view_count: number;
  hiring_manager: {
    name: string;
    role: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  department_info?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  days_until_deadline?: number;
  days_since_posted?: number;
}

interface Department {
  id: string;
  name: string;
  slug: string;
  color: string;
  open_positions: number;
  total_positions: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('posted_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, pagination.limit, filters, searchTerm, sortColumn, sortDirection]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortColumn,
        order: sortDirection,
        ...(searchTerm && { search: searchTerm }),
        ...filters
      });

      const data = await apiClient.get(`/api/admin/careers/jobs?${params}`);

      if (data.success) {
        setJobs(data.data.jobs);
        setDepartments(data.data.departments);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching jobs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDeleteJob = async (job: Job) => {
    try {
      const data = await apiClient.delete(`/api/admin/careers/jobs/${job.id}`);if (data.success) {
        fetchJobs();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting job:', data.message);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      // Transform form data to match API expectations
      const jobData = {
        ...values,
        location: {
          city: values.location_city || '',
          region: values.location_region || '',
          country: values.location_country || 'Perú',
          remote: values.location_remote || false,
          hybrid: values.location_hybrid || false,
          address: values.location_address || ''
        },
        salary: values.salary_min || values.salary_max ? {
          min: values.salary_min || 0,
          max: values.salary_max || 0,
          currency: values.salary_currency || 'PEN',
          period: values.salary_period || 'monthly',
          negotiable: values.salary_negotiable || false
        } : null,
        hiring_manager: values.hiring_manager_name ? {
          name: values.hiring_manager_name,
          role: values.hiring_manager_role || '',
          email: values.hiring_manager_email || ''
        } : null
      };

      // Remove transformed fields
      delete jobData.location_city;
      delete jobData.location_region;
      delete jobData.location_country;
      delete jobData.location_remote;
      delete jobData.location_hybrid;
      delete jobData.location_address;
      delete jobData.salary_min;
      delete jobData.salary_max;
      delete jobData.salary_currency;
      delete jobData.salary_period;
      delete jobData.salary_negotiable;
      delete jobData.hiring_manager_name;
      delete jobData.hiring_manager_role;
      delete jobData.hiring_manager_email;

      const url = editingJob 
        ? `/api/admin/careers/jobs/${editingJob.id}`
        : '/api/admin/careers/jobs';
      
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchJobs();
        setShowForm(false);
        setEditingJob(null);
      } else {
        throw new Error(data.message || 'Error saving job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  };

  // Table columns
  const columns: Column[] = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value: string, row: Job) => (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{value}</span>
            {row.featured && <Star className="w-4 h-4 text-yellow-500" />}
            {row.urgent && <Zap className="w-4 h-4 text-red-500" />}
          </div>
          <div className="text-sm text-gray-500">/{row.slug}</div>
        </div>
      )
    },
    {
      key: 'department_info',
      label: 'Departamento',
      render: (value: any) => value ? (
        <span
          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          style={{ backgroundColor: `${value.color}20`, color: value.color }}
        >
          {value.name}
        </span>
      ) : null
    },
    {
      key: 'level',
      label: 'Nivel',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'director' ? 'bg-purple-100 text-purple-800' :
          value === 'senior' ? 'bg-blue-100 text-blue-800' :
          value === 'mid' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'director' ? 'Director' : 
           value === 'senior' ? 'Senior' :
           value === 'mid' ? 'Intermedio' : 'Junior'}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value === 'full-time' ? 'Tiempo completo' :
           value === 'part-time' ? 'Medio tiempo' :
           value === 'contract' ? 'Contrato' : 'Prácticas'}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Ubicación',
      render: (value: any) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm">{value.city}, {value.region}</div>
            <div className="text-xs text-gray-500">
              {value.remote && 'Remoto'} {value.hybrid && 'Híbrido'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'applicant_count',
      label: 'Aplicaciones',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          value === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? 'Activo' : 
           value === 'paused' ? 'Pausado' :
           value === 'closed' ? 'Cerrado' : 'Borrador'}
        </span>
      )
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value: string, row: Job) => {
        if (!value) return <span className="text-gray-400">Sin límite</span>;
        
        const isExpired = row.days_until_deadline !== undefined && row.days_until_deadline < 0;
        const isUrgent = row.days_until_deadline !== undefined && row.days_until_deadline <= 7;
        
        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className={`text-sm ${isExpired ? 'text-red-600' : isUrgent ? 'text-yellow-600' : ''}`}>
                {new Date(value).toLocaleDateString()}
              </div>
              {row.days_until_deadline !== undefined && (
                <div className="text-xs text-gray-500">
                  {row.days_until_deadline > 0 ? `${row.days_until_deadline} días` : 'Vencido'}
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: (job: Job) => window.open(`/careers/job/${job.slug}`, '_blank'),
      variant: 'secondary'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditJob,
      variant: 'primary'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: (job: Job) => setDeleteConfirm(job),
      variant: 'danger'
    }
  ];

  // Filters
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Departamento',
      type: 'select',
      options: departments.map(dept => ({ value: dept.id, label: dept.name }))
    },
    {
      key: 'level',
      label: 'Nivel',
      type: 'select',
      options: [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Intermedio' },
        { value: 'senior', label: 'Senior' },
        { value: 'director', label: 'Director' }
      ]
    },
    {
      key: 'type',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'full-time', label: 'Tiempo completo' },
        { value: 'part-time', label: 'Medio tiempo' },
        { value: 'contract', label: 'Contrato' },
        { value: 'internship', label: 'Prácticas' }
      ]
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'paused', label: 'Pausado' },
        { value: 'closed', label: 'Cerrado' },
        { value: 'draft', label: 'Borrador' }
      ]
    },
    {
      key: 'featured',
      label: 'Destacado',
      type: 'select',
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      key: 'urgent',
      label: 'Urgente',
      type: 'select',
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      key: 'remote',
      label: 'Remoto',
      type: 'select',
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  // Form fields
  const formFields: FormField[] = [
    {
      key: 'title',
      label: 'Título del Trabajo',
      type: 'text',
      required: true,
      placeholder: 'Ej: Ingeniero Civil Senior',
      group: 'basic'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'Se genera automáticamente si se deja vacío',
      description: 'URL amigable para la oferta laboral',
      group: 'basic'
    },
    {
      key: 'category',
      label: 'Departamento',
      type: 'select',
      required: true,
      options: departments.map(dept => ({ value: dept.id, label: dept.name })),
      group: 'basic'
    },
    {
      key: 'department',
      label: 'Nombre del Departamento',
      type: 'text',
      required: true,
      placeholder: 'Debe coincidir con el departamento seleccionado',
      group: 'basic'
    },
    {
      key: 'level',
      label: 'Nivel',
      type: 'select',
      required: true,
      options: [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Intermedio' },
        { value: 'senior', label: 'Senior' },
        { value: 'director', label: 'Director' }
      ],
      defaultValue: 'mid',
      group: 'basic'
    },
    {
      key: 'type',
      label: 'Tipo de Trabajo',
      type: 'select',
      required: true,
      options: [
        { value: 'full-time', label: 'Tiempo completo' },
        { value: 'part-time', label: 'Medio tiempo' },
        { value: 'contract', label: 'Contrato' },
        { value: 'internship', label: 'Prácticas' }
      ],
      defaultValue: 'full-time',
      group: 'basic'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Borrador' },
        { value: 'active', label: 'Activo' },
        { value: 'paused', label: 'Pausado' },
        { value: 'closed', label: 'Cerrado' }
      ],
      defaultValue: 'draft',
      group: 'basic'
    },
    {
      key: 'experience_years',
      label: 'Años de Experiencia',
      type: 'number',
      placeholder: '0',
      validation: { min: 0, max: 30 },
      group: 'basic'
    },
    {
      key: 'featured',
      label: 'Trabajo Destacado',
      type: 'checkbox',
      description: 'Los trabajos destacados aparecen en posiciones prominentes',
      group: 'basic'
    },
    {
      key: 'urgent',
      label: 'Trabajo Urgente',
      type: 'checkbox',
      description: 'Marcado como urgente con indicador visual',
      group: 'basic'
    },
    {
      key: 'short_description',
      label: 'Descripción Corta',
      type: 'textarea',
      required: true,
      placeholder: 'Resumen breve del trabajo...',
      description: 'Aparece en listados y búsquedas',
      group: 'content'
    },
    {
      key: 'full_description',
      label: 'Descripción Completa',
      type: 'markdown',
      placeholder: 'Descripción detallada del trabajo...',
      description: 'Descripción completa con formato markdown',
      group: 'content'
    },
    {
      key: 'key_responsibilities',
      label: 'Responsabilidades Clave',
      type: 'tags',
      placeholder: 'Separar responsabilidades con comas...',
      description: 'Lista de responsabilidades principales',
      group: 'content'
    },
    {
      key: 'requirements',
      label: 'Requisitos Esenciales',
      type: 'tags',
      placeholder: 'Separar requisitos con comas...',
      description: 'Requisitos indispensables para el cargo',
      group: 'requirements'
    },
    {
      key: 'location_city',
      label: 'Ciudad',
      type: 'text',
      required: true,
      placeholder: 'Lima',
      group: 'location'
    },
    {
      key: 'location_region',
      label: 'Región',
      type: 'text',
      placeholder: 'Lima',
      group: 'location'
    },
    {
      key: 'location_country',
      label: 'País',
      type: 'text',
      defaultValue: 'Perú',
      group: 'location'
    },
    {
      key: 'location_address',
      label: 'Dirección',
      type: 'text',
      placeholder: 'Dirección específica...',
      group: 'location'
    },
    {
      key: 'location_remote',
      label: 'Trabajo Remoto',
      type: 'checkbox',
      group: 'location'
    },
    {
      key: 'location_hybrid',
      label: 'Trabajo Híbrido',
      type: 'checkbox',
      group: 'location'
    },
    {
      key: 'salary_min',
      label: 'Salario Mínimo',
      type: 'number',
      placeholder: '0',
      group: 'compensation'
    },
    {
      key: 'salary_max',
      label: 'Salario Máximo',
      type: 'number',
      placeholder: '0',
      group: 'compensation'
    },
    {
      key: 'salary_currency',
      label: 'Moneda',
      type: 'select',
      options: [
        { value: 'PEN', label: 'Soles (PEN)' },
        { value: 'USD', label: 'Dólares (USD)' }
      ],
      defaultValue: 'PEN',
      group: 'compensation'
    },
    {
      key: 'salary_period',
      label: 'Período',
      type: 'select',
      options: [
        { value: 'monthly', label: 'Mensual' },
        { value: 'annual', label: 'Anual' }
      ],
      defaultValue: 'monthly',
      group: 'compensation'
    },
    {
      key: 'salary_negotiable',
      label: 'Salario Negociable',
      type: 'checkbox',
      group: 'compensation'
    },
    {
      key: 'posted_date',
      label: 'Fecha de Publicación',
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
      group: 'dates'
    },
    {
      key: 'deadline',
      label: 'Fecha Límite',
      type: 'date',
      group: 'dates'
    },
    {
      key: 'hiring_manager_name',
      label: 'Nombre del Gerente de Contratación',
      type: 'text',
      placeholder: 'Nombre completo...',
      group: 'contact'
    },
    {
      key: 'hiring_manager_role',
      label: 'Cargo',
      type: 'text',
      placeholder: 'Gerente de RRHH',
      group: 'contact'
    },
    {
      key: 'hiring_manager_email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@metrica-dip.com',
      group: 'contact'
    },
    {
      key: 'tags',
      label: 'Etiquetas',
      type: 'tags',
      placeholder: 'Separar con comas...',
      description: 'Etiquetas para categorización y búsqueda',
      group: 'meta'
    }
  ];

  const formGroups: FormGroup[] = [
    {
      name: 'basic',
      label: 'Información Básica',
      description: 'Datos fundamentales del trabajo'
    },
    {
      name: 'content',
      label: 'Contenido',
      description: 'Descripción y responsabilidades'
    },
    {
      name: 'requirements',
      label: 'Requisitos',
      description: 'Requisitos y calificaciones'
    },
    {
      name: 'location',
      label: 'Ubicación',
      description: 'Información de ubicación y modalidad'
    },
    {
      name: 'compensation',
      label: 'Compensación',
      description: 'Información salarial',
      collapsible: true
    },
    {
      name: 'dates',
      label: 'Fechas',
      description: 'Fechas de publicación y cierre'
    },
    {
      name: 'contact',
      label: 'Contacto',
      description: 'Información del gerente de contratación',
      collapsible: true
    },
    {
      name: 'meta',
      label: 'Metadatos',
      description: 'Configuración adicional y SEO',
      collapsible: true,
      defaultExpanded: false
    }
  ];

  // Transform editing job data for form
  const getFormInitialValues = () => {
    if (!editingJob) return {};
    
    return {
      ...editingJob,
      location_city: editingJob.location?.city || '',
      location_region: editingJob.location?.region || '',
      location_country: editingJob.location?.country || 'Perú',
      location_address: editingJob.location?.address || '',
      location_remote: editingJob.location?.remote || false,
      location_hybrid: editingJob.location?.hybrid || false,
      salary_min: editingJob.salary?.min || 0,
      salary_max: editingJob.salary?.max || 0,
      salary_currency: editingJob.salary?.currency || 'PEN',
      salary_period: editingJob.salary?.period || 'monthly',
      salary_negotiable: editingJob.salary?.negotiable || false,
      hiring_manager_name: editingJob.hiring_manager?.name || '',
      hiring_manager_role: editingJob.hiring_manager?.role || '',
      hiring_manager_email: editingJob.hiring_manager?.email || '',
      requirements: editingJob.requirements?.essential || []
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Trabajos</h1>
        <p className="mt-2 text-gray-600">
          Administra todas las ofertas laborales y oportunidades de carrera.
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={jobs}
        columns={columns}
        actions={actions}
        filters={filterOptions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
        onSortChange={(column, direction) => {
          setSortColumn(column);
          setSortDirection(direction);
        }}
        onFilterChange={setFilters}
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar trabajos..."
        title="Ofertas Laborales"
        subtitle={`${pagination.total} trabajos en total`}
        primaryAction={{
          label: 'Nueva Oferta',
          onClick: handleCreateJob,
          icon: Plus
        }}
        emptyState={
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ofertas laborales</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera oferta laboral.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateJob}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Oferta
              </button>
            </div>
          </div>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
            <DynamicForm
              fields={formFields}
              groups={formGroups}
              initialValues={getFormInitialValues()}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingJob(null);
              }}
              title={editingJob ? 'Editar Oferta Laboral' : 'Nueva Oferta Laboral'}
              subtitle={editingJob ? 'Modifica los datos de la oferta laboral' : 'Crea una nueva oferta laboral'}
              mode={editingJob ? 'edit' : 'create'}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que deseas eliminar la oferta laboral "<strong>{deleteConfirm.title}</strong>"? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteJob(deleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}