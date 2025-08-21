/**
 * Gestión de Proyectos del Portfolio
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  User,
  AlertTriangle
} from 'lucide-react';
import DataTable, { Column, TableAction, FilterOption } from '@/components/admin/DataTable';
import DynamicForm, { FormField, FormGroup } from '@/components/admin/DynamicForm';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  featured_image: string;
  gallery: string[];
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  investment: string;
  area: string;
  tags: string[];
  order: number;
  created_at: string;
  updated_at: string;
  category_info?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  projects_count: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    categories: Category[];
    stats: any;
  };
  message?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, pagination.limit, filters, searchTerm, sortColumn, sortDirection]);

  const fetchProjects = async () => {
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

      const data: ApiResponse = await apiClient.get(`/api/admin/portfolio/projects?${params}`);

      if (data.success) {
        setProjects(data.data.projects);
        setCategories(data.data.categories);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching projects:', data.message);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      const data = await apiClient.delete(`/api/admin/portfolio/projects/${project.id}`);
      
      if (data.success) {
        fetchProjects();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting project:', data.message);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      const url = editingProject 
        ? `/api/admin/portfolio/projects/${editingProject.id}`
        : '/api/admin/portfolio/projects';
      
      const data = editingProject 
        ? await apiClient.put(url, values)
        : await apiClient.post(url, values);
      
      if (data.success) {
        fetchProjects();
        setShowForm(false);
        setEditingProject(null);
      } else {
        throw new Error(data.message || 'Error saving project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  // Table columns
  const columns: Column[] = [
    {
      key: 'featured_image',
      label: 'Imagen',
      width: 'w-20',
      render: (value: string) => (
        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value: string, row: Project) => (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{value}</span>
            {row.featured && <Star className="w-4 h-4 text-yellow-500" />}
          </div>
          <div className="text-sm text-gray-500">/{row.slug}</div>
        </div>
      )
    },
    {
      key: 'category_info',
      label: 'Categoría',
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
      key: 'client',
      label: 'Cliente',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{value || 'No especificado'}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Ubicación',
      render: (value: any) => {
        // Handle both string and object formats
        let locationText = 'No especificada';
        
        if (typeof value === 'string') {
          locationText = value;
        } else if (value && typeof value === 'object') {
          // Handle location object with city, region, etc.
          const parts = [];
          if (value.city) parts.push(value.city);
          if (value.region) parts.push(value.region);
          locationText = parts.length > 0 ? parts.join(', ') : 'No especificada';
        }
        
        return (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm">{locationText}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'active' ? 'Activo' : value === 'inactive' ? 'Inactivo' : 'Borrador'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Creado',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: (project: Project) => window.open(`/portfolio/${project.slug}`, '_blank'),
      variant: 'secondary'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditProject,
      variant: 'primary'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: (project: Project) => setDeleteConfirm(project),
      variant: 'danger'
    }
  ];

  // Filters
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Categoría',
      type: 'select',
      options: categories.map(cat => ({ value: cat.id, label: cat.name }))
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
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
    }
  ];

  // Form fields
  const formFields: FormField[] = [
    {
      key: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Nombre del proyecto...',
      group: 'basic'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'Se genera automáticamente si se deja vacío',
      description: 'URL amigable para el proyecto',
      group: 'basic'
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Descripción del proyecto...',
      group: 'basic'
    },
    {
      key: 'category',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: categories.map(cat => ({ value: cat.id, label: cat.name })),
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
        { value: 'inactive', label: 'Inactivo' }
      ],
      defaultValue: 'draft',
      group: 'basic'
    },
    {
      key: 'featured',
      label: 'Proyecto Destacado',
      type: 'checkbox',
      description: 'Los proyectos destacados aparecen en posiciones prominentes',
      group: 'basic'
    },
    {
      key: 'featured_image',
      label: 'Imagen Principal',
      type: 'url',
      placeholder: 'https://ejemplo.com/imagen.jpg',
      group: 'media'
    },
    {
      key: 'gallery',
      label: 'Galería de Imágenes',
      type: 'tags',
      placeholder: 'URLs de imágenes separadas por comas',
      description: 'Lista de URLs de imágenes para la galería del proyecto',
      group: 'media'
    },
    {
      key: 'client',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Nombre del cliente...',
      group: 'details'
    },
    {
      key: 'location',
      label: 'Ubicación',
      type: 'text',
      placeholder: 'Ciudad, Región...',
      group: 'details'
    },
    {
      key: 'start_date',
      label: 'Fecha de Inicio',
      type: 'date',
      group: 'details'
    },
    {
      key: 'end_date',
      label: 'Fecha de Finalización',
      type: 'date',
      group: 'details'
    },
    {
      key: 'investment',
      label: 'Inversión',
      type: 'text',
      placeholder: 'Ej: $2.5M USD',
      group: 'details'
    },
    {
      key: 'area',
      label: 'Área',
      type: 'text',
      placeholder: 'Ej: 15,000 m²',
      group: 'details'
    },
    {
      key: 'tags',
      label: 'Etiquetas',
      type: 'tags',
      placeholder: 'Separar con comas...',
      description: 'Etiquetas para categorización y búsqueda',
      group: 'meta'
    },
    {
      key: 'order',
      label: 'Orden de Visualización',
      type: 'number',
      placeholder: '0',
      description: 'Menor número = mayor prioridad',
      group: 'meta'
    }
  ];

  const formGroups: FormGroup[] = [
    {
      name: 'basic',
      label: 'Información Básica',
      description: 'Datos fundamentales del proyecto'
    },
    {
      name: 'media',
      label: 'Medios y Recursos',
      description: 'Imágenes y recursos visuales'
    },
    {
      name: 'details',
      label: 'Detalles del Proyecto',
      description: 'Información específica y fechas'
    },
    {
      name: 'meta',
      label: 'Metadatos',
      description: 'Configuración adicional y SEO',
      collapsible: true,
      defaultExpanded: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proyectos del Portfolio</h1>
        <p className="mt-2 text-gray-600">
          Gestiona todos los proyectos que aparecen en el portfolio de la empresa.
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={projects}
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
        searchPlaceholder="Buscar proyectos..."
        title="Proyectos"
        subtitle={`${pagination.total} proyectos en total`}
        primaryAction={{
          label: 'Nuevo Proyecto',
          onClick: handleCreateProject,
          icon: Plus
        }}
        emptyState={
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proyectos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer proyecto del portfolio.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </button>
            </div>
          </div>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <DynamicForm
              fields={formFields}
              groups={formGroups}
              initialValues={editingProject || {}}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              title={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              subtitle={editingProject ? 'Modifica los datos del proyecto' : 'Crea un nuevo proyecto para el portfolio'}
              mode={editingProject ? 'edit' : 'create'}
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
                ¿Estás seguro de que deseas eliminar el proyecto "<strong>{deleteConfirm.title}</strong>"? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteConfirm)}
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