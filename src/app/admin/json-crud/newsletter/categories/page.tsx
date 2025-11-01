'use client';

import { useState, useEffect } from 'react';
import { useCategorias } from '@/hooks/useNewsletterAdmin';
import { useRouter } from 'next/navigation';
import type { Categoria } from '@/types/newsletter';
import DataTable from '@/components/admin/DataTable';
import DynamicForm from '@/components/admin/DynamicForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, FileText, Palette, TrendingUp } from 'lucide-react';

// Usar tipo de Firestore
type Category = Categoria & {
  order: number;
  status: 'active' | 'inactive';
  metadata: {
    total_views: number;
    avg_reading_time: number;
    featured_articles: number;
    last_article_date: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
};

const CategoriesManagement = () => {
  // Usar hook de Firestore
  const {
    categorias,
    loading,
    error: firestoreError,
    create,
    update,
    remove
  } = useCategorias();

  // Mapear datos de Firestore al formato esperado por el componente
  const categories: Category[] = categorias.map((categoria, index) => ({
    ...categoria,
    order: index + 1,
    status: categoria.featured ? 'active' : 'inactive',
    metadata: {
      total_views: 0,
      avg_reading_time: 0,
      featured_articles: 0,
      last_article_date: ''
    },
    seo: {
      meta_title: '',
      meta_description: categoria.description,
      keywords: []
    }
  }));

  const [error, setError] = useState<string | null>(firestoreError);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sincronizar error de Firestore con error local
  useEffect(() => {
    setError(firestoreError);
  }, [firestoreError]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedCategories = filteredCategories.slice((currentPage - 1) * 10, currentPage * 10);

  const columns = [
    {
      key: 'color',
      label: '',
      render: (category: Category) => (
        <div
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: category.color }}
        />
      )
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="text-lg">{category.icon}</div>
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-gray-500">/{category.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (category: Category) => (
        <div className="max-w-xs truncate text-sm text-gray-600">
          {category.description}
        </div>
      )
    },
    {
      key: 'article_count',
      label: 'Artículos',
      render: (category: Category) => (
        <div className="text-center">
          <div className="font-medium">{category.article_count}</div>
          <div className="text-xs text-gray-500">{category.metadata.featured_articles} destacados</div>
        </div>
      )
    },
    {
      key: 'metadata.total_views',
      label: 'Vistas Totales',
      render: (category: Category) => (
        <div className="text-right font-mono text-sm">
          {category.metadata.total_views.toLocaleString()}
        </div>
      )
    },
    {
      key: 'order',
      label: 'Orden',
      render: (category: Category) => (
        <Badge variant="outline">{category.order}</Badge>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (category: Category) => (
        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
          {category.status === 'active' ? 'Activa' : 'Inactiva'}
        </Badge>
      )
    }
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
      },
      variant: 'default' as const
    },
    {
      label: 'Ver Artículos',
      onClick: (category: Category) => {
        window.open(`/admin/json-crud/newsletter/articles?category=${category.slug}`, '_blank');
      },
      variant: 'outline' as const
    },
    {
      label: 'Subir',
      onClick: async (category: Category) => {
        const newOrder = Math.max(1, category.order - 1);
        await updateCategoryOrder(category.id, newOrder);
      },
      variant: 'outline' as const,
      disabled: (category: Category) => category.order === 1
    },
    {
      label: 'Bajar',
      onClick: async (category: Category) => {
        const maxOrder = Math.max(...categories.map(c => c.order));
        const newOrder = Math.min(maxOrder, category.order + 1);
        await updateCategoryOrder(category.id, newOrder);
      },
      variant: 'outline' as const,
      disabled: (category: Category) => category.order === Math.max(...categories.map(c => c.order))
    },
    {
      label: category => category.status === 'active' ? 'Desactivar' : 'Activar',
      onClick: async (category: Category) => {
        try {
          const newStatus = category.status === 'active' ? 'inactive' : 'active';
          const response = await update(category.id, {
            featured: newStatus === 'active'
          });
          if (!response.exito) {
            setError(response.mensaje || 'Error al actualizar');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al actualizar');
        }
      },
      variant: 'outline' as const
    },
    {
      label: 'Eliminar',
      onClick: async (category: Category) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
        try {
          const response = await remove(category.id);
          if (!response.exito) {
            setError(response.mensaje || 'Error al eliminar');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
      },
      variant: 'destructive' as const,
      confirmMessage: '¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.'
    }
  ];

  const updateCategoryOrder = async (categoryId: string, newOrder: number) => {
    try {
      const response = await update(categoryId, { order: newOrder });
      if (!response.exito) {
        setError(response.mensaje || 'Error al actualizar orden');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar orden');
    }
  };

  const filters = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'active', label: 'Activas' },
        { value: 'inactive', label: 'Inactivas' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ];

  const formFields = [
    {
      key: 'name',
      label: 'Nombre de la Categoría',
      type: 'text' as const,
      required: true,
      validation: { min: 2, max: 50 }
    },
    {
      key: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      required: true,
      placeholder: 'tecnologia-innovacion',
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
      validation: { max: 200 }
    },
    {
      key: 'color',
      label: 'Color de la Categoría',
      type: 'text' as const,
      required: true,
      placeholder: '#3B82F6',
      validation: {
        pattern: '^#[0-9A-Fa-f]{6}$',
        custom: (value: string) => {
          if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            return 'Ingrese un color hexadecimal válido (ej: #3B82F6)';
          }
          return null;
        }
      }
    },
    {
      key: 'icon',
      label: 'Icono (Emoji)',
      type: 'text' as const,
      required: true,
      placeholder: '🚀',
      validation: { max: 2 }
    },
    {
      key: 'order',
      label: 'Orden de Visualización',
      type: 'number' as const,
      required: true,
      validation: { min: 1, max: 100 }
    },
    {
      key: 'seo.meta_title',
      label: 'Título SEO',
      type: 'text' as const,
      group: 'SEO',
      validation: { max: 60 },
      placeholder: 'Título optimizado para motores de búsqueda'
    },
    {
      key: 'seo.meta_description',
      label: 'Descripción SEO',
      type: 'textarea' as const,
      group: 'SEO',
      validation: { max: 160 },
      placeholder: 'Descripción optimizada para motores de búsqueda'
    },
    {
      key: 'seo.keywords',
      label: 'Palabras Clave',
      type: 'tags' as const,
      group: 'SEO',
      placeholder: 'Escriba palabras clave y presione Enter'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Activa' },
        { value: 'inactive', label: 'Inactiva' }
      ]
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      const categoryData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        color: values.color,
        icon: values.icon,
        featured: values.status === 'active'
      };

      let response;
      if (selectedCategory) {
        response = await update(selectedCategory.id, categoryData);
      } else {
        response = await create(categoryData);
      }

      if (response.exito) {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setError(null);
      } else {
        setError(response.mensaje || 'Error al guardar categoría');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const getFormValues = (category: Category | null) => {
    if (!category) return { order: categories.length + 1 };
    return {
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      order: category.order,
      'seo.meta_title': category.seo.meta_title,
      'seo.meta_description': category.seo.meta_description,
      'seo.keywords': category.seo.keywords,
      status: category.status
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
          <Tag className="h-6 w-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
            <p className="text-gray-600">Administra las categorías del newsletter</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Categorías</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{categories.length}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Activas</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {categories.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Total Artículos</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {categories.reduce((sum, cat) => sum + cat.article_count, 0)}
          </div>
        </div>
        <div className="bg-cyan-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-800">Total Vistas</span>
          </div>
          <div className="text-2xl font-bold text-cyan-900">
            {categories.reduce((sum, cat) => sum + cat.metadata.total_views, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <DataTable
        data={paginatedCategories}
        columns={columns}
        actions={actions}
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={{
          current: currentPage,
          total: Math.ceil(filteredCategories.length / 10),
          pageSize: 10
        }}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            fields={formFields}
            initialValues={getFormValues(selectedCategory)}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
            }}
            submitLabel={selectedCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;