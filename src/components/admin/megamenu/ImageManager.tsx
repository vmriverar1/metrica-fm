'use client';

import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Eye, 
  Download, 
  Crop,
  Palette,
  Sliders,
  RotateCw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast-simple';

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  type: 'uploaded' | 'external' | 'stock';
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  used_in: string[];
  tags: string[];
  created_at: string;
  optimized?: boolean;
  alt_text?: string;
  description?: string;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
}

interface ImageManagerProps {
  selectedImage?: string;
  onImageSelect: (url: string, asset?: ImageAsset) => void;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
  allowMultiple?: boolean;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  selectedImage,
  onImageSelect,
  onImageUpload,
  className,
  allowMultiple = false
}) => {
  const [assets, setAssets] = useState<ImageAsset[]>([
    {
      id: '1',
      name: 'consultation-banner.jpg',
      url: '/images/consultation-banner.jpg',
      type: 'uploaded',
      size: 245760,
      dimensions: { width: 800, height: 400 },
      format: 'JPEG',
      used_in: ['services-megamenu'],
      tags: ['consultation', 'business', 'meeting'],
      created_at: '2025-09-01T00:00:00Z',
      optimized: true,
      alt_text: 'Consulta de negocios',
      description: 'Imagen para sección promocional de servicios'
    },
    {
      id: '2',
      name: 'portfolio-banner.jpg',
      url: '/images/portfolio-banner.jpg',
      type: 'uploaded',
      size: 189440,
      dimensions: { width: 800, height: 400 },
      format: 'JPEG',
      used_in: ['portfolio-megamenu'],
      tags: ['portfolio', 'projects', 'construction'],
      created_at: '2025-09-01T00:00:00Z',
      optimized: true,
      alt_text: 'Proyectos de construcción',
      description: 'Banner promocional del portafolio'
    },
    {
      id: '3',
      name: 'team-collaboration.jpg',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
      type: 'external',
      size: 0,
      dimensions: { width: 1200, height: 800 },
      format: 'JPEG',
      used_in: [],
      tags: ['team', 'collaboration', 'office'],
      created_at: '2025-09-01T00:00:00Z',
      alt_text: 'Equipo colaborando',
      description: 'Imagen de equipo trabajando'
    }
  ]);
  
  const [activeTab, setActiveTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'uploaded' | 'external' | 'stock'>('all');
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [imageFilters, setImageFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validaciones
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: `${file.name} no es una imagen válida`,
          variant: "destructive"
        });
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Archivo muy grande",
          description: `${file.name} supera los 5MB permitidos`,
          variant: "destructive"
        });
        continue;
      }

      const fileId = `upload_${Date.now()}_${i}`;
      setUploadingFiles(prev => new Set([...prev, fileId]));

      try {
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let uploadedUrl = '/images/uploaded/' + file.name;
        
        if (onImageUpload) {
          uploadedUrl = await onImageUpload(file);
        }

        const newAsset: ImageAsset = {
          id: fileId,
          name: file.name,
          url: uploadedUrl,
          type: 'uploaded',
          size: file.size,
          dimensions: { width: 800, height: 400 }, // En una implementación real, se calcularían
          format: file.type.split('/')[1].toUpperCase(),
          used_in: [],
          tags: [],
          created_at: new Date().toISOString(),
          optimized: false,
          alt_text: '',
          description: ''
        };

        setAssets(prev => [...prev, newAsset]);
        
        toast({
          title: "Imagen subida",
          description: `${file.name} se ha subido correctamente`
        });

      } catch (error) {
        toast({
          title: "Error de subida",
          description: `No se pudo subir ${file.name}`,
          variant: "destructive"
        });
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const optimizeImage = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    toast({
      title: "Optimizando imagen",
      description: "Procesando imagen para web..."
    });

    // Simular optimización
    await new Promise(resolve => setTimeout(resolve, 3000));

    const updatedAssets = assets.map(a => 
      a.id === assetId 
        ? { ...a, optimized: true, size: Math.floor(a.size * 0.7) }
        : a
    );
    
    setAssets(updatedAssets);
    
    toast({
      title: "Imagen optimizada",
      description: `${asset.name} se ha optimizado para web`
    });
  };

  const deleteAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    if (asset.used_in.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: `Esta imagen está siendo usada en: ${asset.used_in.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setAssets(prev => prev.filter(a => a.id !== assetId));
    toast({
      title: "Imagen eliminada",
      description: `${asset.name} se ha eliminado`
    });
  };

  const updateAssetMetadata = (assetId: string, metadata: Partial<ImageAsset>) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, ...metadata } : a
    ));
  };

  const getFilteredAssets = () => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedFilter);
    }

    return filtered;
  };

  const applyImageFilters = (filters: ImageFilters): string => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAssets = getFilteredAssets();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestor de Imágenes Promocionales
            <Badge variant="outline">{assets.length} imágenes</Badge>
          </CardTitle>
          <CardDescription>
            Gestión avanzada de imágenes para secciones promocionales del megamenú
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">Librería</TabsTrigger>
              <TabsTrigger value="upload">Subir</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
            </TabsList>

            {/* Tab Librería */}
            <TabsContent value="library" className="space-y-4">
              {/* Filtros y búsqueda */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar imágenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las imágenes</SelectItem>
                    <SelectItem value="uploaded">Subidas</SelectItem>
                    <SelectItem value="external">Externas</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grid de imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <Card 
                    key={asset.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedImage === asset.url ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={asset.url}
                        alt={asset.alt_text || asset.name}
                        className="w-full h-full object-cover"
                        onClick={() => onImageSelect(asset.url, asset)}
                      />
                      
                      {/* Overlay con acciones */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setPreviewImage(asset)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onImageSelect(asset.url, asset)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        {asset.type === 'uploaded' && !asset.optimized && (
                          <Button size="sm" variant="secondary" onClick={() => optimizeImage(asset.id)}>
                            <Zap className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Badges de estado */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge variant={asset.type === 'uploaded' ? 'default' : 'secondary'} className="text-xs">
                          {asset.type}
                        </Badge>
                        {asset.optimized && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Optimizada
                          </Badge>
                        )}
                        {asset.used_in.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            En uso
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
                          <span>{formatFileSize(asset.size)}</span>
                        </div>
                        {asset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron imágenes</p>
                </div>
              )}
            </TabsContent>

            {/* Tab Subir */}
            <TabsContent value="upload" className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Subir nuevas imágenes</h3>
                <p className="text-muted-foreground mb-4">
                  Arrastra y suelta imágenes aquí o haz clic para seleccionar
                </p>
                <div className="text-sm text-muted-foreground">
                  Formatos soportados: JPG, PNG, WEBP • Máximo 5MB por archivo
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {/* Archivos en proceso de subida */}
              {uploadingFiles.size > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Subiendo archivos...</h4>
                  {Array.from(uploadingFiles).map(fileId => (
                    <div key={fileId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="animate-spin">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Subiendo imagen...</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Editor */}
            <TabsContent value="editor" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Sliders className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Editor de imágenes - Funcionalidad en desarrollo</p>
                <p className="text-sm">Próximamente: filtros, recorte y efectos</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.name}
            </DialogTitle>
            <DialogDescription>
              Vista previa y detalles de la imagen
            </DialogDescription>
          </DialogHeader>
          
          {previewImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview de la imagen */}
              <div>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={previewImage.url}
                    alt={previewImage.alt_text || previewImage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Detalles y metadatos */}
              <div className="space-y-4">
                <div>
                  <Label>Título alternativo</Label>
                  <Input
                    value={previewImage.alt_text || ''}
                    onChange={(e) => updateAssetMetadata(previewImage.id, { alt_text: e.target.value })}
                    placeholder="Descripción breve de la imagen"
                  />
                </div>
                
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={previewImage.description || ''}
                    onChange={(e) => updateAssetMetadata(previewImage.id, { description: e.target.value })}
                    placeholder="Descripción detallada"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dimensiones:</span>
                    <div>{previewImage.dimensions.width} × {previewImage.dimensions.height}px</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tamaño:</span>
                    <div>{formatFileSize(previewImage.size)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formato:</span>
                    <div>{previewImage.format}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="capitalize">{previewImage.type}</div>
                  </div>
                </div>
                
                {previewImage.used_in.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Usado en:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewImage.used_in.map((usage, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {usage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() => onImageSelect(previewImage.url, previewImage)}
                  >
                    Seleccionar Imagen
                  </Button>
                  
                  {previewImage.type === 'uploaded' && !previewImage.optimized && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => optimizeImage(previewImage.id)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Optimizar
                    </Button>
                  )}
                  
                  {previewImage.used_in.length === 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        deleteAsset(previewImage.id);
                        setPreviewImage(null);
                      }}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageManager;