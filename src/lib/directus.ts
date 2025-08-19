import { createDirectus, rest, graphql, staticToken, authentication } from '@directus/sdk';

// Types para nuestras collections (se expandirán en las siguientes fases)
interface Schema {
  // Se definirán las collections aquí en las próximas fases
  // projects: Project[];
  // blog_posts: BlogPost[];
  // job_postings: JobPosting[];
  // pages: Page[];
  // settings: Setting[];
}

// Cliente REST
export const directus = createDirectus<Schema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ''));

// Cliente GraphQL
export const directusGraphQL = createDirectus<Schema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(graphql())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ''));

// Cliente con autenticación (para admin features)
export const directusAuth = createDirectus<Schema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(authentication('cookie', { credentials: 'include' }))
  .with(rest());

// Helper para URLs de assets/imágenes
export const getDirectusAssetUrl = (assetId: string | null, params?: Record<string, any>) => {
  if (!assetId) return '';
  
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const query = searchParams.toString();
  return `${baseUrl}/${assetId}${query ? `?${query}` : ''}`;
};

// Helper para optimizar imágenes
export const getOptimizedImageUrl = (
  assetId: string | null,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'auto';
    fit?: 'cover' | 'contain' | 'inside' | 'outside';
  } = {}
) => {
  if (!assetId) return '';
  
  const params: Record<string, any> = {
    quality: options.quality || 80,
    format: options.format || 'webp',
    fit: options.fit || 'cover',
    ...options
  };
  
  return getDirectusAssetUrl(assetId, params);
};

// Type guards y utilidades
export const isDirectusError = (error: any): error is DirectusError => {
  return error && typeof error === 'object' && 'errors' in error;
};

// Error handling
export interface DirectusError {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
    };
  }>;
}

// Cache helpers (para ISR)
export const CACHE_TAGS = {
  PROJECTS: 'projects',
  BLOG: 'blog_posts',
  CAREERS: 'job_postings',
  PAGES: 'pages',
  SETTINGS: 'settings',
} as const;

// Revalidation helpers
export const revalidateDirectusCache = async (tag: string) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      // En producción, esto activaría la revalidación de ISR
      await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate?tag=${tag}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REVALIDATE_TOKEN}`
        }
      });
    } catch (error) {
      console.error('Error revalidating cache:', error);
    }
  }
};

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';