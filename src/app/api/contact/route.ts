import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log contact form submission
    console.log('[Contact API] Received contact form:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      data: {
        name: body.name,
        email: body.email,
        subject: body.subject,
        // Don't log full message for privacy, just indicate presence
        hasMessage: !!body.message,
        messageLength: body.message?.length || 0
      }
    });

    // In production, you would:
    // 1. Validate the data
    // 2. Save to database
    // 3. Send email notification
    // 4. Maybe integrate with CRM

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[Contact API] Error processing request:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to submit contact form',
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