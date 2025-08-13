import { Metadata } from 'next';
import { CareersProvider } from '@/contexts/CareersContext';
import UniversalHero from '@/components/ui/universal-hero';
import SectionTransition from '@/components/portfolio/SectionTransition';

export const metadata: Metadata = {
  title: 'Mi Perfil | Carreras Métrica DIP',
  description: 'Dashboard personal para candidatos: seguimiento de aplicaciones, estado de procesos y oportunidades recomendadas.',
  robots: 'noindex, nofollow' // Perfil personal no debe ser indexado
};

export default function ProfilePage() {
  const heroProps = {
    title: 'Mi Dashboard',
    subtitle: 'Seguimiento de aplicaciones y oportunidades recomendadas',
    backgroundImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630'
  };

  return (
    <CareersProvider>
      <main className="min-h-screen bg-background">
        <UniversalHero {...heroProps} />
        
        <SectionTransition variant="fade" />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Dashboard en Desarrollo
              </h2>
              <p className="text-muted-foreground mb-6">
                Esta sección estará disponible próximamente. Aquí podrás seguir el estado de tus aplicaciones,
                ver oportunidades recomendadas y gestionar tu perfil profesional.
              </p>
              <a 
                href="/careers" 
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Volver a Oportunidades
              </a>
            </div>
          </div>
        </div>
      </main>
    </CareersProvider>
  );
}