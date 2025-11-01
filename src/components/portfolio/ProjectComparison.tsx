'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, ArrowRight, Building2, MapPin, Calendar, DollarSign, Ruler, Users, Award } from 'lucide-react';
import { Project, getCategoryLabel, getCategoryColor } from '@/types/portfolio';
import { usePortfolio } from '@/contexts/PortfolioContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ComparisonItem {
  label: string;
  icon: React.ReactNode;
  getValue: (project: Project) => string | number;
  highlight?: boolean;
}

const comparisonItems: ComparisonItem[] = [
  {
    label: 'Categoría',
    icon: <Building2 className="w-4 h-4" />,
    getValue: (p) => getCategoryLabel(p.category)
  },
  {
    label: 'Ubicación',
    icon: <MapPin className="w-4 h-4" />,
    getValue: (p) => `${p.location.city}, ${p.location.region}`
  },
  {
    label: 'Año',
    icon: <Calendar className="w-4 h-4" />,
    getValue: (p) => p.completedAt ? p.completedAt.getFullYear() : 'N/A'
  },
  {
    label: 'Área',
    icon: <Ruler className="w-4 h-4" />,
    getValue: (p) => p.details.area,
    highlight: true
  },
  {
    label: 'Inversión',
    icon: <DollarSign className="w-4 h-4" />,
    getValue: (p) => p.details.investment || 'No disponible',
    highlight: true
  },
  {
    label: 'Duración',
    icon: <Calendar className="w-4 h-4" />,
    getValue: (p) => p.details.duration
  },
  {
    label: 'Equipo',
    icon: <Users className="w-4 h-4" />,
    getValue: (p) => p.details.team.join(', ')
  },
  {
    label: 'Certificaciones',
    icon: <Award className="w-4 h-4" />,
    getValue: (p) => p.details.certifications?.join(', ') || 'N/A'
  }
];

interface ProjectComparisonProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProjectComparison({ 
  isOpen: externalIsOpen, 
  onOpenChange 
}: ProjectComparisonProps = {}) {
  const { allProjects } = usePortfolio();
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [showSelector, setShowSelector] = useState(false);
  const maxProjects = 4;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('comparisonProjects');
    if (saved) {
      const ids = JSON.parse(saved);
      const projects = ids.map((id: string) => 
        allProjects.find(p => p.id === id)
      ).filter(Boolean) as Project[];
      setSelectedProjects(projects);
    }
  }, [allProjects]);

  // Save to localStorage
  useEffect(() => {
    const ids = selectedProjects.map(p => p.id);
    localStorage.setItem('comparisonProjects', JSON.stringify(ids));
  }, [selectedProjects]);

  const addProject = (project: Project) => {
    if (selectedProjects.length < maxProjects && 
        !selectedProjects.find(p => p.id === project.id)) {
      setSelectedProjects([...selectedProjects, project]);
      setShowSelector(false);
    }
  };

  const removeProject = (projectId: string) => {
    setSelectedProjects(selectedProjects.filter(p => p.id !== projectId));
  };

  const clearComparison = () => {
    setSelectedProjects([]);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  // Sync external state
  React.useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Notify parent of state changes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <>
      {/* Comparison Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background border-t shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Comparación de Proyectos</h2>
                  <p className="text-white/80 text-sm">
                    Compara hasta {maxProjects} proyectos lado a lado
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedProjects.length > 0 && (
                    <button
                      onClick={clearComparison}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenChange(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Content */}
            <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
              {selectedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay proyectos para comparar</h3>
                  <p className="text-muted-foreground mb-4">
                    Selecciona proyectos desde la grilla para comenzar
                  </p>
                  <button
                    onClick={() => setShowSelector(true)}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Seleccionar Proyectos
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left p-3 font-semibold">Características</th>
                        {selectedProjects.map(project => (
                          <th key={project.id} className="p-3 text-center">
                            <div className="relative group">
                              <div className="aspect-video relative rounded-lg overflow-hidden mb-2">
                                <Image
                                  src={project.featuredImage}
                                  alt={project.title}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  onClick={() => removeProject(project.id)}
                                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <h4 className="font-semibold text-sm line-clamp-2">
                                {project.title}
                              </h4>
                            </div>
                          </th>
                        ))}
                        {selectedProjects.length < maxProjects && (
                          <th className="p-3">
                            <button
                              onClick={() => setShowSelector(true)}
                              className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center"
                            >
                              <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">
                                Agregar Proyecto
                              </span>
                            </button>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonItems.map((item, index) => (
                        <tr key={index} className={cn(
                          "border-t",
                          item.highlight && "bg-muted/30"
                        )}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                          </td>
                          {selectedProjects.map(project => (
                            <td key={project.id} className="p-3 text-center">
                              <div className={cn(
                                "text-sm",
                                item.highlight && "font-semibold text-accent"
                              )}>
                                {item.getValue(project)}
                              </div>
                            </td>
                          ))}
                          {selectedProjects.length < maxProjects && (
                            <td className="p-3"></td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Seleccionar Proyectos para Comparar</h3>
                <p className="text-muted-foreground">
                  Puedes seleccionar hasta {maxProjects - selectedProjects.length} proyecto(s) más
                </p>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allProjects.filter(p => !selectedProjects.find(sp => sp.id === p.id)).map(project => (
                    <button
                      key={project.id}
                      onClick={() => addProject(project)}
                      className="text-left p-3 border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                    >
                      <div className="aspect-video relative rounded mb-2 overflow-hidden">
                        <Image
                          src={project.thumbnailImage || project.featuredImage}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {project.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(project.category)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}