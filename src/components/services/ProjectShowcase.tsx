'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Layers,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionTransition from '@/components/portfolio/SectionTransition';
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { Project } from '@/types/portfolio';

interface FeaturedProject {
  id: string;
  title: string;
  service: string;
  category: string;
  image: string;
  location: string;
  area: string;
  budget: string;
  year: string;
  status: 'completed' | 'ongoing';
  description: string;
  achievements: string[];
  link: string;
  serviceType: 'consultoria' | 'gestion' | 'supervision' | 'desarrollo';
  featured: boolean;
  featured_order?: number;
}

// Transform Firestore project to featured project format
const transformToFeaturedProject = (project: Project): FeaturedProject => {
  // Map category to service type and service name
  const getServiceInfo = (category: string) => {
    const mapping: Record<string, { service: string; serviceType: string }> = {
      'oficina': { service: 'Gestión Integral', serviceType: 'gestion' },
      'retail': { service: 'Supervisión Técnica', serviceType: 'supervision' },
      'hoteleria': { service: 'Consultoría Estratégica', serviceType: 'consultoria' },
      'vivienda': { service: 'Desarrollo Inmobiliario', serviceType: 'desarrollo' },
      'industria': { service: 'Project Management', serviceType: 'gestion' },
      'salud': { service: 'Supervisión Técnica', serviceType: 'supervision' },
      'educacion': { service: 'Consultoría Estratégica', serviceType: 'consultoria' }
    };
    return mapping[category.toLowerCase()] || { service: 'Gestión Integral', serviceType: 'gestion' };
  };

  const serviceInfo = getServiceInfo(project.category);
  const year = project.completedAt ? new Date(project.completedAt).getFullYear().toString() : '2024';
  const investment = project.details?.investment || 'No especificado';
  const area = project.details?.area || 'No especificado';
  const locationStr = `${project.location.city}, ${project.location.region}`;

  // Generate achievements from project data
  const achievements = [];
  if (project.details?.certifications?.length) {
    achievements.push(project.details.certifications[0]);
  }
  if (project.details?.duration) {
    achievements.push(`Plazo: ${project.details.duration}`);
  }
  if (project.tags?.length) {
    achievements.push(project.tags[0]);
  }
  // Ensure we have at least some achievements
  if (achievements.length === 0) {
    achievements.push('Proyecto exitoso', 'Alta calidad', 'Satisfacción del cliente');
  }

  return {
    id: project.id,
    title: project.title,
    service: serviceInfo.service,
    category: project.category,
    image: project.featured_image || project.featuredImage, // Use featured_image from Firebase first
    location: locationStr,
    area: area,
    budget: investment,
    year: year,
    status: 'completed' as const,
    description: project.shortDescription || project.description,
    achievements: achievements.slice(0, 3), // Limit to 3 achievements
    link: `/portfolio/${project.category}/${project.slug}`,
    serviceType: serviceInfo.serviceType as 'consultoria' | 'gestion' | 'supervision' | 'desarrollo',
    featured: project.featured,
    featured_order: (project as any).featured_order
  };
};


export default function ProjectShowcase() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Load featured projects from Firestore
  useEffect(() => {
    const loadFeaturedProjects = async () => {
      setLoading(true);
      try {
        // Get ALL projects and filter locally since the where query is not working correctly
        const allResult = await FirestoreCore.getDocuments<Project>('portfolio_projects');

        if (allResult.success && allResult.data) {
          // Filter for featured projects
          const featuredProjects = allResult.data.filter(p => p.featured === true);

          if (featuredProjects.length > 0) {
            // Transform all featured projects to display format
            const transformedProjects = featuredProjects.map(transformToFeaturedProject);

            // Ordenar proyectos por featured_order y luego por título
            const sortedProjects = transformedProjects.sort((a, b) => {
              // Si ambos tienen featured_order, ordenar por ese valor
              const orderA = a.featured_order ?? 999;
              const orderB = b.featured_order ?? 999;

              if (orderA !== orderB) {
                return orderA - orderB; // Menor número primero
              }

              // Si tienen el mismo orden (o ambos son 999), ordenar alfabéticamente
              return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
            });

            setFeaturedProjects(sortedProjects);
          } else {

            // Use first 6 projects as fallback if no featured projects
            const fallbackProjects = allResult.data.slice(0, 6);
            const transformedFallback = fallbackProjects.map(transformToFeaturedProject);
            setFeaturedProjects(transformedFallback);
          }
        } else {
          setFeaturedProjects([]);
        }
      } catch (error) {
        console.error('❌ [ProjectShowcase] Error loading projects:', error);
        setFeaturedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);


  const equalizeCardHeights = () => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('[data-project-card]');
    const cardArray = Array.from(cards) as HTMLElement[];
    
    if (cardArray.length === 0) return;

    // Reset heights
    cardArray.forEach(card => {
      card.style.height = 'auto';
    });

    // Get grid computed style to determine columns
    const gridStyles = window.getComputedStyle(gridRef.current);
    const gridTemplateColumns = gridStyles.gridTemplateColumns;
    const columnCount = gridTemplateColumns.split(' ').length;

    // Group cards by rows
    const rows: HTMLElement[][] = [];
    for (let i = 0; i < cardArray.length; i += columnCount) {
      rows.push(cardArray.slice(i, i + columnCount));
    }

    // Set equal heights for each row
    rows.forEach(row => {
      const maxHeight = Math.max(
        ...row.map(card => card.offsetHeight)
      );
      row.forEach(card => {
        card.style.height = `${maxHeight}px`;
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      equalizeCardHeights();
    }, 100);

    return () => clearTimeout(timer);
  }, [featuredProjects]);

  useEffect(() => {
    const handleResize = () => {
      const timer = setTimeout(() => {
        equalizeCardHeights();
      }, 100);
      return () => clearTimeout(timer);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <SectionTransition variant="slide" />
      
      <section id="project-showcase" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Layers className="w-4 h-4" />
              Casos de Éxito Comprobados
            </motion.div>
            
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Proyectos Destacados que Transforman
            </motion.h2>
            
            <motion.p
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Nuestros proyectos más destacados representan la excelencia en dirección integral.
              Descubre cómo hemos transformado ideas en realidades exitosas para nuestros clientes.
            </motion.p>
          </div>


          {/* Projects Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No hay proyectos destacados disponibles.</p>
            </div>
          ) : (
            <motion.div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  data-project-card
                >
                  <div className={cn(
                    "relative bg-card rounded-2xl overflow-hidden shadow-lg transition-all duration-500 h-full flex flex-col",
                    "hover:shadow-2xl hover:-translate-y-2 cursor-pointer",
                    "border border-border hover:border-primary/20"
                  )}>
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Featured Badge - Top Right */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <Badge
                          variant="default"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium flex items-center gap-1 shadow-lg"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          Destacado
                        </Badge>
                      </div>

                      {/* Service Badge - Top Left */}
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="outline"
                          className="bg-white/90 text-xs"
                        >
                          {project.service}
                        </Badge>
                      </div>

                      {/* Hover Overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-primary/80 transition-opacity duration-300",
                        hoveredProject === project.id ? "opacity-100" : "opacity-0"
                      )}>
                        <div className="flex items-center justify-center h-full">
                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => window.location.href = project.link}
                            className="gap-2"
                          >
                            Ver Proyecto
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1 flex flex-col">
                        {/* Title & Category */}
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">
                            {project.category}
                          </Badge>
                          <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>

                        {/* Project Info */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {project.area}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {project.budget}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.year}
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-2 flex-1">
                          <div className="text-xs font-medium text-foreground">Logros destacados:</div>
                          <div className="flex flex-wrap gap-1">
                            {project.achievements.slice(0, 2).map((achievement, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                            {project.achievements.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.achievements.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t border-border mt-auto">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground"
                            onClick={() => window.location.href = project.link}
                          >
                            Ver Caso Completo
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Load More / See All */}
          {/* Call to Action */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-6">
              Estos son solo algunos de nuestros proyectos más destacados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.href = '/portfolio'}
                className="px-8 bg-primary hover:bg-primary/90"
              >
                Ver Todos los Proyectos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('contact-form')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
                className="px-8"
              >
                Consultar Proyecto Similar
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/3 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </section>
    </>
  );
}