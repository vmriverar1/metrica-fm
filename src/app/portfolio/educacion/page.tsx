'use client';

import CategoryPage from '@/components/portfolio/CategoryPage';
import { ProjectCategory } from '@/types/portfolio';
import { useEffect, useState } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export default function ProyectosEducacionPage() {
  const [categoryData, setCategoryData] = useState({
    title: "Proyectos de Educación",
    subtitle: "Instituciones educativas que inspiran el aprendizaje y desarrollo",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const result = await FirestoreCore.getDocuments('portfolio_categories', {
          where: [{ field: 'slug', operator: '==', value: 'educacion' }]
        });

        if (result.success && result.data && result.data.length > 0) {
          const category = result.data[0];
          setCategoryData({
            title: category.seoTitle || `Proyectos de ${category.name}`,
            subtitle: category.seoDescription || category.description,
            backgroundImage: category.backgroundImage || ""
          });
        } else {
          // Solo si no hay datos en Firestore, usar la imagen por defecto
          setCategoryData(prev => ({
            ...prev,
            backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/05.jpg"
          }));
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        // En caso de error, usar la imagen por defecto
        setCategoryData(prev => ({
          ...prev,
          backgroundImage: "https://metrica-dip.com/images/slider-inicio-es/05.jpg"
        }));
      }
    };

    fetchCategoryData();
  }, []);

  return (
    <CategoryPage
      category={ProjectCategory.EDUCACION}
      title={categoryData.title}
      subtitle={categoryData.subtitle}
      backgroundImage={categoryData.backgroundImage}
    />
  );
}