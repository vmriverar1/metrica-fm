import { notFound } from 'next/navigation';
import { directus, isDirectusError, CACHE_TAGS } from './directus';
import type { 
  DirectusQueryOptions, 
  DirectusResponse, 
  DirectusListResponse,
  CacheConfig 
} from '@/types/directus';

// Generic query function with error handling
export async function queryDirectus<T>(
  collection: string,
  options: DirectusQueryOptions = {}
): Promise<T[]> {
  try {
    const result = await directus.request<DirectusListResponse<T>>(
      // @ts-ignore - Will be properly typed when collections are defined
      readItems(collection, options)
    );
    return result.data;
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    if (isDirectusError(error)) {
      console.error('Directus Error Details:', error.errors);
    }
    return [];
  }
}

// Get single item with error handling
export async function getDirectusItem<T>(
  collection: string,
  id: string,
  options: DirectusQueryOptions = {}
): Promise<T | null> {
  try {
    const result = await directus.request<DirectusResponse<T>>(
      // @ts-ignore - Will be properly typed when collections are defined
      readItem(collection, id, options)
    );
    return result.data;
  } catch (error) {
    console.error(`Error getting ${collection} item ${id}:`, error);
    return null;
  }
}

// Get item by slug with error handling
export async function getDirectusItemBySlug<T>(
  collection: string,
  slug: string,
  options: DirectusQueryOptions = {}
): Promise<T | null> {
  try {
    const items = await queryDirectus<T>(collection, {
      ...options,
      filter: { slug: { _eq: slug } },
      limit: 1
    });
    
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error(`Error getting ${collection} by slug ${slug}:`, error);
    return null;
  }
}

// Next.js ISR helpers
export function getStaticPropsConfig(cacheConfig: CacheConfig) {
  return {
    revalidate: cacheConfig.ttl,
    // En Next.js 13+, usamos tags para ISR
    tags: cacheConfig.tags
  };
}

// Generate static paths for dynamic routes
export async function generateStaticPathsFromDirectus<T extends { slug: string }>(
  collection: string,
  options: DirectusQueryOptions = {}
): Promise<{ params: { slug: string } }[]> {
  try {
    const items = await queryDirectus<T>(collection, {
      fields: ['slug'],
      filter: { status: { _eq: 'published' } },
      ...options
    });
    
    return items.map(item => ({
      params: { slug: item.slug }
    }));
  } catch (error) {
    console.error(`Error generating static paths for ${collection}:`, error);
    return [];
  }
}

// Wrapper for getStaticProps with Directus
export async function getStaticPropsWithDirectus<T>(
  fetcher: () => Promise<T>,
  cacheConfig: CacheConfig
) {
  try {
    const data = await fetcher();
    
    if (!data) {
      return { notFound: true };
    }
    
    return {
      props: { data },
      ...getStaticPropsConfig(cacheConfig)
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
}

// Helper for 404 handling
export function handleDirectusNotFound<T>(data: T | null): T {
  if (!data) {
    notFound();
  }
  return data;
}

// Search helper
export async function searchDirectus<T>(
  collection: string,
  searchQuery: string,
  options: DirectusQueryOptions = {}
): Promise<T[]> {
  return queryDirectus<T>(collection, {
    ...options,
    search: searchQuery
  });
}

// Filter helper
export async function filterDirectus<T>(
  collection: string,
  filters: Record<string, any>,
  options: DirectusQueryOptions = {}
): Promise<T[]> {
  return queryDirectus<T>(collection, {
    ...options,
    filter: { ...options.filter, ...filters }
  });
}

// Pagination helper
export async function paginateDirectus<T>(
  collection: string,
  page: number,
  perPage: number = 10,
  options: DirectusQueryOptions = {}
): Promise<{
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}> {
  const offset = (page - 1) * perPage;
  
  try {
    const result = await directus.request<DirectusListResponse<T>>(
      // @ts-ignore
      readItems(collection, {
        ...options,
        limit: perPage,
        offset: offset
      })
    );
    
    const total = result.meta.total_count;
    const totalPages = Math.ceil(total / perPage);
    
    return {
      data: result.data,
      pagination: {
        page,
        perPage,
        total,
        totalPages
      }
    };
  } catch (error) {
    console.error(`Error paginating ${collection}:`, error);
    return {
      data: [],
      pagination: {
        page,
        perPage,
        total: 0,
        totalPages: 0
      }
    };
  }
}

// Development helpers
export function logDirectusQuery(collection: string, options: DirectusQueryOptions) {
  if (process.env.DIRECTUS_DEBUG === 'true') {
    console.log(`[Directus Query] ${collection}`, options);
  }
}

// Type-safe field selection
export function selectFields<T extends Record<string, any>>(
  fields: (keyof T)[]
): string[] {
  return fields.map(field => String(field));
}