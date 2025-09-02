import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Validar que la URL es segura
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
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

  // Lista de dominios permitidos (expandida para casos comunes)
  const allowedDomains = [
    'statom.co.uk',
    'cdn.example.com',
    'videos.example.com',
    // CDNs comunes
    'amazonaws.com',
    'cloudfront.net',
    'googleapis.com',
    'blob.core.windows.net',
    'digitaloceanspaces.com',
    // Plataformas de video alternativas
    'wistia.com',
    'loom.com',
    'streamable.com',
    'dailymotion.com',
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

  try {
    console.log(`Proxying video from: ${videoUrl}`);
    
    // Preparar headers para el fetch basado en si hay range request
    const range = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/octet-stream;q=0.8,*/*;q=0.7',
      'Accept-Encoding': 'identity;q=1, *;q=0',
      'Connection': 'keep-alive',
    };
    
    if (range) {
      fetchHeaders['Range'] = range;
    }
    
    const videoResponse = await fetch(videoUrl, {
      headers: fetchHeaders,
      // Timeout después de 30 segundos
      signal: AbortSignal.timeout(30000),
    });

    if (!videoResponse.ok) {
      console.error(`Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch video: ${videoResponse.statusText}` },
        { status: videoResponse.status }
      );
    }

    // Preparar headers para el proxy
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');
    const contentRange = videoResponse.headers.get('content-range');
    
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Accept-Ranges': 'bytes',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }
    
    if (contentRange) {
      headers['Content-Range'] = contentRange;
    }

    // Stream the video directly instead of loading into memory
    const status = videoResponse.status === 206 ? 206 : 200;
    
    return new NextResponse(videoResponse.body, {
      status,
      headers,
    });

  } catch (error) {
    console.error('Error proxying video:', {
      url: videoUrl,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    let errorMessage = 'Failed to proxy video';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - video took too long to load';
        statusCode = 504;
      } else if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Cannot reach video server - check URL and network connectivity';
        statusCode = 502;
      } else if (error.message.includes('certificate') || error.message.includes('SSL')) {
        errorMessage = 'SSL certificate error - server security issue';
        statusCode = 502;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        originalUrl: videoUrl,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// Support para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}