import { Metadata } from 'next';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { CareersProvider } from '@/contexts/CareersContext';
import { getJobPosting } from '@/types/careers';
import UniversalHero from '@/components/ui/universal-hero';
import ApplicationForm from '@/components/careers/ApplicationForm';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface ApplyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ApplyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const job = getJobPosting(resolvedParams.id);
  
  if (!job) {
    return {
      title: 'Aplicar a Posición | Carreras Métrica FM'
    };
  }

  return {
    title: `Aplicar a ${job.title} | Carreras Métrica FM`,
    description: `Completa tu aplicación para la posición de ${job.title} en ${job.location.city}. Únete al equipo de Métrica FM.`,
    keywords: `aplicar ${job.title.toLowerCase()}, postular empleo, aplicación trabajo construcción`,
    robots: 'noindex, nofollow' // No indexar formularios de aplicación
  };
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const resolvedParams = use(params);
  const job = getJobPosting(resolvedParams.id);

  if (!job) {
    notFound();
  }

  const heroProps = {
    title: `Aplicar a ${job.title}`,
    subtitle: `${job.location.city}, ${job.location.region} • ${job.type} • ${job.level}`,
    backgroundImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=630'
  };

  return (
    <CareersProvider>
      <main className="min-h-screen bg-background">
        <UniversalHero {...heroProps} />
        
        <SectionTransition variant="fade" />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-6 bg-primary/5 rounded-lg border border-primary/10">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {job.title}
              </h2>
              <p className="text-muted-foreground">
                {job.location.city}, {job.location.region} • {job.type} • {job.level}
              </p>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <span>Fecha límite: </span>
                <span className="font-medium text-foreground ml-1">
                  {job.deadline.toLocaleDateString('es-PE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            <ApplicationForm job={job} isStandalone={true} />
          </div>
        </div>
      </main>
    </CareersProvider>
  );
}