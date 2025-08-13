'use client';

import React, { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Grid3X3, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ProjectCategory, 
  getCategoryLabel
} from '@/types/portfolio';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { cn } from '@/lib/utils';
import SmartFilters from './SmartFilters';
import { Sparkles } from 'lucide-react';

interface ProjectFilterProps {
  className?: string;
  viewOptions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function ProjectFilter({ className, viewOptions, activeView, onViewChange }: ProjectFilterProps) {
  const { 
    filters, 
    setFilters, 
    projectCount, 
    uniqueLocations, 
    uniqueYears 
  } = usePortfolio();
  
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <div className={cn("bg-background/95 backdrop-blur-sm", className)}>
      <div className="py-4">
        {/* Filtros básicos */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Fila superior: Búsqueda y botones */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros avanzados
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Filtros avanzados (colapsables) */}
        {showAdvanced && (
          <div className="space-y-6 pt-8 mt-6 border-t border-border">
            {/* Filtros Inteligentes - Solo el input */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Filtros Inteligentes
              </h4>
              <div className="relative">
                <div className="relative rounded-xl border-2 border-border transition-all">
                  <div className="flex items-center gap-3 p-4">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Buscar proyectos, categorías, ubicaciones..."
                      className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros Adicionales - Botones + Dropdowns */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filtros Adicionales
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                {/* Botones de SmartFilters */}
                <SmartFilters showOnlyButtons={true} />

                {/* Ubicación Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {filters.location === 'all' ? 'Ubicación' : filters.location}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleLocationChange('all')}
                      className={cn(
                        "cursor-pointer",
                        filters.location === 'all' && "bg-primary/10"
                      )}
                    >
                      Todas las ubicaciones
                    </DropdownMenuItem>
                    {uniqueLocations.map((location) => (
                      <DropdownMenuItem
                        key={location}
                        onClick={() => handleLocationChange(location)}
                        className={cn(
                          "cursor-pointer",
                          filters.location === location && "bg-primary/10"
                        )}
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Año Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {filters.year === 'all' ? 'Año' : filters.year}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-36">
                    <DropdownMenuItem
                      onClick={() => handleYearChange('all')}
                      className={cn(
                        "cursor-pointer",
                        filters.year === 'all' && "bg-primary/10"
                      )}
                    >
                      Todos los años
                    </DropdownMenuItem>
                    {uniqueYears.map((year) => (
                      <DropdownMenuItem
                        key={year}
                        onClick={() => handleYearChange(year.toString())}
                        className={cn(
                          "cursor-pointer",
                          filters.year === year && "bg-primary/10"
                        )}
                      >
                        {year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Modo de Vista */}
                {viewOptions && activeView && onViewChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        {viewOptions.find(option => option.id === activeView)?.icon}
                        {viewOptions.find(option => option.id === activeView)?.label}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {viewOptions.map(option => (
                        <DropdownMenuItem
                          key={option.id}
                          onClick={() => onViewChange(option.id)}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            activeView === option.id && "bg-primary/10"
                          )}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}