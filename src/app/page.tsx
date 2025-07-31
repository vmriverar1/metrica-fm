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
import CustomCursor from '@/components/custom-cursor';

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <CustomCursor />
      <Header />
      <main>
        <HeroTransform />
        <Stats />
        <Services />
        <Portfolio />
        <PillarsCarousel />
        <PoliciesCarousel />
        <Clients />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
