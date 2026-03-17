import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import Services from '@/components/landing/services';
import ProjectShowcase from '@/components/services/ProjectShowcase';
import SmartContactForm from '@/components/services/SmartContactForm';
import ServiceAnalytics from '@/components/services/ServiceAnalytics';
import ServiceSchema from '@/components/services/ServiceSchema';
import MobileOptimizer from '@/components/services/MobileOptimizer';
import Footer from '@/components/landing/footer';
import { ServicesProvider } from '@/contexts/ServicesContext';
import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { HomePageData } from '@/types/home';

export const metadata: Metadata = {
  title: 'Servicios de Dirección Integral de Proyectos | Métrica FM',
  description: 'Transformamos ideas en impacto con nuestros servicios especializados: Gestión Integral, Consultoría Estratégica, Supervisión Técnica y más. 10+ años de experiencia.',
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

async function getServicesData(): Promise<any | null> {
  try {
    const result = await FirestoreCore.getDocumentById('pages', 'services');

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('❌ [FIRESTORE] Failed to load services data:', error);
    return null;
  }
}

function ServicesPageContent({ servicesData }: { servicesData: any | null }) {
  // Fallback data si no hay datos de servicios
  const defaultServicesData: HomePageData['services'] = {
    section: {
      title: 'Nuestros Servicios',
      subtitle: 'Ofrecemos servicios especializados para el sector construcción'
    },
    services_list: []
  };

  return (
    <ServicesProvider>
      <MobileOptimizer>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {/* SEO Schema Markup */}
          <ServiceSchema />

          <Header />
          <main className="relative">
            <UniversalHero
              title={servicesData?.hero?.title || "Supervisamos y gerenciamos proyectos"}
              subtitle={servicesData?.hero?.subtitle || "10+ años liderando proyectos de infraestructura que transforman el Perú"}
              backgroundImage={servicesData?.hero?.background_image || "https://metricadip.com/images/proyectos/RETAIL/REMODELACION TD6/317906044_611374014122511_6533312105092675192_n.webp"}
            />

            <Services data={servicesData?.services || defaultServicesData} hideCTA={true} />
            {/* <ProjectShowcase /> */}
            <SmartContactForm />

            {/* Analytics and Performance Monitoring */}
            <ServiceAnalytics />
          </main>
          <Footer />
        </div>
      </MobileOptimizer>
    </ServicesProvider>
  );
}

export default async function ServicesPage() {
  try {
    const servicesData = await getServicesData();

    return <ServicesPageContent servicesData={servicesData} />;
  } catch (error) {
    console.error('❌ Error in ServicesPage:', error);
    return <ServicesPageContent servicesData={null} />;
  }
}