'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Image,
  Video,
  FileText,
  Music,
  Archive,
  Eye,
  Edit,
  Copy,
  Share2,
  Tag,
  Calendar,
  User,
  HardDrive,
  Cloud,
  FolderOpen,
  Plus,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Maximize,
  Download as DownloadIcon,
  ExternalLink
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Interfaces principales
export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  folder: string;
  tags: string[];
  description?: string;
  alt?: string;
  title?: string;
  uploadedBy: string;
  uploadedAt: string;
  modifiedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos/audio
  metadata: Record<string, any>;
  isPublic: boolean;
  usageCount: number;
  usedIn: string[];
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  createdAt: string;
  fileCount: number;
  totalSize: number;
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
}

export interface MediaUploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: MediaFile;
}

export interface MediaLibraryConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadPath: string;
  enableThumbnails: boolean;
  enablePreview: boolean;
  compressionEnabled: boolean;
  watermarkEnabled: boolean;
  autoTagging: boolean;
  cdnEnabled: boolean;
  storageProvider: 'local' | 'aws' | 'cloudinary' | 'custom';
  quotaLimit: number;
  quotaUsed: number;
}

interface MediaLibraryManagerProps {
  files: MediaFile[];
  folders: MediaFolder[];
  config: MediaLibraryConfig;
  currentFolder?: string;
  selectionMode?: 'single' | 'multiple';
  selectedFiles?: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  onFoldersChange: (folders: MediaFolder[]) => void;
  onSelectionChange?: (files: MediaFile[]) => void;
  onFileSelect?: (file: MediaFile) => void;
  onUpload?: (files: File[]) => Promise<MediaFile[]>;
  onDelete?: (files: MediaFile[]) => Promise<void>;
  onMove?: (files: MediaFile[], targetFolder: string) => Promise<void>;
  readOnly?: boolean;
  showUploader?: boolean;
  showFolders?: boolean;
  compactMode?: boolean;
}

const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({
  files,
  folders,
  config,
  currentFolder = '',
  selectionMode = 'multiple',
  selectedFiles = [],
  onFilesChange,
  onFoldersChange,
  onSelectionChange,
  onFileSelect,
  onUpload,
  onDelete,
  onMove,
  readOnly = false,
  showUploader = true,
  showFolders = true,
  compactMode = false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>(currentFolder);
  const [selectedItems, setSelectedItems] = useState<MediaFile[]>(selectedFiles);
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [bulkActions, setBulkActions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Filtros y búsqueda
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesFolder = filterFolder === '' || file.folder === filterFolder;
    return matchesSearch && matchesType && matchesFolder;
  }).sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'date':
      default:
        aValue = new Date(a.uploadedAt).getTime();
        bValue = new Date(b.uploadedAt).getTime();
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Handlers principales
  const handleFileSelection = useCallback((file: MediaFile, isCtrlClick = false) => {
    let newSelection: MediaFile[];
    
    if (selectionMode === 'single') {
      newSelection = [file];
      if (onFileSelect) {
        onFileSelect(file);
      }
    } else {
      if (isCtrlClick) {
        newSelection = selectedItems.includes(file)
          ? selectedItems.filter(f => f.id !== file.id)
          : [...selectedItems, file];
      } else {
        newSelection = [file];
      }
    }
    
    setSelectedItems(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [selectedItems, selectionMode, onFileSelect, onSelectionChange]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!onUpload || readOnly) return;
    
    const uploads: MediaUploadProgress[] = files.map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setUploadProgress(uploads);
    
    try {
      // Simular progreso de upload
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        upload.status = 'uploading';
        setUploadProgress([...uploads]);
        
        // Simular progreso
        for (let progress = 0; progress <= 100; progress += 10) {
          upload.progress = progress;
          setUploadProgress([...uploads]);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        upload.status = 'processing';
        setUploadProgress([...uploads]);
      }
      
      const uploadedFiles = await onUpload(files);
      
      // Marcar como completado
      uploads.forEach((upload, index) => {
        upload.status = 'completed';
        upload.result = uploadedFiles[index];
      });
      
      setUploadProgress([...uploads]);
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
      
    } catch (error) {
      uploads.forEach(upload => {
        upload.status = 'error';
        upload.error = error instanceof Error ? error.message : 'Error de subida';
      });
      setUploadProgress([...uploads]);
    }
  }, [onUpload, readOnly]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = useCallback(async (filesToDelete: MediaFile[]) => {
    if (!onDelete || readOnly) return;
    
    try {
      await onDelete(filesToDelete);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  }, [onDelete, readOnly]);

  const getFileIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'archive':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getUsagePercentage = () => {
    return (config.quotaUsed / config.quotaLimit) * 100;
  };

  // Render file card
  const renderFileCard = (file: MediaFile, index: number) => {
    const isSelected = selectedItems.includes(file);
    
    return (
      <Draggable key={file.id} draggableId={file.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              relative group cursor-pointer transition-all duration-200
              ${viewMode === 'grid' 
                ? 'aspect-square rounded-lg border-2 hover:border-blue-300' 
                : 'flex items-center p-3 rounded-lg border hover:border-blue-300'
              }
              ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
              ${snapshot.isDragging ? 'rotate-3 scale-105 shadow-lg' : 'hover:shadow-md'}
            `}
            onClick={(e) => handleFileSelection(file, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => setPreviewFile(file)}
          >
            {viewMode === 'grid' ? (
              <div className="h-full flex flex-col">
                {/* Thumbnail */}
                <div className="flex-1 flex items-center justify-center p-4">
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.alt || file.name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>
                
                {/* File info */}
                <div className="p-2 border-t bg-gray-50">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.dimensions && (
                    <p className="text-xs text-gray-400">
                      {file.dimensions.width} × {file.dimensions.height}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 mr-4">
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.alt || file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {file.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{file.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-blue-500 bg-white rounded-full" />
              </div>
            )}
            
            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(file);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFile(file);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Copy URL to clipboard
                    navigator.clipboard.writeText(file.url);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-sm text-gray-600">
            {filteredFiles.length} archivos • {formatFileSize(config.quotaUsed)} de {formatFileSize(config.quotaLimit)} usado
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          
          {showUploader && !readOnly && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(Array.from(e.target.files));
                  }
                }}
                accept={config.allowedTypes.join(',')}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivos
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subiendo Archivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadProgress.map((upload) => (
              <div key={upload.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{upload.file.name}</span>
                  <div className="flex items-center gap-2">
                    {upload.status === 'uploading' && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                    {upload.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {upload.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={upload.progress} className="h-2" />
                {upload.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{upload.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Storage Usage */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uso de Almacenamiento</span>
            <span className="text-sm text-gray-500">
              {Math.round(getUsagePercentage())}%
            </span>
          </div>
          <Progress value={getUsagePercentage()} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(config.quotaUsed)} de {formatFileSize(config.quotaLimit)} usado
          </p>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="image">Imágenes</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documentos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="archive">Archivos</SelectItem>
              </SelectContent>
            </Select>
            
            {showFolders && (
              <Select value={filterFolder} onValueChange={setFilterFolder}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todas las carpetas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las carpetas</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="size">Tamaño</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedItems.length} archivo(s) seleccionado(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Download selected files
                    selectedItems.forEach(file => {
                      window.open(file.url, '_blank');
                    });
                  }}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBulkActions(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedItems)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Grid/List */}
      <div
        ref={dropzoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative min-h-64 rounded-lg border-2 border-dashed transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-blue-700">
                Suelta los archivos aquí
              </p>
            </div>
          </div>
        )}
        
        {filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay archivos disponibles</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Intenta cambiar los filtros de búsqueda
                </p>
              )}
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="media-files">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    p-4
                    ${viewMode === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' 
                      : 'space-y-2'
                    }
                  `}
                >
                  {filteredFiles.map((file, index) => renderFileCard(file, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(previewFile.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewFile(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              {previewFile.type === 'image' ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.alt || previewFile.name}
                  className="max-w-full h-auto rounded"
                />
              ) : previewFile.type === 'video' ? (
                <video 
                  src={previewFile.url} 
                  controls 
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(previewFile)}
                  </div>
                  <p className="text-gray-600">Vista previa no disponible</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.open(previewFile.url, '_blank')}
                  >
                    Abrir Archivo
                  </Button>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Tamaño:</span>
                  <p>{formatFileSize(previewFile.size)}</p>
                </div>
                <div>
                  <span className="font-medium">Tipo:</span>
                  <p>{previewFile.type}</p>
                </div>
                <div>
                  <span className="font-medium">Subido:</span>
                  <p>{new Date(previewFile.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Usado en:</span>
                  <p>{previewFile.usageCount} lugares</p>
                </div>
              </div>
              {previewFile.tags.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewFile.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Media Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tamaño máximo de archivo</Label>
                <p className="text-sm text-gray-500">{formatFileSize(config.maxFileSize)}</p>
              </div>
              <div>
                <Label>Proveedor de almacenamiento</Label>
                <p className="text-sm text-gray-500 capitalize">{config.storageProvider}</p>
              </div>
              <div>
                <Label>Tipos permitidos</Label>
                <p className="text-sm text-gray-500">{config.allowedTypes.length} tipos</p>
              </div>
              <div>
                <Label>CDN habilitado</Label>
                <Switch checked={config.cdnEnabled} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaLibraryManager;