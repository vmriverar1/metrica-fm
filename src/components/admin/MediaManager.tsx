'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image, 
  FileText, 
  Video, 
  Music, 
  File, 
  X, 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Download, 
  Trash2, 
  Eye, 
  Link as LinkIcon,
  FolderOpen,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  category: string;
  uploadedAt: string;
  dimensions?: { width: number; height: number };
  optimized?: boolean;
  thumbnail?: string;
}

interface MediaManagerProps {
  onSelect?: (url: string) => void;
  onMultiSelect?: (urls: string[]) => void;
  allowUpload?: boolean;
  allowExternal?: boolean;
  filters?: ('images' | 'videos' | 'audio' | 'documents')[];
  categories?: string[];
  optimization?: boolean;
  multiple?: boolean;
  maxFileSize?: number; // MB
  acceptedTypes?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({
  onSelect,
  onMultiSelect,
  allowUpload = true,
  allowExternal = true,
  filters = ['images', 'videos', 'documents'],
  categories = ['hero', 'services', 'portfolio', 'pillars', 'policies', 'general'],
  optimization = true,
  multiple = false,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  isOpen = true,
  onClose
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [externalUrl, setExternalUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample media items for demo
  React.useEffect(() => {
    setMediaItems([
      {
        id: '1',
        name: 'hero-background.jpg',
        url: '/images/hero-bg.jpg',
        type: 'image',
        size: 2.5 * 1024 * 1024,
        category: 'hero',
        uploadedAt: '2024-01-15T10:30:00Z',
        dimensions: { width: 1920, height: 1080 },
        optimized: true,
        thumbnail: '/images/hero-bg-thumb.jpg'
      },
      {
        id: '2',
        name: 'service-dip.png',
        url: '/images/service-dip.png',
        type: 'image',
        size: 1.8 * 1024 * 1024,
        category: 'services',
        uploadedAt: '2024-01-14T15:45:00Z',
        dimensions: { width: 800, height: 600 },
        optimized: true
      },
      {
        id: '3',
        name: 'portfolio-project-1.jpg',
        url: '/images/project-1.jpg',
        type: 'image',
        size: 3.2 * 1024 * 1024,
        category: 'portfolio',
        uploadedAt: '2024-01-13T09:15:00Z',
        dimensions: { width: 1200, height: 800 },
        optimized: false
      }
    ]);
  }, []);

  // File type icons
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter media items
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesFilter = filters.includes(item.type as any) || filters.includes(`${item.type}s` as any);
    
    return matchesSearch && matchesCategory && matchesType && matchesFilter;
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!allowUpload || files.length === 0) return;

    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`El archivo ${file.name} excede el tamaño máximo de ${maxFileSize}MB`);
        continue;
      }

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create media item
      const newItem: MediaItem = {
        id: Date.now().toString() + i,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'document',
        size: file.size,
        category: 'general',
        uploadedAt: new Date().toISOString(),
        optimized: optimization
      };

      // Add dimensions for images
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          newItem.dimensions = { width: img.width, height: img.height };
          setMediaItems(prev => [...prev, newItem]);
        };
        img.src = newItem.url;
      } else {
        setMediaItems(prev => [...prev, newItem]);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [allowUpload, maxFileSize, optimization]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Handle external URL
  const handleAddExternalUrl = async () => {
    if (!externalUrl || !allowExternal) return;

    try {
      // Validate URL
      new URL(externalUrl);
      
      // Determine file type from URL
      const extension = externalUrl.split('.').pop()?.toLowerCase();
      let type: 'image' | 'video' | 'audio' | 'document' = 'document';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
        type = 'image';
      } else if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
        type = 'video';
      } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
        type = 'audio';
      }

      const newItem: MediaItem = {
        id: Date.now().toString(),
        name: externalUrl.split('/').pop() || 'external-file',
        url: externalUrl,
        type,
        size: 0,
        category: 'general',
        uploadedAt: new Date().toISOString(),
        optimized: false
      };

      setMediaItems(prev => [...prev, newItem]);
      setExternalUrl('');
    } catch (error) {
      alert('URL inválida');
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    if (multiple) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  };

  // Handle selection
  const handleSelection = () => {
    if (selectedItems.length === 0) return;

    if (multiple && onMultiSelect) {
      const urls = selectedItems.map(id => 
        mediaItems.find(item => item.id === id)?.url || ''
      ).filter(url => url);
      onMultiSelect(urls);
    } else if (onSelect) {
      const item = mediaItems.find(item => item.id === selectedItems[0]);
      if (item) {
        onSelect(item.url);
      }
    }

    if (onClose) {
      onClose();
    }
  };

  // Delete media item
  const deleteItem = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      setMediaItems(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  if (!isOpen) return null;

  const MediaGridItem = ({ item }: { item: MediaItem }) => {
    const Icon = getFileTypeIcon(item.type);
    const isSelected = selectedItems.includes(item.id);

    return (
      <div 
        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => toggleSelection(item.id)}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {item.type === 'image' ? (
            <img 
              src={item.thumbnail || item.url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="w-12 h-12 text-gray-400" />
          )}
        </div>
        
        <div className="p-3">
          <h4 className="text-sm font-medium truncate">{item.name}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          </div>
          {item.dimensions && (
            <p className="text-xs text-gray-500 mt-1">
              {item.dimensions.width} × {item.dimensions.height}
            </p>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank');
              }}
              className="w-6 h-6 p-0"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="w-6 h-6 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Optimization status */}
        {optimization && item.optimized && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Optimizado
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const MediaListItem = ({ item }: { item: MediaItem }) => {
    const Icon = getFileTypeIcon(item.type);
    const isSelected = selectedItems.includes(item.id);

    return (
      <div 
        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggleSelection(item.id)}
      >
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          {item.type === 'image' ? (
            <img 
              src={item.thumbnail || item.url} 
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <Icon className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.name}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{formatFileSize(item.size)}</span>
            <span>{formatDate(item.uploadedAt)}</span>
            {item.dimensions && (
              <span>{item.dimensions.width} × {item.dimensions.height}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{item.category}</Badge>
          {optimization && item.optimized && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Optimizado
            </Badge>
          )}
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank');
              }}
              className="w-8 h-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isSelected && (
          <Check className="w-5 h-5 text-blue-500" />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Media Manager
                <Badge variant="outline">{filteredItems.length} archivos</Badge>
              </CardTitle>
              <CardDescription>
                Gestiona y organiza tus archivos multimedia
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <Button onClick={handleSelection} className="bg-blue-600 hover:bg-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  Seleccionar ({selectedItems.length})
                </Button>
              )}
              
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Upload Section */}
          <Tabs defaultValue="library" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              {allowUpload && <TabsTrigger value="upload">Subir Archivos</TabsTrigger>}
              {allowExternal && <TabsTrigger value="external">URL Externa</TabsTrigger>}
            </TabsList>

            <TabsContent value="library" className="flex-1 flex flex-col space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar archivos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="image">Imágenes</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Media Grid/List */}
              <div className="flex-1 overflow-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron archivos</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredItems.map(item => (
                      <MediaGridItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map(item => (
                      <MediaListItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {allowUpload && (
              <TabsContent value="upload" className="flex-1 flex flex-col">
                <div 
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                      <p className="text-blue-600">Subiendo archivos...</p>
                      <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{uploadProgress}%</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium">
                          Arrastra archivos aquí o 
                          <Button 
                            variant="link" 
                            className="px-2"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            haz clic para subir
                          </Button>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Máximo {maxFileSize}MB por archivo
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={acceptedTypes.join(',')}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </TabsContent>
            )}

            {allowExternal && (
              <TabsContent value="external" className="flex-1">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Agregar URL Externa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Agrega archivos desde URLs externas
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddExternalUrl}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Consejos:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use URLs directas a archivos (terminan en .jpg, .png, etc.)</li>
                      <li>• Verifique que la URL sea accesible públicamente</li>
                      <li>• Las URLs externas no se optimizan automáticamente</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaManager;