'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ProjectGrid from '@/components/portfolio/ProjectGrid';
import ProjectFilter from '@/components/portfolio/ProjectFilter';
import { PortfolioProvider, usePortfolio } from '@/contexts/PortfolioContext';
import { ProjectCategory, getCategoryLabel } from '@/types/portfolio';

interface CategoryPageProps {
  category: ProjectCategory;
  title: string;
  subtitle: string;
  backgroundImage: string;
}

function CategoryPageContent({ category, title, subtitle, backgroundImage }: CategoryPageProps) {
  const { setFilters, filteredProjects, projectCount } = usePortfolio();

  // Filtrar automáticamente por la categoría cuando se carga la página
  useEffect(() => {
    setFilters({
      category: category,
      location: 'all',
      year: 'all',
      searchTerm: ''
    });
  }, [category, setFilters]);

  const categoryStats = {
    totalProjects: filteredProjects.length,
    featuredProjects: filteredProjects.filter(p => p.featured).length,
    avgArea: filteredProjects.length > 0 
      ? Math.round(filteredProjects.reduce((acc, p) => acc + parseFloat(p.details.area.replace(/[^\d]/g, '')), 0) / filteredProjects.length)
      : 0,
    locations: new Set(filteredProjects.map(p => p.location.city)).size
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <UniversalHero
          title={title}
          subtitle={subtitle}
          backgroundImage={backgroundImage}
        />
        
        {/* Stats Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Proyectos de {getCategoryLabel(category)}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explora nuestra experiencia especializada en proyectos de {getCategoryLabel(category).toLowerCase()}
              </p>
            </motion.div>

            {/* Category Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {categoryStats.totalProjects}
                </div>
                <div className="text-sm text-muted-foreground">
                  Proyectos Completados
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {categoryStats.featuredProjects}
                </div>
                <div className="text-sm text-muted-foreground">
                  Proyectos Destacados
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {categoryStats.avgArea.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  m² Promedio
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {categoryStats.locations}
                </div>
                <div className="text-sm text-muted-foreground">
                  {categoryStats.locations === 1 ? 'Ubicación' : 'Ubicaciones'}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Filters Section (simplified for category pages) */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-20 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {getCategoryLabel(category)}
                </h3>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {projectCount} {projectCount === 1 ? 'proyecto' : 'proyectos'}
                </div>
              </div>
              
              {projectCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  Filtrado por categoría
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Projects Grid */}
        <ProjectGrid />
        
        {/* Empty State for categories with no projects */}
        {projectCount === 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-muted-foreground" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Proyectos en desarrollo
                </h3>
                <p className="text-muted-foreground">
                  Estamos trabajando en nuevos proyectos de {getCategoryLabel(category).toLowerCase()}. 
                  Pronto estarán disponibles en nuestro portafolio.
                </p>
              </motion.div>
            </div>
          </section>
        )}
        
        {/* Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                ¿Tienes un proyecto de {getCategoryLabel(category)} en mente?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Conversemos sobre cómo podemos ayudarte a desarrollar tu proyecto de {getCategoryLabel(category).toLowerCase()} 
                con los más altos estándares de calidad y eficiencia.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Iniciar Conversación
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <PortfolioProvider>
      <CategoryPageContent {...props} />
    </PortfolioProvider>
  );
}