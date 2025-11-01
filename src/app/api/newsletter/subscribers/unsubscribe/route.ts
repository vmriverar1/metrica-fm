/**
 * API Newsletter Unsubscribe
 * Endpoint público para desuscribirse del newsletter
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email required',
        message: 'Please provide an email address'
      } as APIResponse, { status: 400 });
    }

    const result = await newsletterSubscriberService.unsubscribe(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      } as APIResponse);
    } else {
      const status = result.error === 'Subscriber not found' ? 404 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status });
    }

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to unsubscribe',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}