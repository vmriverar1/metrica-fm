'use client';

import React, { useState, useEffect } from 'react';
import { useCareers } from '@/contexts/CareersContext';
import JobCard from './JobCard';
import { cn } from '@/lib/utils';
import { Grid, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'masonry' | 'list';
type GridSize = 'compact' | 'comfortable' | 'spacious';

interface JobGridProps {
  className?: string;
}

export default function JobGrid({ className }: JobGridProps) {
  const { filteredJobs } = useCareers();
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

  if (!filteredJobs.length) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}>
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
          <Grid className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No se encontraron oportunidades
        </h3>
        <p className="text-muted-foreground max-w-md">
          No hay posiciones laborales que coincidan con los filtros actuales. 
          Intenta ajustar los criterios de búsqueda o revisa más tarde.
        </p>
        <Button className="mt-4" variant="outline">
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* View mode controls - Hidden on mobile */}
      {deviceType !== 'mobile' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'oportunidad' : 'oportunidades'} disponible{filteredJobs.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Grid size controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tamaño:</span>
              <select 
                value={gridSize}
                onChange={(e) => setGridSize(e.target.value as GridSize)}
                className="text-xs bg-background border border-border rounded px-2 py-1"
              >
                <option value="compact">Compacto</option>
                <option value="comfortable">Cómodo</option>
                <option value="spacious">Espacioso</option>
              </select>
            </div>

            {/* View mode buttons */}
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
        {filteredJobs.map((job, index) => (
          <div
            key={job.id}
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
            <JobCard
              job={job}
              viewMode={viewMode}
              size={gridSize}
              priority={index < 6} // Prioritize first 6 jobs
            />
          </div>
        ))}
      </div>

      {/* Load more functionality placeholder */}
      {filteredJobs.length >= 9 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline">
            Cargar más oportunidades
          </Button>
        </div>
      )}

      {/* Featured Jobs Section */}
      {filteredJobs.some(job => job.featured) && (
        <div className="border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Oportunidades Destacadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs
              .filter(job => job.featured)
              .slice(0, 3)
              .map((job) => (
                <JobCard
                  key={`featured-${job.id}`}
                  job={job}
                  viewMode="grid"
                  size="comfortable"
                  featured
                />
              ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-muted/30 rounded-xl p-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {filteredJobs.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Posiciones Abiertas
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {new Set(filteredJobs.map(job => job.category)).size}
            </div>
            <div className="text-sm text-muted-foreground">
              Áreas Profesionales
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {new Set(filteredJobs.map(job => job.location)).size}
            </div>
            <div className="text-sm text-muted-foreground">
              Ubicaciones
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {filteredJobs.filter(job => job.remote).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Trabajo Remoto
            </div>
          </div>
        </div>
      </div>

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