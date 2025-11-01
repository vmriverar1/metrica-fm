import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log analytics tracking data
    console.log('[Analytics Track] Received data:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      data: body
    });

    // In production, you would save this to your analytics database
    // For now, we'll just acknowledge receipt

    return NextResponse.json({
      success: true,
      message: 'Analytics data tracked',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[Analytics Track] Error processing request:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to track analytics data',
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