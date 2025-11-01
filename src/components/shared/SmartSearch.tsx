'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar,
  User,
  Tag,
  MapPin,
  Briefcase,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SmartSearchProps<T> {
  items: T[];
  onFiltered: (filtered: T[]) => void;
  searchFields: (keyof T)[];
  type: 'blog' | 'careers';
  placeholder?: string;
  showAdvancedFilters?: boolean;
  className?: string;
}

interface FilterState {
  searchQuery: string;
  categories: string[];
  tags: string[];
  dateRange: [Date | null, Date | null];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  featured?: boolean;
  urgent?: boolean;
  remote?: boolean;
  salaryRange?: [number, number];
  location?: string;
  level?: string;
}

export default function SmartSearch<T extends Record<string, any>>({
  items,
  onFiltered,
  searchFields,
  type,
  placeholder = "Buscar...",
  showAdvancedFilters = true,
  className
}: SmartSearchProps<T>) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    tags: [],
    dateRange: [null, null],
    sortBy: type === 'blog' ? 'publishedAt' : 'postedAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const tags = new Set<string>();
    const locations = new Set<string>();
    const levels = new Set<string>();
    let salaryMin = Infinity;
    let salaryMax = 0;

    items.forEach(item => {
      // Categories
      if (item.category) categories.add(item.category);
      
      // Tags
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => tags.add(tag));
      }
      
      // Locations (for careers)
      if (item.location) {
        if (typeof item.location === 'string') {
          locations.add(item.location);
        } else if (item.location.city) {
          locations.add(item.location.city);
        }
      }
      
      // Levels (for careers)
      if (item.level) levels.add(item.level);
      
      // Salary range (for careers)
      if (item.salary) {
        if (item.salary.min < salaryMin) salaryMin = item.salary.min;
        if (item.salary.max > salaryMax) salaryMax = item.salary.max;
      }
    });

    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
      locations: Array.from(locations).sort(),
      levels: Array.from(levels).sort(),
      salaryRange: salaryMin !== Infinity ? [salaryMin, salaryMax] : [0, 20000]
    };
  }, [items]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`metrica-recent-searches-${type}`);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [type]);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem(`metrica-recent-searches-${type}`, JSON.stringify(updated));
    }
  };

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (Array.isArray(value)) {
            return value.some(v => 
              typeof v === 'string' && v.toLowerCase().includes(query)
            );
          }
          return false;
        })
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => 
        filters.categories.includes(item.category)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags && filters.tags.some(tag => item.tags.includes(tag))
      );
    }

    // Featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(item => !!item.featured === filters.featured);
    }

    // Urgent filter (careers)
    if (filters.urgent !== undefined && type === 'careers') {
      filtered = filtered.filter(item => !!item.urgent === filters.urgent);
    }

    // Remote filter (careers)
    if (filters.remote !== undefined && type === 'careers') {
      filtered = filtered.filter(item => {
        if (typeof item.location === 'object' && item.location.remote !== undefined) {
          return !!item.location.remote === filters.remote;
        }
        return filters.remote ? item.remote : !item.remote;
      });
    }

    // Location filter (careers)
    if (filters.location && type === 'careers') {
      filtered = filtered.filter(item => {
        if (typeof item.location === 'string') {
          return item.location === filters.location;
        }
        return item.location?.city === filters.location;
      });
    }

    // Level filter (careers)
    if (filters.level && type === 'careers') {
      filtered = filtered.filter(item => item.level === filters.level);
    }

    // Salary range filter (careers)
    if (filters.salaryRange && type === 'careers') {
      filtered = filtered.filter(item => {
        if (!item.salary) return false;
        const avgSalary = (item.salary.min + item.salary.max) / 2;
        return avgSalary >= filters.salaryRange![0] && avgSalary <= filters.salaryRange![1];
      });
    }

    // Date range filter
    if (filters.dateRange[0] || filters.dateRange[1]) {
      filtered = filtered.filter(item => {
        const date = type === 'blog' ? item.publishedAt : item.postedAt;
        if (!date) return false;
        
        const itemDate = new Date(date);
        if (filters.dateRange[0] && itemDate < filters.dateRange[0]) return false;
        if (filters.dateRange[1] && itemDate > filters.dateRange[1]) return false;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return filters.sortOrder === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filters.sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [items, filters, searchFields, type]);

  // Update parent component when filtered items change
  useEffect(() => {
    onFiltered(filteredItems);
  }, [filteredItems, onFiltered]);

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleSearchSubmit = () => {
    saveRecentSearch(filters.searchQuery);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      tags: [],
      dateRange: [null, null],
      sortBy: type === 'blog' ? 'publishedAt' : 'postedAt',
      sortOrder: 'desc'
    });
  };

  const getSortOptions = () => {
    if (type === 'blog') {
      return [
        { value: 'publishedAt', label: 'Fecha de publicación' },
        { value: 'title', label: 'Título' },
        { value: 'readingTime', label: 'Tiempo de lectura' }
      ];
    } else {
      return [
        { value: 'postedAt', label: 'Fecha de publicación' },
        { value: 'title', label: 'Título' },
        { value: 'salary', label: 'Salario' },
        { value: 'deadline', label: 'Fecha límite' }
      ];
    }
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.tags.length + 
    (filters.featured ? 1 : 0) + 
    (filters.urgent ? 1 : 0) + 
    (filters.remote !== undefined ? 1 : 0) + 
    (filters.location ? 1 : 0) + 
    (filters.level ? 1 : 0) + 
    (filters.salaryRange ? 1 : 0) + 
    (filters.dateRange[0] || filters.dateRange[1] ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {filters.searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSearchChange('')}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          {showAdvancedFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-6 px-2 text-xs",
                activeFiltersCount > 0 && "bg-primary text-primary-foreground"
              )}
            >
              <Filter className="w-3 h-3 mr-1" />
              {activeFiltersCount > 0 && activeFiltersCount}
            </Button>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !filters.searchQuery && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Búsquedas recientes:</span>
          {recentSearches.map((search, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleSearchChange(search)}
            >
              {search}
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filtros Avanzados</h3>
              {activeFiltersCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  Limpiar ({activeFiltersCount})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categorías</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filterOptions.categories.map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            categories: checked
                              ? [...prev.categories, category]
                              : prev.categories.filter(c => c !== category)
                          }));
                        }}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Etiquetas</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filterOptions.tags.slice(0, 10).map(tag => (
                    <label key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            tags: checked
                              ? [...prev.tags, tag]
                              : prev.tags.filter(t => t !== tag)
                          }));
                        }}
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getSortOptions().filter(option => option.value && option.value.trim()).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                  >
                    {filters.sortOrder === 'asc' ? 
                      <SortAsc className="w-4 h-4" /> : 
                      <SortDesc className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>

              {/* Career-specific filters */}
              {type === 'careers' && (
                <>
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ubicación</label>
                    <Select
                      value={filters.location || ''}
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        location: value || undefined 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las ubicaciones</SelectItem>
                        {filterOptions.locations.filter(location => location && location.trim()).map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nivel</label>
                    <Select
                      value={filters.level || ''}
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        level: value || undefined 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los niveles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        {filterOptions.levels.filter(level => level && level.trim()).map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  {filterOptions.salaryRange[1] > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Rango Salarial: S/ {filters.salaryRange?.[0] || filterOptions.salaryRange[0]} - S/ {filters.salaryRange?.[1] || filterOptions.salaryRange[1]}
                      </label>
                      <Slider
                        value={filters.salaryRange || filterOptions.salaryRange}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          salaryRange: value as [number, number] 
                        }))}
                        min={filterOptions.salaryRange[0]}
                        max={filterOptions.salaryRange[1]}
                        step={100}
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground mr-2">Filtros rápidos:</span>
              
              <Button
                size="sm"
                variant={filters.featured ? "default" : "outline"}
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  featured: prev.featured ? undefined : true 
                }))}
                className="h-7 text-xs"
              >
                <Star className="w-3 h-3 mr-1" />
                Destacados
              </Button>

              {type === 'careers' && (
                <>
                  <Button
                    size="sm"
                    variant={filters.urgent ? "destructive" : "outline"}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      urgent: prev.urgent ? undefined : true 
                    }))}
                    className="h-7 text-xs"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Urgentes
                  </Button>

                  <Button
                    size="sm"
                    variant={filters.remote ? "default" : "outline"}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      remote: prev.remote ? undefined : true 
                    }))}
                    className="h-7 text-xs"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Remoto
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} 
          {filters.searchQuery && ` para "${filters.searchQuery}"`}
        </span>
        
        {activeFiltersCount > 0 && (
          <span>
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}