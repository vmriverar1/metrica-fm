/**
 * API Newsletter Active Subscribers
 * Obtener solo suscriptores activos
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency') as 'daily' | 'weekly' | 'monthly' | null;

    let subscribers;
    if (frequency) {
      subscribers = await newsletterSubscriberService.getSubscribersByFrequency(frequency);
    } else {
      subscribers = await newsletterSubscriberService.getActiveSubscribers();
    }

    return NextResponse.json({
      success: true,
      data: subscribers,
      meta: {
        status: 'active',
        frequency,
        total: subscribers.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching active subscribers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch active subscribers',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}