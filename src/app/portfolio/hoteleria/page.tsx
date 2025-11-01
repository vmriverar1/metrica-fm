'use client';

import { useCategoryData } from '@/hooks/useCategoryData';
import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';

export default function ProyectosHoteleriaPage() {
  const { categoryData, loading, error } = useCategoryData('hoteleria');

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
        category={ProjectCategory.HOTELERIA}
        title="Proyectos de Hotelería"
        subtitle="Hoteles y complejos turísticos que combinan confort y elegancia"
        backgroundImage="https://metrica-dip.com/images/slider-inicio-es/04.jpg"
      />
    );
  }

  return (
    <CategoryPage
      category={ProjectCategory.HOTELERIA}
      title={categoryData.seoTitle || categoryData.name}
      subtitle={categoryData.seoDescription || categoryData.description}
      backgroundImage={categoryData.backgroundImage || "https://metrica-dip.com/images/slider-inicio-es/04.jpg"}
    />
  );
}