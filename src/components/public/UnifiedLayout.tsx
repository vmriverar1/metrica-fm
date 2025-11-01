/**
 * UnifiedLayout - Layout genérico para páginas públicas de todos los sistemas
 * Proporciona estructura común, navegación y SEO
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  MoreHorizontal,
  Home,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SystemType } from '@/hooks/useUnifiedData';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface UnifiedLayoutProps {
  children: ReactNode;
  system: SystemType;

  // Page metadata
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  tags?: string[];

  // Layout options
  variant?: 'default' | 'article' | 'detail' | 'listing';
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;

  // Navigation
  showBackButton?: boolean;
  showBreadcrumbs?: boolean;
  breadcrumbs?: BreadcrumbItem[];

  // Actions
  showShareButton?: boolean;
  showBookmarkButton?: boolean;
  customActions?: ReactNode;

  // Styling
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

// System configuration
const SYSTEM_CONFIG = {
  newsletter: {
    name: 'Blog',
    basePath: '/blog',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '📰'
  },
  portfolio: {
    name: 'Portfolio',
    basePath: '/portfolio',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    icon: '🏗️'
  },
  careers: {
    name: 'Careers',
    basePath: '/careers',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '💼'
  }
} as const;

export default function UnifiedLayout({
  children,
  system,
  title,
  subtitle,
  description,
  category,
  tags = [],
  variant = 'default',
  sidebar,
  header,
  footer,
  showBackButton = true,
  showBreadcrumbs = true,
  breadcrumbs,
  showShareButton = true,
  showBookmarkButton = false,
  customActions,
  className,
  containerClassName,
  contentClassName,
  maxWidth = 'lg'
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const config = SYSTEM_CONFIG[system];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate breadcrumbs if not provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) return breadcrumbs;

    const pathSegments = pathname.split('/').filter(Boolean);
    const generatedBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', href: '/' },
      { label: config.name, href: config.basePath }
    ];

    // Add category if present
    if (category && pathSegments.length > 2) {
      generatedBreadcrumbs.push({
        label: category,
        href: `${config.basePath}/${pathSegments[2]}`
      });
    }

    // Add current page
    if (title) {
      generatedBreadcrumbs.push({
        label: title,
        active: true
      });
    }

    return generatedBreadcrumbs;
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: title || `${config.name} - Métrica`,
      text: description || subtitle,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Container max width classes
  const getMaxWidthClass = () => {
    const widthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'max-w-full'
    };
    return widthClasses[maxWidth];
  };

  const layoutClasses = cn(
    "min-h-screen bg-background",
    className
  );

  const containerClasses = cn(
    "container mx-auto px-4 py-8",
    getMaxWidthClass(),
    containerClassName
  );

  return (
    <div className={layoutClasses}>
      {/* Custom Header */}
      {header}

      <div className={containerClasses}>
        {/* Top Navigation Bar */}
        <div className={cn(
          "flex items-center justify-between mb-6 pb-4 border-b",
          "transition-all duration-300",
          isScrolled && "sticky top-0 bg-background/80 backdrop-blur-sm z-40 -mx-4 px-4"
        )}>
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            )}

            {/* System Badge */}
            <Badge className={cn("gap-1", config.bgColor, config.color)}>
              <span>{config.icon}</span>
              {config.name}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {customActions}

            {showBookmarkButton && (
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
            )}

            {showShareButton && (
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Guardar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              {getBreadcrumbs().map((breadcrumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-3 h-3" />}

                  {breadcrumb.href && !breadcrumb.active ? (
                    <Link
                      href={breadcrumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {index === 0 && <Home className="w-3 h-3 mr-1" />}
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className={cn(
                      breadcrumb.active && "text-foreground font-medium"
                    )}>
                      {breadcrumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Header */}
        {(title || subtitle || description || tags.length > 0) && (
          <header className={cn(
            "mb-8 space-y-4",
            variant === 'article' && "text-center max-w-3xl mx-auto",
            variant === 'detail' && "border-b pb-8"
          )}>
            {/* Category */}
            {category && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{category}</Badge>
              </div>
            )}

            {/* Title */}
            {title && (
              <h1 className={cn(
                "font-bold text-foreground leading-tight",
                variant === 'article' && "text-3xl md:text-4xl lg:text-5xl",
                variant === 'detail' && "text-2xl md:text-3xl",
                variant === 'listing' && "text-xl md:text-2xl",
                !variant && "text-2xl md:text-3xl"
              )}>
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                variant === 'article' && "text-lg md:text-xl",
                variant === 'detail' && "text-base md:text-lg",
                !variant && "text-base"
              )}>
                {subtitle}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex gap-8",
          !sidebar && "block",
          contentClassName
        )}>
          {/* Content */}
          <div className={cn(
            sidebar ? "flex-1" : "w-full",
            variant === 'article' && "max-w-none prose prose-lg max-w-3xl mx-auto"
          )}>
            {children}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <aside className="w-80 flex-shrink-0 space-y-6">
              {sidebar}
            </aside>
          )}
        </main>
      </div>

      {/* Custom Footer */}
      {footer}

      {/* Floating Back to Top Button */}
      {isScrolled && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </Button>
      )}
    </div>
  );
}

// Specialized layout variants
export function ArticleLayout(props: Omit<UnifiedLayoutProps, 'variant'>) {
  return <UnifiedLayout {...props} variant="article" />;
}

export function DetailLayout(props: Omit<UnifiedLayoutProps, 'variant'>) {
  return <UnifiedLayout {...props} variant="detail" />;
}

export function ListingLayout(props: Omit<UnifiedLayoutProps, 'variant'>) {
  return <UnifiedLayout {...props} variant="listing" />;
}