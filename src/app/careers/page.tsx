'use client';

import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CareersContent from '@/components/careers/CareersContent';
import { useCareersData } from '@/hooks/useCareersData';
import OptimizedLoading from '@/components/loading/OptimizedLoading';
import { useEffect } from 'react';

function CareersPageContent() {
  const { data: careersData, loading, error } = useCareersData();

  // Actualizar el título de la página dinámicamente
  useEffect(() => {
    if (careersData?.page?.title) {
      document.title = careersData.page.title;
    }
  }, [careersData?.page?.title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <OptimizedLoading type="page" />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar la página</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!careersData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron datos</h2>
            <p className="text-gray-600">La información de carreras no está disponible</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Header />
      <CareersContent careersData={careersData} />
      <Footer />
    </div>
  );
}

export default function CareersPage() {
  return <CareersPageContent />;
}