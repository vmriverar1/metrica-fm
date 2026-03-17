'use client';

import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';
import { useEffect, useState } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export default function ProyectosOficinaPage() {
  const [categoryData, setCategoryData] = useState({
    title: "Proyectos de Oficina",
    subtitle: "Espacios corporativos modernos y funcionales que potencian la productividad",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const result = await FirestoreCore.getDocumentById('portfolio_categories', 'oficina');

        if (result.success && result.data) {
          const category = result.data;
          setCategoryData({
            title: category.seoTitle || `Proyectos de ${category.name}`,
            subtitle: category.seoDescription || category.description,
            backgroundImage: category.backgroundImage || ""
          });
        } else {
          // Solo si no hay datos en Firestore, usar la imagen por defecto
          setCategoryData(prev => ({
            ...prev,
            backgroundImage: "https://metricafm.com/images/slider-inicio-es/01.jpg"
          }));
        }
      } catch (error) {
        console.error('🏢 [OficinaPage] Error fetching category data:', error);
        // En caso de error, usar la imagen por defecto
        setCategoryData(prev => ({
          ...prev,
          backgroundImage: "https://metricafm.com/images/slider-inicio-es/01.jpg"
        }));
      }
    };

    fetchCategoryData();
  }, []);

  return (
    <CategoryPage
      category={ProjectCategory.OFICINA}
      title={categoryData.title}
      subtitle={categoryData.subtitle}
      backgroundImage={categoryData.backgroundImage}
    />
  );
}