/**
 * API Newsletter Articles - Usando BaseAPIController
 * Endpoints REST para gestión de artículos de newsletter/blog
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterArticle } from '@/lib/migration/validation-rules';
import type { NewsletterArticle, NewsletterArticleData } from '@/lib/firestore/newsletter-service-unified';

// Configurar controlador usando factory unificado
const newsletterArticlesController = createController<NewsletterArticle, NewsletterArticleData>(
  'newsletter',
  newsletterArticleService,
  {
    validator: (data: any) => validateNewsletterArticle(data),
    searchFields: ['title', 'content.excerpt', 'content.body', 'author.name', 'tags'],
    allowedFilters: ['category_id', 'featured', 'status', 'author.email'],
    defaultLimit: 15,
    maxLimit: 50
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return newsletterArticlesController.handleGET(request);
}

export async function POST(request: NextRequest) {
  return newsletterArticlesController.handlePOST(request);
}