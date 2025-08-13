'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  Star,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';
import { JobPosting, getJobCategoryLabel, getJobTypeLabel } from '@/types/careers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: JobPosting;
  viewMode?: 'grid' | 'masonry' | 'list';
  size?: 'compact' | 'comfortable' | 'spacious';
  priority?: boolean;
  featured?: boolean;
  className?: string;
}

export default function JobCard({ 
  job, 
  viewMode = 'grid',
  size = 'comfortable',
  priority = false,
  featured = false,
  className 
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse offset from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Limit magnetic effect to a smooth range
    const maxOffset = 4;
    const offsetX = (mouseX / rect.width) * maxOffset;
    const offsetY = (mouseY / rect.height) * maxOffset;
    
    setMousePosition({ x: offsetX, y: offsetY });
  };

  // Get category colors (careers theme)
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'gestion': 'text-blue-600',
      'ingenieria': 'text-green-600',
      'arquitectura': 'text-purple-600',
      'operaciones': 'text-orange-600',
      'administracion': 'text-red-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const getCategoryBgColor = (category: string) => {
    const colors: Record<string, string> = {
      'gestion': 'bg-blue-100 text-blue-800 border-blue-200',
      'ingenieria': 'bg-green-100 text-green-800 border-green-200',
      'arquitectura': 'bg-purple-100 text-purple-800 border-purple-200',
      'operaciones': 'bg-orange-100 text-orange-800 border-orange-200',
      'administracion': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
      }
      return num.toString();
    };
    return `S/ ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const formatDate = (date: Date) => {
    // Use fixed format to avoid hydration mismatch
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // List view rendering
  if (viewMode === 'list') {
    return (
      <Link href={`/careers/job/${job.id}`} className="block">
        <div
          ref={cardRef}
          className={cn(
            "group flex gap-6 p-6 bg-card border border-border rounded-xl",
            "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
            "cursor-pointer",
            featured && "ring-2 ring-primary/20 ring-offset-2",
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
        {/* Left Side - Main Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryBgColor(job.category)}>
                  {getJobCategoryLabel(job.category)}
                </Badge>
                {job.featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Destacado
                  </Badge>
                )}
                {job.remote && (
                  <Badge variant="outline" className="text-xs">
                    Remoto
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              
              <p className="text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            </div>
            
            {job.salary && (
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold text-primary">
                  {formatSalary(job.salary.min, job.salary.max)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {job.salary.currency} mensual
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {job.department}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location.city}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {getJobTypeLabel(job.type)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(job.postedAt)}
            </div>
          </div>

          {/* Requirements preview */}
          {job.requirements.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Requisitos: </span>
              <span className="text-foreground">
                {job.requirements.slice(0, 2).map(req => req.title).join(', ')}
                {job.requirements.length > 2 && `, +${job.requirements.length - 2} más`}
              </span>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-xs text-muted-foreground">
            {job.urgency === 'urgent' && (
              <Badge variant="destructive" className="text-xs mb-2">
                Urgente
              </Badge>
            )}
          </div>
          
          <Button className="group-hover:bg-primary group-hover:text-white transition-colors">
            Ver Detalles
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
      </Link>
    );
  }

  // Grid/Masonry view rendering
  return (
    <Link href={`/careers/job/${job.id}`} className="block h-full">
      <div
        ref={cardRef}
        className={cn(
          "group relative bg-card border border-border rounded-xl overflow-hidden",
          "hover:shadow-xl hover:border-primary/20 transition-all duration-500",
          "cursor-pointer transform-gpu flex flex-col h-full",
          featured && "ring-2 ring-primary/20 ring-offset-2",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${isHovered ? 1.02 : 1})`
        }}
      >
      {/* Header Section */}
      <div className="p-6 space-y-4 flex-shrink-0">
        {/* Badges */}
        <div className="flex items-center justify-between">
          <Badge className={getCategoryBgColor(job.category)}>
            {getJobCategoryLabel(job.category)}
          </Badge>
          <div className="flex items-center gap-2">
            {job.featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {job.remote && (
              <Badge variant="outline" className="text-xs">
                Remoto
              </Badge>
            )}
            {job.urgency === 'urgent' && (
              <Badge variant="destructive" className="text-xs">
                Urgente
              </Badge>
            )}
          </div>
        </div>

        {/* Job Title */}
        <div>
          <h3 className={cn(
            "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2",
            size === 'compact' && "text-lg",
            size === 'comfortable' && "text-xl",
            size === 'spacious' && "text-xl"
          )}>
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {job.department}
          </p>
        </div>

        {/* Description */}
        <p className={cn(
          "text-muted-foreground",
          size === 'compact' && "text-sm line-clamp-2",
          size === 'comfortable' && "text-base line-clamp-3", 
          size === 'spacious' && "text-base line-clamp-4"
        )}>
          {job.description}
        </p>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-4 space-y-4 flex-1">
        {/* Salary */}
        {job.salary && (
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-1 text-primary mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Salario</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {formatSalary(job.salary.min, job.salary.max)}
            </div>
            <div className="text-xs text-muted-foreground">
              {job.salary.currency} mensual
            </div>
          </div>
        )}

        {/* Key Requirements */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Requisitos clave:
          </h4>
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req.title}
              </Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.requirements.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-6 border-t border-border space-y-4 flex-shrink-0 mt-auto">
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location.city}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {getJobTypeLabel(job.type)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(job.postedAt)}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
          Ver Detalles y Aplicar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
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