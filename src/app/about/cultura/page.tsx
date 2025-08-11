import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import HeroEquipo from '@/components/cultura/HeroEquipo';
import ValuesGallery from '@/components/cultura/ValuesGallery';
import TeamTimeline from '@/components/cultura/TeamTimeline';
import CultureShowcase from '@/components/cultura/Culture3DSpace';
import MomentsMosaic from '@/components/cultura/MomentsMosaic';
import WorkflowGuide from '@/components/cultura/DNACanvas';
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
        
        {/* FASE 2: Timeline Visual del Equipo */}
        <TeamTimeline />
        
        {/* FASE 3: Cultura en Números */}
        <CultureShowcase />
        
        {/* FASE 4: Mosaico de Momentos */}
        <MomentsMosaic />
        
        {/* FASE 5: Guía Visual del Proceso de Trabajo */}
        <WorkflowGuide />
        
        {/* FASE 6: Centro de Innovación Tecnológica */}
        <TechInnovationHub />
        
      </main>
      <Footer />
    </div>
  );
}