'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import ProjectCard from './ProjectCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grid3X3, LayoutGrid, List, ChevronDown, Maximize } from 'lucide-react';
import { ProjectCategory } from '@/types/portfolio';

type ViewMode = 'grid' | 'masonry' | 'list';
type GridSize = 'compact' | 'comfortable' | 'spacious';

interface ResponsiveGridProps {
  className?: string;
}

export default function ResponsiveGrid({ className }: ResponsiveGridProps) {
  const { filteredProjects, filters, filterByCategory } = usePortfolio();
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

  // Get view mode configuration
  const getViewModeConfig = (mode: ViewMode) => {
    switch (mode) {
      case 'grid':
        return { icon: <LayoutGrid className="w-4 h-4" />, label: 'Cuadrícula' };
      case 'masonry':
        return { icon: <Grid3X3 className="w-4 h-4" />, label: 'Mosaico' };
      case 'list':
        return { icon: <List className="w-4 h-4" />, label: 'Lista' };
      default:
        return { icon: <LayoutGrid className="w-4 h-4" />, label: 'Cuadrícula' };
    }
  };

  // Get grid size configuration
  const getGridSizeConfig = (size: GridSize) => {
    switch (size) {
      case 'compact':
        return { icon: <Maximize className="w-4 h-4 scale-75" />, label: 'Compacto' };
      case 'comfortable':
        return { icon: <Maximize className="w-4 h-4" />, label: 'Cómodo' };
      case 'spacious':
        return { icon: <Maximize className="w-4 h-4 scale-125" />, label: 'Espacioso' };
      default:
        return { icon: <Maximize className="w-4 h-4" />, label: 'Cómodo' };
    }
  };

  // Render controls for non-mobile devices
  const renderControls = () => {
    if (deviceType === 'mobile') return null;

    const currentViewMode = getViewModeConfig(viewMode);
    const currentGridSize = getGridSizeConfig(gridSize);

    // Configuración de categorías
    const categories = [
      { value: 'all', label: 'Todos' },
      { value: ProjectCategory.OFICINA, label: 'Oficina' },
      { value: ProjectCategory.RETAIL, label: 'Retail' },
      { value: ProjectCategory.INDUSTRIA, label: 'Industria' },
      { value: ProjectCategory.HOTELERIA, label: 'Hotelería' },
      { value: ProjectCategory.EDUCACION, label: 'Educación' },
      { value: ProjectCategory.VIVIENDA, label: 'Vivienda' },
      { value: ProjectCategory.SALUD, label: 'Salud' }
    ];

    return (
      <div className="flex items-center justify-between gap-6 mb-6">
        {/* Categorías a la izquierda */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={filters.category === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => filterByCategory(category.value as ProjectCategory | 'all')}
              className="text-sm"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Controles de vista a la derecha */}
        <div className="flex items-center gap-3">
        {/* View Mode Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {currentViewMode.icon}
              {currentViewMode.label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {(['grid', 'masonry', 'list'] as ViewMode[]).map((mode) => {
              const config = getViewModeConfig(mode);
              return (
                <DropdownMenuItem
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    viewMode === mode && "bg-primary/10"
                  )}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Grid Size Dropdown - Only show for grid and list modes */}
        {viewMode !== 'masonry' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                {currentGridSize.icon}
                {currentGridSize.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(['compact', 'comfortable', 'spacious'] as GridSize[]).map((size) => {
                const config = getGridSizeConfig(size);
                return (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      gridSize === size && "bg-primary/10"
                    )}
                  >
                    {config.icon}
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
      </div>
    );
  };

  // Render projects based on view mode
  const renderProjects = () => {
    switch (viewMode) {
      case 'masonry':
        return (
          <div className={cn('masonry', gridConfig.masonry, gridConfig.gap)}>
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="break-inside-avoid mb-4">
                <ProjectCard
                  title={project.title}
                  location={`${project.location.city}, ${project.location.region}`}
                  type={project.category}
                  image={project.featuredImage}
                  slug={project.slug}
                  area={project.details.area}
                  year={project.completedAt.getFullYear()}
                  priority={index < 4}
                  index={index}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={cn('flex flex-col', gridConfig.list)}>
            {filteredProjects.map((project, index) => (
              <div key={project.id}>
                <ProjectCard
                  title={project.title}
                  location={`${project.location.city}, ${project.location.region}`}
                  type={project.category}
                  image={project.featuredImage}
                  slug={project.slug}
                  area={project.details.area}
                  year={project.completedAt.getFullYear()}
                  priority={index < 4}
                  index={index}
                  className="aspect-[3/1] md:aspect-[4/1]"
                />
              </div>
            ))}
          </div>
        );

      default: // grid
        return (
          <div className={cn('grid', gridConfig.grid, gridConfig.gap)}>
            {filteredProjects.map((project, index) => (
              <div key={project.id}>
                <ProjectCard
                  title={project.title}
                  location={`${project.location.city}, ${project.location.region}`}
                  type={project.category}
                  image={project.featuredImage}
                  slug={project.slug}
                  area={project.details.area}
                  year={project.completedAt.getFullYear()}
                  priority={index < 4}
                  index={index}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <section className={cn("py-16 px-4", className)}>
      <div className="container mx-auto">
        {renderControls()}
        
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron proyectos
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Intenta ajustar los filtros para ver más proyectos o explora 
              diferentes categorías y ubicaciones.
            </p>
          </div>
        ) : (
          renderProjects()
        )}
      </div>
    </section>
  );
}

// CSS for masonry layout
const masonryStyles = `
  .masonry {
    column-fill: balance;
    orphans: 1;
  }
  
  .masonry > * {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  @supports (grid-template-rows: masonry) {
    .masonry {
      display: grid;
      grid-template-rows: masonry;
      align-tracks: start;
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('masonry-styles')) {
  const style = document.createElement('style');
  style.id = 'masonry-styles';
  style.textContent = masonryStyles;
  document.head.appendChild(style);
}