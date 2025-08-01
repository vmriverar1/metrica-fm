import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import ServiceUniverse from '@/components/services/ServiceUniverse';
import Footer from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Qué Hacemos | Métrica',
  description: 'Descubre cómo transformamos ideas en impacto a través de nuestros servicios especializados en Dirección Integral de Proyectos de infraestructura.',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <UniversalHero 
          title="Qué Hacemos"
          subtitle="¿Cómo transformamos ideas en impacto?"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/02.jpg"
        />
        <ServiceUniverse />
      </main>
      <Footer />
    </div>
  );
}