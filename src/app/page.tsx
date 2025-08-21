import Header from '@/components/landing/header';
import HeroTransform from '@/components/landing/hero-transform';
import PillarsCarousel from '@/components/landing/pillars-carousel';
import Portfolio from '@/components/landing/portfolio';
import Newsletter from '@/components/landing/newsletter';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import Clients from '@/components/landing/clients';
import PoliciesCarousel from '@/components/landing/policies-carousel';
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
