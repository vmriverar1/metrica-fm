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
import { Plus, Building2, Users, Briefcase, TrendingUp, Edit, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailed_description: string;
  icon: string;
  color: string;
  open_positions: number;
  total_employees: number;
  featured: boolean;
  required_skills: string[];
  positions: string[];
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
      render: (department: Department) => department ? (
        <div>
          <div className="font-medium">{department.name || 'Sin nombre'}</div>
          <div className="text-sm text-gray-500">{department.slug || 'Sin slug'}</div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Sin datos</div>
      )
    },
    {
      key: 'icon',
      label: 'Icono',
      render: (department: Department) => department ? (
        <div className="text-center">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: department.color || '#666666' }}
          >
            {department.icon?.charAt(0) || '?'}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Sin datos</div>
      )
    },
    {
      key: 'total_employees',
      label: 'Empleados',
      render: (department: Department) => department ? (
        <div className="text-center">
          <div className="font-medium">{department.total_employees || 0}</div>
          <div className="text-xs text-gray-500">personas</div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Sin datos</div>
      )
    },
    {
      key: 'open_positions',
      label: 'Vacantes',
      render: (department: Department) => department ? (
        <div className="text-center">
          <Badge variant={(department.open_positions || 0) > 0 ? 'default' : 'secondary'}>
            {department.open_positions || 0}
          </Badge>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Sin datos</div>
      )
    },
    {
      key: 'featured',
      label: 'Destacado',
      render: (department: Department) => department ? (
        <Badge variant={department.featured ? 'default' : 'secondary'}>
          {department.featured ? 'Sí' : 'No'}
        </Badge>
      ) : (
        <div className="text-sm text-gray-500">Sin datos</div>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (department: Department) => {
        setSelectedDepartment(department);
        setIsModalOpen(true);
      },
      variant: 'default' as const
    },
    {
      label: 'Ver Empleos',
      icon: Eye,
      onClick: (department: Department) => {
        window.open(`/admin/json-crud/careers/jobs?department=${department.slug}`, '_blank');
      },
      variant: 'outline' as const
    },
    {
      label: department => department.status === 'active' ? 'Desactivar' : 'Activar',
      icon: department => department.status === 'active' ? ToggleLeft : ToggleRight,
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
      icon: Trash2,
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
      key: 'featured',
      label: 'Destacados',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'featured', label: 'Solo destacados' },
        { value: 'not-featured', label: 'No destacados' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
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
      placeholder: 'gestion-direccion',
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
      label: 'Descripción Corta',
      type: 'textarea' as const,
      required: true,
      validation: { max: 200 },
      placeholder: 'Descripción breve del departamento para vistas de lista'
    },
    {
      key: 'detailed_description',
      label: 'Descripción Detallada',
      type: 'textarea' as const,
      required: true,
      validation: { max: 1000 },
      placeholder: 'Descripción completa del departamento para la página de carreras'
    },
    {
      key: 'icon',
      label: 'Icono',
      type: 'text' as const,
      required: true,
      placeholder: 'Users',
      validation: { max: 50 }
    },
    {
      key: 'color',
      label: 'Color (Hex)',
      type: 'text' as const,
      required: true,
      placeholder: '#007bc4',
      validation: { 
        pattern: '^#[0-9A-Fa-f]{6}$',
        custom: (value: string) => {
          if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            return 'El color debe ser un código hex válido (ej: #007bc4)';
          }
          return null;
        }
      }
    },
    {
      key: 'open_positions',
      label: 'Vacantes Abiertas',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 100 }
    },
    {
      key: 'total_employees',
      label: 'Total de Empleados',
      type: 'number' as const,
      required: true,
      validation: { min: 1, max: 1000 }
    },
    {
      key: 'featured',
      label: 'Departamento Destacado',
      type: 'checkbox' as const,
      description: 'Los departamentos destacados aparecen en posiciones prominentes'
    },
    {
      key: 'required_skills',
      label: 'Habilidades Requeridas',
      type: 'tags' as const,
      required: true,
      placeholder: 'Escriba habilidades y presione Enter',
      description: 'Lista de habilidades principales requeridas en este departamento'
    },
    {
      key: 'positions',
      label: 'Posiciones Disponibles',
      type: 'tags' as const,
      required: true,
      placeholder: 'Escriba posiciones y presione Enter',
      description: 'Lista de posiciones específicas en el departamento'
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      const departmentData = {
        id: selectedDepartment?.id || `dept-${Date.now()}`,
        name: values.name,
        slug: values.slug,
        description: values.description,
        detailed_description: values.detailed_description,
        icon: values.icon,
        color: values.color,
        open_positions: parseInt(values.open_positions),
        total_employees: parseInt(values.total_employees),
        featured: Boolean(values.featured),
        required_skills: values.required_skills || [],
        positions: values.positions || []
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
      detailed_description: department.detailed_description,
      icon: department.icon,
      color: department.color,
      open_positions: department.open_positions,
      total_employees: department.total_employees,
      featured: department.featured,
      required_skills: department.required_skills,
      positions: department.positions
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
            {departments.reduce((sum, dept) => sum + (Number(dept.total_employees) || 0), 0)}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Vacantes Abiertas</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {departments.reduce((sum, dept) => sum + (Number(dept.open_positions) || 0), 0)}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Departamentos Destacados</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {departments.filter(dept => dept.featured).length}
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