// Base Directus Types
export interface DirectusFile {
  id: string;
  title: string;
  filename_download: string;
  filename_disk: string;
  type: string;
  width: number | null;
  height: number | null;
  filesize: number;
  uploaded_on: string;
  modified_on: string;
  storage: string;
  description: string | null;
}

export interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: DirectusFile | string | null;
  role: string;
  status: 'active' | 'invited' | 'draft' | 'suspended' | 'archived';
}

// Base Collection Interface
export interface DirectusCollection {
  id: string;
  status: 'published' | 'draft' | 'archived';
  sort: number | null;
  user_created: DirectusUser | string | null;
  date_created: string;
  user_updated: DirectusUser | string | null;
  date_updated: string | null;
}

// SEO Types (reusable across collections)
export interface SEOFields {
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  seo_image: DirectusFile | string | null;
  seo_canonical_url: string | null;
}

// Location Types (reusable)
export interface LocationFields {
  location_city: string;
  location_region: string;
  location_country: string;
  location_address: string | null;
  location_coordinates: [number, number] | null;
}

// Media Gallery Types (reusable)
export interface GalleryItem {
  id: string;
  sort: number;
  directus_files_id: DirectusFile | string;
  caption: string | null;
  alt_text: string | null;
}

// Status Types
export type PublishStatus = 'published' | 'draft' | 'archived';
export type FeaturedStatus = boolean;

// Query Options
export interface DirectusQueryOptions {
  fields?: string[];
  filter?: Record<string, any>;
  sort?: string[];
  limit?: number;
  offset?: number;
  search?: string;
  deep?: Record<string, any>;
}

// API Response Types
export interface DirectusResponse<T> {
  data: T;
}

export interface DirectusListResponse<T> {
  data: T[];
  meta: {
    filter_count: number;
    total_count: number;
  };
}

// Error Types
export interface DirectusErrorResponse {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
      field?: string;
    };
  }>;
}

// Webhook Types (for real-time updates)
export interface DirectusWebhook {
  event: string;
  accountability: {
    user: string | null;
    role: string | null;
  };
  key: string;
  collection: string;
  payload: Record<string, any>;
}

// Cache Types
export interface CacheConfig {
  ttl: number;
  tags: string[];
  key: string;
}

// Utility Types for Relations
export type RelationField<T> = T | string;
export type ManyRelationField<T> = T[] | string[];

// Schema Generation Types (for type safety)
export interface DirectusSchema {
  // Will be populated as we add collections
}

// GraphQL Types
export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}