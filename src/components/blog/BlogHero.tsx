'use client';

import UniversalHero from '@/components/ui/universal-hero';
import { useBlog } from '@/contexts/BlogContext';
import { getBlogStats } from '@/types/blog';

export default function BlogHero() {
  const { pageData, contentData, pageLoading, contentLoading, error } = useBlog();
  const stats = getBlogStats();

  // Show loading state if data isn't ready
  if (pageLoading || contentLoading) {
    const heroProps = {
      title: 'Cargando...',
      subtitle: 'Obteniendo la información más reciente del blog',
      backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
      metadata: {
        stats: ['Cargando estadísticas...']
      }
    };
    return <UniversalHero {...heroProps} />;
  }

  // Show error state
  if (error) {
    const heroProps = {
      title: 'Error',
      subtitle: `Error al cargar el contenido: ${error}`,
      backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
      metadata: {
        stats: ['Error en el sistema']
      }
    };
    return <UniversalHero {...heroProps} />;
  }

  // Use dynamic data from JSON or fallback to defaults
  const heroTitle = pageData?.hero.title || 'Blog Métrica FM';
  const heroSubtitle = pageData?.hero.subtitle || 'Insights, tendencias y casos de estudio del sector construcción e infraestructura en Perú';
  const heroBackground = pageData?.hero.background.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630';

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
      stats: [
        `${actualStats.totalPosts} ${labels.total_posts}`, 
        `${actualStats.totalCategories} ${labels.total_categories}`, 
        `${actualStats.totalAuthors} ${labels.total_authors}`, 
        `${actualStats.averageReadingTime}${labels.average_reading_time}`
      ]
    }
  };

  return <UniversalHero {...heroProps} />;
}