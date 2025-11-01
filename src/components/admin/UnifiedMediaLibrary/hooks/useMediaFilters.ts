/**
 * useMediaFilters Hook
 * Manages filtering, searching, and sorting of media items
 */

import { useState, useMemo, useCallback } from 'react';
import type { ImageInfo, SortBy, SortOrder, UseMediaFiltersReturn } from '../types';

interface UseMediaFiltersOptions {
  defaultSort?: SortBy;
  defaultOrder?: SortOrder;
  acceptedTypes?: string[];
}

export function useMediaFilters(
  images: ImageInfo[],
  options: UseMediaFiltersOptions = {}
): UseMediaFiltersReturn {
  const {
    defaultSort = 'date',
    defaultOrder = 'desc',
    acceptedTypes = [],
  } = options;

  // Filter states
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>(defaultSort);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setCurrentFolder('all');
    setTypeFilter('all');
    setSortBy(defaultSort);
    setSortOrder(defaultOrder);
  }, [defaultSort, defaultOrder]);

  // Compute filtered images
  const filteredImages = useMemo(() => {
    let result = [...images];

    // 1. Filter by accepted types (if specified)
    if (acceptedTypes.length > 0) {
      result = result.filter(img =>
        acceptedTypes.includes(img.type.toLowerCase())
      );
    }

    // 2. Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(img =>
        img.name.toLowerCase().includes(searchLower) ||
        img.path.toLowerCase().includes(searchLower)
      );
    }

    // 3. Filter by folder
    if (currentFolder !== 'all') {
      result = result.filter(img => img.folder === currentFolder);
    }

    // 4. Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(img => img.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // 5. Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;

        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;

        case 'size':
          comparison = a.size - b.size;
          break;

        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;

        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [images, search, currentFolder, typeFilter, sortBy, sortOrder, acceptedTypes]);

  return {
    filteredImages,
    search,
    setSearch,
    currentFolder,
    setCurrentFolder,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    clearFilters,
  };
}
