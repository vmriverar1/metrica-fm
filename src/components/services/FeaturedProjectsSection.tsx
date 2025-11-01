'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Briefcase } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  image: string;
  area?: string;
  year?: string;
  featured?: boolean;
}

export default function FeaturedProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const response = await fetch('/api/portfolio/featured?type=projects&limit=6');
        const data = await response.json();

        if (data.success && data.data.projects) {
          setProjects(data.data.projects);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Briefcase className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Proyectos Destacados</span>
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProjectCard
                title={project.title}
                location={project.location}
                type={project.type}
                image={project.image}
                slug={project.slug}
                area={project.area}
                year={project.year}
                priority={index < 3}
                index={index}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Ver Todos los Proyectos
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
