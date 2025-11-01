import { z } from 'zod';

// Media Asset Schema (for videos and images with fallbacks)
export const MediaAssetSchema = z.object({
  type: z.enum(['image', 'video']).optional(),
  primary_url: z.string().url().optional(),
  fallback_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  video_url_fallback: z.string().url().optional(),
  image_fallback: z.string().url().optional(),
  image_fallback_internal: z.string().optional(),
  image: z.string().optional(),
  overlay_opacity: z.number().min(0).max(1).default(0.4)
});

// Hero Schema (compatible with existing JSON structure)
export const HeroSchema = z.object({
  title: z.union([
    z.string(),
    z.object({
      main: z.string(),
      secondary: z.string().optional()
    })
  ]),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  background: MediaAssetSchema.optional(),
  rotating_words: z.array(z.string()).optional(),
  transition_text: z.string().optional(),
  cta: z.object({
    text: z.string(),
    target: z.string(),
    href: z.string().optional()
  }).optional(),
  primary_button: z.object({
    text: z.string(),
    href: z.string()
  }).optional(),
  secondary_button: z.object({
    text: z.string(),
    href: z.string()
  }).optional(),
  stats: z.object({
    labels: z.record(z.string()).optional(),
    default_values: z.record(z.union([z.string(), z.number()])).optional()
  }).optional(),
  certification_status: z.object({
    is_valid: z.boolean()
  }).optional()
});

// Page Metadata Schema
export const PageMetadataSchema = z.object({
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

// Statistics Schema
export const StatisticSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  icon: z.string(),
  description: z.string().optional(),
  suffix: z.string().optional(),
  color: z.string().optional(),
  trend: z.object({
    direction: z.enum(['up', 'down', 'stable']).optional(),
    percentage: z.number().optional()
  }).optional()
});

// Services Schema
export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string()).optional(),
  cta: z.object({
    text: z.string(),
    href: z.string()
  }).optional()
});

// Base Page Schema
export const BasePageSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string(),
  description: z.string(),
  path: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  lastModified: z.string().optional(),
  size: z.string().optional(),
  type: z.enum(['static', 'dynamic']).default('static'),
  metadata: PageMetadataSchema.optional(),
  page: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().optional()
  }),
  hero: HeroSchema
});

// Home Page Schema (extends base with specific sections)
export const HomePageSchema = BasePageSchema.extend({
  stats: z.object({
    statistics: z.array(StatisticSchema)
  }).optional(),
  services_list: z.array(ServiceSchema).optional(),
  pillars: z.object({
    section: z.object({
      title: z.string(),
      description: z.string()
    }),
    pillars_list: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      image: z.string().optional()
    }))
  }).optional(),
  clients: z.object({
    section: z.object({
      title: z.string()
    }),
    logos: z.array(z.object({
      name: z.string(),
      logo: z.string(),
      alt: z.string().optional()
    }))
  }).optional()
});

// Blog Page Schema
export const BlogPageSchema = BasePageSchema.extend({
  content_sections: z.object({
    latest_content: z.object({
      title: z.string(),
      posts_per_page: z.number().default(12)
    })
  }).optional(),
  filters: z.object({
    search: z.object({
      placeholder: z.string()
    }).optional(),
    category_filter: z.object({
      label: z.string(),
      all_option: z.string()
    }).optional(),
    author_filter: z.object({
      label: z.string(),
      all_option: z.string()
    }).optional()
  }).optional(),
  contact_cta: z.object({
    title: z.string(),
    primary_button: z.object({
      text: z.string(),
      href: z.string()
    })
  }).optional()
});

// Timeline Event Schema (for historia.json)
export const TimelineEventSchema = z.object({
  id: z.string(),
  year: z.string(), // Cambiado a string para permitir rangos como "2015 - 2020"
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  image: z.string(),
  image_fallback: z.string().optional(),
  achievements: z.array(z.string()),
  gallery: z.array(z.union([z.string(), z.object({
    id: z.string(),
    url: z.string(),
    isExternal: z.boolean().optional(),
    caption: z.string().optional(),
    thumbnail: z.string().optional(),
    order: z.number().optional()
  })])), // Soporte para gallery simple y compleja
  impact: z.string(),
  metrics: z.object({
    team_size: z.number().optional(),
    projects: z.number().optional(),
    investment: z.string().optional() // Cambiado de revenue a investment
  }).optional()
});

// Historia Page Schema
export const HistoriaPageSchema = BasePageSchema.extend({
  timeline_events: z.array(TimelineEventSchema)
});

// Generic validation helpers
export const validatePageData = <T>(data: unknown, schema: z.ZodSchema<T>): { success: true; data: T } | { success: false; error: string } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` 
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

export const getDefaultPageData = <T>(pageName: string, schema: z.ZodSchema<T>): T => {
  // Default fallback data structure
  const defaultData = {
    id: pageName,
    title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`,
    description: `Default ${pageName} page description`,
    page: {
      title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Métrica FM`,
      description: `Default ${pageName} page description`
    },
    hero: {
      title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`,
      subtitle: 'Default subtitle',
      background: {
        type: 'image' as const,
        fallback_url: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2359.webp',
        overlay_opacity: 0.5
      }
    }
  };

  try {
    return schema.parse(defaultData);
  } catch (error) {
    console.error(`Failed to create default data for ${pageName}:`, error);
    throw new Error(`Cannot create default data for page: ${pageName}`);
  }
};