/**
 * LibraryTab Component
 * Main library view with filters, grid/list views, and pagination
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FilterBar } from './FilterBar';
import { MediaGrid } from './MediaGrid';
import { MediaList } from './MediaList';
import type { ImageInfo, ViewMode, SortBy, SortOrder } from '../types';

interface LibraryTabProps {
  images: ImageInfo[];
  filteredImages: ImageInfo[];
  selected: Set<string>;
  onSelect: (image: ImageInfo) => void;
  onPreview: (image: ImageInfo) => void;
  viewMode: ViewMode;
  enablePagination: boolean;
  imagesPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  multiSelect: boolean;
  loading: boolean;

  // Filter props
  search: string;
  onSearchChange: (value: string) => void;
  folders: string[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  enableFolders: boolean;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  acceptedTypes: string[];
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
  viewModeValue: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  enableListView: boolean;
  totalPages: number;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  images,
  filteredImages,
  selected,
  onSelect,
  onPreview,
  viewMode,
  enablePagination,
  currentPage,
  onPageChange,
  multiSelect,
  loading,

  // Filter props
  search,
  onSearchChange,
  folders,
  currentFolder,
  onFolderChange,
  enableFolders,
  typeFilter,
  onTypeChange,
  acceptedTypes,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  viewModeValue,
  onViewModeChange,
  enableListView,
  totalPages,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        folders={folders}
        currentFolder={currentFolder}
        onFolderChange={onFolderChange}
        enableFolders={enableFolders}
        typeFilter={typeFilter}
        onTypeChange={onTypeChange}
        acceptedTypes={acceptedTypes}
        sortBy={sortBy}
        onSortChange={onSortChange}
        sortOrder={sortOrder}
        onSortOrderToggle={onSortOrderToggle}
        viewMode={viewModeValue}
        onViewModeChange={onViewModeChange}
        enableListView={enableListView}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Media View (Grid or List) */}
          <div className="flex-1 overflow-auto">
            {viewMode === 'grid' ? (
              <MediaGrid
                images={filteredImages}
                selected={selected}
                onSelect={onSelect}
                onPreview={onPreview}
                multiSelect={multiSelect}
              />
            ) : (
              <MediaList
                images={filteredImages}
                selected={selected}
                onSelect={onSelect}
                onPreview={onPreview}
                multiSelect={multiSelect}
              />
            )}
          </div>

          {/* Pagination */}
          {enablePagination && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
