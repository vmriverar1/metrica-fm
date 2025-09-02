'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  MousePointer,
  Link,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export interface FilterState {
  searchTerm: string;
  type: 'all' | 'megamenu' | 'simple';
  enabled: 'all' | 'enabled' | 'disabled';
  sortBy: 'order' | 'label' | 'clicks' | 'updated';
  sortDirection: 'asc' | 'desc';
  dateRange?: DateRange;
  minClicks: number;
  hasSublinks: 'all' | 'with' | 'without';
  hasImages: 'all' | 'with' | 'without';
}

interface MegaMenuFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalItems: number;
  filteredItems: number;
  onClearFilters: () => void;
  showAdvanced?: boolean;
  onToggleAdvanced: () => void;
}

const MegaMenuFilters: React.FC<MegaMenuFiltersProps> = ({
  filters,
  onFiltersChange,
  totalItems,
  filteredItems,
  onClearFilters,
  showAdvanced = false,
  onToggleAdvanced
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.searchTerm && filters.searchTerm.length > 0,
    filters.type !== 'all',
    filters.enabled !== 'all',
    filters.minClicks > 0,
    filters.hasSublinks !== 'all',
    filters.hasImages !== 'all',
    filters.dateRange?.from || filters.dateRange?.to
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Primera fila - Búsqueda y filtros básicos */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar menús por nombre, descripción o enlaces..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10 pr-10"
              />
              {filters.searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('searchTerm', '')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Tipo de menú */}
          <Select value={filters.type} onValueChange={(value: any) => updateFilter('type', value)}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Tipo de menú" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="megamenu">MegaMenu</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>

          {/* Estado */}
          <Select value={filters.enabled} onValueChange={(value: any) => updateFilter('enabled', value)}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="enabled">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Activos
                </div>
              </SelectItem>
              <SelectItem value="disabled">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  Inactivos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Ordenamiento */}
          <div className="flex gap-2">
            <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Orden</SelectItem>
                <SelectItem value="label">Nombre</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="updated">Actualizado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {filters.sortDirection === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filtros avanzados (colapsibles) */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rango de fechas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango de fechas</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(date) => updateFilter('dateRange', date)}
                  placeholder="Seleccionar fechas"
                />
              </div>

              {/* Mínimo de clicks */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Mínimo clicks
                </label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minClicks}
                  onChange={(e) => updateFilter('minClicks', Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                />
              </div>

              {/* Con sublinks */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Sublinks
                </label>
                <Select value={filters.hasSublinks} onValueChange={(value: any) => updateFilter('hasSublinks', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con sublinks</SelectItem>
                    <SelectItem value="without">Sin sublinks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Con imágenes */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Imágenes
                </label>
                <Select value={filters.hasImages} onValueChange={(value: any) => updateFilter('hasImages', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with">Con imágenes</SelectItem>
                    <SelectItem value="without">Sin imágenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Barra de estado y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
          {/* Estado de filtros */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Mostrando {filteredItems} de {totalItems} menús
            </span>
            
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-xs h-6"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdvanced}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-2" />
              {showAdvanced ? 'Ocultar' : 'Avanzado'}
              {activeFiltersCount > 2 && (
                <Badge variant="destructive" className="ml-2 text-xs h-4">
                  {activeFiltersCount - 2}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filtros activos (tags) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Búsqueda: "{filters.searchTerm}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('searchTerm', '')}
                  className="h-3 w-3 p-0 ml-1"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.type !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Tipo: {filters.type === 'megamenu' ? 'MegaMenu' : 'Simple'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('type', 'all')}
                  className="h-3 w-3 p-0 ml-1"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.enabled !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Estado: {filters.enabled === 'enabled' ? 'Activos' : 'Inactivos'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('enabled', 'all')}
                  className="h-3 w-3 p-0 ml-1"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.minClicks > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                Min clicks: {filters.minClicks}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('minClicks', 0)}
                  className="h-3 w-3 p-0 ml-1"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegaMenuFilters;