/**
 * API Newsletter Subscriber Engagement
 * Actualizar métricas de engagement de un suscriptor
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSubscriberService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { engagement } = body;

    if (!engagement) {
      return NextResponse.json({
        success: false,
        error: 'Engagement data required',
        message: 'Please provide engagement data in the request body'
      } as APIResponse, { status: 400 });
    }

    const result = await newsletterSubscriberService.updateEngagement(params.id, engagement);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Subscriber engagement updated successfully'
      } as APIResponse);
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating subscriber engagement:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update engagement',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}