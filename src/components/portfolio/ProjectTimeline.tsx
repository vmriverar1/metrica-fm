'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Building2, Maximize2, X } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, getCategoryLabel, getCategoryColor } from '@/types/portfolio';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  project: Project;
  date: Date;
  type: 'start' | 'milestone' | 'completion';
}

export default function ProjectTimeline() {
  const { allProjects } = usePortfolio();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'all'>('year');
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get unique years from projects (only from projects with completedAt)
  const years = Array.from(new Set(
    allProjects.filter(p => p.completedAt).map(p => p.completedAt!.getFullYear())
  )).sort((a, b) => b - a);

  // Filter projects by selected year or view mode
  const getFilteredProjects = () => {
    if (viewMode === 'all') return allProjects.filter(p => p.completedAt);

    return allProjects.filter(p => {
      if (!p.completedAt) return false;
      const year = p.completedAt.getFullYear();
      if (viewMode === 'year') return year === selectedYear;
      if (viewMode === 'month') {
        const currentDate = new Date();
        const projectDate = p.completedAt;
        return projectDate.getFullYear() === currentDate.getFullYear() &&
               projectDate.getMonth() === currentDate.getMonth();
      }
      return false;
    });
  };

  const filteredProjects = getFilteredProjects()
    .sort((a, b) => (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0));

  // Group projects by month
  const groupProjectsByMonth = () => {
    const groups: { [key: string]: Project[] } = {};

    filteredProjects.forEach(project => {
      if (!project.completedAt) return;
      const monthKey = `${project.completedAt.getFullYear()}-${project.completedAt.getMonth()}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(project);
    });

    return Object.entries(groups).map(([key, projects]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        date: new Date(year, month),
        projects
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const monthGroups = groupProjectsByMonth();

  // Auto-scroll to current month
  useEffect(() => {
    if (scrollContainerRef.current && viewMode === 'year') {
      const currentMonth = new Date().getMonth();
      const monthElement = scrollContainerRef.current.children[currentMonth] as HTMLElement;
      if (monthElement) {
        monthElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [viewMode, selectedYear]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Línea de Tiempo</h2>
          <p className="text-muted-foreground">
            Explora la evolución de nuestros proyectos a través del tiempo
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {['month', 'year', 'all'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === 'month' && 'Mes'}
                {mode === 'year' && 'Año'}
                {mode === 'all' && 'Todo'}
              </button>
            ))}
          </div>

          {/* Year Selector */}
          {viewMode === 'year' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedYear(prev => Math.max(prev - 1, years[years.length - 1]))}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectedYear(prev => Math.min(prev + 1, years[0]))}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative">
        {viewMode === 'year' ? (
          // Horizontal Timeline for Year View
          <div className="overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto pb-4 scrollbar-thin"
            >
              {months.map((month, monthIndex) => {
                const monthProjects = filteredProjects.filter(p => 
                  p.completedAt.getMonth() === monthIndex
                );

                return (
                  <div key={monthIndex} className="flex-shrink-0 w-64">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg">{month}</h3>
                      <p className="text-sm text-muted-foreground">
                        {monthProjects.length} proyecto{monthProjects.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Timeline Line */}
                    <div className="relative">
                      <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
                      <div className={cn(
                        "relative z-10 w-3 h-3 mx-auto rounded-full",
                        monthProjects.length > 0 ? "bg-accent" : "bg-muted"
                      )} />
                    </div>

                    {/* Projects for this month */}
                    <div className="mt-6 space-y-3">
                      {monthProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedProject(project)}
                          className="cursor-pointer group"
                        >
                          <div className="bg-card border rounded-lg p-3 hover:shadow-lg transition-all hover:scale-105">
                            <div className="aspect-video relative rounded overflow-hidden mb-2">
                              <Image
                                src={project.thumbnailImage || project.featuredImage}
                                alt={project.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {project.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryLabel(project.category)}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {project.completedAt.toLocaleDateString('es-PE', { 
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Vertical Timeline for Month/All View
          <div ref={timelineRef} className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline Events */}
            <div className="space-y-8">
              {monthGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="relative">
                  {/* Month Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "relative z-10 w-4 h-4 rounded-full bg-accent",
                      "md:absolute md:left-1/2 md:-translate-x-1/2"
                    )} />
                    <h3 className="font-bold text-lg md:text-center md:w-full">
                      {group.date.toLocaleDateString('es-PE', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                  </div>

                  {/* Projects Grid */}
                  <div className={cn(
                    "grid gap-4",
                    viewMode === 'all' 
                      ? "md:grid-cols-2 lg:grid-cols-3"
                      : "md:grid-cols-2"
                  )}>
                    {group.projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedProject(project)}
                        className={cn(
                          "bg-card border rounded-xl overflow-hidden cursor-pointer",
                          "hover:shadow-xl transition-all hover:scale-[1.02]",
                          index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                        )}
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={project.featuredImage}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                          <div 
                            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getCategoryColor(project.category) }}
                          >
                            {getCategoryLabel(project.category)}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">{project.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {project.location.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {project.details.duration}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl max-w-2xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video relative">
                <Image
                  src={selectedProject.featuredImage}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-muted-foreground">Ubicación</span>
                    <p className="font-medium">{selectedProject.location.city}, {selectedProject.location.region}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Completado</span>
                    <p className="font-medium">
                      {selectedProject.completedAt.toLocaleDateString('es-PE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Área</span>
                    <p className="font-medium">{selectedProject.details.area}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Duración</span>
                    <p className="font-medium">{selectedProject.details.duration}</p>
                  </div>
                </div>

                <a
                  href={`/portfolio/${selectedProject.category}/${selectedProject.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  Ver Proyecto Completo
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}