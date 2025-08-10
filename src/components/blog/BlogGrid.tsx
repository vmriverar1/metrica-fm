'use client';

import React, { useState, useEffect } from 'react';
import { useBlog } from '@/contexts/BlogContext';
import ArticleCard from './ArticleCard';
import { cn } from '@/lib/utils';
import { Grid, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'masonry' | 'list';
type GridSize = 'compact' | 'comfortable' | 'spacious';

interface BlogGridProps {
  className?: string;
}

export default function BlogGrid({ className }: BlogGridProps) {
  const { filteredPosts } = useBlog();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridSize, setGridSize] = useState<GridSize>('comfortable');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect device type
  useEffect(() => {
    const updateDeviceType = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
        setViewMode('list'); // Force list view on mobile
      } else if (width < 1200) {
        setDeviceType('tablet');
        setViewMode('grid'); // Prefer grid on tablet
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDeviceType);
      return () => window.removeEventListener('resize', updateDeviceType);
    }
  }, []);

  // Grid configurations for different devices and sizes
  const getGridConfig = () => {
    const configs = {
      mobile: {
        grid: 'grid-cols-1',
        gap: 'gap-4',
        masonry: 'columns-1',
        list: 'space-y-4'
      },
      tablet: {
        compact: {
          grid: 'grid-cols-3',
          gap: 'gap-3',
          masonry: 'columns-2',
          list: 'space-y-3'
        },
        comfortable: {
          grid: 'grid-cols-2',
          gap: 'gap-6',
          masonry: 'columns-2',
          list: 'space-y-6'
        },
        spacious: {
          grid: 'grid-cols-2',
          gap: 'gap-8',
          masonry: 'columns-2',
          list: 'space-y-8'
        }
      },
      desktop: {
        compact: {
          grid: 'grid-cols-4',
          gap: 'gap-4',
          masonry: 'columns-3',
          list: 'space-y-4'
        },
        comfortable: {
          grid: 'grid-cols-3',
          gap: 'gap-6',
          masonry: 'columns-3',
          list: 'space-y-6'
        },
        spacious: {
          grid: 'grid-cols-2',
          gap: 'gap-8',
          masonry: 'columns-2',
          list: 'space-y-8'
        }
      }
    };

    if (deviceType === 'mobile') {
      return configs.mobile;
    }

    return configs[deviceType][gridSize];
  };

  const gridConfig = getGridConfig();

  if (!filteredPosts.length) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}>
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
          <Grid className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No se encontraron artículos
        </h3>
        <p className="text-muted-foreground max-w-md">
          No hay artículos que coincidan con los filtros actuales. 
          Intenta ajustar los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* View mode controls - Hidden on mobile */}
      {deviceType !== 'mobile' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'artículo' : 'artículos'}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('masonry')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Grid container */}
      <div
        className={cn(
          "w-full transition-all duration-300",
          viewMode === 'grid' && `grid ${gridConfig.grid} ${gridConfig.gap}`,
          viewMode === 'masonry' && `${gridConfig.masonry} ${gridConfig.gap}`,
          viewMode === 'list' && gridConfig.list
        )}
      >
        {filteredPosts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "break-inside-avoid",
              viewMode === 'masonry' && "mb-6"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards',
              opacity: 0
            }}
          >
            <ArticleCard
              post={post}
              viewMode={viewMode}
              size={gridSize}
              priority={index < 6} // Prioritize first 6 images
            />
          </div>
        ))}
      </div>

      {/* Load more functionality placeholder */}
      {filteredPosts.length >= 9 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline">
            Cargar más artículos
          </Button>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}