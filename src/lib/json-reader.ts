import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Default fallback data for different JSON files
 */
const getFallbackData = (filePath: string): any => {
  // Extract the file name to determine the fallback type
  const fileName = filePath.split('/').pop()?.replace('.json', '') || 'unknown';
  
  const fallbacks = {
    home: {
      hero: {
        title: { main: "Configura tu título principal", secondary: "Y tu subtítulo aquí" },
        subtitle: "Agrega una descripción atractiva de tu empresa",
        background: { video_url: "", image_fallback: "/img/placeholder-hero.jpg", overlay_opacity: 0.6 },
        rotating_words: ["Palabra 1", "Palabra 2"],
        transition_text: "Texto de transición - personaliza este mensaje",
        cta: { text: "BOTÓN PRINCIPAL", target: "#services" }
      },
      stats: {
        statistics: [
          { id: "1", icon: "Building", value: 0, suffix: "", label: "Estadística 1", description: "Agrega tu primera estadística" },
          { id: "2", icon: "Users", value: 0, suffix: "", label: "Estadística 2", description: "Agrega tu segunda estadística" },
          { id: "3", icon: "Award", value: 0, suffix: "", label: "Estadística 3", description: "Agrega tu tercera estadística" },
          { id: "4", icon: "TrendingUp", value: 0, suffix: "", label: "Estadística 4", description: "Agrega tu cuarta estadística" }
        ]
      },
      services: {
        section: { title: "Configura tus Servicios", subtitle: "Personaliza esta sección con tus servicios" },
        services_list: [
          {
            id: "temp1", title: "Servicio 1", description: "Agrega la descripción de tu primer servicio",
            image_url: "/img/placeholder-service.jpg", image_url_fallback: "/img/placeholder-service.jpg",
            icon_url: "/img/ico-placeholder.png", cta: { text: "Ver Más", url: "/services" }
          }
        ]
      },
      portfolio: {
        section: { title: "Proyectos Destacados", subtitle: "Agrega tus proyectos más importantes", cta: { text: "Ver todos", url: "/portfolio" } },
        featured_projects: []
      },
      pillars: {
        section: { title: "Nuestros Pilares", subtitle: "Define los fundamentos de tu empresa" },
        pillars: []
      },
      policies: {
        section: { title: "Nuestras Políticas", subtitle: "Define tus políticas empresariales" },
        policies: []
      },
      newsletter: {
        section: { title: "Mantente Informado", subtitle: "Suscríbete para recibir novedades" },
        form: { placeholder_text: "Tu email", cta_text: "Suscribirse", success_message: "¡Gracias!" }
      }
    },
    services: {
      hero: { title: "Nuestros Servicios", subtitle: "Agrega la descripción de tus servicios" },
      services: { title: "Servicios Especializados", subtitle: "Personaliza esta sección", list: [] }
    },
    megamenu: {
      settings: { enabled: true, animation_duration: 300 },
      items: [
        { id: 'home', label: 'Inicio', href: '/', type: 'simple', enabled: true, order: 1 },
        { id: 'services', label: 'Servicios', href: '/services', type: 'simple', enabled: true, order: 2 },
        { id: 'contact', label: 'Contacto', href: '/contact', type: 'simple', enabled: true, order: 3 }
      ]
    }
  };

  return fallbacks[fileName as keyof typeof fallbacks] || {
    message: "Archivo JSON no configurado",
    description: `Por favor configura el archivo: ${filePath}`,
    placeholder: true
  };
};

/**
 * Utility function to read JSON files from the public directory
 * Works both in development and production environments with fallback support
 */
export function readPublicJSON<T = any>(filePath: string): T {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = join(process.cwd(), 'public', cleanPath);
    const fileContents = readFileSync(fullPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Check if file has placeholder data
    if (data.placeholder) {
      console.warn(`⚠️  JSON file ${filePath} contains placeholder data. Please customize it.`);
    }
    
    return data;
  } catch (error) {
    console.warn(`⚠️  Could not load ${filePath}, using fallback data:`, error instanceof Error ? error.message : error);
    
    // Return fallback data instead of throwing
    return getFallbackData(filePath) as T;
  }
}

/**
 * Async version for consistency with existing fetch calls
 */
export async function readPublicJSONAsync<T = any>(filePath: string): Promise<T> {
  return readPublicJSON<T>(filePath);
}

/**
 * Check if data is placeholder/fallback data
 */
export function isPlaceholderData(data: any): boolean {
  return data && (data.placeholder === true || data.message === "Archivo JSON no configurado");
}