/**
 * Types and Interfaces for UnifiedMediaLibrary
 * Unified media library component combining best of WordPressMediaLibrary and MediaLibrary
 */

// ========== CORE TYPES ==========

export interface ImageInfo {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  lastModified: string;
  dimensions?: {
    width: number;
    height: number;
  };
  folder?: string;
  source: 'local' | 'firebase';  // Fuente de la imagen
  downloadURL?: string;           // URL de descarga (para Firebase)
}

export type ViewMode = 'grid' | 'list';
export type TabType = 'library' | 'upload';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

// ========== UPLOAD CONFIGURATION ==========

export interface UploadConfiguration {
  // Validation
  checkDuplicates?: boolean;
  autoRename?: boolean;

  // Resize
  enableResize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  jpegQuality?: number; // 0-100

  // WebP Conversion
  enableWebP?: boolean;
  webpQuality?: number; // 0-100
  preservePNG?: boolean;

  // UI
  showProgress?: boolean;
  showPreview?: boolean;
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfiguration = {
  checkDuplicates: true,
  autoRename: false,
  enableResize: false,
  maxWidth: 1920,
  maxHeight: 1080,
  maintainAspectRatio: true,
  jpegQuality: 85,
  enableWebP: false,
  webpQuality: 80,
  preservePNG: true,
  showProgress: true,
  showPreview: false,
};

// ========== COMPONENT PROPS ==========

export interface UnifiedMediaLibraryProps {
  // Required
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: ImageInfo[]) => void;

  // Selection
  multiSelect?: boolean;
  selectedImages?: string[];

  // UI
  title?: string;
  acceptedTypes?: string[];

  // Features
  enableUpload?: boolean;
  enableFolders?: boolean;
  enableStats?: boolean;
  enableListView?: boolean;
  enablePagination?: boolean;

  // Configuration
  uploadConfig?: Partial<UploadConfiguration>;
  defaultView?: ViewMode;
  defaultSort?: {
    by: SortBy;
    order: SortOrder;
  };

  // Pagination
  imagesPerPage?: number;
}

// ========== SUB-COMPONENT PROPS ==========

export interface LibraryTabProps {
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
}

export interface UploadTabProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  acceptedTypes: string[];
}

export interface FilterBarProps {
  // Search
  search: string;
  onSearchChange: (value: string) => void;

  // Folder filter
  folders: string[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  enableFolders: boolean;

  // Type filter
  typeFilter: string;
  onTypeChange: (type: string) => void;
  acceptedTypes: string[];

  // Sort
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;

  // View mode
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  enableListView: boolean;
}

export interface MediaGridProps {
  images: ImageInfo[];
  selected: Set<string>;
  onSelect: (image: ImageInfo) => void;
  onPreview: (image: ImageInfo) => void;
  multiSelect: boolean;
}

export interface MediaListProps {
  images: ImageInfo[];
  selected: Set<string>;
  onSelect: (image: ImageInfo) => void;
  onPreview: (image: ImageInfo) => void;
  multiSelect: boolean;
}

export interface MediaItemProps {
  image: ImageInfo;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  multiSelect: boolean;
}

export interface StatsBarProps {
  totalImages: number;
  totalSize: number;
  selectedCount: number;
  typeBreakdown?: { type: string; count: number }[];
}

export interface PreviewModalProps {
  image: ImageInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

// ========== HOOK RETURN TYPES ==========

export interface UseMediaLibraryReturn {
  images: ImageInfo[];
  loading: boolean;
  error: Error | null;
  fetchImages: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  directories: string[];
}

export interface UseMediaFiltersReturn {
  filteredImages: ImageInfo[];
  search: string;
  setSearch: (value: string) => void;
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  clearFilters: () => void;
}

export interface UseMediaUploadReturn {
  uploadFiles: File[];
  setUploadFiles: (files: File[]) => void;
  uploading: boolean;
  handleUpload: (files?: File[]) => Promise<void>;
  resetUpload: () => void;
}

// ========== STATISTICS ==========

export interface MediaStats {
  total: number;
  totalSize: number;
  types: { type: string; count: number }[];
}

// ========== FILE VALIDATION ==========

export interface FileValidationResult {
  file: File;
  valid: boolean;
  error?: string;
  isDuplicate?: boolean;
  suggestedName?: string;
}

export type DuplicateResolution = 'rename' | 'replace' | 'skip';
