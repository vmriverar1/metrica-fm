'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { BlogPost, getBlogCategoryLabel } from '@/types/blog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  post: BlogPost;
  viewMode?: 'grid' | 'masonry' | 'list';
  size?: 'compact' | 'comfortable' | 'spacious';
  priority?: boolean;
  className?: string;
}

export default function ArticleCard({ 
  post, 
  viewMode = 'grid',
  size = 'comfortable',
  priority = false,
  className 
}: ArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use requestAnimationFrame to throttle updates
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calcular offset del mouse desde el centro
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Limitar el efecto magnético a un rango suave
      const maxOffset = 8;
      const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (mouseX / rect.width) * maxOffset));
      const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (mouseY / rect.height) * maxOffset));
      
      setMousePosition({ x: offsetX, y: offsetY });
    });
  }, []);

  // Get category colors (blog theme)
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'industria-tendencias': 'text-blue-600',
      'casos-estudio': 'text-green-600',
      'guias-tecnicas': 'text-purple-600',
      'liderazgo-vision': 'text-orange-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const getCategoryBgColor = (category: string) => {
    const colors: Record<string, string> = {
      'industria-tendencias': 'bg-blue-100 text-blue-800',
      'casos-estudio': 'bg-green-100 text-green-800',
      'guias-tecnicas': 'bg-purple-100 text-purple-800',
      'liderazgo-vision': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // List view rendering
  if (viewMode === 'list') {
    return (
      <Link href={`/blog/${post.category}/${post.slug}`}>
        <div
          ref={cardRef}
          className={cn(
            "group flex gap-6 p-6 bg-card border border-border rounded-xl",
            "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
            "cursor-pointer",
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
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={priority}
              sizes="192px"
            />
            {post.featured && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  Destacado
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Badge className={getCategoryBgColor(post.category)}>
                {getBlogCategoryLabel(post.category)}
              </Badge>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid/Masonry view rendering
  return (
    <Link href={`/blog/${post.category}/${post.slug}`}>
      <div
        ref={cardRef}
        className={cn(
          "group relative bg-card border border-border rounded-xl overflow-hidden",
          "hover:shadow-xl hover:border-primary/20 transition-all duration-500",
          "cursor-pointer transform-gpu",
          size === 'compact' && "h-80",
          size === 'comfortable' && "h-96",
          size === 'spacious' && "h-[28rem]",
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
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs">
                Destacado
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={getCategoryBgColor(post.category)}>
              {getBlogCategoryLabel(post.category)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2",
              size === 'compact' && "text-lg",
              size === 'comfortable' && "text-xl",
              size === 'spacious' && "text-xl"
            )}>
              {post.title}
            </h3>
            
            <p className={cn(
              "text-muted-foreground line-clamp-3",
              size === 'compact' && "text-sm",
              size === 'comfortable' && "text-base",
              size === 'spacious' && "text-base"
            )}>
              {post.excerpt}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author.name}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </div>
              {post.views && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {post.views.toLocaleString()} vistas
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect Glow */}
        <div 
          className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </Link>
  );
}