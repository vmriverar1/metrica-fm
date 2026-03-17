import Header from '@/components/landing/header';
import HeroTransform from '@/components/landing/hero-transform';
import PillarsCarousel from '@/components/landing/pillars-carousel';
import Portfolio from '@/components/landing/portfolio';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import PoliciesCarousel from '@/components/landing/policies-carousel';
import Clients from '@/components/landing/clients';
import { HomePageData } from '@/types/home';
import { Metadata } from 'next';

import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { HOME_PAGE_FALLBACK } from '@/lib/firestore/fallbacks';

// Deep merge de datos de Firestore con fallbacks para evitar errores de undefined
function mergeWithFallback(data: Partial<HomePageData> | null | undefined): HomePageData {
  if (!data) return HOME_PAGE_FALLBACK;

  // Merge profundo para hero para asegurar que todos los campos existan
  const mergedHero = {
    ...HOME_PAGE_FALLBACK.hero,
    ...data.hero,
    title: {
      ...HOME_PAGE_FALLBACK.hero.title,
      ...data.hero?.title
    },
    background: {
      ...HOME_PAGE_FALLBACK.hero.background,
      ...data.hero?.background
    },
    cta: {
      ...HOME_PAGE_FALLBACK.hero.cta,
      ...data.hero?.cta
    },
    rotating_words: data.hero?.rotating_words?.length ? data.hero.rotating_words : HOME_PAGE_FALLBACK.hero.rotating_words
  };

  return {
    page: {
      title: data.page?.title || HOME_PAGE_FALLBACK.page.title,
      description: data.page?.description || HOME_PAGE_FALLBACK.page.description
    },
    hero: mergedHero,
    stats: {
      description_text: data.stats?.description_text || HOME_PAGE_FALLBACK.stats.description_text
    },
    services: data.services || HOME_PAGE_FALLBACK.services,
    portfolio: data.portfolio || HOME_PAGE_FALLBACK.portfolio,
    pillars: data.pillars || HOME_PAGE_FALLBACK.pillars,
    policies: data.policies || HOME_PAGE_FALLBACK.policies,
    clients: data.clients || HOME_PAGE_FALLBACK.clients
  };
}

async function getHomeData(): Promise<HomePageData> {
  try {
    const result = await FirestoreCore.getDocumentById<HomePageData>('pages', 'home');

    if (!result.success || !result.data) {
      return HOME_PAGE_FALLBACK;
    }

    // Merge los datos de Firestore con el fallback para cubrir campos faltantes
    const mergedData = mergeWithFallback(result.data);
    return mergedData;
  } catch (error) {
    console.error('❌ [FIRESTORE] Failed to load home data:', error);
    return HOME_PAGE_FALLBACK;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getHomeData();

    return {
      title: data.page.title,
      description: data.page.description,
      openGraph: {
        title: data.page.title,
        description: data.page.description,
        type: 'website',
        locale: 'es_PE',
        url: 'https://metricafm.com',
        siteName: 'Métrica FM'
      },
      twitter: {
        card: 'summary_large_image',
        title: data.page.title,
        description: data.page.description
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Métrica FM - Dirección Integral de Proyectos',
      description: 'Especialistas en dirección integral de proyectos. Maximizamos el valor de tu inversión con soluciones innovadoras y sostenibles.'
    };
  }
}

// ISR: revalidar cada hora para reflejar cambios del admin
export const revalidate = 3600;

export default async function Home() {
  const data = await getHomeData();

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <HeroTransform data={data.hero} />
        <Stats data={data.stats} />
        <Services data={data.services} />
        <Portfolio data={data.portfolio} />
        <PillarsCarousel data={data.pillars} />
        <PoliciesCarousel data={data.policies} />
        <Clients data={data.clients} />
      </main>
      <Footer />
    </div>
  );
}
