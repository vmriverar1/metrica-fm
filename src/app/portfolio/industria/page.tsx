'use client';

import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';
import { useEffect, useState } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export default function ProyectosIndustriaPage() {
  const [categoryData, setCategoryData] = useState({
    title: "Proyectos de Industria",
    subtitle: "Infraestructura industrial optimizada para procesos productivos eficientes",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        console.log('🏭 [IndustriaPage] Fetching category data for industria...');

        const result = await FirestoreCore.getDocumentById('portfolio_categories', 'industria');

        console.log('🏭 [IndustriaPage] Firestore result:', result);

        if (result.success && result.data) {
          const category = result.data;
          console.log('🏭 [IndustriaPage] Category found:', category);

          setCategoryData({
            title: category.seoTitle || `Proyectos de ${category.name}`,
            subtitle: category.seoDescription || category.description,
            backgroundImage: category.backgroundImage || ""
          });
        } else {
          console.warn('🏭 [IndustriaPage] Category not found, using fallback');
          // Solo si no hay datos en Firestore, usar la imagen por defecto
          setCategoryData(prev => ({
            ...prev,
            backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/03.jpg"
          }));
        }
      } catch (error) {
        console.error('🏭 [IndustriaPage] Error fetching category data:', error);
        // En caso de error, usar la imagen por defecto
        setCategoryData(prev => ({
          ...prev,
          backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/03.jpg"
        }));
      }
    };

    fetchCategoryData();
  }, []);

  return (
    <CategoryPage
      category={ProjectCategory.INDUSTRIA}
      title={categoryData.title}
      subtitle={categoryData.subtitle}
      backgroundImage={categoryData.backgroundImage}
    />
  );
}