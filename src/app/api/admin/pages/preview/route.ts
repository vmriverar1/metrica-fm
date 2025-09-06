import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface PreviewRequest {
  component: 'HomePage' | 'BlogPage' | 'PortfolioPage' | 'AboutPage';
  data: any;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { component, data, timestamp }: PreviewRequest = await request.json();

    if (!component || !data) {
      return NextResponse.json(
        { error: 'Componente y datos son requeridos' },
        { status: 400 }
      );
    }

    // Crear directorio temporal para previews si no existe
    const previewDir = path.join(process.cwd(), 'temp', 'previews');
    try {
      await fs.mkdir(previewDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    // Generar ID único para el preview
    const previewId = `${component.toLowerCase()}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    const previewFile = path.join(previewDir, `${previewId}.json`);

    // Validar y sanitizar datos según el componente
    const validatedData = await validateComponentData(component, data);

    // Guardar datos temporales del preview
    await fs.writeFile(previewFile, JSON.stringify({
      component,
      data: validatedData,
      timestamp,
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutos
    }, null, 2));

    // Generar URL del preview
    const previewUrl = `/preview/${previewId}`;

    // Programar limpieza del archivo temporal (10 minutos)
    setTimeout(async () => {
      try {
        await fs.unlink(previewFile);
      } catch (error) {
        console.log(`Preview file ${previewId} already cleaned up`);
      }
    }, 10 * 60 * 1000);

    return NextResponse.json({
      success: true,
      previewId,
      previewUrl,
      expiresAt: Date.now() + (10 * 60 * 1000)
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function validateComponentData(component: string, data: any): Promise<any> {
  // Validaciones básicas según el componente
  switch (component) {
    case 'HomePage':
      return validateHomePageData(data);
    case 'BlogPage':
      return validateBlogPageData(data);
    case 'PortfolioPage':
      return validatePortfolioPageData(data);
    case 'AboutPage':
      return validateAboutPageData(data);
    default:
      return data;
  }
}

function validateHomePageData(data: any) {
  // Validación para home page
  const validated = {
    page: {
      title: data.page?.title || 'Métrica FM - Preview',
      description: data.page?.description || 'Preview de la página principal'
    },
    hero: {
      title: data.hero?.title || { main: 'Preview', secondary: 'Mode' },
      subtitle: data.hero?.subtitle || 'Vista previa temporal',
      rotating_words: Array.isArray(data.hero?.rotating_words) 
        ? data.hero.rotating_words 
        : ['Innovación', 'Calidad', 'Excelencia'],
      background: data.hero?.background || {},
      cta: data.hero?.cta || { text: 'Ver más', link: '#' }
    },
    stats: {
      section: data.stats?.section || {},
      statistics: Array.isArray(data.stats?.statistics) 
        ? data.stats.statistics 
        : []
    },
    services: {
      section: data.services?.section || {},
      main_service: data.services?.main_service || {},
      secondary_services: Array.isArray(data.services?.secondary_services)
        ? data.services.secondary_services
        : []
    },
    portfolio: {
      section: data.portfolio?.section || {},
      featured_projects: Array.isArray(data.portfolio?.featured_projects)
        ? data.portfolio.featured_projects
        : []
    },
    pillars: {
      section: data.pillars?.section || {},
      pillars: Array.isArray(data.pillars?.pillars)
        ? data.pillars.pillars
        : []
    },
    policies: {
      section: data.policies?.section || {},
      policies: Array.isArray(data.policies?.policies)
        ? data.policies.policies
        : []
    },
    newsletter: data.newsletter || {}
  };

  return validated;
}

function validateBlogPageData(data: any) {
  return {
    page: data.page || {},
    hero: data.hero || {},
    filters: data.filters || {},
    posts: Array.isArray(data.posts) ? data.posts : []
  };
}

function validatePortfolioPageData(data: any) {
  return {
    page: data.page || {},
    hero: data.hero || {},
    filters: data.filters || {},
    projects: Array.isArray(data.projects) ? data.projects : []
  };
}

function validateAboutPageData(data: any) {
  return {
    page: data.page || {},
    hero: data.hero || {},
    sections: data.sections || {}
  };
}

// Endpoint para limpiar previews expirados
export async function DELETE() {
  try {
    const previewDir = path.join(process.cwd(), 'temp', 'previews');
    
    try {
      const files = await fs.readdir(previewDir);
      const now = Date.now();
      let cleaned = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(previewDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const preview = JSON.parse(content);
          
          if (preview.expiresAt && preview.expiresAt < now) {
            await fs.unlink(filePath);
            cleaned++;
          }
        } catch (error) {
          // Si hay error leyendo el archivo, eliminarlo
          await fs.unlink(filePath);
          cleaned++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `${cleaned} previews expirados eliminados`
      });

    } catch (error) {
      return NextResponse.json({
        success: true,
        message: 'Directorio de previews no existe'
      });
    }

  } catch (error) {
    console.error('Preview cleanup error:', error);
    return NextResponse.json(
      { error: 'Error limpiando previews' },
      { status: 500 }
    );
  }
}