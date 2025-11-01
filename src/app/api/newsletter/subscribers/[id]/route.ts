/**
 * API Newsletter Subscriber by ID - Usando BaseAPIController
 * Endpoints REST para gestión individual de suscriptores
 */

import { NextRequest } from 'next/server';
import { BaseAPIController } from '@/lib/api/base-controller';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import { validateNewsletterSubscriber } from '@/lib/migration/validation-rules';
import type { NewsletterSubscriber, NewsletterSubscriberData } from '@/lib/firestore/newsletter-service-unified';

// Reutilizar controlador configurado
const newsletterSubscribersController = new BaseAPIController<NewsletterSubscriber, NewsletterSubscriberData>(
  newsletterSubscriberService,
  {
    validator: (data: any) => validateNewsletterSubscriber(data)
  }
);

// Endpoints por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterSubscribersController.handleGETById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterSubscribersController.handlePUT(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return newsletterSubscribersController.handleDELETE(request, params.id);
}