/**
 * Ejemplos de implementación de páginas unificadas
 * Muestra cómo usar los componentes UnifiedCard, UnifiedGrid, UnifiedLayout y SEO
 */

'use client';

import React from 'react';
import { UnifiedCardData } from '@/components/public/UnifiedCard';
import UnifiedGrid from '@/components/public/UnifiedGrid';
import UnifiedLayout from '@/components/public/UnifiedLayout';
import { useUnifiedData, SystemType } from '@/hooks/useUnifiedData';
import { generateSEOFromCard, generateListSEOFromData } from '@/lib/seo/unified-seo';

// ==========================================
// EJEMPLO 1: Página de Lista del Newsletter
// ==========================================

export function NewsletterListPage() {
  const { data, loading, error } = useUnifiedData({
    system: 'newsletter',
    endpoint: 'articles',
    limit: 12,
    autoRefresh: true
  });

  // Generar SEO para la lista
  const seoData = generateListSEOFromData('newsletter', data, {
    totalCount: data.length
  });

  return (
    <UnifiedLayout
      system="newsletter"
      variant="listing"
      title="Blog Métrica"
      subtitle="Artículos, análisis y tendencias sobre construcción y arquitectura"
      showBreadcrumbs={true}
      showShareButton={true}
    >
      <UnifiedGrid
        data={data}
        system="newsletter"
        loading={loading}
        error={error}
        viewMode="grid"
        columns={3}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        itemsPerPage={12}
      />
    </UnifiedLayout>
  );
}

// ==========================================
// EJEMPLO 2: Página de Detalle de Portfolio
// ==========================================

interface PortfolioDetailPageProps {
  projectData: UnifiedCardData;
  relatedProjects: UnifiedCardData[];
}

export function PortfolioDetailPage({
  projectData,
  relatedProjects
}: PortfolioDetailPageProps) {
  // Generar SEO para el proyecto
  const seoData = generateSEOFromCard('portfolio', projectData, 'detail');

  return (
    <UnifiedLayout
      system="portfolio"
      variant="detail"
      title={projectData.title}
      subtitle={projectData.description || projectData.short_description}
      category={projectData.category}
      tags={projectData.tags}
      showBackButton={true}
      showBreadcrumbs={true}
      showShareButton={true}
      sidebar={
        <div className="space-y-6">
          {/* Project Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Detalles del Proyecto
            </h3>
            <div className="space-y-3 text-sm">
              {projectData.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium">{projectData.location.city}</span>
                </div>
              )}
              {projectData.year && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Año:</span>
                  <span className="font-medium">{projectData.year}</span>
                </div>
              )}
              {projectData.area && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área:</span>
                  <span className="font-medium">{projectData.area}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Proyectos Relacionados
              </h3>
              <div className="space-y-4">
                {relatedProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground line-clamp-2">
                        {project.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.location?.city} • {project.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      {/* Main Content */}
      <div className="space-y-8">
        {/* Project Gallery */}
        {projectData.image && (
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
            <img
              src={projectData.image}
              alt={projectData.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Description */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {projectData.description || projectData.short_description}
          </p>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoData.structuredData)
        }}
      />
    </UnifiedLayout>
  );
}

// ==========================================
// EJEMPLO 3: Página de Careers con Filtros
// ==========================================

export function CareersListPage() {
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'masonry'>('grid');

  const { data, loading, error } = useUnifiedData({
    system: 'careers',
    endpoint: 'positions',
    filters,
    limit: 20,
    autoRefresh: true
  });

  const categories = React.useMemo(() =>
    [...new Set(data.map(item => item.category))],
    [data]
  );

  return (
    <UnifiedLayout
      system="careers"
      variant="listing"
      title="Oportunidades Laborales"
      subtitle="Únete al equipo de Métrica y construye el futuro"
      description="Explora nuestras oportunidades laborales en construcción, arquitectura e ingeniería"
    >
      <UnifiedGrid
        data={data}
        system="careers"
        loading={loading}
        error={error}
        viewMode={viewMode}
        columns={2}
        searchable={true}
        filterable={true}
        sortable={true}
        categories={categories}
        pagination={true}
        itemsPerPage={16}
        onSearch={(query) => {
          console.log('Search:', query);
        }}
        onFilter={(newFilters) => {
          setFilters(newFilters);
        }}
        onSort={(field, order) => {
          console.log('Sort:', field, order);
        }}
        onViewModeChange={setViewMode}
      />
    </UnifiedLayout>
  );
}

// ==========================================
// EJEMPLO 4: Hook personalizado para SEO
// ==========================================

export function useUnifiedSEO(
  system: SystemType,
  data?: UnifiedCardData,
  pageType: 'list' | 'detail' = 'list'
) {
  return React.useMemo(() => {
    if (data && pageType === 'detail') {
      return generateSEOFromCard(system, data, 'detail');
    }

    return generateListSEOFromData(system, [], {
      totalCount: 0
    });
  }, [system, data, pageType]);
}

// ==========================================
// EJEMPLO 5: Página con múltiples sistemas
// ==========================================

export function UnifiedDashboardPage() {
  const newsletter = useUnifiedData({
    system: 'newsletter',
    endpoint: 'articles',
    limit: 3
  });

  const portfolio = useUnifiedData({
    system: 'portfolio',
    endpoint: 'projects',
    limit: 3
  });

  const careers = useUnifiedData({
    system: 'careers',
    endpoint: 'positions',
    limit: 3
  });

  return (
    <UnifiedLayout
      system="portfolio" // Sistema base
      variant="default"
      title="Dashboard Unificado"
      subtitle="Vista general de todos los sistemas"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Newsletter Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Últimos Artículos</h2>
          <div className="space-y-4">
            {newsletter.data.slice(0, 3).map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.author?.name} • {item.publishedAt?.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Proyectos Destacados</h2>
          <div className="space-y-4">
            {portfolio.data.slice(0, 3).map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.location?.city} • {item.year}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Careers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Empleos Recientes</h2>
          <div className="space-y-4">
            {careers.data.slice(0, 3).map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.department} • {item.location?.city}
                </p>
                {item.salary && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {item.salary.currency} {item.salary.min} - {item.salary.max}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}