import { Metadata } from 'next';
import { use } from 'react';
import CategoryPage from '@/components/portfolio/CategoryPage';
import { BlogProvider } from '@/contexts/BlogContext';
import { getBlogCategoryLabel, getBlogPostsByCategory } from '@/types/blog';

interface BlogCategoryPageProps {
  params: Promise<{
    categoria: string;
  }>;
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryLabel = getBlogCategoryLabel(resolvedParams.categoria as any);
  
  return {
    title: `${categoryLabel} | Blog Métrica DIP`,
    description: `Artículos especializados en ${categoryLabel.toLowerCase()}: análisis, tendencias y guías técnicas del sector construcción e infraestructura en Perú.`,
    keywords: `${categoryLabel.toLowerCase()}, blog construcción, artículos arquitectura, análisis mercado inmobiliario`,
    openGraph: {
      title: `${categoryLabel} | Blog Métrica DIP`,
      description: `Artículos especializados en ${categoryLabel.toLowerCase()}: análisis, tendencias y guías técnicas del sector construcción e infraestructura en Perú.`,
      type: 'website'
    }
  };
}

export default function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const resolvedParams = use(params);
  const categoryLabel = getBlogCategoryLabel(resolvedParams.categoria as any);
  const posts = getBlogPostsByCategory(resolvedParams.categoria as any);

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