import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import UniversalHero from '@/components/ui/universal-hero';
import {
  Heart,
  GraduationCap,
  Truck,
  Home,
  Building2,
  Building,
  Settings,
  Award,
  Shield,
  TrendingUp,
  Cpu,
  Star,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { PagesService } from '@/lib/firestore/pages-service';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';
import ClientStatistics from '@/components/clientes/ClientStatistics';
import DynamicLogoGrid from '@/components/clientes/DynamicLogoGrid';

// Forzar contenido dinámico - los cambios del admin se reflejan inmediatamente
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ClientesData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback: string;
  };
  introduction: {
    title: string;
    description: string;
    stats?: Array<{
      number: string;
      label: string;
      description: string;
      icon?: string;
      color?: string;
    }>;
  };
  client_sectors: any[];
  clientes: {
    logos: string[]; // Array simple de URLs
    section: {
      title: string;
      subtitle: string;
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
    testimonials_list: any[];
    youtube_videos?: Array<{
      id: string;
      videoId: string;
      title: string;
      description: string;
      author: string;
      position: string;
      company: string;
      sector?: string;
      order?: number;
    }>;
  };
  client_benefits: {
    title: string;
    subtitle: string;
    benefits: any[];
  };
  success_metrics: {
    title: string;
    subtitle: string;
    metrics: any[];
  };
}

const iconMap = {
  Heart,
  GraduationCap,
  Truck,
  Home,
  Building2,
  Building,
  Settings,
  Award,
  Shield,
  TrendingUp,
  Cpu,
  Star,
  Users,
  Clock,
  Target
};

export const metadata: Metadata = {
  title: 'Nuestros Clientes | Métrica FM',
  description: 'Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo en dirección integral de proyectos de infraestructura.',
};

// Fallback data para cuando Firestore no tiene datos
const CLIENTES_FALLBACK: ClientesData = {
  page: {
    title: 'Nuestros Clientes | Métrica FM',
    description: 'Organismos públicos y empresas líderes que confían en nuestra experiencia'
  },
  hero: {
    title: 'Nuestros Clientes',
    subtitle: 'Empresas líderes que confían en nuestra experiencia',
    background_image: '/images/clientes/hero.jpg',
    background_image_fallback: '/images/clientes/hero.jpg'
  },
  introduction: {
    title: 'Relaciones de Confianza',
    description: 'Construimos relaciones duraderas con nuestros clientes basadas en la excelencia, transparencia y resultados.',
    stats: []
  },
  client_sectors: [],
  clientes: {
    logos: [],
    section: {
      title: 'Nuestros Clientes',
      subtitle: 'Empresas que confían en nosotros'
    }
  },
  testimonials: {
    title: 'Testimonios',
    subtitle: 'Lo que dicen nuestros clientes',
    testimonials_list: [],
    youtube_videos: []
  },
  client_benefits: {
    title: 'Beneficios para Nuestros Clientes',
    subtitle: 'Por qué elegirnos',
    benefits: []
  },
  success_metrics: {
    title: 'Métricas de Éxito',
    subtitle: 'Resultados que hablan por sí mismos',
    metrics: []
  }
};

async function getClientesData(): Promise<ClientesData> {
  try {
    // First try to load from Firestore
    const firestoreData = await PagesService.getClientesPage();
    if (firestoreData) {
      // Merge con fallback para cubrir campos faltantes
      return {
        ...CLIENTES_FALLBACK,
        ...firestoreData,
        page: { ...CLIENTES_FALLBACK.page, ...firestoreData.page },
        hero: { ...CLIENTES_FALLBACK.hero, ...firestoreData.hero },
        introduction: { ...CLIENTES_FALLBACK.introduction, ...firestoreData.introduction },
        clientes: { ...CLIENTES_FALLBACK.clientes, ...firestoreData.clientes },
        testimonials: { ...CLIENTES_FALLBACK.testimonials, ...firestoreData.testimonials },
        client_benefits: { ...CLIENTES_FALLBACK.client_benefits, ...firestoreData.client_benefits },
        success_metrics: { ...CLIENTES_FALLBACK.success_metrics, ...firestoreData.success_metrics }
      } as ClientesData;
    }

    console.warn('⚠️ [FALLBACK] Clientes Page: Sin datos en Firestore, usando fallback');
    return CLIENTES_FALLBACK;
  } catch (error) {
    console.error('Error loading clientes data:', error);
    console.warn('⚠️ [FALLBACK] Clientes Page: Error detectado, usando fallback');
    return CLIENTES_FALLBACK;
  }
}

function ClientesContent({ data }: { data: ClientesData }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero con imagen de fondo */}
        <UniversalHero
          title={data.hero?.title || 'Nuestros Clientes'}
          subtitle={data.hero?.subtitle || 'Empresas líderes que confían en nuestra experiencia'}
          backgroundImage={data.hero?.background_image || ''}
        />
        
        {/* Introducción y estadísticas */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">{data.introduction.title}</h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
                {data.introduction.description}
              </p>
              
              {/* Stats */}
              {data.introduction.stats && data.introduction.stats.length > 0 && (
                <ClientStatistics stats={data.introduction.stats} />
              )}
            </div>
          
            {/* SECCIÓN DE TESTIMONIOS DE YOUTUBE */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-primary mb-6">
                  Testimonios de Nuestros Clientes
                </h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Escucha de primera mano lo que nuestros clientes opinan sobre nuestro trabajo
                  y cómo hemos contribuido al éxito de sus proyectos.
                </p>
              </div>

              {/* Grid de Videos */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {data.testimonials?.youtube_videos && data.testimonials.youtube_videos.length > 0 ? (
                  data.testimonials.youtube_videos
                    .sort((a: any, b: any) => (a.order || 999) - (b.order || 999))
                    .map((video: any) => (
                      <YouTubeEmbed
                        key={video.id}
                        videoId={video.videoId}
                        title={video.title}
                        description={video.description}
                      />
                    ))
                ) : (
                  // Fallback a videos hardcodeados si no hay datos en Firestore
                  <>
                    <YouTubeEmbed
                      videoId="xBpz8Ret1Io"
                      title="Testimonio - Nora Valencia, Gerente de BCP"
                      description="Nora Valencia, Gerente de BCP, comparte su experiencia trabajando con Métrica FM en proyectos de infraestructura bancaria."
                    />
                    <YouTubeEmbed
                      videoId="DkUC15ltTYs"
                      title="Testimonio - Mario Cruz Galarza CEO ™"
                      description="Mario Cruz Galarza, CEO, nos cuenta cómo Métrica FM contribuyó al éxito de sus proyectos empresariales."
                    />
                    <YouTubeEmbed
                      videoId="d3aYMlb5VKA"
                      title="Álvaro Chinchayán - CEO Latam Logistic"
                      description="Álvaro Chinchayán, CEO de Latam Logistic, destaca la calidad y profesionalismo en la dirección de proyectos logísticos."
                    />
                  </>
                )}
              </div>

              {/* Call to action */}
              <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">
                  ¿Quieres conocer más testimonios y casos de éxito?
                </p>
                <a
                  href="/portfolio"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Ver Nuestro Portfolio
                </a>
              </div>
            </div>

            {/* Client Benefits */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-primary mb-4">{data.client_benefits.title}</h3>
                <p className="text-muted-foreground">{data.client_benefits.subtitle}</p>
              </div>

              <div className={`grid gap-8 ${
                data.client_benefits.benefits.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                data.client_benefits.benefits.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
                data.client_benefits.benefits.length === 3 ? 'md:grid-cols-3 max-w-5xl mx-auto' :
                'md:grid-cols-2 lg:grid-cols-4'
              }`}>
                {data.client_benefits.benefits.map((benefit) => {
                  const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
                  return (
                    <div key={benefit.id} className="text-center">
                      {IconComponent && (
                        <div className="flex justify-center mb-4">
                          <div className="p-4 rounded-full" style={{ backgroundColor: `${benefit.color}20` }}>
                            <IconComponent className="w-8 h-8" style={{ color: benefit.color }} />
                          </div>
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-primary mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{benefit.description}</p>
                      <div className="space-y-1">
                        {Array.isArray(benefit.metrics) && benefit.metrics.map((metric: string, idx: number) => (
                          <div key={idx} className="text-xs text-muted-foreground">• {metric}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Metrics */}
            {/* <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-4">{data.success_metrics.title}</h3>
                <p className="text-white/90">{data.success_metrics.subtitle}</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.isArray(data.success_metrics?.metrics) && data.success_metrics.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                    <div className="text-sm font-semibold text-white/90 mb-1">{metric.category}</div>
                    <div className="text-xs text-white/80 mb-2">{metric.description}</div>
                    <div className="text-xs text-accent font-medium">{metric.trend}</div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function ClientesPage() {
  const data = await getClientesData();
  return <ClientesContent data={data} />;
}