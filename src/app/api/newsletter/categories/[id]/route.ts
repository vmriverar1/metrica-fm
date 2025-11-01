/**
 * API Newsletter Category by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de categorías
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { newsletterCategoryService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterCategory } from '@/lib/migration/validation-rules';
import type { NewsletterCategory, NewsletterCategoryData } from '@/lib/firestore/newsletter-service-unified';

// Reutilizar controlador configurado
const newsletterCategoriesController = new BaseAPIController<NewsletterCategory, NewsletterCategoryData>(
  newsletterCategoryService,
  {
    validator: (data: any) => validateNewsletterCategory(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterCategoriesController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterCategoriesController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterCategoriesController.handleDELETE(request, params.id);
}