import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import TimelineHorizontal from '@/components/historia/TimelineHorizontal';
import CierreHistoria from '@/components/historia/CierreHistoria';
import Footer from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Nuestra Historia | Métrica',
  description: 'Conoce la trayectoria de Métrica DIP desde 2010, más de una década liderando la dirección integral de proyectos de infraestructura en el Perú.',
};

export default function HistoriaPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <UniversalHero 
          title="Nuestra Historia"
          subtitle="Más de una década transformando el Perú"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/06.jpg"
        />
        <TimelineHorizontal />
        <CierreHistoria />
      </main>
      <Footer />
    </div>
  );
}