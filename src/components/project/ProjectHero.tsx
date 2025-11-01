'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Ruler, Building, Users, Award, DollarSign, Clock } from 'lucide-react';
import { Project, getCategoryLabel, getCategoryColor, getCategoryBgColor } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface ProjectHeroProps {
  project: Project;
}

// Helper function to check if a value exists and is not empty
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmedValue = value.trim().toLowerCase();
    // Check if empty or contains placeholder text
    if (trimmedValue === '') return false;
    if (trimmedValue.includes('no especificad')) return false;
    if (trimmedValue.includes('no disponible')) return false;
    if (trimmedValue.includes('sin especificar')) return false;
    if (trimmedValue === 'n/a') return false;
    return true;
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export default function ProjectHero({ project }: ProjectHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = (project.title || '').split(' ').filter(word => word.trim() !== '');
  const hasTitle = hasValue(project.title);

  // Build metadata items dynamically - only show fields that have data
  const metadataItems = [
    {
      icon: MapPin,
      label: 'Ubicación',
      value: project.location?.city,
      show: hasValue(project.location?.city)
    },
    {
      icon: Calendar,
      label: 'Año',
      value: project.completedAt ? project.completedAt.getFullYear().toString() : null,
      show: hasValue(project.completedAt)
    },
    {
      icon: Ruler,
      label: 'Área',
      value: project.details?.area,
      show: hasValue(project.details?.area)
    },
    {
      icon: Building,
      label: 'Cliente',
      value: project.details?.client,
      show: hasValue(project.details?.client)
    },
    {
      icon: DollarSign,
      label: 'Inversión',
      value: project.details?.investment,
      show: hasValue(project.details?.investment)
    },
    {
      icon: Clock,
      label: 'Duración',
      value: project.details?.duration,
      show: hasValue(project.details?.duration)
    },
    {
      icon: Users,
      label: 'Equipo',
      value: project.details?.team && Array.isArray(project.details.team)
        ? project.details.team.join(', ')
        : null,
      show: hasValue(project.details?.team)
    }
  ].filter(item => item.show); // Only keep items that should be shown

  // Check if featured image exists
  const hasFeaturedImage = hasValue(project.featuredImage);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0">
        {hasFeaturedImage ? (
          <motion.div
            className="absolute inset-0 scale-110"
            animate={{
              scale: [1.1, 1.15, 1.1],
              transformOrigin: ['center center', 'top right', 'bottom left', 'center center']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          >
            <Image
              src={project.featuredImage}
              alt={project.title || 'Proyecto'}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </motion.div>
        ) : (
          // Fallback gradient if no image
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80" />
        )}
        
        {/* Parallax overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />
        
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end">
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl">
            {/* Category badge - Only show if category exists */}
            {hasValue(project.category) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <span className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                  "backdrop-blur-sm border border-white/20 text-white",
                  getCategoryBgColor(project.category)
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    project.category === 'oficina' ? 'bg-blue-400' :
                    project.category === 'retail' ? 'bg-cyan-400' :
                    project.category === 'industria' ? 'bg-gray-400' :
                    project.category === 'hoteleria' ? 'bg-purple-400' :
                    project.category === 'educacion' ? 'bg-green-400' :
                    project.category === 'vivienda' ? 'bg-yellow-400' :
                    'bg-red-400'
                  )} />
                  {getCategoryLabel(project.category)}
                </span>
              </motion.div>
            )}

            {/* Title with word-by-word reveal - Only show if exists */}
            {hasTitle && words.length > 0 && (
              <div className="mb-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  {words.map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 50, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className="inline-block mr-4"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>
              </div>
            )}

            {/* Project metadata - Dynamic grid based on available data */}
            {metadataItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className={cn(
                  "grid gap-6 mb-8",
                  metadataItems.length === 1 && "grid-cols-1",
                  metadataItems.length === 2 && "grid-cols-1 md:grid-cols-2",
                  metadataItems.length === 3 && "grid-cols-1 md:grid-cols-3",
                  metadataItems.length >= 4 && "grid-cols-2 md:grid-cols-4"
                )}
              >
                {metadataItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 + (index * 0.1) }}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">{item.label}</div>
                        <div className="font-medium text-sm">{item.value}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Description - Only show if exists */}
            {hasValue(project.description) && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed mb-8"
              >
                {project.description}
              </motion.p>
            )}

            {/* Tags - Only show if exists */}
            {hasValue(project.tags) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex flex-wrap gap-2"
              >
                {project.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      "bg-white/10 text-white/80 backdrop-blur-sm border border-white/20",
                      "hover:bg-white/20 transition-colors duration-300"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/70 text-sm font-alliance-medium tracking-wider">DESLIZA</span>
          <motion.svg 
            className="w-6 h-6 text-white/70" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{
              y: [0, 4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </motion.svg>
        </div>
      </motion.div>
    </section>
  );
}