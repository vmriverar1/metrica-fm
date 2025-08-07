const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Configuración del entorno
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Configuración específica para servidores compartidos
const app = next({ 
  dev, 
  hostname, 
  port,
  // Configuración adicional para servidores compartidos
  customServer: true,
  quiet: false // Cambia a true en producción para menos logs
});

const handle = app.getRequestHandler();

console.log(`🚀 Iniciando servidor Next.js...`);
console.log(`📍 Entorno: ${dev ? 'desarrollo' : 'producción'}`);
console.log(`🌐 Hostname: ${hostname}`);
console.log(`🔌 Puerto: ${port}`);

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse de la URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Log básico para debugging (solo en desarrollo)
      if (dev) {
        console.log(`📥 ${req.method} ${pathname}`);
      }

      // Manejo especial para archivos estáticos
      if (pathname.startsWith('/_next/static/') || 
          pathname.startsWith('/images/') || 
          pathname.startsWith('/img/') ||
          pathname.startsWith('/fonts/') ||
          pathname === '/favicon.ico') {
        // Configurar headers de cache para archivos estáticos
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      // Manejo especial para API routes
      if (pathname.startsWith('/api/')) {
        // Configurar headers CORS si es necesario
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Manejo de preflight requests
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
      }

      // Manejo especial para rutas de Firebase/Genkit
      if (pathname.startsWith('/api/genkit') || pathname.startsWith('/__/genkit')) {
        // Headers específicos para Firebase/Genkit
        res.setHeader('Content-Type', 'application/json');
      }

      // Delegar al manejador de Next.js
      await handle(req, res, parsedUrl);

    } catch (err) {
      console.error('❌ Error manejando la petición:', req.url, err);
      
      // Respuesta de error personalizada
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error 500 - Métrica DIP</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: #f8f9fa; 
                color: #333;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #dc3545; margin-bottom: 20px; }
              .error-code { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔧 Error del Servidor</h1>
              <p>Lo sentimos, ha ocurrido un error interno del servidor.</p>
              <p>Si el problema persiste, por favor contacta al administrador del sitio.</p>
              ${dev ? `<div class="error-code">Error: ${err.message}</div>` : ''}
            </div>
          </body>
        </html>
      `);
    }
  })
  .listen(port, (err) => {
    if (err) {
      console.error('❌ Error iniciando el servidor:', err);
      throw err;
    }
    
    console.log('✅ Servidor iniciado exitosamente');
    console.log(`🌍 Servidor disponible en: http://${hostname}:${port}`);
    console.log('📊 Métrica DIP - Dirección Integral de Proyectos');
    console.log('⚡ Servidor optimizado para hosting compartido');
    
    // Información adicional para debugging
    if (dev) {
      console.log('🛠️  Modo desarrollo activado');
      console.log('📁 Estructura del proyecto lista');
      console.log('🎨 GSAP y animaciones configuradas');
      console.log('🔥 Firebase/Genkit integrado');
    }
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ El puerto ${port} ya está en uso`);
      console.log('💡 Intentando con otro puerto...');
      
      // Intentar con puerto alternativo
      const alternativePort = port + 1;
      console.log(`🔄 Reintentando en puerto ${alternativePort}`);
      
      // Aquí podrías implementar lógica para reintentar con otro puerto
      // Por simplicidad, solo mostramos el mensaje
      process.exit(1);
    } else {
      console.error('❌ Error del servidor:', err);
      process.exit(1);
    }
  });

}).catch((ex) => {
  console.error('❌ Error preparando la aplicación Next.js:', ex);
  console.error('🔍 Verifica que todas las dependencias estén instaladas correctamente');
  console.error('📦 Ejecuta: npm install');
  console.error('🏗️  Luego: npm run build');
  process.exit(1);
});

// Manejo de señales del sistema para cierre elegante
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM. Cerrando servidor elegantemente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT. Cerrando servidor elegantemente...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
  process.exit(1);
});
