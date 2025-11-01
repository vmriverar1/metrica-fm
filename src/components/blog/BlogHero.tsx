'use client';

import UniversalHero from '@/components/ui/universal-hero';
import { useBlog } from '@/contexts/BlogContext';
import { getBlogStats } from '@/types/blog';

export default function BlogHero() {
  const { pageData, contentData, pageLoading, contentLoading, error } = useBlog();
  const stats = getBlogStats();

  // Use dynamic data from JSON - always use Firebase data
  const heroTitle = pageData?.hero.title || 'Blog Métrica FM';
  const heroSubtitle = pageData?.hero.subtitle || 'Insights, tendencias y casos de estudio del sector construcción e infraestructura en Perú';
  const heroBackground = pageData?.hero.background.image || '';

  // Use actual stats from contentData if available, otherwise use defaults
  const actualStats = contentData ? {
    totalPosts: contentData.metadata.total_articles,
    totalCategories: contentData.metadata.total_categories,
    totalAuthors: contentData.metadata.total_authors,
    averageReadingTime: contentData.metadata.average_reading_time
  } : pageData?.hero.stats.default_values || {
    totalPosts: 25,
    totalCategories: 5,
    totalAuthors: 4,
    averageReadingTime: 8
  };

  // Use labels from pageData if available
  const labels = pageData?.hero.stats.labels || {
    total_posts: 'Artículos',
    total_categories: 'Categorías',
    total_authors: 'Expertos',
    average_reading_time: 'min Lectura'
  };

  const heroProps = {
    title: heroTitle,
    subtitle: heroSubtitle,
    backgroundImage: heroBackground,
    metadata: {
      centerText: "Un artículo nuevo cada 15 días"
    }
  };

  return <UniversalHero {...heroProps} />;
}