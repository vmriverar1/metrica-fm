'use client';

import React from 'react';
import { Image, Upload, ExternalLink, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import MediaManager from './MediaManager';
import { useMediaManager } from '@/hooks/useMediaManager';

interface MediaPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  allowUpload?: boolean;
  allowExternal?: boolean;
  allowManualInput?: boolean;
  category?: string;
  filters?: ('images' | 'videos' | 'audio' | 'documents')[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const MediaPickerField: React.FC<MediaPickerFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar archivo...',
  allowUpload = true,
  allowExternal = true,
  allowManualInput = true,
  category = 'general',
  filters = ['images'],
  required = false,
  disabled = false,
  className = ''
}) => {
  const mediaManager = useMediaManager({
    multiple: false,
    allowUpload,
    allowExternal,
    categories: [category],
    filters
  });

  const handleMediaSelect = (url: string) => {
    onChange(url);
  };

  const handleClearValue = () => {
    onChange('');
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Current Value Preview */}
      {value && isValidUrl(value) && (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {isImage(value) ? (
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={value} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-900">Archivo actual</span>
                {isValidUrl(value) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(value, '_blank')}
                    className="w-6 h-6 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{value}</p>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearValue}
              className="text-red-500 hover:text-red-700 w-6 h-6 p-0"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Input Methods */}
      <div className="space-y-3">
        {/* Media Manager Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={mediaManager.openMediaManager}
            disabled={disabled}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {value ? 'Cambiar archivo' : 'Seleccionar archivo'}
          </Button>
          
          {allowExternal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const url = prompt('Ingresa la URL del archivo:');
                if (url) {
                  onChange(url);
                }
              }}
              disabled={disabled}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Manual Input */}
        {allowManualInput && (
          <div>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={value && !isValidUrl(value) ? 'border-red-300' : ''}
            />
            {value && !isValidUrl(value) && (
              <p className="text-sm text-red-600 mt-1">
                URL inválida
              </p>
            )}
          </div>
        )}
      </div>

      {/* Usage Tips */}
      {!value && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Opciones:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Media Manager:</strong> Sube nuevos archivos o selecciona existentes</li>
            {allowExternal && <li>• <strong>URL Externa:</strong> Usa archivos desde otros sitios</li>}
            {allowManualInput && <li>• <strong>Manual:</strong> Escribe la ruta del archivo directamente</li>}
          </ul>
        </div>
      )}

      {/* Media Manager Modal */}
      <MediaManager
        {...mediaManager.mediaManagerProps}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};

export default MediaPickerField;