/**
 * Componente de tabla de datos con paginación, filtros y ordenamiento
 */

'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  SortAsc,
  SortDesc
} from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableAction {
  label: string;
  icon: any;
  onClick: (row: any) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  show?: (row: any) => boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'text' | 'checkbox';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: TableAction[];
  filters?: FilterOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSearch?: (term: string) => void;
  emptyState?: React.ReactNode;
  title?: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: any;
  };
}

export default function DataTable({
  data,
  columns,
  actions = [],
  filters = [],
  searchable = true,
  searchPlaceholder = 'Buscar...',
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
  onSearch,
  emptyState,
  title,
  subtitle,
  primaryAction
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  const handleSort = (column: string) => {
    if (!onSortChange) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
    }

    setSortColumn(column);
    setSortDirection(direction);
    onSortChange(column, direction);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const getActionVariantClass = (variant: string = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 hover:text-blue-900';
      case 'danger':
        return 'text-red-600 hover:text-red-900';
      default:
        return 'text-gray-600 hover:text-gray-900';
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <SortAsc className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <SortAsc className="w-4 h-4 text-blue-600" />
      : <SortDesc className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      {(title || searchable || filters.length > 0 || primaryAction) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {searchable && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {filters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && filters.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' && (
                    <select
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Todos</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {filter.type === 'text' && (
                    <input
                      type="text"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}

                  {filter.type === 'checkbox' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterValues[filter.key] || false}
                        onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {filter.placeholder || 'Activar filtro'}
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div>
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(data.map(row => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 2 : 0)} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 2 : 0)} className="px-6 py-12 text-center">
                  {emptyState || (
                    <div>
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50">
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, row.id]);
                          } else {
                            setSelectedRows(selectedRows.filter(id => id !== row.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => {
                          if (action.show && !action.show(row)) return null;

                          return (
                            <button
                              key={actionIndex}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Action clicked:', action.label, 'Row:', row);
                                action.onClick(row);
                              }}
                              className={`${getActionVariantClass(action.variant)} hover:bg-gray-100 p-1.5 rounded transition-colors`}
                              title={action.label}
                            >
                              <action.icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              type="button"
              onClick={() => onPageChange && onPageChange((pagination.page || 1) - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange && onPageChange((pagination.page || 1) + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {pagination ? (((pagination.page || 1) - 1) * (pagination.limit || 10)) + 1 : 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {pagination ? Math.min((pagination.page || 1) * (pagination.limit || 10), pagination.total || 0) : data.length}
                </span>{' '}
                de{' '}
                <span className="font-medium">{pagination ? pagination.total || 0 : data.length}</span>{' '}
                resultados
              </p>
              
              {pagination && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Por página:</label>
                  <select
                    value={pagination.limit || 10}
                    onChange={(e) => onLimitChange && onLimitChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md text-sm px-2 py-1"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              )}
            </div>
            
            {pagination && (
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    type="button"
                    onClick={() => onPageChange && onPageChange((pagination.page || 1) - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
                    const pageNum = Math.max(1, (pagination.page || 1) - 2) + i;
                    if (pageNum > (pagination.totalPages || 1)) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => onPageChange && onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === (pagination.page || 1)
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={() => onPageChange && onPageChange((pagination.page || 1) + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}