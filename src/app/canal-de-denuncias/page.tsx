import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CanalDenunciasHero from '@/components/canal-denuncias/CanalDenunciasHero';
import DenunciaForm from '@/components/canal-denuncias/DenunciaForm';
import ProcesoEtico from '@/components/canal-denuncias/ProcesoEtico';
import ContactoEtico from '@/components/canal-denuncias/ContactoEtico';

export const metadata: Metadata = {
  title: 'Canal de Denuncias | Métrica FM - Línea Ética',
  description: 'Canal confidencial para reportar irregularidades, actos de corrupción o violaciones éticas en proyectos de construcción. Garantizamos anonimato y protección al denunciante.',
  keywords: 'denuncias, ética empresarial, anticorrupción, línea ética, construcción responsable, compliance, transparencia',
  openGraph: {
    title: 'Canal de Denuncias | Métrica FM',
    description: 'Reporta irregularidades de forma confidencial y anónima. Construimos con ética y transparencia.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Métrica FM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canal de Denuncias | Métrica FM',
    description: 'Canal confidencial para reportar irregularidades en el sector construcción.'
  },
  alternates: {
    canonical: 'https://metrica-dip.com/canal-de-denuncias'
  }
};

export default function CanalDenunciasPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <CanalDenunciasHero />
        <ProcesoEtico />
        <DenunciaForm />
        <ContactoEtico />
      </main>
      <Footer />
    </div>
  );
}