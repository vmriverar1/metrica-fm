'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, ExternalLink, X, Eye, Check, AlertCircle, Plus, Grid, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ImageFieldProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  multiple?: boolean; // Nueva prop para habilitar modo galería
  maxImages?: number; // Límite de imágenes en modo galería
}

const ImageField: React.FC<ImageFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar imagen...',
  required = false,
  disabled = false,
  description,
  className = '',
  multiple = false,
  maxImages = 10
}) => {
  // Normalizar value a array para manejo interno
  const [images, setImages] = useState<string[]>(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      // Manejar arrays que pueden contener objetos con campo 'logo' o 'url'
      return value.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // Buscar campos comunes de imagen en objetos
          return item.logo || item.url || item.image || item.src || '';
        }
        return '';
      }).filter(img => img && img.trim());
    }
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  });

  const [isExternal, setIsExternal] = useState(() => {
    // Auto-detect if current value is external URL
    const firstImage = images[0];
    if (firstImage && typeof firstImage === 'string') {
      return firstImage.startsWith('http://') || firstImage.startsWith('https://');
    }
    return false;
  });

  // Update internal state when value changes
  useEffect(() => {
    let newImages: string[] = [];

    if (!value) {
      newImages = [];
    } else if (Array.isArray(value)) {
      // Manejar arrays que pueden contener objetos con campo 'logo' o 'url'
      newImages = value.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // Buscar campos comunes de imagen en objetos
          return item.logo || item.url || item.image || item.src || '';
        }
        return '';
      }).filter(img => img && img.trim());
    } else if (typeof value === 'string' && value.trim()) {
      newImages = [value];
    }

    setImages(newImages);

    if (newImages.length > 0 && typeof newImages[0] === 'string') {
      const shouldBeExternal = newImages[0].startsWith('http://') || newImages[0].startsWith('https://');
      setIsExternal(shouldBeExternal);
    }
  }, [value]);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Prevenir uploads simultáneos
    if (uploading) {
      console.log('⚠️ [IMAGE FIELD] Upload ya en progreso, ignorando nueva solicitud');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona solo archivos de imagen (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB permitido.');
      return;
    }

    console.log('📤 [IMAGE FIELD] Iniciando upload de:', file.name);
    setUploading(true);
    setUploadError(null);

    // Timeout de seguridad de 30 segundos
    const timeoutId = setTimeout(() => {
      console.error('❌ [IMAGE FIELD] Timeout: El upload tardó demasiado');
      setUploadError('El upload tardó demasiado. Por favor intenta nuevamente.');
      setUploading(false);
      setDragActive(false);
    }, 30000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'images');

      console.log('🔄 [IMAGE FIELD] Enviando archivo al servidor...');
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      // Limpiar timeout si la respuesta llega
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [IMAGE FIELD] Error HTTP:', response.status, errorText);
        throw new Error(`Error al subir la imagen (${response.status})`);
      }

      const data = await response.json();
      console.log('📥 [IMAGE FIELD] Respuesta del servidor:', data);

      if (data.success && data.url) {
        console.log('✅ [IMAGE FIELD] File uploaded successfully:', data.url);

        // Actualizar el valor dependiendo del modo
        if (multiple) {
          // Modo galería: agregar a la lista
          const newImages = [...images, data.url];
          setImages(newImages);
          onChange(newImages);
        } else {
          // Modo imagen única: reemplazar
          setImages([data.url]);
          onChange(data.url);
        }

        setUploadError(null);

        // Reset del input file para permitir subir nuevas imágenes (como WordPress)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Reset estados de drag
        setDragActive(false);
      } else {
        throw new Error(data.message || data.error || 'Error desconocido al subir la imagen');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ [IMAGE FIELD] Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir la imagen');

      // Reset del input file en caso de error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setDragActive(false);
    } finally {
      // Asegurar que siempre se resetea el estado uploading
      console.log('🔄 [IMAGE FIELD] Finalizando upload, reseteando estados');
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      // En modo galería, procesar múltiples archivos
      const remainingSlots = maxImages - images.length;
      const filesToProcess = Math.min(files.length, remainingSlots);

      if (filesToProcess < files.length) {
        setUploadError(`Solo se pueden agregar ${remainingSlots} imágenes más (máximo ${maxImages})`);
      }

      // Procesar archivos uno por uno
      for (let i = 0; i < filesToProcess; i++) {
        await handleFileUpload(files[i]);
      }
    } else {
      // En modo único, procesar solo el primer archivo
      handleFileUpload(files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (multiple) {
      // En modo galería, procesar múltiples archivos
      const remainingSlots = maxImages - images.length;
      const filesToProcess = Math.min(files.length, remainingSlots);

      if (filesToProcess < files.length) {
        setUploadError(`Solo se pueden agregar ${remainingSlots} imágenes más (máximo ${maxImages})`);
      }

      // Procesar archivos uno por uno
      for (let i = 0; i < filesToProcess; i++) {
        await handleFileUpload(files[i]);
      }
    } else {
      // En modo único, procesar solo el primer archivo
      handleFileUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleClearValue = (index?: number) => {
    if (multiple && typeof index === 'number') {
      // Eliminar imagen específica en modo galería
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onChange(newImages);
    } else {
      // Limpiar todo
      setImages([]);
      onChange(multiple ? [] : '');
    }
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModeSwitch = (external: boolean) => {
    setIsExternal(external);
    if (!external && images.some(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')))) {
      // Si cambiamos a interno y hay URLs externas, limpiar
      setImages([]);
      onChange(multiple ? [] : '');
    }
    setUploadError(null);
  };

  const handleExternalUrlChange = (url: string) => {
    if (multiple) {
      // En modo galería, agregar a la lista
      if (url.trim()) {
        const newImages = [...images, url.trim()];
        setImages(newImages);
        onChange(newImages);
      }
    } else {
      // En modo único, reemplazar
      setImages(url ? [url] : []);
      onChange(url);
    }
    setUploadError(null);
  };

  const handleAddExternalUrl = (url: string) => {
    if (!url.trim()) return;

    if (multiple && images.length >= maxImages) {
      setUploadError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    const newImages = multiple ? [...images, url.trim()] : [url.trim()];
    setImages(newImages);
    onChange(multiple ? newImages : url.trim());
    setUploadError(null);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const previewImage = (url?: string) => {
    const imageToPreview = url || images[0];
    if (imageToPreview && isValidUrl(imageToPreview)) {
      window.open(imageToPreview, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label and Mode Toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Mode Toggle */}
        <div className={`flex items-center gap-2 text-sm ${!label ? 'w-full justify-end' : ''}`}>
          <span className={`transition-colors ${!isExternal ? 'text-gray-900' : 'text-gray-500'}`}>
            Subir archivo
          </span>
          <Switch
            checked={isExternal}
            onCheckedChange={handleModeSwitch}
            disabled={disabled || uploading}
            size="sm"
          />
          <span className={`transition-colors ${isExternal ? 'text-gray-900' : 'text-gray-500'}`}>
            URL externa
          </span>
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Current Images Preview */}
      {images.length > 0 && (
        <div className={multiple ? "space-y-2" : ""}>
          {multiple ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                  {maxImages && ` de ${maxImages} máximo`}
                </span>
                {images.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearValue()}
                    disabled={disabled}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Limpiar todo
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <Card key={index} className="p-2 bg-gray-50 relative group">
                    <div className="aspect-square bg-white rounded overflow-hidden border mb-2">
                      {isValidImage(img) ? (
                        <img
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = 'aspect-square bg-gray-100 rounded flex items-center justify-center border';
                              parent.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => previewImage(img)}
                        disabled={!isValidUrl(img)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleClearValue(index)}
                        disabled={disabled}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {/* Botón para agregar más en modo galería */}
                {images.length < maxImages && (
                  <Card
                    className="p-2 bg-gray-50 border-dashed border-2 flex items-center justify-center aspect-square cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={openFileDialog}
                  >
                    <div className="text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">Agregar más</span>
                    </div>
                  </Card>
                )}
              </div>
            </>
          ) : (
            // Vista para imagen única (modo actual)
            images[0] && isValidUrl(images[0]) && (
              <Card className="p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {isValidImage(images[0]) ? (
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border shadow-sm">
                        <img
                          src={images[0]}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = 'w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border';
                              parent.innerHTML = '<div class="flex flex-col items-center"><svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-xs text-gray-500">Error</span></div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center border">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isExternal ? "secondary" : "default"} className="text-xs">
                        {isExternal ? 'Externa' : 'Interna'}
                      </Badge>
                      {isValidImage(images[0]) && <Check className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-600 break-all mb-2">{images[0]}</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => previewImage(images[0])}
                        disabled={!isValidUrl(images[0])}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleClearValue()}
                        disabled={disabled}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Input Area */}
      {isExternal ? (
        // External URL Input
        <div className="space-y-2">
          {multiple ? (
            <>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={externalUrlInput}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={disabled || images.length >= maxImages}
                  className={uploadError ? 'border-red-300 focus:border-red-500' : ''}
                  onChange={(e) => setExternalUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExternalUrl(externalUrlInput);
                      setExternalUrlInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || images.length >= maxImages || !externalUrlInput.trim()}
                  onClick={() => {
                    handleAddExternalUrl(externalUrlInput);
                    setExternalUrlInput('');
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Ingresa URLs de imágenes externas y presiona Enter o el botón + para agregar
              </p>
            </>
          ) : (
            <>
              <Input
                type="url"
                value={images[0] || ''}
                onChange={(e) => handleExternalUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={disabled}
                className={uploadError ? 'border-red-300 focus:border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">
                Ingresa la URL completa de una imagen externa (debe comenzar con http:// o https://)
              </p>
            </>
          )}
        </div>
      ) : (
        // File Upload Area
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled || uploading || (multiple && images.length >= maxImages)}
            className="hidden"
          />
          
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${uploadError ? 'border-red-300' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!disabled && !uploading ? openFileDialog : undefined}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {multiple
                      ? `Haz clic para seleccionar o arrastra imágenes aquí`
                      : `Haz clic para seleccionar o arrastra una imagen aquí`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {multiple
                      ? `PNG, JPG, GIF hasta 5MB cada una • Máximo ${maxImages} imágenes`
                      : `PNG, JPG, GIF hasta 5MB`}
                  </p>
                  {multiple && images.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {maxImages - images.length} espacios disponibles
                    </p>
                  )}
                </div>
                {dragActive && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <p className="text-sm font-medium text-blue-700">
                      {multiple ? 'Suelta las imágenes aquí' : 'Suelta la imagen aquí'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || uploading || (multiple && images.length >= maxImages)}
            >
              <Upload className="w-4 h-4 mr-2" />
              {multiple ? 'Seleccionar archivos' : 'Seleccionar archivo'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageField;