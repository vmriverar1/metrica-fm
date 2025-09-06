'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Ruler, Building, Users, Award } from 'lucide-react';
import { Project, getCategoryLabel, getCategoryColor, getCategoryBgColor } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface ProjectHeroProps {
  project: Project;
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = project.title.split(' ');

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0">
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
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>
        
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
            {/* Category badge */}
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
                  project.category === 'retail' ? 'bg-sky-400' :
                  project.category === 'industria' ? 'bg-gray-400' :
                  project.category === 'hoteleria' ? 'bg-purple-400' :
                  project.category === 'educacion' ? 'bg-green-400' :
                  project.category === 'vivienda' ? 'bg-yellow-400' :
                  'bg-red-400'
                )} />
                {getCategoryLabel(project.category)}
              </span>
            </motion.div>

            {/* Title with word-by-word reveal */}
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

            {/* Project metadata */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            >
              {/* Location */}
              <div className="flex items-center gap-3 text-white/90">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Ubicación</div>
                  <div className="font-medium">{project.location.city}</div>
                </div>
              </div>

              {/* Year */}
              <div className="flex items-center gap-3 text-white/90">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Año</div>
                  <div className="font-medium">{project.completedAt.getFullYear()}</div>
                </div>
              </div>

              {/* Area */}
              <div className="flex items-center gap-3 text-white/90">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Área</div>
                  <div className="font-medium">{project.details.area}</div>
                </div>
              </div>

              {/* Client */}
              <div className="flex items-center gap-3 text-white/90">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Cliente</div>
                  <div className="font-medium text-sm">{project.details.client}</div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed mb-8"
            >
              {project.description}
            </motion.p>

            {/* Tags */}
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
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
        <div className="text-white/60 text-xs mt-2 text-center">Explorar proyecto</div>
      </motion.div>
    </section>
  );
}