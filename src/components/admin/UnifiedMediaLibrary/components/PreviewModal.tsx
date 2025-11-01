/**
 * PreviewModal Component
 * Modal for previewing images with details
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { PreviewModalProps } from '../types';

export const PreviewModal: React.FC<PreviewModalProps> = ({
  image,
  isOpen,
  onClose,
}) => {
  if (!image) return null;

  const handleDownload = () => {
    window.open(image.url, '_blank');
  };

  const handleOpenInNewTab = () => {
    window.open(image.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">{image.name}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-contain"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        {/* Image Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Tipo</p>
            <p className="font-medium uppercase">{image.type}</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">Tamaño</p>
            <p className="font-medium">{formatFileSize(image.size)}</p>
          </div>

          {image.dimensions && (
            <div>
              <p className="text-muted-foreground mb-1">Dimensiones</p>
              <p className="font-medium">
                {image.dimensions.width} × {image.dimensions.height}
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-1">Última modificación</p>
            <p className="font-medium">{formatDate(image.lastModified)}</p>
          </div>

          {image.folder && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Carpeta</p>
              <p className="font-medium">📁 {image.folder}</p>
            </div>
          )}

          <div className="col-span-2 md:col-span-4">
            <p className="text-muted-foreground mb-1">Ruta</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded truncate">
              {image.path}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helpers
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
