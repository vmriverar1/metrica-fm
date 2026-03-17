import { NextRequest, NextResponse } from 'next/server';

/**
 * Redirect to the real submit endpoint
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const submitUrl = new URL('/api/contact/submit', request.url);

  const response = await fetch(submitUrl.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formData: body,
      formType: 'contact',
      requiredFields: ['email'],
      recaptchaToken: body.recaptchaToken
    })
  });

  const result = await response.json();
  return NextResponse.json(result, { status: response.status });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
