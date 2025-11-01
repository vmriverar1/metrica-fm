/**
 * UnifiedMediaLibrary - Unified media library component
 * Combines best features from WordPressMediaLibrary and MediaLibrary
 *
 * Features:
 * - Modal dialog with tabs (Library/Upload)
 * - Advanced filtering (search, folder, type, sort)
 * - Grid and List views
 * - Pagination
 * - Upload with drag & drop
 * - Duplicate validation
 * - Image resize and WebP conversion
 * - Statistics
 * - Preview modal
 * - Multi-select support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Upload as UploadIcon, ImageIcon } from 'lucide-react';

// Types
import type {
  UnifiedMediaLibraryProps,
  ImageInfo,
  ViewMode,
  TabType,
  UploadConfiguration,
} from './types';

// Constants
import { DEFAULT_UPLOAD_CONFIG } from './types';

// Hooks
import { useMediaLibrary } from './hooks/useMediaLibrary';
import { useMediaFilters } from './hooks/useMediaFilters';
import { useMediaUpload } from './hooks/useMediaUpload';

// Sub-components
import { LibraryTab } from './components/LibraryTab';
import { UploadTab } from './components/UploadTab';
import { PreviewModal } from './components/PreviewModal';

const UnifiedMediaLibrary: React.FC<UnifiedMediaLibraryProps> = ({
  // Required props
  isOpen,
  onClose,
  onSelect,

  // Selection props
  multiSelect = false,
  selectedImages = [],

  // UI props
  title = 'Biblioteca de Medios',
  acceptedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],

  // Feature flags
  enableUpload = true,
  enableFolders = true,
  enableStats = true,
  enableListView = true,
  enablePagination = true,

  // Configuration
  uploadConfig,
  defaultView = 'grid',
  defaultSort = { by: 'date', order: 'desc' },

  // Pagination
  imagesPerPage = 30,
}) => {
  // ========== STATE ==========

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedImages));

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<ImageInfo | null>(null);

  // ========== HOOKS ==========

  // Main library hook
  const {
    images,
    loading,
    error,
    fetchImages,
    refreshLibrary,
    directories,
  } = useMediaLibrary();

  // Filters hook
  const {
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
  } = useMediaFilters(images, {
    defaultSort: defaultSort.by,
    defaultOrder: defaultSort.order,
    acceptedTypes,
  });

  // Upload hook
  const {
    uploadFiles,
    setUploadFiles,
    uploading,
    handleUpload,
    resetUpload,
  } = useMediaUpload({
    config: {
      ...DEFAULT_UPLOAD_CONFIG,
      ...uploadConfig,
    },
    onSuccess: async () => {
      await refreshLibrary();
      setActiveTab('library');
      resetUpload();
    },
  });

  // ========== EFFECTS ==========

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelected(new Set(selectedImages));
      setCurrentPage(1);
      setActiveTab('library');
    }
  }, [isOpen, selectedImages]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (search !== '') {
      setCurrentPage(1);
    }
  }, [search]);

  // ========== HANDLERS ==========

  const handleImageSelect = (image: ImageInfo) => {
    if (!multiSelect) {
      setSelected(new Set([image.id]));
    } else {
      const newSelected = new Set(selected);
      if (selected.has(image.id)) {
        newSelected.delete(image.id);
      } else {
        newSelected.add(image.id);
      }
      setSelected(newSelected);
    }
  };

  const handleConfirmSelection = () => {
    const selectedImages = images.filter(img => selected.has(img.id));
    onSelect(selectedImages);
    onClose();
  };

  const handlePreview = (image: ImageInfo) => {
    setPreviewImage(image);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // ========== PAGINATION ==========

  const totalImages = filteredImages.length;
  const totalPages = enablePagination ? Math.ceil(totalImages / imagesPerPage) : 1;
  const startIndex = enablePagination ? (currentPage - 1) * imagesPerPage : 0;
  const endIndex = enablePagination ? startIndex + imagesPerPage : filteredImages.length;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  // ========== RENDER ==========

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ImageIcon className="h-6 w-6" />
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="flex flex-col flex-1 overflow-hidden px-6"
          >
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Biblioteca de medios
              </TabsTrigger>
              {enableUpload && (
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Subir archivos
                </TabsTrigger>
              )}
            </TabsList>

            {/* Library Tab */}
            <TabsContent
              value="library"
              className="flex flex-col mt-4 overflow-hidden data-[state=active]:flex"
            >
              <LibraryTab
                images={images}
                filteredImages={paginatedImages}
                selected={selected}
                onSelect={handleImageSelect}
                onPreview={handlePreview}
                viewMode={viewMode}
                enablePagination={enablePagination}
                imagesPerPage={imagesPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                multiSelect={multiSelect}
                loading={loading}
                // Filter props
                search={search}
                onSearchChange={setSearch}
                folders={directories}
                currentFolder={currentFolder}
                onFolderChange={setCurrentFolder}
                enableFolders={enableFolders}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                acceptedTypes={acceptedTypes}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderToggle={toggleSortOrder}
                viewModeValue={viewMode}
                onViewModeChange={setViewMode}
                enableListView={enableListView}
                totalPages={totalPages}
              />
            </TabsContent>

            {/* Upload Tab */}
            {enableUpload && (
              <TabsContent
                value="upload"
                className="flex flex-col mt-4 overflow-hidden data-[state=active]:flex"
              >
                <UploadTab
                  onUpload={handleUpload}
                  uploading={uploading}
                  acceptedTypes={acceptedTypes}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Footer */}
          <DialogFooter className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selected.size > 0 && (
                <span>{selected.size} {selected.size === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selected.size === 0}
              >
                {multiSelect ? 'Insertar imágenes' : 'Insertar imagen'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        image={previewImage}
        isOpen={!!previewImage}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default UnifiedMediaLibrary;
export type { UnifiedMediaLibraryProps, ImageInfo };
