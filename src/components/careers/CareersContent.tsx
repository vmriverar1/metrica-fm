'use client';

import { Suspense } from 'react';
import CareersHero from '@/components/careers/CareersHero';
import CompanyBenefits from '@/components/careers/CompanyBenefits';
import JobGrid from '@/components/careers/JobGrid';
import CareerFilters from '@/components/careers/CareerFilters';
import SectionTransition from '@/components/portfolio/SectionTransition';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import OptimizedLoading from '@/components/loading/OptimizedLoading';
import { CareersData } from '@/hooks/useCareersData';

interface CareersContentProps {
  careersData: CareersData;
}

export default function CareersContent({ careersData }: CareersContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<OptimizedLoading type="careers" />}>
        <CareersHero heroData={careersData.hero} />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      <Suspense fallback={<OptimizedLoading type="careers" message="Cargando beneficios de la empresa..." />}>
        <CompanyBenefits benefitsData={careersData.company_benefits} />
      </Suspense>

      <SectionTransition variant="slide" />

      <section id="job-opportunities" className="py-16">
        <div id="careers-content"></div>
        <div className="container mx-auto px-4">
          <Suspense fallback={<OptimizedLoading type="search" />}>
            <CareerFilters jobOpportunitiesData={careersData.job_opportunities} />
            <JobGrid jobOpportunitiesData={careersData.job_opportunities} />
          </Suspense>
        </div>
      </section>
      
      <SectionTransition variant="slide" />
      
      <PortfolioCTA 
        type="careers"
        title={careersData.final_cta.title}
        description={careersData.final_cta.description}
        primaryButton={{
          text: careersData.final_cta.primary_button.text,
          href: careersData.final_cta.primary_button.href
        }}
        secondaryButton={{
          text: careersData.final_cta.secondary_button.text,
          href: careersData.final_cta.secondary_button.href
        }}
      />
    </main>
  );
}