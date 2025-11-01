'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, Globe, MapPin } from 'lucide-react';
import ProjectMap from './ProjectMap';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function MapSection() {
  const { filteredProjects } = usePortfolio();
  
  const uniqueLocations = new Set(filteredProjects.map(p => p.location.city));
  const uniqueRegions = new Set(filteredProjects.map(p => p.location.region));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Presencia Nacional
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Proyectos a través del{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Perú
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explora la ubicación geográfica de nuestros proyectos y descubre cómo hemos 
              contribuido al desarrollo de infraestructura en diferentes regiones del país.
            </p>
          </motion.div>

          {/* Statistics */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {uniqueLocations.size}
              </div>
              <div className="text-sm text-muted-foreground">
                {uniqueLocations.size === 1 ? 'Ciudad' : 'Ciudades'}
              </div>
            </div>

            <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {uniqueRegions.size}
              </div>
              <div className="text-sm text-muted-foreground">
                {uniqueRegions.size === 1 ? 'Región' : 'Regiones'}
              </div>
            </div>

            <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {filteredProjects.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredProjects.length === 1 ? 'Proyecto' : 'Proyectos'}
              </div>
            </div>
          </motion.div>

          {/* Interactive Map */}
          <motion.div variants={itemVariants}>
            <ProjectMap className="w-full" />
          </motion.div>

          {/* Instructions */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Haz clic en los marcadores para ver información detallada de cada proyecto
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}