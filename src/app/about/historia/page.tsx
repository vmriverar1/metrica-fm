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

async function getHistoriaData(): Promise<HistoriaPageData> {
  try {
    // First try to load from Firestore
    const firestoreData = await PagesService.getHistoriaPage();
    if (firestoreData) {
      // Serialize Firestore data before returning
      const serializedData = serializeFirestoreData(firestoreData);
      return serializedData as HistoriaPageData;
    }

    // Fallback to API if Firestore fails
    const response = await fetch('/api/admin/pages/historia', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch historia data: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to load historia data');
    }

    return result.data;
  } catch (error) {
    console.error('Error loading historia data:', error);
    throw error;
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