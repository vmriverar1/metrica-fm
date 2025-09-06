'use client';

import React from 'react';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import TimelineTransformWrapper from '@/components/historia/TimelineTransformWrapper';
import Footer from '@/components/landing/footer';
import { useHistoriaData } from '@/hooks/useJsonData';

export default function HistoriaPage() {
  const { data: historiaData, loading, error } = useHistoriaData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
            <p className="mt-4 text-foreground/70">Cargando historia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !historiaData) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-destructive">Error: {error || 'No se pudo cargar la historia'}</p>
            <p className="mt-2 text-foreground/70">Usando datos por defecto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { page } = historiaData;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <UniversalHero 
          title={page.title}
          subtitle={page.subtitle}
          backgroundImage={page.hero_image}
        />
        <TimelineTransformWrapper historiaData={historiaData} />
      </main>
      <Footer />
    </div>
  );
}