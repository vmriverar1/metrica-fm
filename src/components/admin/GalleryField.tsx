'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Image, 
  Upload, 
  ExternalLink, 
  X, 
  Eye, 
  Plus, 
  Edit2,
  AlertCircle,
  Trash2,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface GalleryFieldProps {
  value: string | string[] | any[];
  onChange: (value: any[]) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  galleryType?: 'simple' | 'complex' | 'captioned';
}

interface GalleryItem {
  id: string;
  url: string;
  isExternal: boolean;
  caption?: string;
  thumbnail?: string;
  stage?: string;
  order?: number;
  title?: string;
  description?: string;
  image?: string;
}

const GalleryField: React.FC<GalleryFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Agregar imágenes a la galería...',
  required = false,
  disabled = false,
  description,
  className = '',
  galleryType
}) => {
  // Auto-detect gallery type if not specified
  const detectedType = galleryType || (() => {
    if (!Array.isArray(value) || value.length === 0) return 'simple';
    
    const firstItem = value[0];
    if (typeof firstItem === 'string') return 'simple';
    if (firstItem && typeof firstItem === 'object') {
      if ('caption' in firstItem && 'stage' in firstItem) return 'complex';
      if ('caption' in firstItem || 'title' in firstItem) return 'captioned';
    }
    return 'simple';
  })();

  // Convert value to array and create gallery items
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    if (!value) return [];
    
    let items: any[] = [];
    if (Array.isArray(value)) {
      items = value;
    } else if (typeof value === 'string' && value.trim()) {
      items = value.split(',').map(url => url.trim()).filter(Boolean);
    }
    
    return items.map((item, index) => {
      let galleryItem: GalleryItem;
      
      if (typeof item === 'string') {
        // Simple: just URLs
        galleryItem = {
          id: `item-${index}`,
          url: item,
          isExternal: item.startsWith('http://') || item.startsWith('https://')
        };
      } else if (item && typeof item === 'object') {
        // Extract URL from different object structures
        const url = item.url || item.image || '';
        galleryItem = {
          id: item.id || `item-${index}`,
          url: String(url),
          isExternal: url.startsWith('http://') || url.startsWith('https://'),
          caption: item.caption,
          thumbnail: item.thumbnail,
          stage: item.stage,
          order: item.order,
          title: item.title,
          description: item.description,
          image: item.image
        };
      } else {
        // Fallback
        galleryItem = {
          id: `item-${index}`,
          url: String(item || ''),
          isExternal: false
        };
      }
      
      return galleryItem;
    });
  });

  const [isExternalMode, setIsExternalMode] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStage, setNewStage] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [editingCaption, setEditingCaption] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingStage, setEditingStage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent with useCallback to prevent unnecessary re-renders
  const updateParent = useCallback((newItems: GalleryItem[]) => {
    let result;
    
    if (detectedType === 'simple') {
      result = newItems.map(item => item.url);
    } else if (detectedType === 'captioned') {
      result = newItems.map(item => ({
        url: item.url,
        caption: item.caption || '',
        ...(item.title && { title: item.title }),
        ...(item.description && { description: item.description })
      }));
    } else if (detectedType === 'complex') {
      result = newItems.map(item => ({
        id: item.id,
        url: item.url,
        thumbnail: item.thumbnail || item.url,
        caption: item.caption || '',
        stage: item.stage || 'final',
        order: item.order || 1
      }));
    }
    
    onChange(result || []);
  }, [onChange, detectedType]);

  const isValidImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
  };

  const handleAddExternalUrl = () => {
    if (!newUrl.trim()) return;
    
    const newItem: GalleryItem = {
      id: `item-${Date.now()}`,
      url: newUrl.trim(),
      isExternal: true,
      ...(detectedType !== 'simple' && {
        caption: newCaption.trim() || '',
        ...(detectedType === 'captioned' && newTitle.trim() && { title: newTitle.trim() }),
        ...(detectedType === 'captioned' && newDescription.trim() && { description: newDescription.trim() }),
        ...(detectedType === 'complex' && { 
          stage: newStage.trim() || 'final',
          thumbnail: newUrl.trim(),
          order: galleryItems.length + 1
        })
      })
    };

    const newItems = [...galleryItems, newItem];
    setGalleryItems(newItems);
    updateParent(newItems);
    
    // Reset form
    setNewUrl('');
    setNewCaption('');
    setNewTitle('');
    setNewDescription('');
    setNewStage('');
    setUploadError(null);
  };

  const handleEditItem = (itemId: string) => {
    const item = galleryItems.find(item => item.id === itemId);
    if (item) {
      setEditingItem(itemId);
      setEditingUrl(item.url);
      setEditingCaption(item.caption || '');
      setEditingTitle(item.title || '');
      setEditingDescription(item.description || '');
      setEditingStage(item.stage || '');
    }
  };

  const handleSaveEdit = () => {
    if (!editingUrl.trim() || !editingItem) return;

    const newItems = galleryItems.map(item => 
      item.id === editingItem 
        ? { 
            ...item, 
            url: editingUrl.trim(),
            ...(detectedType !== 'simple' && {
              caption: editingCaption.trim(),
              ...(detectedType === 'captioned' && { 
                title: editingTitle.trim(),
                description: editingDescription.trim()
              }),
              ...(detectedType === 'complex' && { 
                stage: editingStage.trim() || 'final',
                thumbnail: editingUrl.trim()
              })
            })
          }
        : item
    );
    
    setGalleryItems(newItems);
    updateParent(newItems);
    setEditingItem(null);
    setEditingUrl('');
    setEditingCaption('');
    setEditingTitle('');
    setEditingDescription('');
    setEditingStage('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingUrl('');
    setEditingCaption('');
    setEditingTitle('');
    setEditingDescription('');
    setEditingStage('');
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = galleryItems.filter(item => item.id !== itemId);
    setGalleryItems(newItems);
    updateParent(newItems);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);
    const newItems: GalleryItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`Archivo "${file.name}" no es una imagen válida`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`Archivo "${file.name}" es demasiado grande. Máximo 5MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'gallery');

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }

        const data = await response.json();
        
        if (data.success && data.url) {
          newItems.push({
            id: `item-${Date.now()}-${i}`,
            url: data.url,
            isExternal: false,
            ...(detectedType !== 'simple' && {
              caption: `Imagen ${galleryItems.length + newItems.length + 1}`,
              ...(detectedType === 'complex' && {
                stage: 'final',
                thumbnail: data.url,
                order: galleryItems.length + newItems.length + 1
              })
            })
          });
        } else {
          throw new Error(data.message || `Error desconocido al subir ${file.name}`);
        }
      }

      if (newItems.length > 0) {
        const updatedItems = [...galleryItems, ...newItems];
        setGalleryItems(updatedItems);
        updateParent(updatedItems);
        console.log(`✅ [GALLERY FIELD] ${newItems.length} files uploaded successfully`);
      }

    } catch (error) {
      console.error('Error uploading gallery images:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const previewImage = (url: string) => {
    if (isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Mode Toggle */}
        <div className={`flex items-center gap-2 text-sm ${!label ? 'w-full justify-end' : ''}`}>
          <span className={`transition-colors ${!isExternalMode ? 'text-gray-900' : 'text-gray-500'}`}>
            Subir archivos
          </span>
          <Switch
            checked={isExternalMode}
            onCheckedChange={setIsExternalMode}
            disabled={disabled || uploading}
            size="sm"
          />
          <span className={`transition-colors ${isExternalMode ? 'text-gray-900' : 'text-gray-500'}`}>
            URLs externas
          </span>
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Current Gallery Items */}
      {galleryItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Galería ({galleryItems.length} imagen{galleryItems.length !== 1 ? 's' : ''})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {galleryItems.map((item) => (
              <Card key={item.id} className="p-3 bg-gray-50">
                <div className="flex items-start gap-3">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {isValidImage(item.url) ? (
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border shadow-sm">
                        <img 
                          src={item.url} 
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = 'w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border';
                              parent.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.isExternal ? "secondary" : "default"} className="text-xs">
                        {item.isExternal ? 'Externa' : 'Interna'}
                      </Badge>
                    </div>

                    {/* Edit Mode */}
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <Input
                          type="url"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="text-sm"
                        />
                        
                        {/* Additional fields for captioned and complex types */}
                        {detectedType !== 'simple' && (
                          <Input
                            type="text"
                            value={editingCaption}
                            onChange={(e) => setEditingCaption(e.target.value)}
                            placeholder="Descripción de la imagen..."
                            className="text-sm"
                          />
                        )}
                        
                        {detectedType === 'captioned' && (
                          <>
                            <Input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              placeholder="Título (opcional)..."
                              className="text-sm"
                            />
                            <Input
                              type="text"
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              placeholder="Descripción detallada (opcional)..."
                              className="text-sm"
                            />
                          </>
                        )}
                        
                        {detectedType === 'complex' && (
                          <select
                            value={editingStage}
                            onChange={(e) => setEditingStage(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="inicio">Inicio</option>
                            <option value="proceso">Proceso</option>
                            <option value="final">Final</option>
                          </select>
                        )}
                        
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editingUrl.trim()}
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Additional info display */}
                        {detectedType !== 'simple' && (item.title || item.caption) && (
                          <div className="mb-2">
                            {item.title && (
                              <p className="text-sm font-medium text-gray-800 mb-1">{item.title}</p>
                            )}
                            {item.caption && (
                              <p className="text-xs text-gray-600">{item.caption}</p>
                            )}
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                            {detectedType === 'complex' && item.stage && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.stage === 'inicio' ? 'Inicio' : 
                                 item.stage === 'proceso' ? 'Proceso' : 'Final'}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-600 break-all mb-2">{item.url}</p>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => previewImage(item.url)}
                            disabled={!isValidUrl(item.url)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item.id)}
                            disabled={disabled}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={disabled}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Items */}
      {isExternalMode ? (
        // External URL Input
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Agregar URL Externa</h4>
              <Badge variant="outline" className="text-xs">
                Tipo: {detectedType === 'simple' ? 'Simple' : 
                       detectedType === 'captioned' ? 'Con descripción' : 'Complejo'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (detectedType === 'simple') {
                      handleAddExternalUrl();
                    }
                  }
                }}
              />
              
              {/* Additional fields based on gallery type */}
              {detectedType !== 'simple' && (
                <Input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Descripción de la imagen..."
                  disabled={disabled}
                />
              )}
              
              {detectedType === 'captioned' && (
                <>
                  <Input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Título (opcional)..."
                    disabled={disabled}
                  />
                  <Input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descripción detallada (opcional)..."
                    disabled={disabled}
                  />
                </>
              )}
              
              {detectedType === 'complex' && (
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  disabled={disabled}
                >
                  <option value="">Seleccionar etapa...</option>
                  <option value="inicio">Inicio</option>
                  <option value="proceso">Proceso</option>
                  <option value="final">Final</option>
                </select>
              )}
              
              <Button
                type="button"
                onClick={handleAddExternalUrl}
                disabled={disabled || !newUrl.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Ingresa la URL y los datos adicionales según el tipo de galería detectado
            </p>
          </div>
        </Card>
      ) : (
        // File Upload Area
        <Card className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              hover:border-gray-400 hover:bg-gray-50
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={!disabled && !uploading ? openFileDialog : undefined}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">Subiendo imágenes...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Haz clic para seleccionar o arrastra imágenes aquí
                  </p>
                  <p className="text-xs text-gray-500">
                    Puedes seleccionar múltiples archivos - PNG, JPG, GIF hasta 5MB cada uno
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar Archivos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GalleryField;