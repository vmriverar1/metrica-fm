'use client';

import UniversalHero from '@/components/ui/universal-hero';
import { useBlog } from '@/contexts/BlogContext';
import { getBlogStats } from '@/types/blog';

export default function BlogHero() {
  const { postCount } = useBlog();
  const stats = getBlogStats();

  const heroProps = {
    title: 'Blog Métrica DIP',
    subtitle: 'Insights, tendencias y casos de estudio del sector construcción e infraestructura en Perú',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
    metadata: {
      stats: [`${stats.totalPosts} Artículos`, `${stats.totalCategories} Categorías`, `${stats.totalAuthors} Expertos`, `${stats.averageReadingTime}min Lectura`]
    }
  };

  return <UniversalHero {...heroProps} />;
}