'use client';

import React from 'react';

interface AboutPageRendererProps {
  data: any;
  isPreview?: boolean;
}

const AboutPageRenderer: React.FC<AboutPageRendererProps> = ({ data, isPreview = false }) => {
  const { page = {}, hero = {}, sections = {} } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Info (solo visible en preview) */}
      {isPreview && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <strong>SEO:</strong> {page.title} | {page.description}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {hero.title || 'Sobre Métrica DIP'}
          </h1>
          {hero.subtitle && (
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {Object.keys(sections).length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {Object.entries(sections).map(([key, section]: [string, any], index) => (
                <div key={key} className="bg-white rounded-lg p-8 shadow-lg">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    {section.title || `Sección ${index + 1}`}
                  </h2>
                  {section.content && (
                    <div className="prose prose-lg max-w-none text-gray-600">
                      <p>{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No hay contenido para mostrar</h3>
              <p className="text-gray-500">Las secciones sobre la empresa se mostrarán aquí en preview.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutPageRenderer;