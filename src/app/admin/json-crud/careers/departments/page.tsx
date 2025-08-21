'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import DataTable from '@/components/admin/DataTable';
import DynamicForm from '@/components/admin/DynamicForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Users, Briefcase, TrendingUp } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  head: string;
  head_email: string;
  head_avatar: string;
  location: string;
  team_size: number;
  open_positions: number;
  status: 'active' | 'inactive';
  budget: {
    annual: number;
    allocated: number;
    remaining: number;
  };
  metadata: {
    founded_date: string;
    total_hires: number;
    avg_salary: number;
    employee_satisfaction: number;
    turnover_rate: number;
  };
  skills_required: string[];
  benefits: string[];
  working_model: 'remote' | 'hybrid' | 'onsite';
}

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/admin/careers/departments');
      setDepartments(data.data?.departments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || department.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || department.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * 10, currentPage * 10);

  const columns = [
    {
      key: 'name',
      label: 'Departamento',
      render: (department: Department) => (
        <div>
          <div className="font-medium">{department.name}</div>
          <div className="text-sm text-gray-500">{department.location}</div>
        </div>
      )
    },
    {
      key: 'head',
      label: 'Jefe de Área',
      render: (department: Department) => (
        <div className="flex items-center gap-3">
          <img
            src={department.head_avatar || '/default-avatar.png'}
            alt={department.head}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-sm">{department.head}</div>
            <div className="text-xs text-gray-500">{department.head_email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'team_size',
      label: 'Equipo',
      render: (department: Department) => (
        <div className="text-center">
          <div className="font-medium">{department.team_size}</div>
          <div className="text-xs text-gray-500">personas</div>
        </div>
      )
    },
    {
      key: 'open_positions',
      label: 'Vacantes',
      render: (department: Department) => (
        <div className="text-center">
          <Badge variant={department.open_positions > 0 ? 'default' : 'secondary'}>
            {department.open_positions}
          </Badge>
        </div>
      )
    },
    {
      key: 'working_model',
      label: 'Modalidad',
      render: (department: Department) => {
        const modelLabels = {
          remote: 'Remoto',
          hybrid: 'Híbrido',
          onsite: 'Presencial'
        };
        const modelColors = {
          remote: 'bg-green-100 text-green-800',
          hybrid: 'bg-blue-100 text-blue-800',
          onsite: 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge className={modelColors[department.working_model]}>
            {modelLabels[department.working_model]}
          </Badge>
        );
      }
    },
    {
      key: 'metadata.employee_satisfaction',
      label: 'Satisfacción',
      render: (department: Department) => (
        <div className="text-center">
          <div className="font-medium">{department.metadata.employee_satisfaction}%</div>
          <div className="w-12 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${department.metadata.employee_satisfaction}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (department: Department) => (
        <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
          {department.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (department: Department) => {
        setSelectedDepartment(department);
        setIsModalOpen(true);
      },
      variant: 'default' as const
    },
    {
      label: 'Ver Empleos',
      onClick: (department: Department) => {
        window.open(`/admin/json-crud/careers/jobs?department=${department.slug}`, '_blank');
      },
      variant: 'outline' as const
    },
    {
      label: department => department.status === 'active' ? 'Desactivar' : 'Activar',
      onClick: async (department: Department) => {
        try {
          const data = await apiClient.put(`/api/admin/careers/departments/${department.id}`, {
              ...department,
              status: department.status === 'active' ? 'inactive' : 'active'
            });
          await fetchDepartments();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al actualizar');
        }
      },
      variant: 'outline' as const
    },
    {
      label: 'Eliminar',
      onClick: async (department: Department) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este departamento?')) return;
        try {
          const data = await apiClient.delete(`/api/admin/careers/departments/${department.id}`);
          await fetchDepartments();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
      },
      variant: 'destructive' as const,
      confirmMessage: '¿Estás seguro de que quieres eliminar este departamento? Esta acción no se puede deshacer.'
    }
  ];

  const uniqueLocations = [...new Set(departments.map(d => d.location))];

  const filters = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    },
    {
      key: 'location',
      label: 'Ubicación',
      options: [
        { value: 'all', label: 'Todas' },
        ...uniqueLocations.map(location => ({ value: location, label: location }))
      ],
      value: locationFilter,
      onChange: setLocationFilter
    }
  ];

  const formFields = [
    {
      key: 'name',
      label: 'Nombre del Departamento',
      type: 'text' as const,
      required: true,
      validation: { min: 2, max: 100 }
    },
    {
      key: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      required: true,
      placeholder: 'ingenieria-infraestructura',
      validation: { 
        pattern: '^[a-z0-9-]+$',
        custom: (value: string) => {
          if (!/^[a-z0-9-]+$/.test(value)) {
            return 'El slug solo puede contener letras minúsculas, números y guiones';
          }
          return null;
        }
      }
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
      required: true,
      validation: { max: 500 }
    },
    {
      key: 'location',
      label: 'Ubicación',
      type: 'text' as const,
      required: true,
      placeholder: 'Lima, Perú'
    },
    {
      key: 'working_model',
      label: 'Modalidad de Trabajo',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'onsite', label: 'Presencial' },
        { value: 'hybrid', label: 'Híbrido' },
        { value: 'remote', label: 'Remoto' }
      ]
    },
    {
      key: 'head',
      label: 'Jefe de Área',
      type: 'text' as const,
      required: true,
      group: 'Liderazgo'
    },
    {
      key: 'head_email',
      label: 'Email del Jefe',
      type: 'email' as const,
      required: true,
      group: 'Liderazgo'
    },
    {
      key: 'head_avatar',
      label: 'Avatar del Jefe (URL)',
      type: 'url' as const,
      group: 'Liderazgo',
      placeholder: 'https://ejemplo.com/avatar.jpg'
    },
    {
      key: 'team_size',
      label: 'Tamaño del Equipo',
      type: 'number' as const,
      required: true,
      validation: { min: 1, max: 1000 },
      group: 'Equipo'
    },
    {
      key: 'open_positions',
      label: 'Posiciones Abiertas',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 },
      group: 'Equipo'
    },
    {
      key: 'budget.annual',
      label: 'Presupuesto Anual (USD)',
      type: 'number' as const,
      required: true,
      validation: { min: 0 },
      group: 'Presupuesto'
    },
    {
      key: 'budget.allocated',
      label: 'Presupuesto Asignado (USD)',
      type: 'number' as const,
      required: true,
      validation: { min: 0 },
      group: 'Presupuesto'
    },
    {
      key: 'metadata.avg_salary',
      label: 'Salario Promedio (USD)',
      type: 'number' as const,
      required: true,
      validation: { min: 0 },
      group: 'Métricas'
    },
    {
      key: 'metadata.employee_satisfaction',
      label: 'Satisfacción de Empleados (%)',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 },
      group: 'Métricas'
    },
    {
      key: 'metadata.turnover_rate',
      label: 'Tasa de Rotación (%)',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 },
      group: 'Métricas'
    },
    {
      key: 'skills_required',
      label: 'Habilidades Requeridas',
      type: 'tags' as const,
      required: true,
      placeholder: 'Escriba habilidades y presione Enter'
    },
    {
      key: 'benefits',
      label: 'Beneficios del Departamento',
      type: 'tags' as const,
      placeholder: 'Escriba beneficios y presione Enter'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' }
      ]
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      const departmentData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        head: values.head,
        head_email: values.head_email,
        head_avatar: values.head_avatar || '',
        location: values.location,
        team_size: parseInt(values.team_size),
        open_positions: parseInt(values.open_positions),
        status: values.status,
        budget: {
          annual: parseFloat(values['budget.annual']),
          allocated: parseFloat(values['budget.allocated']),
          remaining: parseFloat(values['budget.annual']) - parseFloat(values['budget.allocated'])
        },
        metadata: {
          founded_date: selectedDepartment?.metadata.founded_date || new Date().toISOString(),
          total_hires: selectedDepartment?.metadata.total_hires || 0,
          avg_salary: parseFloat(values['metadata.avg_salary']),
          employee_satisfaction: parseInt(values['metadata.employee_satisfaction']),
          turnover_rate: parseFloat(values['metadata.turnover_rate'])
        },
        skills_required: values.skills_required || [],
        benefits: values.benefits || [],
        working_model: values.working_model
      };

      const url = selectedDepartment
        ? `/api/admin/careers/departments/${selectedDepartment.id}`
        : '/api/admin/careers/departments';
      
      const method = selectedDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar departamento');
      }

      setIsModalOpen(false);
      setSelectedDepartment(null);
      await fetchDepartments();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const getFormValues = (department: Department | null) => {
    if (!department) return {};
    return {
      name: department.name,
      slug: department.slug,
      description: department.description,
      head: department.head,
      head_email: department.head_email,
      head_avatar: department.head_avatar,
      location: department.location,
      team_size: department.team_size,
      open_positions: department.open_positions,
      'budget.annual': department.budget.annual,
      'budget.allocated': department.budget.allocated,
      'metadata.avg_salary': department.metadata.avg_salary,
      'metadata.employee_satisfaction': department.metadata.employee_satisfaction,
      'metadata.turnover_rate': department.metadata.turnover_rate,
      skills_required: department.skills_required,
      benefits: department.benefits,
      working_model: department.working_model,
      status: department.status
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Departamentos</h1>
            <p className="text-gray-600">Administra los departamentos de la empresa</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedDepartment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Departamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Total Departamentos</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{departments.length}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Empleados</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {departments.reduce((sum, dept) => sum + dept.team_size, 0)}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Vacantes Abiertas</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {departments.reduce((sum, dept) => sum + dept.open_positions, 0)}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Satisfacción Promedio</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {departments.length > 0 
              ? Math.round(departments.reduce((sum, dept) => sum + dept.metadata.employee_satisfaction, 0) / departments.length)
              : 0}%
          </div>
        </div>
      </div>

      <DataTable
        data={paginatedDepartments}
        columns={columns}
        actions={actions}
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={{
          current: currentPage,
          total: Math.ceil(filteredDepartments.length / 10),
          pageSize: 10
        }}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            fields={formFields}
            initialValues={getFormValues(selectedDepartment)}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedDepartment(null);
            }}
            submitLabel={selectedDepartment ? 'Actualizar Departamento' : 'Crear Departamento'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsManagement;