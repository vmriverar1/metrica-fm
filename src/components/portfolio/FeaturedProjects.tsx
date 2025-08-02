'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useFeaturedProjects } from '@/contexts/PortfolioContext';
import { Button } from '@/components/ui/button';

export default function FeaturedProjects() {
  const featuredProjects = useFeaturedProjects();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (featuredProjects.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Proyectos Destacados
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Excelencia
            </span>{' '}
            en Cada Proyecto
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubre nuestros proyectos más emblemáticos que definen estándares de calidad, 
            innovación y sostenibilidad en la industria de la construcción.
          </p>
        </motion.div>

        {/* Featured Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {featuredProjects.slice(0, 6).map((project, index) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="relative group"
            >
              {/* Featured badge */}
              <div className="absolute top-4 right-4 z-20 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                <Star className="w-3 h-3 inline mr-1" />
                Destacado
              </div>
              
              <ProjectCard
                title={project.title}
                location={`${project.location.city}, ${project.location.region}`}
                type={project.category}
                image={project.featuredImage}
                slug={project.slug}
                area={project.details.area}
                year={project.completedAt.getFullYear()}
                priority={index < 3}
                className="h-full transform transition-all duration-500 group-hover:scale-[1.02]"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action to see all projects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              const filtersSection = document.querySelector('[data-filters]');
              filtersSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="mr-2">Ver Todos los Proyectos</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}