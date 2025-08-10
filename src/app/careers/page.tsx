import { Metadata } from 'next';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CareersContent from '@/components/careers/CareersContent';
import { CareersProvider } from '@/contexts/CareersContext';

export const metadata: Metadata = {
  title: 'Bolsa de Trabajo | Métrica DIP - Únete a Nuestro Equipo',
  description: 'Descubre oportunidades laborales en Métrica DIP. Construye tu carrera profesional en proyectos de construcción e infraestructura de gran impacto en Perú.',
  keywords: 'trabajos construcción, empleos arquitectura, carreras ingeniería civil, oportunidades laborales Perú, trabajo project manager',
  openGraph: {
    title: 'Bolsa de Trabajo | Métrica DIP - Únete a Nuestro Equipo',
    description: 'Descubre oportunidades laborales en Métrica DIP. Construye tu carrera profesional en proyectos de gran impacto.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Métrica DIP'
  }
};

export default function CareersPage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Header />
      <CareersProvider>
        <CareersContent />
      </CareersProvider>
      <Footer />
    </div>
  );
}