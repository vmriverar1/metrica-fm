import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import HeroEquipo from '@/components/cultura/HeroEquipo';
import ValuesGallery from '@/components/cultura/ValuesGallery';
import TeamAndMoments from '@/components/cultura/TeamAndMoments';
import CultureShowcase from '@/components/cultura/Culture3DSpace';
import TechInnovationHub from '@/components/cultura/TechInnovationHub';

export default function CulturaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero fusionado con galería del equipo */}
        <HeroEquipo
          title="Cultura y Personas"
          subtitle="Un equipo multidisciplinario comprometido con la excelencia, innovación y desarrollo continuo"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/03.jpg"
        />
        
        {/* FASE 1: Galería Inmersiva de Valores */}
        <ValuesGallery />
        
        {/* FASE 2: Cultura en Números */}
        <CultureShowcase />
        
        {/* FASE 3: Equipo y Momentos Unificados */}
        <TeamAndMoments />
        
        {/* FASE 6: Centro de Innovación Tecnológica */}
        <TechInnovationHub />
        
      </main>
      <Footer />
    </div>
  );
}