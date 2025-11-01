/**
 * MediaGrid Component
 * Grid view for media items
 */

'use client';

import React from 'react';
import { Check, Eye } from 'lucide-react';
import Image from 'next/image';
import type { MediaGridProps } from '../types';

export const MediaGrid: React.FC<MediaGridProps> = ({
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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 p-4 auto-rows-max">
      {images.map((image) => {
        const isSelected = selected.has(image.id);

        return (
          <div
            key={image.id}
            className={`
              relative group cursor-pointer border-2 rounded-lg overflow-hidden
              transition-all hover:shadow-md
              ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => onSelect(image)}
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative">
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  className="bg-white rounded-full p-2 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(image);
                  }}
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Selection indicator */}
              {(multiSelect || isSelected) && (
                <div
                  className={`
                    absolute top-2 right-2 w-6 h-6 rounded-full border-2
                    flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-primary border-primary' : 'bg-white/80 border-gray-300'}
                  `}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              )}
            </div>

            {/* Image info */}
            <div className="p-2 bg-white">
              <p className="text-xs font-medium truncate" title={image.name}>
                {image.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(image.size)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
