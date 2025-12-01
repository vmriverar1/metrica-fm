import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
// import HeroEquipo from '@/components/cultura/HeroEquipo'; // Comentado temporalmente
import UniversalHero from '@/components/ui/universal-hero';
import ValuesGallery from '@/components/cultura/ValuesGallery';
import { CulturaData } from '@/types/cultura';
import { PagesService } from '@/lib/firestore/pages-service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getCulturaData();
    return {
      title: data.page?.title || 'Cultura Empresarial | Métrica FM',
      description: data.page?.description || 'Conoce nuestra cultura empresarial, valores, equipo y forma de trabajo en Métrica FM.',
      keywords: Array.isArray(data.page?.keywords) ? data.page.keywords.join(', ') : 'cultura, valores, equipo, Métrica FM',
      openGraph: data.page?.openGraph || {
        title: data.page?.title || 'Cultura Empresarial | Métrica FM',
        description: data.page?.description || 'Conoce nuestra cultura empresarial, valores, equipo y forma de trabajo en Métrica FM.',
        type: 'website',
        locale: 'es_PE',
        siteName: 'Métrica FM'
      }
    };
  } catch (error) {
    console.error('Error generating metadata for cultura page:', error);
    return {
      title: 'Cultura Empresarial | Métrica FM',
      description: 'Conoce nuestra cultura empresarial, valores, equipo y forma de trabajo en Métrica FM.',
      keywords: 'cultura, valores, equipo, Métrica FM',
      openGraph: {
        title: 'Cultura Empresarial | Métrica FM',
        description: 'Conoce nuestra cultura empresarial, valores, equipo y forma de trabajo en Métrica FM.',
        type: 'website',
        locale: 'es_PE',
        siteName: 'Métrica FM'
      }
    };
  }
}

// Fallback data
const CULTURA_FALLBACK: CulturaData = {
  page: {
    title: 'Cultura Empresarial',
    description: 'Conoce nuestra cultura empresarial y valores.',
    subtitle: 'Nuestros valores nos definen',
    hero_image: '/images/cultura/hero.jpg',
    keywords: ['cultura', 'valores', 'equipo'],
    openGraph: {
      title: 'Cultura Empresarial | Métrica FM',
      description: 'Conoce nuestra cultura empresarial y valores.',
      type: 'website',
      locale: 'es_PE',
      siteName: 'Métrica FM'
    }
  },
  hero: {
    title: 'Cultura Empresarial',
    subtitle: 'Nuestros valores nos definen',
    team_gallery: { columns: [] }
  },
  values: {
    section: {
      title: 'Nuestros Valores',
      subtitle: 'Los principios que nos guían'
    },
    values_list: []
  }
};

async function getCulturaData(): Promise<CulturaData> {
  try {
    const firestoreData = await PagesService.getCulturaPage();
    if (firestoreData) {
      // Deep merge con fallback
      return {
        ...CULTURA_FALLBACK,
        ...firestoreData,
        page: { ...CULTURA_FALLBACK.page, ...firestoreData.page },
        hero: { ...CULTURA_FALLBACK.hero, ...firestoreData.hero },
        values: {
          ...CULTURA_FALLBACK.values,
          ...firestoreData.values,
          section: { ...CULTURA_FALLBACK.values.section, ...firestoreData.values?.section }
        }
      } as CulturaData;
    }

    console.warn('⚠️ [FALLBACK] Cultura Page: Sin datos en Firestore, usando fallback');
    return CULTURA_FALLBACK;
  } catch (error) {
    console.error('Error loading cultura data:', error);
    console.warn('⚠️ [FALLBACK] Cultura Page: Error detectado, usando fallback');
    return CULTURA_FALLBACK;
  }
}

function CulturaPageContent({ culturaData }: { culturaData: CulturaData }) {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero normal - DATOS DINÁMICOS */}
        {/* <HeroEquipo
          title={culturaData.hero.title}
          subtitle={culturaData.hero.subtitle}
          teamImages={culturaData.hero.team_gallery?.columns}
        /> */}

        <UniversalHero
          title={culturaData.page?.title || culturaData.hero?.title || 'Cultura Empresarial'}
          subtitle={culturaData.page?.subtitle || culturaData.hero?.subtitle || 'Nuestros valores nos definen'}
          backgroundImage={culturaData.page?.hero_image || ''}
        />

        {/* FASE 1: Galería Inmersiva de Valores - DATOS DINÁMICOS */}
        <ValuesGallery
          title={culturaData.values.section.title}
          subtitle={culturaData.values.section.subtitle}
          values={culturaData.values.values_list}
        />


      </main>
      <Footer />
    </div>
  );
}

export default async function CulturaPage() {
  const culturaData = await getCulturaData();
  return <CulturaPageContent culturaData={culturaData} />;
}