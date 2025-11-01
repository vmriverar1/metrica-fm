/**
 * UnifiedGrid - Componente de grilla genérico para todos los sistemas
 * Maneja listas de elementos con filtros, búsqueda y paginación
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Grid, List, LayoutGrid, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UnifiedCard, { UnifiedCardData } from './UnifiedCard';
import { SystemType } from '@/hooks/useUnifiedData';

export interface UnifiedGridProps {
  data: UnifiedCardData[];
  system: SystemType;
  loading?: boolean;
  error?: string | null;

  // Layout options
  viewMode?: 'grid' | 'list' | 'masonry';
  columns?: 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  cardSize?: 'small' | 'medium' | 'large';

  // Filtering and search
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  categories?: string[];

  // Pagination
  pagination?: boolean;
  itemsPerPage?: number;

  // Callbacks
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onViewModeChange?: (mode: 'grid' | 'list' | 'masonry') => void;

  // Custom styling
  className?: string;
  headerClassName?: string;
  gridClassName?: string;
}

// System-specific configuration
const SYSTEM_CONFIG = {
  newsletter: {
    defaultSort: [
      { field: 'publishedAt', label: 'Fecha de publicación' },
      { field: 'title', label: 'Título' },
      { field: 'readingTime', label: 'Tiempo de lectura' },
      { field: 'views', label: 'Visualizaciones' }
    ],
    filterFields: [
      { field: 'featured', label: 'Destacados', type: 'boolean' },
      { field: 'category', label: 'Categoría', type: 'select' }
    ]
  },
  portfolio: {
    defaultSort: [
      { field: 'year', label: 'Año' },
      { field: 'title', label: 'Título' },
      { field: 'location.city', label: 'Ubicación' },
      { field: 'area', label: 'Área' }
    ],
    filterFields: [
      { field: 'featured', label: 'Destacados', type: 'boolean' },
      { field: 'category', label: 'Tipo', type: 'select' },
      { field: 'year', label: 'Año', type: 'range' }
    ]
  },
  careers: {
    defaultSort: [
      { field: 'postedDate', label: 'Fecha de publicación' },
      { field: 'title', label: 'Título' },
      { field: 'salary.min', label: 'Salario' },
      { field: 'department', label: 'Departamento' }
    ],
    filterFields: [
      { field: 'featured', label: 'Destacados', type: 'boolean' },
      { field: 'urgent', label: 'Urgentes', type: 'boolean' },
      { field: 'remote', label: 'Remoto', type: 'boolean' },
      { field: 'category', label: 'Categoría', type: 'select' },
      { field: 'employmentType', label: 'Tipo', type: 'select' }
    ]
  }
} as const;

export default function UnifiedGrid({
  data,
  system,
  loading = false,
  error = null,
  viewMode = 'grid',
  columns = 3,
  gap = 'medium',
  cardSize = 'medium',
  searchable = true,
  filterable = true,
  sortable = true,
  categories = [],
  pagination = true,
  itemsPerPage = 12,
  onSearch,
  onFilter,
  onSort,
  onViewModeChange,
  className,
  headerClassName,
  gridClassName
}: UnifiedGridProps) {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const config = SYSTEM_CONFIG[system];

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query)) ||
        (item.excerpt?.toLowerCase().includes(query)) ||
        (item.short_description?.toLowerCase().includes(query)) ||
        (item.author?.name.toLowerCase().includes(query)) ||
        (item.location?.city.toLowerCase().includes(query)) ||
        (item.department?.toLowerCase().includes(query))
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filtered = filtered.filter(item => {
          const fieldValue = field.includes('.')
            ? field.split('.').reduce((obj, key) => obj?.[key], item)
            : item[field as keyof UnifiedCardData];

          if (typeof value === 'boolean') {
            return Boolean(fieldValue) === value;
          }
          return fieldValue === value;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = sortField.includes('.')
          ? sortField.split('.').reduce((obj, key) => obj?.[key], a)
          : a[sortField as keyof UnifiedCardData];
        const bValue = sortField.includes('.')
          ? sortField.split('.').reduce((obj, key) => obj?.[key], b)
          : b[sortField as keyof UnifiedCardData];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, activeFilters, sortField, sortOrder]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch?.(query);
  }, [onSearch]);

  const handleFilter = useCallback((field: string, value: any) => {
    const newFilters = { ...activeFilters, [field]: value };
    setActiveFilters(newFilters);
    setCurrentPage(1);
    onFilter?.(newFilters);
  }, [activeFilters, onFilter]);

  const handleSort = useCallback((field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort?.(field, newOrder);
  }, [sortField, sortOrder, onSort]);

  const clearFilter = useCallback((field: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[field];
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  }, [activeFilters, onFilter]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
    onFilter?.({});
    onSearch?.('');
  }, [onFilter, onSearch]);

  // Grid layout classes
  const getGridClasses = () => {
    const baseClasses = {
      grid: cn(
        "grid gap-6",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        gap === 'small' && "gap-4",
        gap === 'medium' && "gap-6",
        gap === 'large' && "gap-8"
      ),
      list: "space-y-4",
      masonry: cn(
        "columns-1 md:columns-2 lg:columns-3 space-y-6",
        gap === 'small' && "gap-4",
        gap === 'medium' && "gap-6",
        gap === 'large' && "gap-8"
      )
    };

    return baseClasses[viewMode];
  };

  // Render active filters
  const renderActiveFilters = () => {
    const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchQuery;

    if (!hasActiveFilters) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Filtros activos:</span>

        {searchQuery && (
          <Badge variant="secondary" className="gap-1">
            Búsqueda: "{searchQuery}"
            <button
              onClick={() => handleSearch('')}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        )}

        {Object.entries(activeFilters).map(([field, value]) => (
          <Badge key={field} variant="secondary" className="gap-1">
            {field}: {String(value)}
            <button
              onClick={() => clearFilter(field)}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground"
        >
          Limpiar todo
        </Button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg" />
          <div className={getGridClasses()}>
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-destructive mb-4">
          <Filter className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error al cargar datos</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className={cn("space-y-4", headerClassName)}>
        {/* Top row: Search and View Mode */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${system}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange?.('masonry')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second row: Filters and Sort */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            {filterable && categories.length > 0 && (
              <Select
                value={activeFilters.category || ''}
                onValueChange={(value) => handleFilter('category', value || null)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.filter(category => category && category.trim()).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Additional Filters */}
            {filterable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {config.filterFields.map((field) => (
                    <DropdownMenuItem
                      key={field.field}
                      onClick={() => {
                        if (field.type === 'boolean') {
                          const currentValue = activeFilters[field.field];
                          handleFilter(field.field, !currentValue);
                        }
                      }}
                    >
                      {field.label}
                      {field.type === 'boolean' && activeFilters[field.field] && (
                        <Badge variant="secondary" className="ml-auto">
                          Activo
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Sort */}
          {sortable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4 mr-2" />
                  ) : (
                    <SortDesc className="w-4 h-4 mr-2" />
                  )}
                  Ordenar
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {config.defaultSort.map((sort) => (
                  <DropdownMenuItem
                    key={sort.field}
                    onClick={() => handleSort(sort.field)}
                  >
                    {sort.label}
                    {sortField === sort.field && (
                      <Badge variant="secondary" className="ml-auto">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Active filters */}
        {renderActiveFilters()}

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredData.length === data.length ? (
            `${data.length} elementos`
          ) : (
            `${filteredData.length} de ${data.length} elementos`
          )}
        </div>
      </div>

      {/* Grid Content */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">No se encontraron resultados</h3>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
          {(searchQuery || Object.keys(activeFilters).length > 0) && (
            <Button variant="outline" onClick={clearAllFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(getGridClasses(), gridClassName)}>
          {paginatedData.map((item, index) => (
            <UnifiedCard
              key={item.id}
              data={item}
              system={system}
              variant={viewMode === 'list' ? 'list' : 'card'}
              size={cardSize}
              priority={index < 3}
              className={viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
            if (page > totalPages) return null;

            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}