'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ExternalLink, Building2 } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, getCategoryLabel, getCategoryColor } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Simplified map component without leaflet dependency
// TODO: Implement proper map with alternative library

export default function ProjectMap() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { filteredProjects } = usePortfolio();

  // Get projects with location data
  const projectsWithLocation = filteredProjects.filter(project => 
    project.location && project.coordinates
  );

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      {/* Placeholder map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Mapa de Proyectos
          </h3>
          <p className="text-gray-500 mb-4">
            {projectsWithLocation.length} proyectos con ubicación
          </p>
          
          {/* Simple project list as fallback */}
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {projectsWithLocation.slice(0, 6).map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(project.category)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.title}</p>
                    <p className="text-xs text-gray-500">{project.location}</p>
                  </div>
                </button>
              ))}
            </div>
            
            {projectsWithLocation.length > 6 && (
              <p className="text-xs text-gray-400 mt-2">
                +{projectsWithLocation.length - 6} más...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Project detail popup */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-10"
          >
            <div className="relative">
              {selectedProject.images?.length > 0 && (
                <Image
                  src={selectedProject.images[0]}
                  alt={selectedProject.title}
                  width={320}
                  height={160}
                  className="w-full h-32 object-cover"
                />
              )}
              
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(selectedProject.category)}`} />
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {getCategoryLabel(selectedProject.category)}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedProject.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedProject.location}
              </p>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {selectedProject.description}
              </p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  Ver Detalles
                </Button>
                
                {selectedProject.externalUrl && (
                  <Button size="sm" variant="ghost" className="p-2">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}