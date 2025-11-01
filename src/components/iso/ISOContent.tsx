'use client';

import { Suspense } from 'react';
import ISOHero from '@/components/iso/ISOHero';
import ISOIntroduction from '@/components/iso/ISOIntroduction';
import QualityPolicy from '@/components/iso/QualityPolicy';
import SectionTransition from '@/components/portfolio/SectionTransition';
import SectionLoading from '@/components/loading/SectionLoading';

export default function ISOContent() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Certificado 3D */}
      <section id="hero">
        <Suspense fallback={<SectionLoading message="Cargando certificación..." size="large" />}>
          <ISOHero />
        </Suspense>
      </section>
      
      <SectionTransition variant="fade" />
      
      {/* Introduction to ISO 9001 */}
      <section id="introduccion">
        <Suspense fallback={<SectionLoading message="Cargando información de ISO 9001..." size="medium" />}>
          <ISOIntroduction />
        </Suspense>
      </section>
      
      <SectionTransition variant="slide" />
      
      {/* Quality Policy */}
      <section id="politica-calidad">
        <Suspense fallback={<SectionLoading message="Cargando política de calidad..." size="medium" />}>
          <QualityPolicy />
        </Suspense>
      </section>
    </main>
  );
}