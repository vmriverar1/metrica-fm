/**
 * FilterBar Component
 * Filter controls for media library (search, folder, type, sort, view)
 */

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Search,
  SortAsc,
  SortDesc,
  Grid3x3,
  List,
} from 'lucide-react';
import type { FilterBarProps } from '../types';

export const FilterBar: React.FC<FilterBarProps> = ({
  // Search
  search,
  onSearchChange,

  // Folder
  folders,
  currentFolder,
  onFolderChange,
  enableFolders,

  // Type
  typeFilter,
  onTypeChange,
  acceptedTypes,

  // Sort
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,

  // View
  viewMode,
  onViewModeChange,
  enableListView,
}) => {
  return (
    <div className="flex items-center gap-3 border-b pb-2 px-4 pt-2 flex-wrap flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 min-w-[250px]">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar imágenes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Folder Filter */}
      {enableFolders && folders.length > 0 && (
        <Select value={currentFolder} onValueChange={onFolderChange}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Carpetas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📁 Todas</SelectItem>
            {folders.map(folder => (
              <SelectItem key={folder} value={folder}>
                📁 {folder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Type Filter */}
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-28 h-9">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {acceptedTypes.map(type => (
            <SelectItem key={type} value={type}>
              {type.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-32 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nombre</SelectItem>
          <SelectItem value="date">Fecha</SelectItem>
          <SelectItem value="size">Tamaño</SelectItem>
          <SelectItem value="type">Tipo</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order */}
      <Button
        variant="outline"
        size="icon"
        onClick={onSortOrderToggle}
        title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
        className="h-9 w-9"
      >
        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
      </Button>

      {/* View Mode Toggle */}
      {enableListView && (
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8 w-8 p-0"
            title="Vista Grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 w-8 p-0"
            title="Vista Lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
