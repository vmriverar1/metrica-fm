/**
 * API Newsletter Subscribers - Usando BaseAPIController
 * Endpoints REST para gestión de suscriptores del newsletter
 */

import { NextRequest } from 'next/server';
import { createController } from '@/lib/api/unified-config';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterSubscriber } from '@/lib/migration/validation-rules';
import { APIResponse } from '@/lib/api/unified-response';
import type { NewsletterSubscriber, NewsletterSubscriberData } from '@/lib/firestore/newsletter-service-unified';

// Configurar controlador usando factory unificado
const newsletterSubscribersController = createController<NewsletterSubscriber, NewsletterSubscriberData>(
  'newsletter',
  newsletterSubscriberService,
  {
    validator: (data: any) => validateNewsletterSubscriber(data),
    searchFields: ['email', 'name'],
    allowedFilters: ['status', 'preferences.frequency', 'source', 'verified'],
    defaultLimit: 25,
    maxLimit: 100
  }
);

// Endpoints REST
export async function GET(request: NextRequest) {
  return newsletterSubscribersController.handleGET(request);
}

export async function POST(request: NextRequest) {
  // Usar método especializado para suscripción con respuestas unificadas
  try {
    const body = await request.json();
    const { email, preferences } = body;

    const result = await newsletterSubscriberService.subscribe(email, preferences);

    if (result.success) {
      return APIResponse.success(
        { id: result.data },
        result.message,
        { subscription: true, email },
        201
      );
    } else {
      return APIResponse.badRequest(result.message, result.error);
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return APIResponse.error(
      'SUBSCRIPTION_FAILED',
      error instanceof Error ? error.message : 'Unknown subscription error',
      500
    );
  }
}