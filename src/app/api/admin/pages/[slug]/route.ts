import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PWACacheInvalidator } from '@/middleware/pwa-cache-invalidator';
import { PagesService } from '@/lib/firestore/pages-service';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Intentar cargar desde Firestore primero
    try {
      let firestoreData = null;

      switch (slug) {
        case 'home':
          firestoreData = await PagesService.getHomePage();
          break;
        case 'blog':
          firestoreData = await PagesService.getBlogPage();
          break;
        case 'careers':
          const careersResult = await FirestoreCore.getDocumentById('pages', 'careers');
          firestoreData = careersResult.success ? careersResult.data : null;
          break;
        case 'clientes':
          firestoreData = await PagesService.getClientesPage();
          break;
        case 'compromiso':
          firestoreData = await PagesService.getCompromisoPage();
          break;
        case 'contact':
          firestoreData = await PagesService.getContactPage();
          break;
        case 'cultura':
          firestoreData = await PagesService.getCulturaPage();
          break;
        case 'historia':
          firestoreData = await PagesService.getHistoriaPage();
          break;
        case 'iso':
          firestoreData = await PagesService.getIsoPage();
          break;
        case 'portfolio':
          const portfolioResult = await FirestoreCore.getDocumentById('pages', 'portfolio');
          firestoreData = portfolioResult.success ? portfolioResult.data : null;
          break;
        case 'services':
          firestoreData = await PagesService.getServicesPage();
          break;
        case 'megamenu':
          firestoreData = await PagesService.getMegamenuPage();
          break;
        default:
          // Para páginas que no están en Firestore, usar JSON como fallback
          break;
      }

      if (firestoreData) {
        return NextResponse.json({
          success: true,
          data: {
            content: firestoreData,
            source: 'firestore'
          }
        });
      }
    } catch (firestoreError) {
      console.error(`Firestore error for ${slug}:`, firestoreError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to load page data from Firestore'
        },
        { status: 500 }
      );
    }

    // If no Firestore method exists for this slug
    return NextResponse.json(
      {
        success: false,
        error: 'Page not found in Firestore'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error reading data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const jsonPath = `pages/${slug}.json`;

  // Usar el middleware PWA para invalidación automática
  return await PWACacheInvalidator.withCacheInvalidation(
    jsonPath,
    async () => {
      try {
        const { content } = await request.json();

        // Guardar en Firestore primero si la página está soportada
        let firestoreSaved = false;
        try {
          if (['home', 'blog', 'careers', 'clientes', 'compromiso', 'contact', 'cultura', 'historia', 'iso', 'portfolio', 'services', 'megamenu'].includes(slug)) {
            const { db } = await import('@/lib/firebase/config');
            const { doc, setDoc } = await import('firebase/firestore');

            // Procesar arrays para compatibilidad con Firestore si es necesario
            const processArrays = (obj: any): any => {
              if (Array.isArray(obj)) {
                return obj.map((item, index) => ({ index, ...item }));
              }
              if (obj && typeof obj === 'object') {
                const result: any = {};
                for (const key in obj) {
                  result[key] = processArrays(obj[key]);
                }
                return result;
              }
              return obj;
            };

            let processedData = content;
            // Solo procesar arrays anidados para páginas complejas
            if (['cultura', 'historia', 'iso', 'portfolio', 'services', 'megamenu'].includes(slug)) {
              processedData = processArrays(content);
            }

            const docRef = doc(db, 'pages', slug);
            await setDoc(docRef, processedData);
            firestoreSaved = true;
          }
        } catch (firestoreError) {
          console.warn(`Failed to save ${slug} to Firestore:`, firestoreError);
          // Continuar con JSON como fallback
        }

        // También guardar en JSON como backup
        const filePath = path.join(process.cwd(), 'public', 'json', 'pages', `${slug}.json`);
        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');

        return NextResponse.json({
          success: true,
          message: 'Data updated successfully',
          jsonPath,
          firestoreSaved,
          pwaCacheInvalidated: true,
          sources: firestoreSaved ? ['firestore', 'json'] : ['json']
        });
      } catch (error) {
        console.error('Error writing data:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    },
    {
      broadcastToClients: true,
      preloadAfterInvalidation: true,
      logActivity: true
    }
  );
}