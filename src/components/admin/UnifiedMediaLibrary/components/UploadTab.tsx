/**
 * UploadTab Component
 * Upload tab with drag & drop and settings
 */

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, X, FileImage, Loader2 } from 'lucide-react';
import type { UploadTabProps } from '../types';

export const UploadTab: React.FC<UploadTabProps> = ({
  onUpload,
  uploading,
  acceptedTypes,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    // Filter by accepted types
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return acceptedTypes.includes(extension);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;

    await onUpload(selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-auto">
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UploadIcon className="w-8 h-8 text-primary" />
          </div>

          <div>
            <p className="text-lg font-semibold mb-2">
              Arrastra archivos aquí
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              o
            </p>
            <Button type="button" variant="outline">
              Seleccionar archivos
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Soporta: {acceptedTypes.map(t => t.toUpperCase()).join(', ')}
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.map(t => `.${t}`).join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">
            Archivos seleccionados ({selectedFiles.length})
          </h3>

          <div className="space-y-2 max-h-48 overflow-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileImage className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUploadClick}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Subir {selectedFiles.length} {selectedFiles.length === 1 ? 'archivo' : 'archivos'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
