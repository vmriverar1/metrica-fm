'use client';

import { Suspense } from 'react';
import CareersHero from '@/components/careers/CareersHero';
import CompanyBenefits from '@/components/careers/CompanyBenefits';
import JobGrid from '@/components/careers/JobGrid';
import CareerFilters from '@/components/careers/CareerFilters';
import SectionTransition from '@/components/portfolio/SectionTransition';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import OptimizedLoading from '@/components/loading/OptimizedLoading';

export default function CareersContent() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<OptimizedLoading type="careers" />}>
        <CareersHero />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      <Suspense fallback={<OptimizedLoading type="careers" message="Cargando beneficios de la empresa..." />}>
        <CompanyBenefits />
      </Suspense>

      <SectionTransition variant="slide" />

      <section id="job-opportunities" className="py-16">
        <div id="careers-content"></div>
        <div className="container mx-auto px-4">
          <Suspense fallback={<OptimizedLoading type="search" />}>
            <CareerFilters />
            <JobGrid />
          </Suspense>
        </div>
      </section>
      
      <SectionTransition variant="slide" />
      
      <PortfolioCTA 
        type="careers"
        title="¿No encontraste la posición ideal?"
        description="Envía tu CV y te contactaremos cuando surjan oportunidades que se alineen con tu perfil profesional."
        primaryButton={{
          text: "Enviar CV",
          href: "/careers/apply"
        }}
        secondaryButton={{
          text: "Conoce Nuestra Cultura",
          href: "/about/cultura"
        }}
      />
    </main>
  );
}