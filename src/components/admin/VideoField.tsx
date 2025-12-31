'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Upload, ExternalLink, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface VideoFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  allowYouTube?: boolean;
  allowVimeo?: boolean;
}

// Función para obtener URL con proxy para CORS
const getProxiedVideoUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // URLs locales o relativas - no necesitan proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1' || url.startsWith('/')) {
      return url;
    }
    
    // YouTube y Vimeo tienen su propio manejo
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || hostname.includes('vimeo.com')) {
      return url;
    }
    
    // Videos directos externos - usar proxy para evitar CORS
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|m4v|3gp|wmv)(\?.*)?$/i)) {
      return `/api/proxy/video?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  } catch {
    return url;
  }
};

const VideoField: React.FC<VideoFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar video...',
  required = false,
  disabled = false,
  description,
  className = '',
  allowYouTube = true,
  allowVimeo = true
}) => {
  const [isExternal, setIsExternal] = useState(() => {
    // Auto-detect if current value is external URL
    if (value) {
      return value.startsWith('http://') || value.startsWith('https://') || 
             value.includes('youtube.com') || value.includes('youtu.be') || 
             value.includes('vimeo.com');
    }
    return false;
  });

  const [useProxy, setUseProxy] = useState(false);

  // Ref para evitar bucles infinitos
  const previousUrlRef = useRef<string>('');

  // Update mode when value changes (for editing existing records)
  useEffect(() => {
    // Solo procesar si la URL realmente cambió para evitar bucles infinitos
    if (previousUrlRef.current === value) {
      return;
    }

    console.log('VideoField: URL cambió de', previousUrlRef.current, 'a', value);
    previousUrlRef.current = value;

    if (value) {
      const shouldBeExternal = value.startsWith('http://') || value.startsWith('https://') ||
                              value.includes('youtube.com') || value.includes('youtu.be') ||
                              value.includes('vimeo.com');
      setIsExternal(shouldBeExternal);
      
      // Solo usar proxy para URLs externas que NO sean YouTube/Vimeo
      if (shouldBeExternal && !value.includes('youtube.com') && !value.includes('youtu.be') && !value.includes('vimeo.com')) {
        setUseProxy(true);
      } else {
        setUseProxy(false);
      }
      
      setPreviewError(null); // Clear previous errors
    } else {
      // Si no hay value, resetear a modo upload
      setIsExternal(false);
      setUseProxy(false);
    }
  }, [value]);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate video file
  const validateVideo = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',    // .mov
      'video/x-msvideo',    // .avi
      'video/x-m4v',        // .m4v
      'video/3gpp',         // .3gp
      'video/x-ms-wmv',     // .wmv
      'video/mpeg',         // .mpeg
      ''                    // Algunos navegadores no detectan el tipo
    ];

    console.log('[VideoField] Validando archivo:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });

    // Si el tipo está vacío pero la extensión es de video, permitir
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.3gp', '.wmv', '.mpeg'];
    const hasVideoExtension = videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!allowedTypes.includes(file.type) && !hasVideoExtension) {
      console.error('[VideoField] Tipo no permitido:', file.type);
      return `Formato de video no válido (${file.type || 'desconocido'}). Use MP4, WebM, OGG, MOV o AVI.`;
    }

    if (file.size > maxSize) {
      return 'El video es demasiado grande. Máximo 100MB.';
    }

    return null;
  };

  // Upload video file
  const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'videos');
    
    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al subir el video');
    }
    
    const data = await response.json();
    return data.url;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    console.log('[VideoField] handleFileSelect llamado con:', file.name);

    const validationError = validateVideo(file);
    if (validationError) {
      console.error('[VideoField] Error de validación:', validationError);
      setUploadError(validationError);
      return;
    }

    console.log('[VideoField] Validación pasada, iniciando subida...');
    setUploading(true);
    setUploadError(null);

    try {
      console.log('[VideoField] Llamando uploadVideo...');
      const url = await uploadVideo(file);
      console.log('[VideoField] Video subido exitosamente:', url);
      onChange(url);
      
      // Get video metadata
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size
        });
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir el video');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isExternal) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isExternal, handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[VideoField] Input change event triggered');
    const file = e.target.files?.[0];
    console.log('[VideoField] Archivo seleccionado:', file ? file.name : 'ninguno');
    if (file) {
      handleFileSelect(file);
    } else {
      console.log('[VideoField] No se seleccionó ningún archivo');
    }
  };

  // Validate external URL
  const validateExternalUrl = (url: string): boolean => {
    if (!url) return true;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Direct video files - más formatos soportados
      if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|m4v|3gp|wmv)(\?.*)?$/i)) {
        return true;
      }
      
      // YouTube URLs (más variaciones)
      if (allowYouTube && (
        hostname.includes('youtube.com') || 
        hostname.includes('youtu.be') ||
        hostname.includes('m.youtube.com')
      )) {
        return true;
      }
      
      // Vimeo URLs
      if (allowVimeo && hostname.includes('vimeo.com')) {
        return true;
      }
      
      // Otras plataformas de video populares
      if (hostname.includes('dailymotion.com') || 
          hostname.includes('wistia.com') ||
          hostname.includes('loom.com') ||
          hostname.includes('streamable.com')) {
        return true;
      }
      
      // Other video platforms could be added here
      return hostname.startsWith('http') || hostname.startsWith('https');
    } catch {
      return false;
    }
  };


  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  // Get Vimeo embed URL
  const getVimeoEmbedUrl = (url: string): string | null => {
    const regExp = /vimeo.com\/(?:.*\/)?(\d+)/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    return null;
  };


  // Clear value
  const clearValue = () => {
    onChange('');
    setPreviewError(null);
    setUploadError(null);
  };

  // Render video preview
  const renderVideoPreview = () => {
    if (!value) return null;

    const isValidUrl = validateExternalUrl(value);
    if (!isValidUrl) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">URL de video no válida</span>
          </div>
        </div>
      );
    }

    // YouTube embed
    const youtubeEmbed = getYouTubeEmbedUrl(value);
    if (youtubeEmbed) {
      return (
        <div className="mt-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={youtubeEmbed}
              className="w-full h-full"
              allowFullScreen
              title="YouTube video preview"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-red-600 border-red-200">
              YouTube
            </Badge>
          </div>
        </div>
      );
    }

    // Vimeo embed
    const vimeoEmbed = getVimeoEmbedUrl(value);
    if (vimeoEmbed) {
      return (
        <div className="mt-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={vimeoEmbed}
              className="w-full h-full"
              allowFullScreen
              title="Vimeo video preview"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Vimeo
            </Badge>
          </div>
        </div>
      );
    }

    // Direct video file - SIMPLIFICADO como en el hero
    return (
      <div className="mt-4">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={() => {
              setPreviewError('No se pudo cargar el video. Verifica que la URL sea correcta y accesible.');
            }}
          >
            <source src={getProxiedVideoUrl(value)} type="video/mp4" />
            <source src={value} type="video/mp4" />
            Su navegador no soporta el elemento de video.
          </video>
        </div>

        {previewError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <div className="font-medium">Error de reproducción</div>
                <div className="text-red-600 text-xs mt-1">{previewError}</div>
                <div className="mt-2 text-xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewError(null)}
                    className="h-6 text-xs"
                  >
                    Reintentar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(value, '_blank')}
                    className="h-6 text-xs ml-2"
                  >
                    Abrir Enlace
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with mode toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {isExternal ? 'Video Externo' : 'Subir Video'}
            </span>
            {required && <span className="text-red-500">*</span>}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Subir</span>
            <Switch
              checked={isExternal}
              onCheckedChange={setIsExternal}
              disabled={disabled}
            />
            <span className="text-xs text-gray-500">URL</span>
          </div>
        </div>

        {/* External URL input */}
        {isExternal ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
                  disabled={disabled}
                  className="pl-10"
                />
              </div>
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearValue}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* URL validation indicators */}
            <div className="flex items-center space-x-2 text-xs">
              {allowYouTube && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  YouTube
                </Badge>
              )}
              {allowVimeo && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Vimeo
                </Badge>
              )}
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                MP4, WebM, OGG
              </Badge>
            </div>
          </div>
        ) : (
          /* File upload area */
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : uploadError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept="video/*"
              className="hidden"
              disabled={disabled}
            />
            
            <div className="space-y-2">
              {uploading ? (
                <>
                  <div className="animate-spin mx-auto">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-blue-600">Subiendo video...</p>
                </>
              ) : (
                <>
                  <Video className="w-8 h-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {dragActive ? 'Suelta el video aquí' : placeholder}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, WebM, OGG, MOV, AVI hasta 100MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {value && !uploading && (
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearValue();
                  }}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{uploadError}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}

        {/* Video preview */}
        {renderVideoPreview()}
      </div>
    </div>
  );
};

export default VideoField;