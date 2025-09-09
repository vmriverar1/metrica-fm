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
import { readPublicJSONAsync } from '@/lib/json-reader';

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

// Define interface for services data
interface ServicesPageData {
  page: {
    title: string;
    subtitle: string;
    hero_image: string;
    hero_image_fallback: string;
    description: string;
    url: string;
  };
  introduction: {
    text: string;
    value_proposition: string;
  };
  service_philosophy: {
    title: string;
    principles: Array<{
      title: string;
      description: string;
    }>;
  };
  main_service: {
    dip: {
      title: string;
      subtitle: string;
      icon: string;
      color: string;
      featured: boolean;
      overview: {
        description: string;
        key_value: string;
        differentiator: string;
      };
      pillars: Array<{
        id: number;
        name: string;
        description: string;
        tools: string[];
        outcomes: string[];
      }>;
      benefits: {
        quantitative: Array<{
          metric: string;
          value: string;
          description: string;
        }>;
        qualitative: string[];
      };
    };
  };
  additional_services: Record<string, {
    title: string;
    description: string;
    scope: string[];
  }>;
  methodology: {
    title: string;
    description: string;
    phases: Array<{
      phase: string;
      description: string;
      duration: string;
    }>;
  };
  quality_assurance: {
    title: string;
    certifications: Array<{
      name: string;
      description: string;
      year_obtained: number;
    }>;
    processes: string[];
  };
}

// Function to load services data
async function getServicesData(): Promise<ServicesPageData> {
  return readPublicJSONAsync<ServicesPageData>('/json/pages/services.json');
}

export default async function ServicesPage() {
  const data = await getServicesData();

  return (
    <MobileOptimizer>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* SEO Schema Markup */}
        <ServiceSchema />
        
        <Header />
        <main className="relative">
          <UniversalHero 
            title={data.page.title}
            subtitle={data.page.subtitle}
            backgroundImage={data.page.hero_image}
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
          
          <ServiceMatrix data={data} />
          <ProjectShowcase data={data} />
          <SmartContactForm data={data} />
          
          {/* Analytics and Performance Monitoring */}
          <ServiceAnalytics />
        </main>
        <Footer />
      </div>
    </MobileOptimizer>
  );
}