import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import FeaturedProjects from '@/components/portfolio/FeaturedProjects';
import ProjectGrid from '@/components/portfolio/ProjectGrid';
import ProjectFilter from '@/components/portfolio/ProjectFilter';
import MapSection from '@/components/portfolio/MapSection';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import PerformanceMonitor from '@/components/portfolio/PerformanceMonitor';
import { PortfolioProvider } from '@/contexts/PortfolioContext';

export const metadata: Metadata = {
  title: 'Portafolio de Proyectos | Métrica DIP - Dirección Integral de Proyectos',
  description: 'Explora nuestro portafolio de proyectos de infraestructura, arquitectura y construcción en Perú. Más de 200 proyectos exitosos en oficinas, retail, industria, salud, educación y vivienda.',
  keywords: 'portafolio proyectos, construcción Perú, arquitectura, infraestructura, dirección proyectos, oficinas, retail, industria, salud, educación, vivienda',
  openGraph: {
    title: 'Portafolio de Proyectos | Métrica DIP',
    description: 'Explora nuestro portafolio de proyectos de infraestructura y construcción en Perú',
    images: [
      {
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        width: 1200,
        height: 630,
        alt: 'Portafolio Métrica DIP'
      }
    ],
    type: 'website',
    locale: 'es_PE'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portafolio de Proyectos | Métrica DIP',
    description: 'Explora nuestro portafolio de proyectos de infraestructura y construcción en Perú'
  }
};

export default function PortfolioPage() {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-background relative">
        
        <Header />
        <main className="relative">
          {/* Hero Section */}
          <PortfolioHero />
          
          {/* Featured Projects Section */}
          <FeaturedProjects />
          
          {/* Filters Section */}
          <div data-filters>
            <ProjectFilter />
          </div>
          
          {/* Projects Grid */}
          <ProjectGrid />
          
          {/* Interactive Map Section */}
          <MapSection />
          
          {/* Call to Action */}
          <PortfolioCTA />
        </main>
        <Footer />
        
        {/* Performance monitoring for development */}
        <PerformanceMonitor />
      </div>
    </PortfolioProvider>
  );
}