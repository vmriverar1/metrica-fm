'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, ExternalLink, X, Eye, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
}

const ImageField: React.FC<ImageFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar imagen...',
  required = false,
  disabled = false,
  description,
  className = ''
}) => {
  const [isExternal, setIsExternal] = useState(() => {
    // Auto-detect if current value is external URL
    if (value) {
      return value.startsWith('http://') || value.startsWith('https://');
    }
    return false;
  });

  // Update mode when value changes (for editing existing records)
  useEffect(() => {
    if (value) {
      const shouldBeExternal = value.startsWith('http://') || value.startsWith('https://');
      setIsExternal(shouldBeExternal);
    }
  }, [value]);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'images');

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        console.log('✅ [IMAGE FIELD] File uploaded successfully:', data.url);
        onChange(data.url);
        setUploadError(null);
      } else {
        throw new Error(data.message || 'Error desconocido al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
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

  const handleClearValue = () => {
    onChange('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModeSwitch = (external: boolean) => {
    setIsExternal(external);
    if (!external && value && (value.startsWith('http://') || value.startsWith('https://'))) {
      // Si cambiamos a interno y la URL actual es externa, limpiar
      onChange('');
    }
    setUploadError(null);
  };

  const handleExternalUrlChange = (url: string) => {
    onChange(url);
    setUploadError(null);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const previewImage = () => {
    if (value && isValidUrl(value)) {
      window.open(value, '_blank', 'noopener,noreferrer');
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

      {/* Current Image Preview */}
      {value && isValidUrl(value) && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {isValidImage(value) ? (
                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border shadow-sm">
                  <img 
                    src={value} 
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
                {isValidImage(value) && <Check className="w-4 h-4 text-green-500" />}
              </div>
              <p className="text-sm text-gray-600 break-all mb-2">{value}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={previewImage}
                  disabled={!isValidUrl(value)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearValue}
                  disabled={disabled}
                >
                  <X className="w-3 h-3 mr-1" />
                  Quitar
                </Button>
              </div>
            </div>
          </div>
        </Card>
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
          <Input
            type="url"
            value={value}
            onChange={(e) => handleExternalUrlChange(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            disabled={disabled}
            className={uploadError ? 'border-red-300 focus:border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            Ingresa la URL completa de una imagen externa (debe comenzar con http:// o https://)
          </p>
        </div>
      ) : (
        // File Upload Area
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
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
                    Haz clic para seleccionar o arrastra una imagen aquí
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
                {dragActive && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <p className="text-sm font-medium text-blue-700">Suelta la imagen aquí</p>
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
              disabled={disabled || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar archivo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageField;