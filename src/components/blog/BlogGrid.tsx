'use client';

import React, { useState, useEffect } from 'react';
import { useBlog } from '@/contexts/BlogContext';
import ArticleCard from './ArticleCard';
import { cn } from '@/lib/utils';
import { Grid, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedLoading from '@/components/loading/OptimizedLoading';

type ViewMode = 'grid' | 'masonry' | 'list';
type GridSize = 'compact' | 'comfortable' | 'spacious';

interface BlogGridProps {
  className?: string;
}

export default function BlogGrid({ className }: BlogGridProps) {
  const { filteredPosts, allPosts, isLoading, error } = useBlog();

  // Debug logging
  console.log('BlogGrid Debug:', {
    filteredPosts: filteredPosts?.length || 0,
    allPosts: allPosts?.length || 0,
    isLoading,
    error,
    actualFilteredPosts: filteredPosts?.slice(0, 2) // Show first 2 for debugging
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridSize, setGridSize] = useState<GridSize>('comfortable');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9; // 9 posts per page for good grid layout

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

  // Pagination calculations
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPosts]);

  // Show loading spinner while loading
  if (isLoading) {
    return (
      <div className={cn(className)}>
        <OptimizedLoading
          type="blog"
          message="Cargando los últimos artículos del blog..."
          showProgress={true}
          estimatedTime={3}
        />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}>
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Grid className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Error al cargar artículos
        </h3>
        <p className="text-muted-foreground max-w-md">
          {error}
        </p>
      </div>
    );
  }

  // Show no articles message only when loading is complete and no articles found
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
            {totalPosts} {totalPosts === 1 ? 'artículo' : 'artículos'} {totalPages > 1 && `• Página ${currentPage} de ${totalPages}`}
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

      {/* Debug info when no posts */}
      {currentPosts.length === 0 && (
        <div className="col-span-full bg-yellow-100 border border-yellow-300 rounded-lg p-6 text-yellow-800">
          <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
          <p>• Total filteredPosts: {filteredPosts?.length || 0}</p>
          <p>• Total allPosts: {allPosts?.length || 0}</p>
          <p>• Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>• Error: {error || 'None'}</p>
          <p>• Current page: {currentPage}</p>
          <p>• Posts per page: {postsPerPage}</p>
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
        {currentPosts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "break-inside-avoid",
              viewMode === 'masonry' && "mb-6"
            )}
            style={{
              animationName: 'fadeInUp',
              animationDuration: '0.6s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${index * 50}ms`,
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8">
          {/* Page Info */}
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, totalPosts)} de {totalPosts} artículos
          </div>
          
          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and adjacent pages
                const showPage = 
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;
                
                if (!showPage) {
                  // Show ellipsis
                  if (page === 2 && currentPage > 4) {
                    return <span key={page} className="px-2 text-muted-foreground">...</span>;
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 3) {
                    return <span key={page} className="px-2 text-muted-foreground">...</span>;
                  }
                  return null;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
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