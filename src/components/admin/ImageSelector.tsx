/**
 * ImageSelector - Componente wrapper para selección de imágenes
 * Integra MediaLibrary con formularios de manera sencilla
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon,
  Plus,
  X,
  Eye,
  Upload,
  ExternalLink
} from 'lucide-react';
import UnifiedMediaLibrary from './UnifiedMediaLibrary';
import Image from 'next/image';

interface ImageInfo {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

interface ImageSelectorProps {
  // Configuración básica
  label?: string;
  description?: string;
  placeholder?: string;

  // Valores
  value?: string | string[];
  onChange: (value: string | string[]) => void;

  // Comportamiento
  multiSelect?: boolean;
  maxImages?: number;
  acceptedTypes?: string[];

  // UI
  variant?: 'card' | 'input' | 'gallery';
  size?: 'sm' | 'md' | 'lg';

  // Validación
  required?: boolean;
  error?: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  label,
  description,
  placeholder = 'Seleccionar imagen...',
  value,
  onChange,
  multiSelect = false,
  maxImages = 10,
  acceptedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  variant = 'card',
  size = 'md',
  required = false,
  error
}) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Convertir valor a array para manejo uniforme
  const selectedUrls = Array.isArray(value) ? value : value ? [value] : [];



  // Manejar selección desde MediaLibrary
  const handleMediaSelect = useCallback((images: ImageInfo[]) => {
    const urls = images.map(img => img.url);

    if (multiSelect) {
      // En modo múltiple, agregar a la selección actual
      const newUrls = [...selectedUrls, ...urls];
      const uniqueUrls = Array.from(new Set(newUrls)).slice(0, maxImages);
      onChange(uniqueUrls);
    } else {
      // En modo único, reemplazar
      onChange(urls[0] || '');
    }
  }, [selectedUrls, multiSelect, maxImages, onChange]);

  // Remover imagen
  const handleRemoveImage = (urlToRemove: string) => {
    if (multiSelect) {
      const newUrls = selectedUrls.filter(url => url !== urlToRemove);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  // Obtener información de display de una URL
  const getImageInfo = (url: string | any) => {
    // Asegurar que url es un string
    const urlString = typeof url === 'string' ? url : String(url || '');

    if (!urlString) {
      return {
        filename: '',
        extension: '',
        isExternal: false,
        displayName: 'Sin imagen'
      };
    }

    const pathParts = urlString.split('/');
    const filename = pathParts[pathParts.length - 1];
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    return {
      filename,
      extension,
      isExternal: !urlString.startsWith('/'),
      displayName: filename.length > 30 ? filename.substring(0, 27) + '...' : filename
    };
  };

  // Obtener clases de tamaño
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { container: 'h-24', image: 'w-20 h-20', button: 'h-24 text-sm' };
      case 'lg': return { container: 'h-40', image: 'w-36 h-36', button: 'h-40' };
      default: return { container: 'h-32', image: 'w-28 h-28', button: 'h-32' };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'input') {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={Array.isArray(value) ? value.join(', ') : value || ''}
              placeholder={placeholder}
              readOnly
              className={`w-full px-3 py-2 border rounded-md bg-gray-50 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {selectedUrls.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 h-6"
                onClick={() => onChange(multiSelect ? [] : '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLibraryOpen(true)}
            className="flex-shrink-0"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Explorar
          </Button>
        </div>

        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  if (variant === 'gallery') {
    return (
      <div className="space-y-4">
        {label && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Imágenes seleccionadas */}
          {selectedUrls.map((url, index) => {
            const imageInfo = getImageInfo(url);

            return (
              <Card key={url} className="relative group">
                <CardContent className="p-2">
                  <div className={`relative bg-gray-100 rounded overflow-hidden ${sizeClasses.container}`}>
                    <Image
                      src={url}
                      alt={imageInfo.displayName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-image.jpg';
                      }}
                    />

                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-blue-300"
                        onClick={() => setPreviewImage(url)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-red-300"
                        onClick={() => handleRemoveImage(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge para URLs externas */}
                    {imageInfo.isExternal && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Externa
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-600 truncate" title={imageInfo.filename}>
                    {imageInfo.displayName}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Botón para agregar más */}
          {(multiSelect && selectedUrls.length < maxImages) || (!multiSelect && selectedUrls.length === 0) ? (
            <Card
              className={`border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer group ${sizeClasses.container}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLibraryOpen(true);
              }}
            >
              <CardContent className="p-2 h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-500">
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">
                  {selectedUrls.length === 0 ? 'Agregar imagen' : 'Agregar otra'}
                </span>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {/* UnifiedMediaLibrary Modal for gallery variant */}
        <UnifiedMediaLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelect={handleMediaSelect}
          multiSelect={multiSelect}
          selectedImages={selectedUrls}
          acceptedTypes={acceptedTypes}
          title={`Seleccionar ${multiSelect ? 'imágenes' : 'imagen'}`}
        />
      </div>
    );
  }

  // Variant por defecto: 'card'
  return (
    <div className="space-y-4">
      {label && (
        <div>
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}

      {selectedUrls.length === 0 ? (
        <Card
          className={`border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer group ${
            error ? 'border-red-300 hover:border-red-500' : ''
          }`}
          onClick={() => setIsLibraryOpen(true)}
        >
          <CardContent className={`flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-500 ${sizeClasses.button}`}>
            <ImageIcon className="h-12 w-12 mb-3" />
            <span className="text-sm font-medium">{placeholder}</span>
            <span className="text-xs text-gray-400 mt-1">
              Clic para explorar la biblioteca de medios
            </span>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          {selectedUrls.map((url) => {
            const imageInfo = getImageInfo(url);

            return (
              <Card key={url} className="relative group">
                <CardContent className="p-2">
                  <div className={`relative bg-gray-100 rounded overflow-hidden ${sizeClasses.image}`}>
                    <Image
                      src={url}
                      alt={imageInfo.displayName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-image.jpg';
                      }}
                    />

                    {/* Botón de eliminar */}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Badge para URLs externas */}
                    {imageInfo.isExternal && (
                      <div className="absolute bottom-1 left-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <ExternalLink className="h-2 w-2" />
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-gray-600 text-center truncate" title={imageInfo.filename}>
                    {imageInfo.displayName}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {multiSelect && selectedUrls.length < maxImages && (
            <Card
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer group"
              onClick={() => setIsLibraryOpen(true)}
            >
              <CardContent className={`flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-500 ${sizeClasses.image}`}>
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">Agregar</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* UnifiedMediaLibrary Modal */}
      <UnifiedMediaLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleMediaSelect}
        multiSelect={multiSelect}
        selectedImages={selectedUrls}
        acceptedTypes={acceptedTypes}
        title={`Seleccionar ${multiSelect ? 'imágenes' : 'imagen'}`}
      />

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;