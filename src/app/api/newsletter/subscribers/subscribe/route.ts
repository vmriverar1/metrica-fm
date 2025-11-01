/**
 * API Newsletter Subscribe
 * Endpoint público para suscribirse al newsletter
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, preferences } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email required',
        message: 'Please provide an email address'
      } as APIResponse, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      } as APIResponse, { status: 400 });
    }

    const subscriberPreferences = {
      ...preferences,
      ...(name && { name })
    };

    const result = await newsletterSubscriberService.subscribe(email, subscriberPreferences);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { id: result.data },
        message: result.message || 'Successfully subscribed to newsletter'
      } as APIResponse, { status: 201 });
    } else {
      const status = result.error === 'Email already subscribed' ? 409 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status });
    }

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to subscribe',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}