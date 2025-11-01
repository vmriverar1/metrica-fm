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

async function getCulturaData(): Promise<CulturaData> {
  try {
    // First try to load from Firestore
    const firestoreData = await PagesService.getCulturaPage();
    if (firestoreData) {
      return firestoreData as CulturaData;
    }

    // Fallback to API if Firestore fails
    const response = await fetch('/api/admin/pages/cultura', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch cultura data: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to load cultura data');
    }

    return result.data;
  } catch (error) {
    console.error('Error loading cultura data:', error);
    throw error;
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