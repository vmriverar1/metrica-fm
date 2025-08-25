/**
 * Gestión de Artículos del Newsletter
 */

'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import {
  PenTool,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Tag,
  FileText,
  ExternalLink
} from 'lucide-react';
import DataTable, { Column, TableAction, FilterOption } from '@/components/admin/DataTable';
import DynamicForm, { FormField, FormGroup } from '@/components/admin/DynamicForm';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_id: string;
  featured_image: string;
  featured_image_alt: string;
  excerpt: string;
  content: string;
  published_date: string;
  reading_time: number;
  featured: boolean;
  tags: string[];
  seo_description: string;
  social_image: string;
  url: string;
  related_articles: string[];
  gallery: any[];
  created_at: string;
  updated_at: string;
  author_info?: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  category_info?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  days_since_published?: number;
  status: 'published' | 'draft';
}

interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  articles_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  articles_count: number;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
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
  const [sortColumn, setSortColumn] = useState('published_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Article | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchArticles();
  }, [pagination.page, pagination.limit, filters, searchTerm, sortColumn, sortDirection]);

  const fetchArticles = async () => {
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

      const data = await apiClient.get(`/api/admin/newsletter/articles?${params}`);

      if (data.success) {
        setArticles(data.data.articles);
        setAuthors(data.data.authors);
        setCategories(data.data.categories);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching articles:', data.message);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDeleteArticle = async (article: Article) => {
    try {
      const data = await apiClient.delete(`/api/admin/newsletter/articles/${article.id}`);if (data.success) {
        fetchArticles();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting article:', data.message);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      const url = editingArticle 
        ? `/api/admin/newsletter/articles/${editingArticle.id}`
        : '/api/admin/newsletter/articles';
      
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchArticles();
        setShowForm(false);
        setEditingArticle(null);
      } else {
        throw new Error(data.message || 'Error saving article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
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
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value: string, row: Article) => (
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{value}</span>
            {row.featured && <Star className="w-4 h-4 text-yellow-500" />}
          </div>
          <div className="text-sm text-gray-500">/{row.slug}</div>
          <div className="text-xs text-gray-400 mt-1">{row.excerpt?.substring(0, 60)}...</div>
        </div>
      )
    },
    {
      key: 'author_info',
      label: 'Autor',
      render: (value: any) => value ? (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
            {value.avatar ? (
              <img src={value.avatar} alt={value.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value.name}</div>
            <div className="text-xs text-gray-500">{value.role}</div>
          </div>
        </div>
      ) : null
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
      key: 'status',
      label: 'Estado',
      render: (value: string, row: Article) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'published' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'published' ? 'Publicado' : 'Borrador'}
        </span>
      )
    },
    {
      key: 'reading_time',
      label: 'Lectura',
      render: (value: number) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{value || 0} min</span>
        </div>
      )
    },
    {
      key: 'published_date',
      label: 'Publicación',
      sortable: true,
      render: (value: string, row: Article) => {
        if (!value) {
          return <span className="text-gray-400">Sin publicar</span>;
        }
        
        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
              {row.days_since_published !== undefined && (
                <div className="text-xs text-gray-500">
                  {row.days_since_published === 0 ? 'Hoy' : 
                   row.days_since_published === 1 ? 'Ayer' :
                   `Hace ${row.days_since_published} días`}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'tags',
      label: 'Etiquetas',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {value?.length > 2 && (
            <span className="text-xs text-gray-500">+{value.length - 2}</span>
          )}
        </div>
      )
    }
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: (article: Article) => window.open(`/blog/${article.slug}`, '_blank'),
      variant: 'secondary',
      show: (article: Article) => !!article.published_date
    },
    {
      label: 'Vista previa',
      icon: ExternalLink,
      onClick: (article: Article) => window.open(`/admin/preview/article/${article.id}`, '_blank'),
      variant: 'secondary',
      show: (article: Article) => !article.published_date
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditArticle,
      variant: 'primary'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: (article: Article) => setDeleteConfirm(article),
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
      key: 'author_id',
      label: 'Autor',
      type: 'select',
      options: authors.map(author => ({ value: author.id, label: author.name }))
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
      key: 'published',
      label: 'Estado de publicación',
      type: 'select',
      options: [
        { value: 'true', label: 'Publicado' },
        { value: 'false', label: 'Borrador' }
      ]
    }
  ];

  // Form fields
  const formFields: FormField[] = [
    {
      key: 'title',
      label: 'Título del Artículo',
      type: 'text',
      required: true,
      placeholder: 'Título del artículo...',
      group: 'basic'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'Se genera automáticamente si se deja vacío',
      description: 'URL amigable para el artículo',
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
      key: 'author_id',
      label: 'Autor',
      type: 'select',
      required: true,
      options: authors.map(author => ({ value: author.id, label: author.name })),
      group: 'basic'
    },
    {
      key: 'featured',
      label: 'Artículo Destacado',
      type: 'checkbox',
      description: 'Los artículos destacados aparecen en posiciones prominentes',
      group: 'basic'
    },
    {
      key: 'excerpt',
      label: 'Extracto',
      type: 'textarea',
      required: true,
      placeholder: 'Resumen del artículo que aparecerá en listados...',
      description: 'Resumen breve del artículo (máximo 160 caracteres recomendado)',
      validation: { max: 200 },
      group: 'content'
    },
    {
      key: 'content',
      label: 'Contenido',
      type: 'markdown',
      required: true,
      placeholder: 'Escribe el contenido del artículo en Markdown...',
      description: 'Contenido completo del artículo en formato Markdown',
      group: 'content'
    },
    {
      key: 'featured_image',
      label: 'Imagen Principal',
      type: 'url',
      placeholder: 'https://ejemplo.com/imagen.jpg',
      description: 'URL de la imagen principal del artículo',
      group: 'media'
    },
    {
      key: 'featured_image_alt',
      label: 'Texto Alternativo de la Imagen',
      type: 'text',
      placeholder: 'Descripción de la imagen...',
      description: 'Texto alternativo para accesibilidad',
      group: 'media'
    },
    {
      key: 'social_image',
      label: 'Imagen para Redes Sociales',
      type: 'url',
      placeholder: 'https://ejemplo.com/imagen-social.jpg',
      description: 'Imagen que aparecerá al compartir en redes sociales',
      group: 'media'
    },
    {
      key: 'published_date',
      label: 'Fecha de Publicación',
      type: 'datetime-local',
      description: 'Deja vacío para guardar como borrador',
      group: 'publishing'
    },
    {
      key: 'reading_time',
      label: 'Tiempo de Lectura (minutos)',
      type: 'number',
      placeholder: '0',
      description: 'Se calcula automáticamente si se deja vacío',
      validation: { min: 0, max: 60 },
      group: 'publishing'
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
      key: 'seo_description',
      label: 'Meta Descripción (SEO)',
      type: 'textarea',
      placeholder: 'Descripción para motores de búsqueda...',
      description: 'Descripción que aparecerá en los resultados de búsqueda (máximo 160 caracteres)',
      validation: { max: 160 },
      group: 'meta'
    },
    {
      key: 'related_articles',
      label: 'Artículos Relacionados',
      type: 'tags',
      placeholder: 'IDs de artículos separados por comas...',
      description: 'IDs de otros artículos relacionados',
      group: 'meta'
    }
  ];

  const formGroups: FormGroup[] = [
    {
      name: 'basic',
      label: 'Información Básica',
      description: 'Datos fundamentales del artículo'
    },
    {
      name: 'content',
      label: 'Contenido',
      description: 'Extracto y contenido principal del artículo'
    },
    {
      name: 'media',
      label: 'Medios',
      description: 'Imágenes y recursos visuales'
    },
    {
      name: 'publishing',
      label: 'Publicación',
      description: 'Configuración de publicación y fechas'
    },
    {
      name: 'meta',
      label: 'Metadatos',
      description: 'SEO y configuración adicional',
      collapsible: true,
      defaultExpanded: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Artículos</h1>
        <p className="mt-2 text-gray-600">
          Administra todos los artículos del blog y newsletter de la empresa.
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={articles}
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
        searchPlaceholder="Buscar artículos..."
        title="Artículos del Newsletter"
        subtitle={`${pagination.total} artículos en total`}
        primaryAction={{
          label: 'Nuevo Artículo',
          onClick: handleCreateArticle,
          icon: Plus
        }}
        emptyState={
          <div className="text-center py-12">
            <PenTool className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay artículos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer artículo del newsletter.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateArticle}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Artículo
              </button>
            </div>
          </div>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={() => setShowForm(false)}
        >
          <div 
            className="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-screen overflow-y-auto">
              <DynamicForm
                fields={formFields}
                groups={formGroups}
                initialValues={editingArticle || {}}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingArticle(null);
                }}
                title={editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
                subtitle={editingArticle ? 'Modifica los datos del artículo' : 'Crea un nuevo artículo para el newsletter'}
                mode={editingArticle ? 'edit' : 'create'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que deseas eliminar el artículo "<strong>{deleteConfirm.title}</strong>"? 
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
                  onClick={() => handleDeleteArticle(deleteConfirm)}
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