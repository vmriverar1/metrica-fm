'use client';

import { Suspense } from 'react';
import ISOHero from '@/components/iso/ISOHero';
import ISOIntroduction from '@/components/iso/ISOIntroduction';
import QualitySystem from '@/components/iso/QualitySystem';
import CertificationTimeline from '@/components/iso/CertificationTimeline';
import QualityPolicy from '@/components/iso/QualityPolicy';
import dynamic from 'next/dynamic';

const ProcessMap = dynamic(() => import('@/components/iso/ProcessMap'), {
  ssr: false,
  loading: () => <SectionLoading message="Cargando mapa de procesos..." size="medium" />
});

const AuditDashboard = dynamic(() => import('@/components/iso/AuditDashboard'), {
  ssr: false,
  loading: () => <SectionLoading message="Cargando dashboard de auditorías..." size="medium" />
});

const ClientBenefits = dynamic(() => import('@/components/iso/ClientBenefits'), {
  ssr: false,
  loading: () => <SectionLoading message="Cargando beneficios para clientes..." size="medium" />
});
import ISOMetrics from '@/components/iso/ISOMetrics';
import SectionTransition from '@/components/portfolio/SectionTransition';
import SectionLoading from '@/components/loading/SectionLoading';

export default function ISOContent() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Certificado 3D */}
      <Suspense fallback={<SectionLoading message="Cargando certificación..." size="large" />}>
        <ISOHero />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      {/* Introduction to ISO 9001 */}
      <Suspense fallback={<SectionLoading message="Cargando información de ISO 9001..." size="medium" />}>
        <ISOIntroduction />
      </Suspense>
      
      <SectionTransition variant="slide" />
      
      {/* Quality System Overview */}
      <Suspense fallback={<SectionLoading message="Cargando sistema de gestión de calidad..." size="medium" />}>
        <QualitySystem />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      {/* Certification Timeline */}
      <Suspense fallback={<SectionLoading message="Cargando cronología de certificación..." size="medium" />}>
        <CertificationTimeline />
      </Suspense>
      
      <SectionTransition variant="slide" />
      
      {/* Quality Policy */}
      <Suspense fallback={<SectionLoading message="Cargando política de calidad..." size="medium" />}>
        <QualityPolicy />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      {/* Interactive Process Map */}
      <Suspense fallback={<SectionLoading message="Cargando mapa de procesos..." size="medium" />}>
        <ProcessMap />
      </Suspense>
      
      <SectionTransition variant="slide" />
      
      {/* Real-time Metrics Dashboard */}
      <Suspense fallback={<SectionLoading message="Cargando métricas de calidad..." size="medium" />}>
        <ISOMetrics />
      </Suspense>
      
      <SectionTransition variant="fade" />
      
      {/* Audit Dashboard */}
      <Suspense fallback={<SectionLoading message="Cargando dashboard de auditorías..." size="medium" />}>
        <AuditDashboard />
      </Suspense>
      
      <SectionTransition variant="slide" />
      
      {/* Client Benefits */}
      <Suspense fallback={<SectionLoading message="Cargando beneficios para clientes..." size="medium" />}>
        <ClientBenefits />
      </Suspense>
    </main>
  );
}