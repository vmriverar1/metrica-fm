'use client';

import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import HeroEquipo from '@/components/cultura/HeroEquipo';
import ValuesGallery from '@/components/cultura/ValuesGallery';
import TeamAndMoments from '@/components/cultura/TeamAndMoments';
import CultureShowcase from '@/components/cultura/Culture3DSpace';
import TechInnovationHub from '@/components/cultura/TechInnovationHub';
import { useCulturaData } from '@/hooks/useCulturaData';
import OptimizedLoading from '@/components/loading/OptimizedLoading';

function CulturaPageContent() {
  const { data: culturaData, loading, error } = useCulturaData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <OptimizedLoading type="careers" />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar la página</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!culturaData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron datos</h2>
            <p className="text-gray-600">La información de cultura no está disponible</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero fusionado con galería del equipo - DATOS DINÁMICOS */}
        <HeroEquipo
          title={culturaData.hero.title}
          subtitle={culturaData.hero.subtitle}
          backgroundImage={culturaData.hero.background_image}
          teamImages={culturaData.hero.team_gallery.columns}
        />
        
        {/* FASE 1: Galería Inmersiva de Valores - DATOS DINÁMICOS */}
        <ValuesGallery 
          title={culturaData.values.section.title}
          subtitle={culturaData.values.section.subtitle}
          values={culturaData.values.values_list}
        />
        
        {/* FASE 2: Cultura en Números - DATOS DINÁMICOS */}
        <CultureShowcase 
          title={culturaData.culture_stats.section.title}
          subtitle={culturaData.culture_stats.section.subtitle}
          categories={culturaData.culture_stats.categories}
        />
        
        {/* FASE 3: Equipo y Momentos Unificados - DATOS DINÁMICOS */}
        <TeamAndMoments 
          teamSection={culturaData.team.section}
          members={culturaData.team.members}
          moments={culturaData.team.moments}
        />
        
        {/* FASE 6: Centro de Innovación Tecnológica - DATOS DINÁMICOS */}
        <TechInnovationHub 
          section={culturaData.technologies.section}
          technologies={culturaData.technologies.tech_list}
        />
        
      </main>
      <Footer />
    </div>
  );
}

export default function CulturaPage() {
  return <CulturaPageContent />;
}