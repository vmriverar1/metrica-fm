import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import ServiceMatrix from '@/components/services/ServiceMatrix';
import ProjectShowcase from '@/components/services/ProjectShowcase';
import SmartContactForm from '@/components/services/SmartContactForm';
import ServiceAnalytics from '@/components/services/ServiceAnalytics';
import ServiceSchema from '@/components/services/ServiceSchema';
import MobileOptimizer from '@/components/services/MobileOptimizer';
import Footer from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Servicios de Dirección Integral de Proyectos | Métrica FM',
  description: 'Transformamos ideas en impacto con nuestros servicios especializados: Gestión Integral, Consultoría Estratégica, Supervisión Técnica y más. 15+ años de experiencia.',
  keywords: 'servicios construcción, gestión proyectos, consultoría construcción, supervisión técnica, project management, dirección integral proyectos',
  openGraph: {
    title: 'Servicios de Dirección Integral de Proyectos | Métrica FM',
    description: 'Servicios especializados que transforman proyectos en éxitos garantizados. Consultoría, gestión, supervisión y más.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Métrica FM',
    images: [
      {
        url: '/img/services-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Servicios Métrica FM'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servicios de Dirección Integral de Proyectos | Métrica FM',
    description: 'Servicios especializados que transforman proyectos en éxitos garantizados.'
  },
  alternates: {
    canonical: 'https://metrica-dip.com/services'
  }
};

export default function ServicesPage() {
  return (
    <MobileOptimizer>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* SEO Schema Markup */}
        <ServiceSchema />
        
        <Header />
        <main className="relative">
          <UniversalHero 
            title="Transformamos Ideas en Impacto"
            subtitle="15+ años liderando proyectos de infraestructura que transforman el Perú"
            backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
            metadata={{
              stats: [
                'S/ 2.5B+ Gestionados',
                '300+ Proyectos Exitosos',
                '99% Satisfacción Cliente'
              ]
            }}
            primaryButton={{
              text: "Ver Proyectos Emblemáticos",
              href: "/portfolio"
            }}
            secondaryButton={{
              text: "Consulta Gratuita",
              href: "#contact-form"
            }}
          />
          
          <ServiceMatrix />
          <ProjectShowcase />
          <SmartContactForm />
          
          {/* Analytics and Performance Monitoring */}
          <ServiceAnalytics />
        </main>
        <Footer />
      </div>
    </MobileOptimizer>
  );
}