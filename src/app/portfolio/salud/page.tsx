'use client';

import { useCategoryData } from '@/hooks/useCategoryData';
import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosSaludPage() {
  const { categoryData, loading, error } = useCategoryData('salud');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F6F]"></div>
      </div>
    );
  }

  if (error || !categoryData) {
    // Fallback con datos estáticos si hay error
    return (
      <CategoryPage
        category={ProjectCategory.SALUD}
        title="Proyectos de Salud"
        subtitle="Infraestructura hospitalaria de vanguardia para el cuidado de la salud"
        backgroundImage="https://metrica-dip.com/images/slider-inicio-es/07.jpg"
      />
    );
  }

  return (
    <CategoryPage
      category={ProjectCategory.SALUD}
      title={categoryData.name}
      subtitle={categoryData.description}
      backgroundImage={categoryData.backgroundImage || "https://metrica-dip.com/images/slider-inicio-es/07.jpg"}
    />
  );
}