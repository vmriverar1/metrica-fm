import Header from '@/components/landing/header';
import HeroTransform from '@/components/landing/hero-transform';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import dynamic from 'next/dynamic';

// Lazy load heavy below-the-fold components with loading placeholders
const Portfolio = dynamic(() => import('@/components/landing/portfolio'), {
  loading: () => <div className="min-h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse rounded-lg" />
});

const PillarsCarousel = dynamic(() => import('@/components/landing/pillars-carousel'), {
  loading: () => <div className="min-h-[500px] bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse rounded-lg" />
});

const PoliciesCarousel = dynamic(() => import('@/components/landing/policies-carousel'), {
  loading: () => <div className="min-h-[400px] bg-gradient-to-br from-accent/5 to-primary/5 animate-pulse rounded-lg" />
});

const Clients = dynamic(() => import('@/components/landing/clients'), {
  loading: () => <div className="min-h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg" />
});

const Newsletter = dynamic(() => import('@/components/landing/newsletter'), {
  loading: () => <div className="min-h-[200px] bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse rounded-lg" />
});
import { HomePageData } from '@/types/home';

import { readPublicJSONAsync } from '@/lib/json-reader';

async function getHomeData(): Promise<HomePageData> {
  return readPublicJSONAsync<HomePageData>('/json/pages/home.json');
}

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
        <Clients />
        <Newsletter data={data.newsletter} />
      </main>
      <Footer />
    </div>
  );
}
