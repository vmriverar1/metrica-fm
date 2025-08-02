'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ProjectHero from '@/components/project/ProjectHero';
import ProjectGallery from '@/components/project/ProjectGallery';
import ProjectNavigation from '@/components/project/ProjectNavigation';
import { PortfolioProvider, useProject } from '@/contexts/PortfolioContext';
import { ProjectCategory } from '@/types/portfolio';

interface ProjectPageProps {
  params: {
    categoria: string;
    slug: string;
  };
}

function ProjectPageContent({ params }: ProjectPageProps) {
  const project = useProject(params.slug);

  if (!project) {
    notFound();
  }

  // Verificar que la categoría coincida
  if (project.category !== params.categoria) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero inmersivo */}
        <ProjectHero project={project} />
        
        {/* Galería segmentada */}
        <ProjectGallery project={project} />
        
        {/* Navegación entre proyectos */}
        <ProjectNavigation currentProject={project} />
      </main>
      <Footer />
    </div>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <PortfolioProvider>
      <ProjectPageContent params={params} />
    </PortfolioProvider>
  );
}