'use client';

import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';
import { useEffect, useState } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export default function ProyectosViviendaPage() {
  const [categoryData, setCategoryData] = useState({
    title: "Proyectos de Vivienda",
    subtitle: "Complejos residenciales que ofrecen calidad de vida y bienestar",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        console.log('🏠 [ViviendaPage] Fetching category data for vivienda...');

        const result = await FirestoreCore.getDocumentById('portfolio_categories', 'vivienda');

        console.log('🏠 [ViviendaPage] Firestore result:', result);

        if (result.success && result.data) {
          const category = result.data;
          console.log('🏠 [ViviendaPage] Category found:', category);

          setCategoryData({
            title: category.seoTitle || `Proyectos de ${category.name}`,
            subtitle: category.seoDescription || category.description,
            backgroundImage: category.backgroundImage || ""
          });
        } else {
          console.warn('🏠 [ViviendaPage] Category not found, using fallback');
          // Solo si no hay datos en Firestore, usar la imagen por defecto
          setCategoryData(prev => ({
            ...prev,
            backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/06.jpg"
          }));
        }
      } catch (error) {
        console.error('🏠 [ViviendaPage] Error fetching category data:', error);
        // En caso de error, usar la imagen por defecto
        setCategoryData(prev => ({
          ...prev,
          backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/06.jpg"
        }));
      }
    };

    fetchCategoryData();
  }, []);

  return (
    <CategoryPage
      category={ProjectCategory.VIVIENDA}
      title={categoryData.title}
      subtitle={categoryData.subtitle}
      backgroundImage={categoryData.backgroundImage}
    />
  );
}