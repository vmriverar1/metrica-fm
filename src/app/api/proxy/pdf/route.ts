import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Parse and validate URL
    const parsedUrl = new URL(pdfUrl);
    
    // Lista de dominios permitidos (expandida para casos comunes)
    const allowedDomains = [
      'statom.co.uk',
      'cdn.example.com',
      'documents.example.com',
      // CDNs comunes
      'amazonaws.com',
      'cloudfront.net',
      'googleapis.com',
      'blob.core.windows.net',
      'digitaloceanspaces.com',
      // Servicios de documentos
      'drive.google.com',
      'dropbox.com',
      'onedrive.com',
      'box.com',
      // Permitir cualquier dominio temporalmente para desarrollo
      // En producción se debe mantener la lista restringida
    ];

    // En desarrollo, permitir cualquier dominio HTTPS
    // En producción, usar lista restrictiva
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!isDevelopment) {
      // Solo en producción verificar lista de dominios permitidos
      const isDomainAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
      );

      if (!isDomainAllowed) {
        console.log(`Domain not allowed in production: ${parsedUrl.hostname}`);
        return NextResponse.json({ 
          error: 'Domain not allowed',
          domain: parsedUrl.hostname,
          allowedDomains: allowedDomains 
        }, { status: 403 });
      }
    } else {
      console.log(`Development mode: allowing domain ${parsedUrl.hostname}`);
    }

    // Permitir HTTPS y HTTP para desarrollo local
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    // Para producción, solo HTTPS excepto localhost
    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol === 'http:' && 
        !['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'Only HTTPS URLs are allowed in production' }, { status: 400 });
    }

    // Verificar que la URL sea un PDF
    if (!pdfUrl.match(/\.pdf(\?.*)?$/i)) {
      return NextResponse.json({ error: 'URL must point to a PDF file' }, { status: 400 });
    }

    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/pdf,application/octet-stream;q=0.8,*/*;q=0.7',
      'Accept-Encoding': 'identity;q=1, *;q=0',
      'Connection': 'keep-alive',
    };

    const pdfResponse = await fetch(pdfUrl, {
      headers: fetchHeaders,
      // Timeout después de 30 segundos
      signal: AbortSignal.timeout(30000),
    });

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}` },
        { status: pdfResponse.status }
      );
    }

    // Verificar que el contenido sea PDF
    const contentType = pdfResponse.headers.get('content-type');
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      return NextResponse.json(
        { error: 'Response is not a PDF file' },
        { status: 400 }
      );
    }

    // Stream the PDF response
    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error proxying PDF:', {
      url: pdfUrl,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    let errorMessage = 'Failed to proxy PDF';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - PDF took too long to load';
        statusCode = 504;
      } else if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Cannot reach PDF server - check URL and network connectivity';
        statusCode = 502;
      } else if (error.message.includes('certificate') || error.message.includes('SSL')) {
        errorMessage = 'SSL certificate error - server security issue';
        statusCode = 502;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        originalUrl: pdfUrl,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}