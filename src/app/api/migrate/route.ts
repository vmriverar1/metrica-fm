import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Validate Firebase credentials
function validateFirebaseCredentials() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  
  if (!FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID no configurado correctamente');
  }
  
  if (!FIREBASE_CLIENT_EMAIL || FIREBASE_CLIENT_EMAIL.includes('xxxxx')) {
    throw new Error('FIREBASE_CLIENT_EMAIL no configurado correctamente');
  }
  
  if (!FIREBASE_PRIVATE_KEY || FIREBASE_PRIVATE_KEY.includes('TU_PRIVATE_KEY_AQUI')) {
    throw new Error('FIREBASE_PRIVATE_KEY no configurado correctamente');
  }
  
  return { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY };
}

// Initialize Firebase Admin (only once)
let db: any = null;

async function initializeFirestore() {
  if (db) return db;
  
  try {
    validateFirebaseCredentials();
    
    // Importar Firebase dinámicamente para evitar problemas durante build
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    
    if (!getApps().length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    // Usar la base de datos por defecto
    db = getFirestore();
    return db;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    throw error;
  }
}

interface MigrationResult {
  success: boolean;
  message: string;
  collections: {
    [key: string]: {
      migrated: number;
      errors: string[];
    };
  };
  totalDocuments: number;
  errors: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 Iniciando migración JSON → Firestore...');
    
    // Inicializar Firestore con validación de credenciales
    const firestore = await initializeFirestore();
    
    const result: MigrationResult = {
      success: true,
      message: '',
      collections: {},
      totalDocuments: 0,
      errors: []
    };

    // 1. Migrar Pages
    await migratePages(result, firestore);
    
    // 2. Migrar Portfolio
    await migratePortfolio(result, firestore);
    
    // 3. Migrar Blog/Newsletter
    await migrateBlog(result, firestore);
    
    // 4. Migrar Careers
    await migrateCareers(result, firestore);
    
    // 5. Migrar Admin & Users
    await migrateAdmin(result, firestore);
    
    // 6. Crear metadata del sistema
    await createSystemMetadata(result, firestore);

    result.message = `✅ Migración completada exitosamente. ${result.totalDocuments} documentos migrados.`;
    
    console.log('✅ Migración completada:', result);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    
    return NextResponse.json({
      success: false,
      message: `❌ Error en migración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      collections: {},
      totalDocuments: 0,
      errors: [error instanceof Error ? error.message : 'Error desconocido']
    }, { status: 500 });
  }
}

// Función para limpiar valores inválidos para Firestore
function cleanForFirestore(obj: any, depth = 0): any {
  if (depth > 20) return null; // Evitar objetos muy profundos
  
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item, depth + 1)).filter(item => item !== null);
  }
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanedValue = cleanForFirestore(value, depth + 1);
    if (cleanedValue !== null) {
      cleaned[key] = cleanedValue;
    }
  }
  
  return cleaned;
}

// Función para leer archivos JSON
function readJsonFile(filePath: string): any {
  try {
    const fullPath = join(process.cwd(), 'public', 'json', filePath);
    const fileContent = readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    throw new Error(`No se pudo leer el archivo ${filePath}`);
  }
}

// 1. MIGRAR PAGES
async function migratePages(result: MigrationResult, db: any) {
  console.log('📄 Migrando Pages...');
  
  result.collections.pages = { migrated: 0, errors: [] };
  
  const pagesDir = join(process.cwd(), 'public', 'json', 'pages');
  const pageFiles = readdirSync(pagesDir).filter(file => file.endsWith('.json'));
  
  for (const file of pageFiles) {
    try {
      const pageData = readJsonFile(`pages/${file}`);
      const pageId = file.replace('.json', '');
      
      // Transformar estructura para Firestore
      let sectionsData = {};
      
      // Caso especial para cultura.json - serializar JSON profundo
      if (pageId === 'cultura') {
        sectionsData = {
          hero: JSON.stringify(pageData.hero || {}),
          content_json: JSON.stringify(pageData) // Guardar todo como string
        };
      } else {
        sectionsData = {
          hero: pageData.hero || {},
          ...Object.fromEntries(
            Object.entries(pageData).filter(([key]) => 
              !['id', 'name', 'title', 'description', 'status', 'lastModified', 'type', 'metadata', 'hero'].includes(key)
            )
          )
        };
      }

      const rawDoc = {
        id: pageId,
        name: file,
        title: pageData.title || pageId,
        description: pageData.description || '',
        status: pageData.status || 'active',
        lastModified: pageData.lastModified || new Date().toISOString(),
        type: pageData.type || 'static',
        
        // SEO data
        seo: {
          title: pageData.metadata?.seoTitle || pageData.title || pageId,
          description: pageData.metadata?.seoDescription || pageData.description || '',
          keywords: pageData.metadata?.tags || [],
          ogImage: pageData.hero?.background?.image || ''
        },
        
        // Content sections 
        sections: sectionsData,
        
        // Metadata
        metadata: {
          author: pageData.metadata?.author || 'System',
          tags: pageData.metadata?.tags || [],
          category: pageData.metadata?.category || 'general',
          version: '1.0.0'
        },
        
        created_at: new Date(),
        updated_at: new Date()
      };

      // Limpiar documento para Firestore
      const firestoreDoc = cleanForFirestore(rawDoc);
      
      await db.collection('pages').doc(pageId).set(firestoreDoc);
      result.collections.pages.migrated++;
      result.totalDocuments++;
      
      console.log(`  ✅ Migrado: ${pageId}`);
      
    } catch (error) {
      const errorMsg = `Error migrando página ${file}: ${error}`;
      result.collections.pages.errors.push(errorMsg);
      result.errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

// 2. MIGRAR PORTFOLIO - ESTRUCTURA INDIVIDUAL
async function migratePortfolio(result: MigrationResult, db: any) {
  console.log('🎨 Migrando Portfolio con documentos individuales...');
  
  result.collections.portfolio_categories = { migrated: 0, errors: [] };
  result.collections.portfolio_projects = { migrated: 0, errors: [] };
  
  try {
    const portfolioData = readJsonFile('dynamic-content/portfolio/content.json');
    
    // Migrar Categories como documentos individuales
    if (portfolioData.categories) {
      console.log(`  📁 Migrando ${portfolioData.categories.length} categorías...`);
      for (const category of portfolioData.categories) {
        try {
          const categoryDoc = cleanForFirestore({
            ...category,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // ✅ NUEVO: Documentos individuales en /portfolio-categories/
          await db.collection('portfolio-categories').doc(category.id).set(categoryDoc);
          result.collections.portfolio_categories.migrated++;
          result.totalDocuments++;
          
          console.log(`    ✅ Categoría: ${category.name}`);
          
        } catch (error) {
          const errorMsg = `Error migrando categoría ${category.id}: ${error}`;
          result.collections.portfolio_categories.errors.push(errorMsg);
          result.errors.push(errorMsg);
          console.error(`    ❌ ${errorMsg}`);
        }
      }
    }
    
    // Migrar Projects como documentos individuales  
    if (portfolioData.projects) {
      console.log(`  🏗️ Migrando ${portfolioData.projects.length} proyectos...`);
      for (const project of portfolioData.projects) {
        try {
          const projectDoc = cleanForFirestore({
            ...project,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // ✅ NUEVO: Documentos individuales en /portfolio-projects/
          await db.collection('portfolio-projects').doc(project.id).set(projectDoc);
          result.collections.portfolio_projects.migrated++;
          result.totalDocuments++;
          
          console.log(`    ✅ Proyecto: ${project.title || project.name || project.id}`);
          
        } catch (error) {
          const errorMsg = `Error migrando proyecto ${project.id}: ${error}`;
          result.collections.portfolio_projects.errors.push(errorMsg);
          result.errors.push(errorMsg);
          console.error(`    ❌ ${errorMsg}`);
        }
      }
    }
    
  } catch (error) {
    const errorMsg = `Error migrando portfolio: ${error}`;
    result.collections.portfolio_categories.errors.push(errorMsg);
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }
}

// 3. MIGRAR BLOG
async function migrateBlog(result: MigrationResult, db: any) {
  console.log('📝 Migrando Blog...');
  
  result.collections.blog_authors = { migrated: 0, errors: [] };
  result.collections.blog_categories = { migrated: 0, errors: [] };
  result.collections.blog_articles = { migrated: 0, errors: [] };
  
  try {
    const blogData = readJsonFile('dynamic-content/newsletter/content.json');
    
    // Migrar Authors
    if (blogData.authors) {
      for (const author of blogData.authors) {
        try {
          const authorDoc = {
            ...author,
            social: {
              linkedin: author.linkedin || '',
              email: author.email || ''
            },
            created_at: new Date(),
            updated_at: new Date()
          };
          
          // Remover campos duplicados
          delete authorDoc.linkedin;
          delete authorDoc.email;
          
          await db.collection('blog').doc('authors').collection('items').doc(author.id).set(authorDoc);
          result.collections.blog_authors.migrated++;
          result.totalDocuments++;
          
        } catch (error) {
          const errorMsg = `Error migrando autor ${author.id}: ${error}`;
          result.collections.blog_authors.errors.push(errorMsg);
          result.errors.push(errorMsg);
        }
      }
    }
    
    // Migrar Categories
    if (blogData.categories) {
      for (const category of blogData.categories) {
        try {
          const categoryDoc = {
            ...category,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          await db.collection('blog').doc('categories').collection('items').doc(category.id).set(categoryDoc);
          result.collections.blog_categories.migrated++;
          result.totalDocuments++;
          
        } catch (error) {
          const errorMsg = `Error migrando categoría blog ${category.id}: ${error}`;
          result.collections.blog_categories.errors.push(errorMsg);
          result.errors.push(errorMsg);
        }
      }
    }
    
    // Migrar Articles
    if (blogData.articles) {
      for (const article of blogData.articles) {
        try {
          const articleDoc = {
            ...article,
            published_date: new Date(article.published_date),
            seo: {
              title: article.seo_title || article.title,
              description: article.seo_description || article.excerpt,
              keywords: article.tags || []
            },
            analytics: {
              views: 0,
              likes: 0,
              shares: 0
            },
            created_at: new Date(),
            updated_at: new Date()
          };
          
          // Limpiar campos duplicados
          delete articleDoc.seo_title;
          delete articleDoc.seo_description;
          
          await db.collection('blog').doc('articles').collection('items').doc(article.id).set(articleDoc);
          result.collections.blog_articles.migrated++;
          result.totalDocuments++;
          
        } catch (error) {
          const errorMsg = `Error migrando artículo ${article.id}: ${error}`;
          result.collections.blog_articles.errors.push(errorMsg);
          result.errors.push(errorMsg);
        }
      }
    }
    
  } catch (error) {
    const errorMsg = `Error migrando blog: ${error}`;
    result.collections.blog_authors.errors.push(errorMsg);
    result.errors.push(errorMsg);
  }
}

// 4. MIGRAR CAREERS
async function migrateCareers(result: MigrationResult, db: any) {
  console.log('💼 Migrando Careers...');
  
  result.collections.careers = { migrated: 0, errors: [] };
  
  try {
    const careersData = readJsonFile('dynamic-content/careers/content.json');
    
    // Migrar todo el contenido de careers como un documento
    const careersDoc = {
      ...careersData,
      migrated_at: new Date(),
      updated_at: new Date()
    };
    
    await db.collection('careers').doc('main').set(careersDoc);
    result.collections.careers.migrated++;
    result.totalDocuments++;
    
  } catch (error) {
    const errorMsg = `Error migrando careers: ${error}`;
    result.collections.careers.errors.push(errorMsg);
    result.errors.push(errorMsg);
  }
}

// 5. MIGRAR ADMIN
async function migrateAdmin(result: MigrationResult, db: any) {
  console.log('⚙️ Migrando Admin & Users...');
  
  result.collections.admin = { migrated: 0, errors: [] };
  result.collections.users = { migrated: 0, errors: [] };
  
  try {
    // Migrar Megamenu
    const megamenuData = readJsonFile('admin/megamenu.json');
    await db.collection('admin').doc('megamenu').set({
      ...megamenuData,
      migrated_at: new Date(),
      updated_at: new Date()
    });
    result.collections.admin.migrated++;
    result.totalDocuments++;
    
    // Migrar Users
    const usersData = readJsonFile('data/users.json');
    if (usersData.users) {
      for (const user of usersData.users) {
        const userDoc = {
          ...user,
          created_at: new Date(user.created_at),
          updated_at: new Date(),
          last_activity: new Date(),
          permissions: ['basic.read'] // Permisos básicos por defecto
        };
        
        await db.collection('users').doc(user.id).set(userDoc);
        result.collections.users.migrated++;
        result.totalDocuments++;
      }
    }
    
  } catch (error) {
    const errorMsg = `Error migrando admin: ${error}`;
    result.collections.admin.errors.push(errorMsg);
    result.errors.push(errorMsg);
  }
}

// 6. CREAR SYSTEM METADATA
async function createSystemMetadata(result: MigrationResult, db: any) {
  console.log('📊 Creando metadata del sistema...');
  
  try {
    const systemStats = {
      // Content counts
      total_pages: result.collections.pages?.migrated || 0,
      total_portfolio_categories: result.collections.portfolio_categories?.migrated || 0,
      total_portfolio_projects: result.collections.portfolio_projects?.migrated || 0,
      total_blog_authors: result.collections.blog_authors?.migrated || 0,
      total_blog_categories: result.collections.blog_categories?.migrated || 0,
      total_blog_articles: result.collections.blog_articles?.migrated || 0,
      total_users: result.collections.users?.migrated || 0,
      
      // Migration info
      last_migration: new Date(),
      migration_version: '1.0.0',
      total_documents_migrated: result.totalDocuments,
      migration_errors: result.errors.length,
      
      // Performance placeholders
      average_page_load: '1.2s',
      total_media_size: '150MB',
      
      updated_at: new Date()
    };
    
    await db.collection('metadata').doc('system_stats').set(systemStats);
    result.totalDocuments++;
    
    console.log('  ✅ System metadata creado');
    
  } catch (error) {
    const errorMsg = `Error creando system metadata: ${error}`;
    result.errors.push(errorMsg);
    console.error(`  ❌ ${errorMsg}`);
  }
}

// GET method para verificar status
export async function GET(): Promise<NextResponse> {
  try {
    // Verificar conexión a Firestore
    const firestore = await initializeFirestore();
    const testDoc = await firestore.collection('metadata').doc('system_stats').get();
    
    return NextResponse.json({
      status: 'ready',
      message: '✅ API de migración lista',
      firestore_connected: true,
      last_migration: testDoc.exists ? testDoc.data()?.last_migration : null,
      endpoint: '/api/migrate',
      method: 'POST',
      description: 'Migra todos los JSON del proyecto a Firestore'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: '❌ Error de conexión a Firestore',
      firestore_connected: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}