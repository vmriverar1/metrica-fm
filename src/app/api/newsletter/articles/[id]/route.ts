/**
 * API Newsletter Article by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de artículos
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterArticle } from '@/lib/migration/validation-rules';
import type { NewsletterArticle, NewsletterArticleData } from '@/lib/firestore/newsletter-service-unified';

// Reutilizar controlador configurado
const newsletterArticlesController = new BaseAPIController<NewsletterArticle, NewsletterArticleData>(
  newsletterArticleService,
  {
    validator: (data: any) => validateNewsletterArticle(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterArticlesController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterArticlesController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterArticlesController.handleDELETE(request, params.id);
}