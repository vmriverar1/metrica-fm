import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { CareersProvider } from '@/contexts/CareersContext';
import { getJobPosting, sampleJobPostings } from '@/types/careers';
import UniversalHero from '@/components/ui/universal-hero';
import JobDescription from '@/components/careers/JobDescription';
import ApplicationForm from '@/components/careers/ApplicationForm';
import CVUpload from '@/components/careers/CVUpload';
import JobSEO from '@/components/seo/JobSEO';
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface JobPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return sampleJobPostings.map((job) => ({
    id: job.id,
  }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = getJobPosting(params.id);
  
  if (!job) {
    return {
      title: 'Posición no encontrada | Carreras Métrica DIP'
    };
  }

  return {
    title: `${job.title} | Carreras Métrica DIP`,
    description: job.description,
    keywords: [
      job.title.toLowerCase(),
      job.category.toLowerCase(),
      job.location.city.toLowerCase(),
      job.level,
      'empleo construcción',
      'trabajo arquitectura',
      'carrera ingeniería'
    ].join(', '),
    openGraph: {
      title: `${job.title} | Carreras Métrica DIP`,
      description: job.description,
      type: 'article',
      images: [
        {
          url: '/img/logo-color.png',
          width: 1200,
          height: 630,
          alt: `${job.title} - Métrica DIP`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} | Carreras Métrica DIP`,
      description: job.description
    }
  };
}

export default function JobPage({ params }: JobPageProps) {
  const job = getJobPosting(params.id);

  if (!job) {
    notFound();
  }

  const heroProps = {
    title: job.title,
    subtitle: `${job.location.city}, ${job.location.region} • ${job.type} • ${job.level}`,
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
    metadata: {
      location: `${job.location.city}, ${job.location.region}`,
      type: job.type,
      level: job.level,
      postedDate: job.postedAt,
      deadline: job.deadline
    }
  };

  return (
    <CareersProvider>
      <JobSEO job={job} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <UniversalHero 
          title={job.title}
          subtitle={`${job.location.city}, ${job.location.region} • ${job.type} • ${job.level}`}
          backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630"
        />
        
        <SectionTransition variant="fade" />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Job Description */}
            <div className="lg:col-span-2">
              <JobDescription 
                job={job} 
              />
            </div>

            {/* Sidebar - Application Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div id="application-form">
                  <ApplicationForm 
                    job={job}
                  />
                </div>
                
                <CVUpload
                  jobId={job.id}
                  required={true}
                />
              </div>
            </div>
          </div>
        </div>
        
        <SectionTransition variant="slide" />
        
        <PortfolioCTA 
          type="apply"
          title="¿Listo para dar el siguiente paso?"
          description="Únete a nuestro equipo y forma parte de proyectos que transforman el paisaje urbano del Perú."
          primaryButton={{
            text: "Aplicar Ahora",
            href: `#application-form`
          }}
          secondaryButton={{
            text: "Ver Más Posiciones",
            href: "/careers"
          }}
        />
      </main>
      
      <Footer />
    </CareersProvider>
  );
}