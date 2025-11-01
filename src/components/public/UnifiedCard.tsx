/**
 * UnifiedCard - Componente de tarjeta genérico para todos los sistemas
 * Compatible con Newsletter (articles), Portfolio (projects), y Careers (positions)
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, User, BookOpen, Briefcase,
  DollarSign, Building2, Star, ChevronRight, Ruler,
  Users, Badge as BadgeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SystemType } from '@/hooks/useUnifiedData';

// Tipos unificados para datos de entrada
export interface UnifiedCardData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  short_description?: string;
  image?: string;
  featuredImage?: string;
  category: string;
  featured?: boolean;

  // Campos específicos por sistema
  // Newsletter/Blog
  author?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  publishedAt?: Date;
  readingTime?: number;
  views?: number;
  tags?: string[];

  // Portfolio
  location?: {
    city: string;
    country?: string;
  };
  year?: number;
  area?: string;
  type?: string;

  // Careers
  department?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType?: string;
  remote?: boolean;
  hybrid?: boolean;
  urgent?: boolean;
  postedDate?: Date;
  requirements?: {
    essential: string[];
    desirable?: string[];
  };
}

export interface UnifiedCardProps {
  data: UnifiedCardData;
  system: SystemType;
  variant?: 'card' | 'list' | 'compact';
  size?: 'small' | 'medium' | 'large';
  priority?: boolean;
  className?: string;
  onHover?: (hovered: boolean) => void;
}

/**
 * Configuraciones específicas por sistema
 */
const SYSTEM_CONFIG = {
  newsletter: {
    basePath: '/blog',
    categoryPath: true,
    defaultImage: '📰',
    colorScheme: {
      primary: 'text-blue-600',
      bg: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  },
  portfolio: {
    basePath: '/portfolio',
    categoryPath: true,
    defaultImage: '🏗️',
    colorScheme: {
      primary: 'text-cyan-600',
      bg: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
  },
  careers: {
    basePath: '/careers',
    categoryPath: false,
    defaultImage: '💼',
    colorScheme: {
      primary: 'text-green-600',
      bg: 'bg-green-100 text-green-800 border-green-200'
    }
  }
} as const;

/**
 * Helper functions for categorization and formatting
 */
const getCategoryLabel = (system: SystemType, category: string): string => {
  const categoryMaps = {
    newsletter: {
      'industria-tendencias': 'Tendencias',
      'casos-estudio': 'Casos de Estudio',
      'guias-tecnicas': 'Guías Técnicas',
      'liderazgo-vision': 'Liderazgo'
    },
    portfolio: {
      'residential': 'Residencial',
      'commercial': 'Comercial',
      'industrial': 'Industrial',
      'public': 'Público'
    },
    careers: {
      'gestion-direccion': 'Gestión',
      'ingenieria-tecnica': 'Ingeniería',
      'arquitectura-diseño': 'Arquitectura',
      'operaciones-control': 'Operaciones',
      'administracion-finanzas': 'Administración'
    }
  };

  return categoryMaps[system]?.[category as keyof typeof categoryMaps[typeof system]] || category;
};

const getCategoryColor = (system: SystemType, category: string): string => {
  const colorMaps = {
    newsletter: {
      'industria-tendencias': 'bg-blue-100 text-blue-800',
      'casos-estudio': 'bg-green-100 text-green-800',
      'guias-tecnicas': 'bg-purple-100 text-purple-800',
      'liderazgo-vision': 'bg-cyan-100 text-cyan-800'
    },
    portfolio: {
      'residential': 'bg-emerald-100 text-emerald-800',
      'commercial': 'bg-blue-100 text-blue-800',
      'industrial': 'bg-cyan-100 text-cyan-800',
      'public': 'bg-purple-100 text-purple-800'
    },
    careers: {
      'gestion-direccion': 'bg-blue-100 text-blue-800',
      'ingenieria-tecnica': 'bg-green-100 text-green-800',
      'arquitectura-diseño': 'bg-purple-100 text-purple-800',
      'operaciones-control': 'bg-cyan-100 text-cyan-800',
      'administracion-finanzas': 'bg-red-100 text-red-800'
    }
  };

  return colorMaps[system]?.[category as keyof typeof colorMaps[typeof system]] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatSalary = (min: number, max: number, currency = 'S/'): string => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };
  return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
};

/**
 * Componente principal UnifiedCard
 */
export default function UnifiedCard({
  data,
  system,
  variant = 'card',
  size = 'medium',
  priority = false,
  className,
  onHover
}: UnifiedCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const config = SYSTEM_CONFIG[system];

  // Build URL based on system configuration
  const buildUrl = () => {
    const { basePath, categoryPath } = config;
    if (categoryPath) {
      return `${basePath}/${data.category}/${data.slug}`;
    }
    return `${basePath}/${data.slug}`;
  };

  // Get main image source
  const getImageSrc = () => {
    return data.image || data.featuredImage || '';
  };

  // Get description text
  const getDescription = () => {
    return data.description || data.excerpt || data.short_description || '';
  };

  // Mouse handlers with performance optimization
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover?.(true);
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    onHover?.(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [onHover]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const maxOffset = variant === 'compact' ? 4 : 6;
      const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (mouseX / rect.width) * maxOffset));
      const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (mouseY / rect.height) * maxOffset));

      setMousePosition({ x: offsetX, y: offsetY });
    });
  }, [variant]);

  // Render metadata specific to each system
  const renderMetadata = () => {
    switch (system) {
      case 'newsletter':
        return (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {data.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="truncate">{data.author.name}</span>
              </div>
            )}
            {data.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(data.publishedAt)}</span>
              </div>
            )}
            {data.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{data.readingTime} min</span>
              </div>
            )}
            {data.views && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{data.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        );

      case 'portfolio':
        return (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{data.location.city}</span>
              </div>
            )}
            {data.year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{data.year}</span>
              </div>
            )}
            {data.area && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                <span>{data.area}</span>
              </div>
            )}
          </div>
        );

      case 'careers':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {data.department && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">{data.department}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{data.location.city}</span>
                </div>
              )}
              {data.employmentType && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{data.employmentType}</span>
                </div>
              )}
            </div>
            {data.salary && (
              <div className="flex items-center gap-1 text-primary font-medium">
                <DollarSign className="w-4 h-4" />
                <span>{formatSalary(data.salary.min, data.salary.max, data.salary.currency)}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Render badges
  const renderBadges = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={getCategoryColor(system, data.category)}>
        {getCategoryLabel(system, data.category)}
      </Badge>

      {data.featured && (
        <Badge variant="secondary" className="text-xs">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Destacado
        </Badge>
      )}

      {/* System-specific badges */}
      {system === 'careers' && (
        <>
          {data.remote && (
            <Badge variant="outline" className="text-xs">
              Remoto
            </Badge>
          )}
          {data.urgent && (
            <Badge variant="destructive" className="text-xs">
              Urgente
            </Badge>
          )}
        </>
      )}
    </div>
  );

  // List variant
  if (variant === 'list') {
    return (
      <Link href={buildUrl()} className="block">
        <div
          ref={cardRef}
          className={cn(
            "group flex gap-6 p-6 bg-card border border-border rounded-xl",
            "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
            "cursor-pointer",
            data.featured && "ring-2 ring-primary/20 ring-offset-2",
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          {/* Image */}
          <div className="flex-shrink-0 w-48 h-32 relative overflow-hidden rounded-lg">
            {getImageSrc() ? (
              <Image
                src={getImageSrc()}
                alt={data.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={priority}
                sizes="192px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="text-2xl mb-2">{config.defaultImage}</div>
                  <div className="text-xs">Sin imagen</div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              {renderBadges()}

              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {data.title}
              </h3>

              <p className="text-muted-foreground line-clamp-2">
                {getDescription()}
              </p>
            </div>

            {renderMetadata()}
          </div>

          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  // Card variant (default) and compact
  return (
    <Link href={buildUrl()} className="block h-full">
      <div
        ref={cardRef}
        className={cn(
          "group relative bg-card border border-border rounded-xl overflow-hidden",
          "hover:shadow-xl hover:border-primary/20 transition-all duration-500",
          "cursor-pointer transform-gpu flex flex-col h-full",
          data.featured && "ring-2 ring-primary/20 ring-offset-2",
          variant === 'compact' && "h-80",
          size === 'small' && "max-w-sm",
          size === 'large' && "max-w-lg",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${isHovered ? 1.02 : 1})`
        }}
      >
        {/* Image Container */}
        <div className={cn(
          "relative overflow-hidden flex-shrink-0",
          variant === 'compact' ? "h-32" : "h-44"
        )}>
          {getImageSrc() ? (
            <Image
              src={getImageSrc()}
              alt={data.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-3xl mb-2">{config.defaultImage}</div>
                <div className="text-sm">Sin imagen disponible</div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-3 flex-1">
            {renderBadges()}

            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2",
              variant === 'compact' ? "text-lg" : "text-xl"
            )}>
              {data.title}
            </h3>

            <p className={cn(
              "text-muted-foreground flex-1",
              variant === 'compact' ? "text-sm line-clamp-2" : "text-base line-clamp-3"
            )}>
              {getDescription()}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            {renderMetadata()}
          </div>
        </div>

        {/* Hover Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </Link>
  );
}