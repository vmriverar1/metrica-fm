'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { Project, getCategoryLabel } from '@/types/portfolio';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectNavigationProps {
  currentProject: Project;
}

export default function ProjectNavigation({ currentProject }: ProjectNavigationProps) {
  const { allProjects } = usePortfolio();

  const { previousProject, nextProject } = useMemo(() => {
    const currentIndex = allProjects.findIndex(p => p.id === currentProject.id);
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allProjects.length - 1;
    const nextIndex = currentIndex < allProjects.length - 1 ? currentIndex + 1 : 0;
    
    return {
      previousProject: allProjects[prevIndex],
      nextProject: allProjects[nextIndex]
    };
  }, [allProjects, currentProject.id]);

  const ProjectCard = ({ 
    project, 
    direction, 
    className 
  }: { 
    project: Project; 
    direction: 'prev' | 'next';
    className?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn("group", className)}
    >
      <Link 
        href={`/portfolio/${project.category}/${project.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={project.thumbnailImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Direction indicator */}
            <div className={cn(
              "absolute top-4 p-2 bg-white/90 backdrop-blur-sm rounded-full",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              direction === 'prev' ? "left-4" : "right-4"
            )}>
              {direction === 'prev' ? (
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-800" />
              )}
            </div>
            
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                {getCategoryLabel(project.category)}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className={cn(
              "text-sm text-muted-foreground mb-2 flex items-center gap-2",
              direction === 'prev' ? "flex-row" : "flex-row-reverse"
            )}>
              {direction === 'prev' ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Proyecto anterior</span>
                </>
              ) : (
                <>
                  <span>Siguiente proyecto</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.shortDescription}
            </p>
            
            {/* Metadata */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              {project.location.city && (
                <>
                  <span>{project.location.city}</span>
                  <span>•</span>
                </>
              )}
              {project.completedAt && (
                <>
                  <span>{project.completedAt.getFullYear()}</span>
                  <span>•</span>
                </>
              )}
              {project.details.area && (
                <span>{project.details.area}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Explora Más Proyectos
          </h2>
          <p className="text-muted-foreground">
            Descubre otros proyectos destacados de nuestro portafolio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Previous project */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <ProjectCard 
              project={previousProject} 
              direction="prev"
            />
          </motion.div>

          {/* Next project */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <ProjectCard 
              project={nextProject} 
              direction="next"
            />
          </motion.div>
        </div>

        {/* Back to portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/portfolio">
            <Button 
              variant="outline" 
              size="lg"
              className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Grid3X3 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver todos los proyectos
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}