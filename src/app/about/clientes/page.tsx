import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import UniversalHero from '@/components/ui/universal-hero';
import { PagesService } from '@/lib/firestore/pages-service';
import DynamicLogoGrid from '@/components/clientes/DynamicLogoGrid';
import Portfolio from '@/components/landing/portfolio';
import { PortfolioSectionData } from '@/types/home';

// ISR: revalidar cada hora
export const revalidate = 3600;

interface ClientesData {
  page: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background?: {
      type?: 'image' | 'video';
      image?: string;
      video_url?: string;
      image_fallback?: string;
    };
  };
  introduction: {
    title: string;
    description: string;
  };
  portfolio?: PortfolioSectionData;
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
  valor_agregado: {
    title: string;
    description: string;
  };
}


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
    background: {
      type: 'image',
      image: ''
    }
  },
  introduction: {
    title: 'Relaciones de Confianza',
    description: 'Construimos relaciones duraderas con nuestros clientes basadas en la excelencia, transparencia y resultados.'
  },
  portfolio: {
    section: {
      title: 'Clientes que Confían en Nosotros',
      subtitle: 'Hemos construido relaciones sólidas con organismos públicos y empresas privadas.',
      cta: { text: 'Ver portfolio completo' }
    },
    featured_projects: []
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
  valor_agregado: {
    title: 'Valor Agregado',
    description: 'Nuestra empresa se distingue por su enfoque centrado en el cliente y su compromiso con la calidad y la excelencia en el servicio. Nos esforzamos por establecer relaciones sólidas y duraderas con nuestros clientes, basadas en la confianza mutua y la transparencia. Creemos en la comunicación abierta y constante, y nos aseguramos de mantener a nuestros clientes informados sobre el progreso de los proyectos y cualquier cambio relevante.\nTrabajamos de cerca con nuestros clientes para entender sus necesidades específicas y diseñar soluciones personalizadas que se adapten a sus requerimientos.'
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
        portfolio: {
          section: { ...CLIENTES_FALLBACK.portfolio?.section, ...firestoreData.portfolio?.section },
          featured_projects: firestoreData.portfolio?.featured_projects || CLIENTES_FALLBACK.portfolio?.featured_projects || []
        },
        clientes: { ...CLIENTES_FALLBACK.clientes, ...firestoreData.clientes },
        testimonials: { ...CLIENTES_FALLBACK.testimonials, ...firestoreData.testimonials },
        valor_agregado: { ...CLIENTES_FALLBACK.valor_agregado, ...firestoreData.valor_agregado }
      } as ClientesData;
    }

    return CLIENTES_FALLBACK;
  } catch (error) {
    console.error('Error loading clientes data:', error);
    return CLIENTES_FALLBACK;
  }
}

function ClientesContent({ data }: { data: ClientesData }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero con imagen o video de fondo */}
        <UniversalHero
          title={data.hero?.title || 'Nuestros Clientes'}
          subtitle={data.hero?.subtitle || 'Empresas líderes que confían en nuestra experiencia'}
          background={{
            type: data.hero?.background?.type || 'image',
            primary_url: data.hero?.background?.type === 'video' ? data.hero?.background?.video_url : undefined,
            fallback_url: data.hero?.background?.type === 'video'
              ? data.hero?.background?.image_fallback
              : data.hero?.background?.image
          }}
        />
        
        {/* Portfolio Slider */}
        {data.portfolio && data.portfolio.featured_projects && data.portfolio.featured_projects.length > 0 && (
          <Portfolio data={data.portfolio} />
        )}

        {/* Valor Agregado */}
        {data.valor_agregado?.description && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h3 className="text-2xl font-semibold text-primary mb-8">{data.valor_agregado.title}</h3>
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {data.valor_agregado.description}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default async function ClientesPage() {
  const data = await getClientesData();
  return <ClientesContent data={data} />;
}