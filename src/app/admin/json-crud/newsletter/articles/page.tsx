/**
 * Gestión de Artículos del Newsletter
 */

'use client';

import { useState, useEffect } from 'react';
import { useArticulos, useAutores, useCategorias } from '@/hooks/useNewsletterAdmin';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ArticuloConRelaciones } from '@/types/newsletter';
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

// Usar tipo de Firestore
type Article = ArticuloConRelaciones;

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
  const router = useRouter();

  // Usar hooks de Firestore
  const articulosHook = useArticulos();
  const autoresHook = useAutores();
  const categoriasHook = useCategorias();

  // Mapear datos de Firestore a formato esperado
  const articles = articulosHook.articulos;

  // Debug: verificar que los artículos tienen ID
  console.log('Articles loaded:', articles.length, 'articles');
  console.log('First article:', articles[0]);
  const authors: Author[] = autoresHook.autores.map(autor => ({
    id: autor.id,
    name: autor.name,
    role: autor.role,
    bio: autor.bio,
    avatar: autor.avatar,
    articles_count: autor.articles_count || 0
  }));
  const categories: Category[] = categoriasHook.categorias.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
    articles_count: cat.articles_count || 0
  }));

  const loading = articulosHook.loading || autoresHook.loading || categoriasHook.loading;
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
  
  const [deleteConfirm, setDeleteConfirm] = useState<Article | null>(null);

  // Actualizar paginación cuando cambien los datos
  useEffect(() => {
    const total = articles.length;
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
      hasNextPage: prev.page < totalPages,
      hasPrevPage: prev.page > 1
    }));
  }, [articles.length, pagination.limit, pagination.page]);

  const handleCreateArticle = () => {
    router.push('/admin/json-crud/newsletter/articles/new');
  };

  const handleEditArticle = (article: Article) => {
    console.log('handleEditArticle called with:', article);
    console.log('Article ID:', article.id);
    router.push(`/admin/json-crud/newsletter/articles/new?id=${article.id}`);
  };

  const handleDeleteArticle = async (article: Article) => {
    try {
      const response = await articulosHook.remove(article.id);
      if (response.exito) {
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting article:', response.mensaje);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };


  // Table columns - Solo título y acciones
  const columns: Column[] = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value: string, row: Article) => (
        <div className="py-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
              {row.featured_image ? (
                <img src={row.featured_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 truncate">{value}</span>
                {row.featured && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  row.status === 'published' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {row.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">/{row.slug}</div>
              {row.excerpt && (
                <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {row.excerpt.length > 100 ? `${row.excerpt.substring(0, 100)}...` : row.excerpt}
                </div>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {row.autor && (
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {row.autor.name}
                  </span>
                )}
                {row.categoria && (
                  <span className="flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {row.categoria.name}
                  </span>
                )}
                {row.published_date && (
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {row.published_date.toDate ? row.published_date.toDate().toLocaleDateString() : 'Sin fecha'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Table actions - Editar como primera acción siempre visible
  const actions: TableAction[] = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEditArticle,
      variant: 'primary'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: (article: Article) => {
        console.log('Delete action clicked for article:', article.title, article.id);
        setDeleteConfirm(article);
      },
      variant: 'danger'
    },
    {
      label: 'Ver',
      icon: Eye,
      onClick: (article: Article) => window.open(`/blog/${article.slug}`, '_blank'),
      variant: 'secondary',
      show: (article: Article) => article.status === 'published' && !!article.published_date
    },
    {
      label: 'Vista previa',
      icon: ExternalLink,
      onClick: (article: Article) => window.open(`/admin/preview/article/${article.id}`, '_blank'),
      variant: 'secondary',
      show: (article: Article) => article.status === 'draft' || !article.published_date
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