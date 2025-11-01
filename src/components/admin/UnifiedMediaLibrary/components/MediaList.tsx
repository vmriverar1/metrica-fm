/**
 * MediaList Component
 * List view for media items (table format)
 */

'use client';

import React from 'react';
import { Check, Eye } from 'lucide-react';
import Image from 'next/image';
import type { MediaListProps } from '../types';

export const MediaList: React.FC<MediaListProps> = ({
  images,
  selected,
  onSelect,
  onPreview,
  multiSelect,
}) => {
  if (images.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <p className="text-muted-foreground text-lg mb-2">
            No se encontraron imágenes
          </p>
          <p className="text-sm text-muted-foreground">
            Intenta ajustar los filtros o sube nuevas imágenes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {multiSelect && <th className="w-12 p-2"></th>}
            <th className="w-16 p-2"></th>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2 hidden md:table-cell">Tipo</th>
            <th className="text-left p-2 hidden lg:table-cell">Tamaño</th>
            <th className="text-left p-2 hidden xl:table-cell">Fecha</th>
            <th className="w-12 p-2"></th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => {
            const isSelected = selected.has(image.id);

            return (
              <tr
                key={image.id}
                className={`
                  border-b cursor-pointer hover:bg-gray-50 transition-colors
                  ${isSelected ? 'bg-primary/5' : ''}
                `}
                onClick={() => onSelect(image)}
              >
                {/* Checkbox */}
                {multiSelect && (
                  <td className="p-2">
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </td>
                )}

                {/* Thumbnail */}
                <td className="p-2">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </td>

                {/* Name */}
                <td className="p-2">
                  <p className="font-medium text-sm truncate max-w-xs" title={image.name}>
                    {image.name}
                  </p>
                  {image.folder && (
                    <p className="text-xs text-muted-foreground">
                      📁 {image.folder}
                    </p>
                  )}
                </td>

                {/* Type */}
                <td className="p-2 hidden md:table-cell">
                  <span className="text-sm uppercase text-muted-foreground">
                    {image.type}
                  </span>
                </td>

                {/* Size */}
                <td className="p-2 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(image.size)}
                  </span>
                </td>

                {/* Date */}
                <td className="p-2 hidden xl:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(image.lastModified)}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-2">
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(image);
                    }}
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Helper functions
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
    month: 'short',
    day: 'numeric',
  });
}
