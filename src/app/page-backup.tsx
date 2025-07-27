import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Pillars from '@/components/landing/pillars';
import Portfolio from '@/components/landing/portfolio';
import Newsletter from '@/components/landing/newsletter';
import Footer from '@/components/landing/footer';
import Stats from '@/components/landing/stats';
import Services from '@/components/landing/services';
import Clients from '@/components/landing/clients';
import Policies from '@/components/landing/policies';

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
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