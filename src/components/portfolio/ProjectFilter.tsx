'use client';

import React, { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ProjectCategory, 
  getCategoryLabel
} from '@/types/portfolio';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { cn } from '@/lib/utils';

interface ProjectFilterProps {
  className?: string;
}

export default function ProjectFilter({ className }: ProjectFilterProps) {
  const { 
    filters, 
    setFilters, 
    projectCount, 
    uniqueLocations, 
    uniqueYears 
  } = usePortfolio();
  
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm);

  const handleCategoryChange = useCallback((category: ProjectCategory | 'all') => {
    setFilters({
      ...filters,
      category
    });
  }, [filters, setFilters]);

  const handleLocationChange = useCallback((location: string) => {
    setFilters({
      ...filters,
      location
    });
  }, [filters, setFilters]);

  const handleYearChange = useCallback((year: string) => {
    setFilters({
      ...filters,
      year: year === 'all' ? 'all' : parseInt(year)
    });
  }, [filters, setFilters]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        searchTerm: term
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      category: 'all',
      location: 'all',
      year: 'all',
      searchTerm: ''
    });
  }, [setFilters]);

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.location !== 'all' || 
                          filters.year !== 'all' || 
                          filters.searchTerm !== '';

  return (
    <div className={cn("bg-background/95 backdrop-blur-sm border-b border-border sticky top-20 z-40", className)}>
      <div className="container mx-auto px-4 py-6">
        {/* Encabezado de filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Explorar Proyectos</h2>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all duration-300",
              "bg-primary/10 text-primary",
              projectCount > 0 && "animate-pulse"
            )}>
              {projectCount} {projectCount === 1 ? 'proyecto' : 'proyectos'}
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-fit"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Ubicación */}
          <Select value={filters.location} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Todas las ubicaciones" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Año */}
          <Select value={filters.year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Todos los años" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {uniqueYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Espacio para futuras opciones */}
          <div className="hidden lg:block" />
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          {/* Botón "Todos" */}
          <Button
            variant={filters.category === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('all')}
            className={cn(
              "transition-all duration-300",
              filters.category === 'all' && "bg-primary text-primary-foreground"
            )}
          >
            Todos
          </Button>

          {/* Botones por categoría */}
          {Object.values(ProjectCategory).map((category) => {
            const isActive = filters.category === category;
            const categoryColors = {
              [ProjectCategory.OFICINA]: 'blue',
              [ProjectCategory.RETAIL]: 'orange', 
              [ProjectCategory.INDUSTRIA]: 'gray',
              [ProjectCategory.HOTELERIA]: 'purple',
              [ProjectCategory.EDUCACION]: 'green',
              [ProjectCategory.VIVIENDA]: 'yellow',
              [ProjectCategory.SALUD]: 'red'
            };
            
            const color = categoryColors[category];
            
            return (
              <Button
                key={category}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "transition-all duration-300 border-2",
                  isActive ? (
                    `bg-${color}-500 text-white border-${color}-500 hover:bg-${color}-600`
                  ) : (
                    `border-${color}-200 hover:bg-${color}-50 hover:border-${color}-300`
                  )
                )}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  `bg-${color}-500`
                )} />
                {getCategoryLabel(category)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}