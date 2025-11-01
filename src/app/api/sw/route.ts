import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the service worker file from public directory
    const swPath = join(process.cwd(), 'public', 'sw.js');

    if (!existsSync(swPath)) {
      console.error('Service Worker file not found at:', swPath);
      return new NextResponse('Service Worker not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const swContent = readFileSync(swPath, 'utf8');

    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Service-Worker-Allowed': '/',
      },
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}