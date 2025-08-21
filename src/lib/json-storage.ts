/**
 * FASE 5: Sistema de Almacenamiento JSON Mock
 * 
 * Sistema de almacenamiento de datos usando archivos JSON para desarrollo
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Asegurar que existe el directorio de datos
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JSONStorage {
  private static getFilePath(collection: string): string {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  static async read<T>(collection: string): Promise<T[]> {
    try {
      const filePath = this.getFilePath(collection);
      
      if (!fs.existsSync(filePath)) {
        // Crear archivo vacío si no existe
        await this.write(collection, []);
        return [];
      }
      
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error reading collection ${collection}:`, error);
      return [];
    }
  }

  static async write<T>(collection: string, data: T[]): Promise<void> {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing collection ${collection}:`, error);
      throw error;
    }
  }

  static async create<T extends { id?: string }>(collection: string, item: T): Promise<T> {
    try {
      const items = await this.read<T>(collection);
      
      // Generar ID si no existe
      if (!item.id) {
        item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Agregar timestamps
      const now = new Date().toISOString();
      (item as any).created_at = now;
      (item as any).updated_at = now;
      
      items.push(item);
      await this.write(collection, items);
      
      return item;
    } catch (error) {
      console.error(`Error creating item in ${collection}:`, error);
      throw error;
    }
  }

  static async update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const items = await this.read<T>(collection);
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Actualizar item
      items[index] = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString()
      } as T;
      
      await this.write(collection, items);
      return items[index];
    } catch (error) {
      console.error(`Error updating item ${id} in ${collection}:`, error);
      throw error;
    }
  }

  static async delete(collection: string, id: string): Promise<boolean> {
    try {
      const items = await this.read(collection);
      const filteredItems = items.filter((item: any) => item.id !== id);
      
      if (filteredItems.length === items.length) {
        return false; // Item no encontrado
      }
      
      await this.write(collection, filteredItems);
      return true;
    } catch (error) {
      console.error(`Error deleting item ${id} from ${collection}:`, error);
      throw error;
    }
  }

  static async findById<T>(collection: string, id: string): Promise<T | null> {
    try {
      const items = await this.read<T>(collection);
      return items.find((item: any) => item.id === id) || null;
    } catch (error) {
      console.error(`Error finding item ${id} in ${collection}:`, error);
      return null;
    }
  }

  static async findMany<T>(collection: string, filter?: (item: T) => boolean): Promise<T[]> {
    try {
      const items = await this.read<T>(collection);
      return filter ? items.filter(filter) : items;
    } catch (error) {
      console.error(`Error finding items in ${collection}:`, error);
      return [];
    }
  }

  // Utilidad para paginación
  static paginate<T>(items: T[], page: number = 1, limit: number = 20): {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: items.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

// Inicializar datos mock si no existen
export async function initializeMockData() {
  const collections = ['portfolio_projects', 'portfolio_categories', 'portfolio_technologies', 
                      'careers_jobs', 'careers_departments', 'careers_applications',
                      'newsletter_articles', 'newsletter_categories', 'newsletter_authors'];

  for (const collection of collections) {
    const items = await JSONStorage.read(collection);
    if (items.length === 0) {
      await createMockData(collection);
    }
  }
}

async function createMockData(collection: string) {
  switch (collection) {
    case 'portfolio_projects':
      await JSONStorage.write('portfolio_projects', [
        {
          id: 'proj_1',
          title: 'Modernización de Infraestructura Portuaria',
          description: 'Proyecto de modernización integral del Puerto del Callao',
          category: 'Infraestructura Portuaria',
          status: 'completed',
          client: 'Autoridad Portuaria Nacional',
          start_date: '2023-01-15',
          end_date: '2023-12-20',
          budget: 15000000,
          technologies: ['BIM', 'AutoCAD', 'Proyección 3D'],
          images: ['/images/portfolio/puerto-callao-1.jpg'],
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      break;
    
    case 'portfolio_categories':
      await JSONStorage.write('portfolio_categories', [
        {
          id: 'cat_1',
          name: 'Infraestructura Portuaria',
          description: 'Proyectos de puertos y terminales marítimos',
          color: '#003F6F',
          project_count: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      break;
      
    case 'careers_jobs':
      await JSONStorage.write('careers_jobs', [
        {
          id: 'job_1',
          title: 'Ingeniero Civil Senior',
          department: 'Ingeniería',
          location: 'Lima, Perú',
          type: 'full-time',
          experience: 'senior',
          salary_range: '$80,000 - $120,000',
          description: 'Buscamos ingeniero civil con experiencia en infraestructura',
          requirements: ['Título de Ingeniero Civil', '5+ años experiencia', 'AutoCAD avanzado'],
          benefits: ['Seguro médico', 'Bonos por proyecto'],
          status: 'active',
          applications_count: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      break;

    case 'newsletter_articles':
      await JSONStorage.write('newsletter_articles', [
        {
          id: 'art_1',
          title: 'Innovaciones en Infraestructura Portuaria',
          slug: 'innovaciones-infraestructura-portuaria',
          author_id: 'auth_1',
          category_id: 'news_cat_1',
          content: 'Las nuevas tecnologías están revolucionando...',
          excerpt: 'Análisis de las últimas tendencias en infraestructura portuaria',
          featured_image: '/images/blog/puerto-innovacion.jpg',
          status: 'published',
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      break;
  }
}