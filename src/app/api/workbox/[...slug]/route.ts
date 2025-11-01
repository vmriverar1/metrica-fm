import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Reconstruct the filename from the slug
    const filename = params.slug.join('/');

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || !filename.startsWith('workbox-') || !filename.endsWith('.js')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    // Read the workbox file from public directory
    const workboxPath = join(process.cwd(), 'public', filename);

    if (!existsSync(workboxPath)) {
      console.warn(`Workbox file not found: ${filename}`);
      return new NextResponse('Workbox file not found', { status: 404 });
    }

    const workboxContent = readFileSync(workboxPath, 'utf8');

    return new NextResponse(workboxContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving workbox file:', error);
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}