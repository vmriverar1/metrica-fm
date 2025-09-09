import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogFilters from '@/components/blog/BlogFilters';
import SectionTransition from '@/components/portfolio/SectionTransition';
// import FloatingParticles from '@/components/portfolio/FloatingParticles'; // Removed for server performance
import PortfolioCTA from '@/components/portfolio/PortfolioCTA';
import { BlogProvider } from '@/contexts/BlogContext';
import OptimizedLoading, { LoadingWrapper } from '@/components/loading/OptimizedLoading';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Blog | Métrica FM - Insights de Construcción e Infraestructura',
  description: 'Descubre las últimas tendencias, análisis de mercado, casos de estudio y guías técnicas del sector construcción en Perú. Insights de expertos en dirección integral de proyectos.',
  keywords: 'blog construcción, arquitectura Perú, ingeniería civil, gestión proyectos, tendencias construcción, casos estudio infraestructura',
  openGraph: {
    title: 'Blog | Métrica FM - Insights de Construcción e Infraestructura',
    description: 'Descubre las últimas tendencias, análisis de mercado, casos de estudio y guías técnicas del sector construcción en Perú.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Métrica FM'
  }
};

export default function BlogPage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Header />
      <BlogProvider>
        <main className="min-h-screen bg-background">
          <Suspense fallback={<OptimizedLoading type="blog" />}>
            <BlogHero />
          </Suspense>
          
          <SectionTransition variant="fade" />
          
          <section className="py-16">
            <div className="container mx-auto px-4">
              <Suspense fallback={<OptimizedLoading type="search" />}>
                <BlogFilters />
                <BlogGrid />
              </Suspense>
            </div>
          </section>
          
          {/* <FloatingParticles /> */}
          
          <PortfolioCTA 
            type="blog"
            title="¿Tienes un proyecto en mente?"
            description="Contacta con nuestros expertos para recibir una consulta personalizada sobre tu proyecto de construcción o infraestructura."
            primaryButton={{
              text: "Consulta Gratuita",
              href: "/contact"
            }}
            secondaryButton={{
              text: "Ver Proyectos",
              href: "/portfolio"
            }}
          />
        </main>
      </BlogProvider>
      <Footer />
    </div>
  );
}