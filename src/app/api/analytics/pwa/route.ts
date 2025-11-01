import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log PWA analytics data for development/debugging
    console.log('[PWA Analytics] Received data:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      data: body
    });

    // In a real application, you would save this to a database
    // For now, we'll just acknowledge receipt

    return NextResponse.json({
      success: true,
      message: 'PWA analytics data received',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[PWA Analytics] Error processing request:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process analytics data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
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