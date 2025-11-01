/**
 * StatsBar Component
 * Statistics bar showing total images, size, and type breakdown
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { StatsBarProps } from '../types';

export const StatsBar: React.FC<StatsBarProps> = ({
  totalImages,
  totalSize,
  selectedCount,
  typeBreakdown,
}) => {
  return (
    <div className="border-t px-4 py-2 bg-muted/30">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left side - Main stats */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-semibold">{totalImages}</span>
            <span className="text-muted-foreground ml-1">
              {totalImages === 1 ? 'imagen' : 'imágenes'}
            </span>
          </div>

          <div className="text-muted-foreground text-xs">
            {formatFileSize(totalSize)}
          </div>

          {selectedCount > 0 && (
            <div className="text-primary font-medium">
              {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Right side - Type breakdown */}
        {typeBreakdown && typeBreakdown.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {typeBreakdown.map(({ type, count }) => (
              <Badge key={type} variant="outline" className="text-xs py-0 h-5">
                {type.toUpperCase()}: {count}
              </Badge>
            ))}
          </div>
        )}
      </div>
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
