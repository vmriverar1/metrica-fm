'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PortfolioPageRendererProps {
  data: any;
  isPreview?: boolean;
}

const PortfolioPageRenderer: React.FC<PortfolioPageRendererProps> = ({ data, isPreview = false }) => {
  const { page = {}, hero = {}, filters = {}, projects = [] } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Info (solo visible en preview) */}
      {isPreview && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <strong>SEO:</strong> {page.title} | {page.description}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {hero.title || 'Portfolio Métrica FM'}
          </h1>
          {hero.subtitle && (
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-64 bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-600">🏗️ {project.name || `Proyecto ${index + 1}`}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold">{project.name || `Proyecto ${index + 1}`}</h3>
                      {project.type && (
                        <Badge variant="secondary">{project.type}</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{project.description || 'Descripción del proyecto...'}</p>
                    {project.status && (
                      <Badge className="bg-green-100 text-green-800">{project.status}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No hay proyectos para mostrar</h3>
              <p className="text-gray-500">Los proyectos del portfolio se mostrarán aquí en preview.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PortfolioPageRenderer;