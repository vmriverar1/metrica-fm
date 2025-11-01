/**
 * Portfolio Firestore Collections - Optimized for Firebase App Hosting
 * Complementa portfolio.ts existente con estructuras optimizadas para Firestore
 */

import { Timestamp } from 'firebase/firestore';

// ==========================================
// FIRESTORE OPTIMIZED COLLECTIONS
// ==========================================

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  featured_image: string;
  projects_count: number;  // Denormalizado para performance
  total_investment: string;
  total_area: string;
  featured: boolean;
  order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PortfolioCategoryData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  featured_image: string;
  total_investment: string;
  total_area: string;
  featured?: boolean;
  order?: number;
}

export type ProjectStatus = 'completado' | 'en_curso' | 'planificado';

export interface PortfolioProjectFirestore {
  id: string;
  name: string;
  category_id: string;
  description: string;
  location: string;
  year: string;
  status: ProjectStatus;
  client: string;
  services: string[];
  area: string;
  budget: string;
  duration: string;
  featured: boolean;

  // SEO y URLs
  slug: string;
  meta_description?: string;

  // Imágenes optimizadas
  featured_image: string;
  images_count: number;

  // Timestamps
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PortfolioProjectData {
  name: string;
  category_id: string;
  description: string;
  location: string;
  year: string;
  status: ProjectStatus;
  client: string;
  services: string[];
  area: string;
  budget: string;
  duration: string;
  featured?: boolean;
  slug: string;
  meta_description?: string;
  featured_image: string;
}

export type ImageFormat = 'webp' | 'png' | 'jpg';

export interface PortfolioImageFirestore {
  id: string;
  project_id: string;
  url: string;
  alt: string;
  title: string;
  featured: boolean;
  order: number;

  // Optimizaciones
  width?: number;
  height?: number;
  format: ImageFormat;
  size_bytes?: number;

  created_at: Timestamp;
}

export interface PortfolioImageData {
  project_id: string;
  url: string;
  alt: string;
  title: string;
  featured?: boolean;
  order?: number;
  width?: number;
  height?: number;
  format: ImageFormat;
  size_bytes?: number;
}

// ==========================================
// ENRICHED TYPES CON RELACIONES
// ==========================================

export interface PortfolioProjectWithCategory extends PortfolioProjectFirestore {
  category_info: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
}

export interface PortfolioProjectWithImages extends PortfolioProjectFirestore {
  images: PortfolioImageFirestore[];
}

export interface PortfolioProjectComplete extends PortfolioProjectWithCategory {
  images: PortfolioImageFirestore[];
}

export interface PortfolioCategoryWithProjects extends PortfolioCategory {
  projects: PortfolioProjectFirestore[];
}

// ==========================================
// API & FILTERING
// ==========================================

export interface PortfolioFilters {
  category?: string;
  status?: ProjectStatus;
  featured?: boolean;
  year?: string;
  client?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface PortfolioStats {
  total_categories: number;
  total_projects: number;
  total_images: number;
  featured_projects: number;
  completed_projects: number;
  total_investment_value: number;
  total_area_value: number;
  projects_by_category: Record<string, number>;
  projects_by_year: Record<string, number>;
  projects_by_status: Record<ProjectStatus, number>;
}

export interface CRUDResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

export function validateCategoryData(data: any): data is PortfolioCategoryData {
  return (
    typeof data.name === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.description === 'string' &&
    typeof data.icon === 'string' &&
    typeof data.color === 'string' &&
    typeof data.featured_image === 'string' &&
    typeof data.total_investment === 'string' &&
    typeof data.total_area === 'string'
  );
}

export function validateProjectData(data: any): data is PortfolioProjectData {
  return (
    typeof data.name === 'string' &&
    typeof data.category_id === 'string' &&
    typeof data.description === 'string' &&
    typeof data.location === 'string' &&
    typeof data.year === 'string' &&
    ['completado', 'en_curso', 'planificado'].includes(data.status) &&
    typeof data.client === 'string' &&
    Array.isArray(data.services) &&
    typeof data.area === 'string' &&
    typeof data.budget === 'string' &&
    typeof data.duration === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.featured_image === 'string'
  );
}

export function validateImageData(data: any): data is PortfolioImageData {
  return (
    typeof data.project_id === 'string' &&
    typeof data.url === 'string' &&
    typeof data.alt === 'string' &&
    typeof data.title === 'string' &&
    ['webp', 'png', 'jpg'].includes(data.format)
  );
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function parseInvestment(investment: string): number {
  const match = investment.match(/\$?(\d+(?:\.\d+)?)[MK]?/);
  if (!match) return 0;

  const number = parseFloat(match[1]);
  if (investment.includes('M')) return number * 1000000;
  if (investment.includes('K')) return number * 1000;
  return number;
}

export function parseArea(area: string): number {
  const match = area.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ''));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M USD`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K USD`;
  }
  return `$${amount.toLocaleString()} USD`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} m²`;
}