import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Log newsletter subscription
    console.log('[Newsletter API] New subscription:', {
      timestamp: new Date().toISOString(),
      email: body.email,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      source: body.source || 'website'
    });

    // In production, you would:
    // 1. Check if email is already subscribed
    // 2. Save to newsletter database
    // 3. Send confirmation email
    // 4. Integrate with email marketing service (Mailchimp, etc.)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[Newsletter API] Error processing subscription:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to subscribe to newsletter',
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