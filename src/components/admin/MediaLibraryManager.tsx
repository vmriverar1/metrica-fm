'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload,
  Image as ImageIcon,
  Video,
  Folder,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Copy,
  Download,
  Trash2,
  Eye,
  ExternalLink,
  File,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface MediaItem {
  id: string;
  name: string;
  path: string;
  type: 'image' | 'video' | 'folder';
  size: number;
  lastModified: Date;
  url: string;
  thumbnail?: string;
  alt?: string;
  category?: string;
}

interface MediaFolder {
  name: string;
  path: string;
  itemCount: number;
  size: number;
}

interface MediaLibraryManagerProps {
  onSelectMedia?: (media: MediaItem) => void;
  allowedTypes?: ('image' | 'video')[];
  maxSelections?: number;
  className?: string;
}

export default function MediaLibraryManager({
  onSelectMedia,
  allowedTypes = ['image', 'video'],
  maxSelections = 1,
  className = ''
}: MediaLibraryManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentPath, setCurrentPath] = useState('/images/proyectos');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load media from the file system
  const loadMedia = useCallback(async (path: string = '/images/proyectos') => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate loading media from known project folders
      const projectFolders = [
        'EDUCACIÓN', 'HOTELERIA', 'INDUSTRIA', 'OFICINA', 
        'RETAIL', 'SALUD', 'VIVIENDA'
      ];

      const mockFolders: MediaFolder[] = projectFolders.map(folder => ({
        name: folder,
        path: `/images/proyectos/${folder}`,
        itemCount: Math.floor(Math.random() * 20) + 5,
        size: Math.floor(Math.random() * 50000000) + 1000000
      }));

      // Simulate loading some sample images
      const mockItems: MediaItem[] = [
        {
          id: '1',
          name: '_ARI2359.webp',
          path: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2359.webp',
          type: 'image',
          size: 245000,
          lastModified: new Date(),
          url: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2359.webp',
          category: 'OFICINA'
        },
        {
          id: '2',
          name: '_ARI3978.webp',
          path: '/images/proyectos/EDUCACIÓN/Innova/Copia de _ARI3978.webp',
          type: 'image',
          size: 320000,
          lastModified: new Date(),
          url: '/images/proyectos/EDUCACIÓN/Innova/Copia de _ARI3978.webp',
          category: 'EDUCACIÓN'
        },
        {
          id: '3',
          name: '_ARI0071.webp',
          path: '/images/proyectos/RETAIL/Saga VES/Copia de _ARI0071.webp',
          type: 'image',
          size: 280000,
          lastModified: new Date(),
          url: '/images/proyectos/RETAIL/Saga VES/Copia de _ARI0071.webp',
          category: 'RETAIL'
        },
        {
          id: '4',
          name: 'hotel-video.mp4',
          path: '/videos/hotel-presentation.mp4',
          type: 'video',
          size: 15000000,
          lastModified: new Date(),
          url: '/videos/hotel-presentation.mp4',
          thumbnail: '/images/proyectos/HOTELERIA/Hotel Hilton Bajada Balta/_ARI2385-Editar.webp',
          category: 'HOTELERIA'
        }
      ];

      setFolders(mockFolders);
      setItems(mockItems);
    } catch (error) {
      toast({
        title: 'Error al cargar medios',
        description: 'No se pudieron cargar los archivos multimedia.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMedia(currentPath);
  }, [loadMedia, currentPath]);

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = allowedTypes.includes(item.type);
    return matchesSearch && matchesCategory && matchesType;
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      if (maxSelections === 1) {
        newSelected.clear();
        newSelected.add(itemId);
      } else if (newSelected.size < maxSelections) {
        newSelected.add(itemId);
      } else {
        toast({
          title: 'Límite alcanzado',
          description: `Solo puedes seleccionar ${maxSelections} elemento(s).`,
          variant: 'destructive',
        });
        return;
      }
    }
    
    setSelectedItems(newSelected);
    
    // If onSelectMedia is provided and we have a selection
    if (onSelectMedia && newSelected.size > 0) {
      const selectedItem = items.find(item => item.id === Array.from(newSelected)[0]);
      if (selectedItem) {
        onSelectMedia(selectedItem);
      }
    }
  };

  // Handle folder navigation
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSelectedItems(new Set());
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'URL copiada',
        description: 'La URL se ha copiado al portapapeles.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la URL.',
        variant: 'destructive',
      });
    }
  };

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Biblioteca de Medios
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMedia(currentPath)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-40">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Folder className="h-4 w-4" />
          <span>{currentPath}</span>
          {selectedItems.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedItems.size} seleccionado(s)
            </Badge>
          )}
        </div>

        <Tabs defaultValue="media" className="w-full">
          <TabsList>
            <TabsTrigger value="media">Medios ({filteredItems.length})</TabsTrigger>
            <TabsTrigger value="folders">Carpetas ({folders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando medios...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron archivos que coincidan con los criterios.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                        selectedItems.has(item.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.alt || item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Video className="h-12 w-12 text-white" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-2">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                      </div>

                      {/* Action menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar URL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir en nueva pestaña
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Selection indicator */}
                      {selectedItems.has(item.id) && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedItems.has(item.id)
                          ? 'bg-primary/5 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        {item.type === 'image' ? (
                          <ImageIcon className="h-6 w-6" />
                        ) : (
                          <Video className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(item.size)} • {item.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.url);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="folders" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {folders.map((folder) => (
                  <Card
                    key={folder.path}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Folder className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{folder.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {folder.itemCount} elementos • {formatFileSize(folder.size)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Selected items summary */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">
              {selectedItems.size} archivo(s) seleccionado(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Limpiar selección
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}