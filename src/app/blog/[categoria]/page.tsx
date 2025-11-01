import { Metadata } from 'next';
import { use } from 'react';
import CategoryPage from '@/components/portfolio/CategoryPage';
import { BlogProvider } from '@/contexts/BlogContext';
import { getBlogCategoryLabel } from '@/types/blog';
import { convertToCompatibleFormat } from '@/lib/blog-utils';

interface BlogCategoryPageProps {
  params: Promise<{
    categoria: string;
  }>;
}

// Función para obtener artículos por categoría desde Firestore
async function getArticlesByCategory(categorySlug: string) {
  try {
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const result = await articulos.getAll();

    // Obtener artículos con relaciones
    const articulosConRelaciones = [];
    const articles = result?.data || [];

    for (const articulo of articles) {
      if (articulo && articulo.id) {
        const articuloConRelacion = await articulos.getConRelaciones(articulo.id);
        if (articuloConRelacion) {
          articulosConRelaciones.push(articuloConRelacion);
        }
      }
    }

    const converted = convertToCompatibleFormat(articulosConRelaciones);
    return converted.filter(article => article.category === categorySlug);
  } catch (error) {
    console.error('Error loading articles by category:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryLabel = getBlogCategoryLabel(resolvedParams.categoria as any);

  return {
    title: `${categoryLabel} | Blog Métrica FM`,
    description: `Artículos especializados en ${categoryLabel.toLowerCase()}: análisis, tendencias y guías técnicas del sector construcción e infraestructura en Perú.`,
    keywords: `${categoryLabel.toLowerCase()}, blog construcción, artículos arquitectura, análisis mercado inmobiliario`,
    openGraph: {
      title: `${categoryLabel} | Blog Métrica FM`,
      description: `Artículos especializados en ${categoryLabel.toLowerCase()}: análisis, tendencias y guías técnicas del sector construcción e infraestructura en Perú.`,
      type: 'website'
    }
  };
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const resolvedParams = await params;
  const categoryLabel = getBlogCategoryLabel(resolvedParams.categoria as any);
  const posts = await getArticlesByCategory(resolvedParams.categoria);

  return (
    <BlogProvider>
      <CategoryPage
        type="blog"
        category={resolvedParams.categoria}
        title={categoryLabel}
        description={`Explora nuestros artículos especializados en ${categoryLabel.toLowerCase()}`}
        items={posts}
        totalItems={posts.length}
      />
    </BlogProvider>
  );
}