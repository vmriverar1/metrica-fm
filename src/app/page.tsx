import Header from '@/components/landing/header';
import HeroTransform from '@/components/landing/hero-transform';
import PillarsCarousel from '@/components/landing/pillars-carousel';
import Portfolio from '@/components/landing/portfolio';
import Newsletter from '@/components/landing/newsletter';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import PoliciesCarousel from '@/components/landing/policies-carousel';
import Clients from '@/components/landing/clients';
import { HomePageData } from '@/types/home';
import { Metadata } from 'next';

import { FirestoreCore } from '@/lib/firestore/firestore-core';
import { HOME_PAGE_FALLBACK } from '@/lib/firestore/fallbacks';

async function getHomeData(): Promise<HomePageData> {
  try {
    const result = await FirestoreCore.getDocumentById<HomePageData>('pages', 'home');

    if (!result.success || !result.data) {
      console.warn('⚠️ [FALLBACK] Home Page: Sin datos en Firestore, usando fallback descriptivo');
      return HOME_PAGE_FALLBACK;
    }

    console.log('🔥 [FIRESTORE] Home data loaded successfully:', result.data);
    console.log('🔥 [SERVICES] Services data specifically:', result.data.services);
    return result.data;
  } catch (error) {
    console.error('❌ [FIRESTORE] Failed to load home data:', error);
    console.warn('⚠️ [FALLBACK] Home Page: Error detectado, usando fallback descriptivo');
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
        url: 'https://metricadip.com',
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        <Newsletter data={data.newsletter} />
      </main>
      <Footer />
    </div>
  );
}
