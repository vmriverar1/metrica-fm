'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface HomePageRendererProps {
  data: any;
  isPreview?: boolean;
}

const HomePageRenderer: React.FC<HomePageRendererProps> = ({ data, isPreview = false }) => {
  const {
    page = {},
    hero = {},
    stats = {},
    services = {},
    portfolio = {},
    pillars = {},
    policies = {},
    newsletter = {}
  } = data;

  // Hero Section
  const HeroSection = () => (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Background overlay */}
      {hero.background?.overlay_opacity && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: hero.background.overlay_opacity }}
        />
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center text-white">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="block">{hero.title?.main || 'Métrica'}</span>
            <span className="block text-cyan-500">{hero.title?.secondary || 'DIP'}</span>
          </h1>
          
          {/* Subtitle */}
          {hero.subtitle && (
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          )}
          
          {/* Rotating Words */}
          {hero.rotating_words && hero.rotating_words.length > 0 && (
            <div className="mb-8">
              <p className="text-lg mb-4">{hero.transition_text || 'Especialistas en'}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {hero.rotating_words.map((word: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-cyan-500 text-white px-3 py-1">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA */}
          {hero.cta?.text && (
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              {hero.cta.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );

  // Statistics Section  
  const StatisticsSection = () => {
    if (!stats.statistics || stats.statistics.length === 0) return null;

    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {stats.section?.title && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {stats.section.title}
            </h2>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.statistics.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}{stat.suffix || ''}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Services Section
  const ServicesSection = () => {
    const { main_service, secondary_services = [] } = services;
    
    if (!main_service && (!secondary_services || secondary_services.length === 0)) {
      return null;
    }

    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {services.section?.title && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {services.section.title}
            </h2>
          )}

          {/* Main Service */}
          {main_service && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">{main_service.name}</h3>
                {main_service.description && (
                  <p className="text-lg mb-6">{main_service.description}</p>
                )}
                {main_service.cta?.text && (
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    {main_service.cta.text}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Secondary Services */}
          {secondary_services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {secondary_services.map((service: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">
                    {service.name}
                  </h4>
                  {service.description && (
                    <p className="text-gray-600 mb-4">{service.description}</p>
                  )}
                  {service.cta?.text && (
                    <button className="text-blue-600 font-medium hover:underline">
                      {service.cta.text} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Portfolio Section
  const PortfolioSection = () => {
    if (!portfolio.featured_projects || portfolio.featured_projects.length === 0) {
      return null;
    }

    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {portfolio.section?.title && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {portfolio.section.title}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolio.featured_projects.map((project: any, index: number) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                  {project.image_url ? (
                    <span className="text-gray-600">📸 {project.name}</span>
                  ) : (
                    <span className="text-gray-400">Sin imagen</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-semibold text-gray-800">{project.name}</h4>
                    {project.type && (
                      <Badge variant="secondary">{project.type}</Badge>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-600">{project.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Pillars Section
  const PillarsSection = () => {
    if (!pillars.pillars || pillars.pillars.length === 0) {
      return null;
    }

    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {pillars.section?.title && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {pillars.section.title}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.pillars.map((pillar: any, index: number) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">
                  {pillar.title}
                </h4>
                {pillar.description && (
                  <p className="text-gray-600 text-sm">{pillar.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Policies Section
  const PoliciesSection = () => {
    if (!policies.policies || policies.policies.length === 0) {
      return null;
    }

    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          {policies.section?.title && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {policies.section.title}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policies.policies.map((policy: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-cyan-600">📋</span>
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">{policy.name}</h5>
                  {policy.description && (
                    <p className="text-xs text-gray-600">{policy.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Newsletter Section
  const NewsletterSection = () => {
    if (!newsletter.section?.title) return null;

    return (
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {newsletter.section.title}
          </h2>
          {newsletter.section.subtitle && (
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              {newsletter.section.subtitle}
            </p>
          )}
          <div className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Tu email..." 
              className="flex-1 px-4 py-3 rounded-lg"
              disabled
            />
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              {newsletter.form?.submit_text || 'Suscribirse'}
            </button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* SEO Info (solo visible en preview) */}
      {isPreview && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <strong>SEO:</strong> {page.title} | {page.description}
        </div>
      )}
      
      <HeroSection />
      <StatisticsSection />
      <ServicesSection />
      <PortfolioSection />
      <PillarsSection />
      <PoliciesSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePageRenderer;