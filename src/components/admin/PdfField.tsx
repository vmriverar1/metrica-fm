'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Upload, ExternalLink, X, AlertCircle, Download, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PdfFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
}

// Función para obtener URL con proxy para PDFs (si es necesario)
const getProxiedPdfUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // URLs locales o relativas - no necesitan proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1' || url.startsWith('/')) {
      return url;
    }
    
    // PDFs directos externos - usar proxy si hay problemas CORS
    if (url.match(/\.pdf(\?.*)?$/i)) {
      return `/api/proxy/pdf?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  } catch {
    return url;
  }
};

// Función para validar URLs de PDF
const isPdfUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return url.match(/\.pdf(\?.*)?$/i) !== null;
  } catch {
    return false;
  }
};

export default function PdfField({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  description,
  className = ''
}: PdfFieldProps) {
  const [isExternal, setIsExternal] = useState(() => {
    // Auto-detect if current value is external URL
    if (value) {
      return value.startsWith('http://') || value.startsWith('https://');
    }
    return false;
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update mode when value changes
  useEffect(() => {
    if (value) {
      const shouldBeExternal = value.startsWith('http://') || value.startsWith('https://');
      setIsExternal(shouldBeExternal);
      setPreviewError(null); // Clear previous errors
    } else {
      setIsExternal(false);
    }
  }, [value]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFileUpload(files[0]);
    }
  }, [disabled]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setUploadError('Por favor selecciona un archivo PDF válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('El archivo PDF es muy grande (máximo 10MB)');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pdf');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
        setIsExternal(false);
      } else {
        throw new Error('Error al subir el archivo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error al subir el archivo PDF');
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

  // Clear value
  const clearValue = () => {
    onChange('');
    setPreviewError(null);
    setUploadError(null);
  };

  // Test PDF URL
  const testPdfUrl = async (url: string) => {
    try {
      const response = await fetch(getProxiedPdfUrl(url), { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('PDF test error:', error);
      return false;
    }
  };

  // Render PDF preview
  const renderPreview = () => {
    if (!value) return null;

    if (isExternal && !isPdfUrl(value)) {
      return (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 text-sm">
              La URL no parece ser un archivo PDF. Verifica que termine en .pdf
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Archivo PDF</h4>
                  <p className="text-sm text-gray-600">
                    {isExternal ? 'Enlace externo' : 'Archivo local'}
                  </p>
                  {value && (
                    <p className="text-xs text-gray-500 mt-1 break-all">
                      {value.length > 60 ? `${value.substring(0, 60)}...` : value}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getProxiedPdfUrl(value), '_blank')}
                  className="h-8"
                  title="Abrir PDF"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = getProxiedPdfUrl(value);
                    link.download = 'documento.pdf';
                    link.click();
                  }}
                  className="h-8"
                  title="Descargar PDF"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Descargar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={clearValue}
                  className="h-8 text-red-600 hover:text-red-700"
                  title="Eliminar"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            

            {/* Metadata */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <FileText className="w-3 h-3 mr-1" />
                  PDF
                </Badge>
                {isExternal && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Externo
                  </Badge>
                )}
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {previewError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <div className="font-medium">Error de vista previa</div>
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
                    Abrir en Nueva Pestaña
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600">
              {isExternal ? 'Enlace externo' : 'Subir archivo'}
            </label>
            <Switch
              checked={isExternal}
              onCheckedChange={setIsExternal}
              disabled={disabled}
            />
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* External URL Mode */}
      {isExternal && (
        <div className="mt-3 space-y-2">
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "https://ejemplo.com/documento.pdf"}
              className="pl-10"
              disabled={disabled}
            />
          </div>
          
          {uploadError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {uploadError}
            </div>
          )}

          {value && renderPreview()}
        </div>
      )}

      {/* Upload Mode */}
      {!isExternal && (
        <div className="mt-3">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-600">Subiendo PDF...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-primary">Haz clic para subir</span> o arrastra un PDF aquí
                </p>
                <p className="text-xs text-gray-500">
                  Archivos PDF hasta 10MB
                </p>
              </div>
            )}
          </div>
          
          {uploadError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {uploadError}
            </div>
          )}

          {value && !uploading && renderPreview()}
        </div>
      )}
    </div>
  );
}