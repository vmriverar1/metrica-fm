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
    showScrollIndicator: true,
    
    // Estadísticas específicas del blog
    stats: [
      {
        value: stats.totalPosts.toString(),
        label: 'Artículos',
        description: 'Contenido especializado'
      },
      {
        value: stats.totalCategories.toString(),
        label: 'Categorías',
        description: 'Áreas de expertise'
      },
      {
        value: stats.totalAuthors.toString(),
        label: 'Expertos',
        description: 'Autores especializados'
      },
      {
        value: `${stats.averageReadingTime}min`,
        label: 'Lectura Promedio',
        description: 'Tiempo de contenido'
      }
    ],

    // Información específica del blog
    metadata: {
      primaryText: 'Conocimiento Especializado',
      secondaryText: 'Construyendo el futuro con información',
      category: 'Blog Corporativo',
      location: 'Lima, Perú'
    },

    // Call to action
    cta: {
      primary: {
        text: 'Explorar Artículos',
        href: '#blog-content'
      },
      secondary: {
        text: 'Suscribirse',
        href: '#newsletter'
      }
    },

    // Breadcrumbs para navegación
    breadcrumbs: [
      { label: 'Inicio', href: '/' },
      { label: 'Blog' }
    ],

    // Tema específico para blog
    theme: {
      primary: 'text-blue-600',
      accent: 'text-orange-500',
      background: 'bg-blue-50'
    }
  };

  return <UniversalHero type="blog" {...heroProps} />;
}