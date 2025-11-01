'use client';

import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';
import { useEffect, useState } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export default function ProyectosRetailPage() {
  const [categoryData, setCategoryData] = useState({
    title: "Proyectos de Retail",
    subtitle: "Centros comerciales y tiendas que crean experiencias de compra excepcionales",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        console.log('🛍️ [RetailPage] Fetching category data for retail...');

        const result = await FirestoreCore.getDocumentById('portfolio_categories', 'retail');

        console.log('🛍️ [RetailPage] Firestore result:', result);

        if (result.success && result.data) {
          const category = result.data;
          console.log('🛍️ [RetailPage] Category found:', category);

          setCategoryData({
            title: category.seoTitle || `Proyectos de ${category.name}`,
            subtitle: category.seoDescription || category.description,
            backgroundImage: category.backgroundImage || ""
          });
        } else {
          console.warn('🛍️ [RetailPage] Category not found, using fallback');
          // Solo si no hay datos en Firestore, usar la imagen por defecto
          setCategoryData(prev => ({
            ...prev,
            backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/02.jpg"
          }));
        }
      } catch (error) {
        console.error('🛍️ [RetailPage] Error fetching category data:', error);
        // En caso de error, usar la imagen por defecto
        setCategoryData(prev => ({
          ...prev,
          backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/02.jpg"
        }));
      }
    };

    fetchCategoryData();
  }, []);

  return (
    <CategoryPage
      category={ProjectCategory.RETAIL}
      title={categoryData.title}
      subtitle={categoryData.subtitle}
      backgroundImage={categoryData.backgroundImage}
    />
  );
}