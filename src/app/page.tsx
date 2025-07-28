import Header from '@/components/landing/header';
import HeroTransform from '@/components/landing/hero-transform';
import Pillars from '@/components/landing/pillars';
import Portfolio from '@/components/landing/portfolio';
import Newsletter from '@/components/landing/newsletter';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import Clients from '@/components/landing/clients';
import Policies from '@/components/landing/policies';
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
        <Pillars />
        <Policies />
        <Clients />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
