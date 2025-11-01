import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log analytics events
    console.log('[Analytics Events] Received event:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      event: body
    });

    // In production, you would save this to your analytics system
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[Analytics Events] Error processing event:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to track event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}