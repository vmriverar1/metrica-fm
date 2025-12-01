import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/landing/header';
import UniversalHero from '@/components/ui/universal-hero';
import TimelineTransformWrapper from '@/components/historia/TimelineTransformWrapper';
import Footer from '@/components/landing/footer';
import { HistoriaPageData } from '@/types/historia';
import { PagesService } from '@/lib/firestore/pages-service';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getHistoriaData();
    return {
      title: `${data.page.title} | Métrica FM`,
      description: data.page.description,
      openGraph: {
        title: data.page.title,
        description: data.page.description,
        type: 'website'
      }
    };
  } catch {
    return {
      title: 'Nuestra Historia | Métrica FM',
      description: 'Conoce la historia y evolución de Métrica FM a lo largo de los años.'
    };
  }
}

// Helper function to serialize Firestore data for Client Components
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item));
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    // Check if it's a Firestore timestamp
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toISOString();
    }

    // Recursively process object properties
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreData(value);
    }
    return serialized;
  }

  return data;
}

// Fallback data
const HISTORIA_FALLBACK: HistoriaPageData = {
  page: {
    title: 'Nuestra Historia',
    subtitle: 'Un recorrido por nuestra trayectoria',
    description: 'Conoce la historia y evolución de Métrica FM.',
    hero_image: '/images/historia/hero.jpg'
  },
  timeline: {
    title: 'Línea de Tiempo',
    subtitle: 'Nuestra evolución',
    events: []
  },
  milestones: [],
  closing: {
    title: 'El Futuro',
    description: 'Seguimos construyendo historia.',
    cta_text: 'Contáctanos',
    cta_link: '/contact'
  }
};

async function getHistoriaData(): Promise<HistoriaPageData> {
  try {
    const firestoreData = await PagesService.getHistoriaPage();
    if (firestoreData) {
      const serializedData = serializeFirestoreData(firestoreData);
      // Deep merge con fallback
      return {
        ...HISTORIA_FALLBACK,
        ...serializedData,
        page: { ...HISTORIA_FALLBACK.page, ...serializedData.page },
        timeline: { ...HISTORIA_FALLBACK.timeline, ...serializedData.timeline },
        closing: { ...HISTORIA_FALLBACK.closing, ...serializedData.closing }
      } as HistoriaPageData;
    }

    console.warn('⚠️ [FALLBACK] Historia Page: Sin datos en Firestore, usando fallback');
    return HISTORIA_FALLBACK;
  } catch (error) {
    console.error('Error loading historia data:', error);
    console.warn('⚠️ [FALLBACK] Historia Page: Error detectado, usando fallback');
    return HISTORIA_FALLBACK;
  }
}

function HistoriaPageContent({ historiaData }: { historiaData: HistoriaPageData }) {
  const { page } = historiaData;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <UniversalHero
          title={page.title}
          subtitle={page.subtitle}
          backgroundImage={page.hero_image}
        />
        <TimelineTransformWrapper historiaData={historiaData} />
      </main>
      <Footer />
    </div>
  );
}

export default async function HistoriaPage() {
  const historiaData = await getHistoriaData();
  return <HistoriaPageContent historiaData={historiaData} />;
}