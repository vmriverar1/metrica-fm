/**
 * API Newsletter Categories - Usando BaseAPIController Unificado
 * Endpoints REST para gestión de categorías de newsletter
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { newsletterCategoryService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterCategory } from '@/lib/migration/validation-rules';
import type { NewsletterCategory, NewsletterCategoryData } from '@/lib/firestore/newsletter-service-unified';

// Configurar controlador usando factory unificado
const newsletterCategoriesController = createController<NewsletterCategory, NewsletterCategoryData>(
  'newsletter',
  newsletterCategoryService,
  {
    validator: (data: any) => validateNewsletterCategory(data),
    searchFields: ['name', 'description', 'slug'],
    allowedFilters: ['featured', 'order']
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return newsletterCategoriesController.handleGET(request);
}

export async function POST(request: NextRequest) {
  return newsletterCategoriesController.handlePOST(request);
}