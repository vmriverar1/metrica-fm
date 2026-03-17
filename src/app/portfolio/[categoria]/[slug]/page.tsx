'use client';

import React, { use, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import ProjectHero from '@/components/project/ProjectHero';
import ProjectGallery from '@/components/project/ProjectGallery';
import ProjectNavigation from '@/components/project/ProjectNavigation';
import { PortfolioProvider, useProject, usePortfolio } from '@/contexts/PortfolioContext';
import { ProjectCategory } from '@/types/portfolio';
import { analytics } from '@/lib/analytics';

interface ProjectPageProps {
  params: Promise<{
    categoria: string;
    slug: string;
  }>;
}

function ProjectPageContent({ params }: ProjectPageProps) {
  const resolvedParams = use(params);
  const { isLoading, allProjects } = usePortfolio();
  const project = useProject(resolvedParams.slug);

  // Track project view (must be before any conditional returns to follow Rules of Hooks)
  useEffect(() => {
    if (project) {
      analytics.projectView(
        project.title,
        project.category,
        project.id
      );

      // Track with additional details
      analytics.logEvent('project_detail_view', {
        project_id: project.id,
        project_title: project.title,
        project_category: project.category,
        project_location: project.location?.city || 'unknown',
        has_gallery: project.gallery && project.gallery.length > 0,
        gallery_size: project.gallery?.length || 0
      });
    }
  }, [project]);

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Solo llamar notFound si ya terminó de cargar y no hay proyecto
  if (!isLoading && !project) {
    notFound();
  }

  // Si aún no hay proyecto pero no está cargando, mostrar loading también
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar que la categoría coincida (decodificar URL parameter)
  const decodedCategoria = decodeURIComponent(resolvedParams.categoria);

  // Check category match
  if (project.category !== decodedCategoria) {
    // Temporarily allow mismatch for debugging
    // notFound();
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