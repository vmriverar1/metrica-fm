/**
 * API Route para migración de datos de muestra a Firestore
 * Específico para la Fase 6 del proyecto unificado
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Datos de muestra específicos para las colecciones unificadas
const SAMPLE_DATA = {
  // Categorías del Newsletter/Blog
  blog_categories: [
    {
      id: 'construccion',
      name: 'Construcción',
      description: 'Artículos sobre construcción y metodologías',
      slug: 'construccion',
      color: '#00A8E8',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'arquitectura',
      name: 'Arquitectura',
      description: 'Diseño arquitectónico y tendencias',
      slug: 'arquitectura',
      color: '#003F6F',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'ingenieria',
      name: 'Ingeniería',
      description: 'Soluciones de ingeniería y tecnología',
      slug: 'ingenieria',
      color: '#646363',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Artículos del Newsletter/Blog
  blog_articles: [
    {
      id: 'construccion-sostenible-2024',
      title: 'Construcción Sostenible: Tendencias para 2024',
      slug: 'construccion-sostenible-2024',
      content: 'La construcción sostenible se ha convertido en una prioridad para la industria. En este artículo exploramos las principales tendencias y tecnologías que están definiendo el futuro de la construcción ecológica.',
      short_description: 'Descubre las últimas tendencias en construcción sostenible y cómo están transformando la industria.',
      description: 'Descubre las últimas tendencias en construcción sostenible y cómo están transformando la industria.',
      category_id: 'construccion',
      author_id: 'admin',
      author: {
        name: 'Equipo Métrica',
        email: 'info@metrica.com',
        avatar: '/images/team/admin.jpg'
      },
      image: '/images/blog/construccion-sostenible.jpg',
      featured_image: '/images/blog/construccion-sostenible.jpg',
      tags: ['sostenibilidad', 'construcción', 'ecología', 'tendencias'],
      status: 'published',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
      published_at: new Date('2024-01-15'),
      publishedAt: new Date('2024-01-15')
    },
    {
      id: 'tecnologia-bim-proyectos',
      title: 'BIM: Revolucionando la Gestión de Proyectos',
      slug: 'tecnologia-bim-proyectos',
      content: 'Building Information Modeling (BIM) está transformando la manera en que diseñamos, construimos y gestionamos proyectos de construcción. Conoce sus beneficios y aplicaciones.',
      short_description: 'Cómo la tecnología BIM está revolucionando la gestión de proyectos de construcción.',
      description: 'Cómo la tecnología BIM está revolucionando la gestión de proyectos de construcción.',
      category_id: 'ingenieria',
      author_id: 'admin',
      author: {
        name: 'Equipo Métrica',
        email: 'info@metrica.com',
        avatar: '/images/team/admin.jpg'
      },
      image: '/images/blog/bim-technology.jpg',
      featured_image: '/images/blog/bim-technology.jpg',
      tags: ['BIM', 'tecnología', 'gestión', 'proyectos'],
      status: 'published',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-10'),
      published_at: new Date('2024-01-10'),
      publishedAt: new Date('2024-01-10')
    }
  ],

  // Categorías del Portfolio
  portfolio_categories: [
    {
      id: 'residencial',
      name: 'Residencial',
      description: 'Proyectos habitacionales y residenciales',
      slug: 'residencial',
      color: '#00A8E8',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'comercial',
      name: 'Comercial',
      description: 'Edificios comerciales y corporativos',
      slug: 'comercial',
      color: '#003F6F',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Proyectos industriales y logísticos',
      slug: 'industrial',
      color: '#646363',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Proyectos del Portfolio
  portfolio_projects: [
    {
      id: 'residencial-valle-oriente',
      title: 'Residencial Valle Oriente',
      slug: 'residencial-valle-oriente',
      description: 'Desarrollo habitacional de lujo con 150 unidades, amenidades de primer nivel y diseño arquitectónico contemporáneo. El proyecto incluye áreas verdes, club house y sistemas sustentables.',
      short_description: 'Desarrollo residencial de lujo con 150 unidades y amenidades premium.',
      category_id: 'residencial',
      category: 'Residencial',
      image: '/images/portfolio/valle-oriente-main.jpg',
      featured_image: '/images/portfolio/valle-oriente-main.jpg',
      images: [
        {
          url: '/images/portfolio/valle-oriente-1.jpg',
          caption: 'Fachada principal del desarrollo',
          type: 'exterior'
        },
        {
          url: '/images/portfolio/valle-oriente-2.jpg',
          caption: 'Áreas comunes y jardines',
          type: 'amenities'
        }
      ],
      location: {
        city: 'Monterrey',
        state: 'Nuevo León',
        country: 'México',
        address: 'Av. Valle Oriente 1234'
      },
      client: 'Grupo Inmobiliario del Norte',
      year: 2023,
      area: '15,000 m²',
      budget: {
        currency: 'MXN',
        amount: 180000000
      },
      tags: ['residencial', 'lujo', 'sustentable', 'monterrey'],
      status: 'completed',
      created_at: new Date('2023-01-15'),
      updated_at: new Date('2023-12-01')
    },
    {
      id: 'torre-corporativa-santa-fe',
      title: 'Torre Corporativa Santa Fe',
      slug: 'torre-corporativa-santa-fe',
      description: 'Edificio corporativo de 25 pisos con diseño vanguardista, certificación LEED Gold y tecnologías inteligentes. Ubicado en el corazón financiero de Santa Fe.',
      short_description: 'Torre corporativa de 25 pisos con certificación LEED Gold.',
      category_id: 'comercial',
      category: 'Comercial',
      image: '/images/portfolio/torre-santa-fe-main.jpg',
      featured_image: '/images/portfolio/torre-santa-fe-main.jpg',
      images: [
        {
          url: '/images/portfolio/torre-santa-fe-1.jpg',
          caption: 'Vista nocturna de la torre',
          type: 'exterior'
        },
        {
          url: '/images/portfolio/torre-santa-fe-2.jpg',
          caption: 'Lobby principal',
          type: 'interior'
        }
      ],
      location: {
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        address: 'Av. Santa Fe 495'
      },
      client: 'Corporativo Inmobiliario SA',
      year: 2024,
      area: '35,000 m²',
      budget: {
        currency: 'MXN',
        amount: 450000000
      },
      tags: ['comercial', 'corporativo', 'leed', 'santa-fe'],
      status: 'in_progress',
      created_at: new Date('2023-06-01'),
      updated_at: new Date('2024-01-15')
    }
  ],

  // Departamentos de Careers
  careers_departments: [
    {
      id: 'arquitectura',
      name: 'Arquitectura',
      description: 'Diseño arquitectónico y desarrollo de proyectos',
      slug: 'arquitectura',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'ingenieria',
      name: 'Ingeniería',
      description: 'Ingeniería estructural, civil y especialidades',
      slug: 'ingenieria',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'construccion',
      name: 'Construcción',
      description: 'Gestión y supervisión de obra',
      slug: 'construccion',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Posiciones de Careers
  careers_positions: [
    {
      id: 'arquitecto-senior',
      title: 'Arquitecto Senior',
      slug: 'arquitecto-senior',
      description: 'Buscamos un arquitecto senior con experiencia en proyectos residenciales y comerciales para liderar nuestro equipo de diseño.',
      short_description: 'Arquitecto senior para liderar proyectos de diseño arquitectónico.',
      department_id: 'arquitectura',
      department: 'Arquitectura',
      type: 'full_time',
      level: 'senior',
      location: {
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        remote_allowed: false
      },
      salary: {
        currency: 'MXN',
        min: 45000,
        max: 65000,
        period: 'monthly'
      },
      requirements: [
        'Licenciatura en Arquitectura',
        'Mínimo 5 años de experiencia',
        'Dominio de AutoCAD, SketchUp y BIM',
        'Experiencia en proyectos residenciales y comerciales',
        'Inglés intermedio-avanzado'
      ],
      responsibilities: [
        'Liderar proyectos arquitectónicos',
        'Coordinar con equipos multidisciplinarios',
        'Supervisar desarrollo de planos ejecutivos',
        'Presentaciones a clientes'
      ],
      benefits: [
        'Seguro de gastos médicos mayores',
        'Fondo de ahorro',
        'Capacitación continua',
        'Home office híbrido'
      ],
      tags: ['arquitectura', 'senior', 'diseño', 'bim'],
      status: 'active',
      posted_date: new Date('2024-01-01'),
      application_deadline: new Date('2024-02-29'),
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: 'ingeniero-estructural',
      title: 'Ingeniero Estructural',
      slug: 'ingeniero-estructural',
      description: 'Ingeniero estructural para análisis y diseño de estructuras en proyectos de gran escala. Experiencia en software especializado.',
      short_description: 'Ingeniero estructural para proyectos de gran escala.',
      department_id: 'ingenieria',
      department: 'Ingeniería',
      type: 'full_time',
      level: 'mid',
      location: {
        city: 'Monterrey',
        state: 'Nuevo León',
        country: 'México',
        remote_allowed: true
      },
      salary: {
        currency: 'MXN',
        min: 35000,
        max: 50000,
        period: 'monthly'
      },
      requirements: [
        'Ingeniería Civil o Estructural',
        'Mínimo 3 años de experiencia',
        'SAP2000, ETABS, SAFE',
        'Conocimiento de códigos de construcción mexicanos',
        'Inglés técnico'
      ],
      responsibilities: [
        'Análisis y diseño estructural',
        'Revisión de planos estructurales',
        'Coordinación con arquitectura',
        'Supervisión técnica'
      ],
      benefits: [
        'Seguro médico',
        'Prestaciones superiores a ley',
        'Certificaciones técnicas',
        'Trabajo remoto parcial'
      ],
      tags: ['ingeniería', 'estructural', 'análisis', 'diseño'],
      status: 'active',
      posted_date: new Date('2024-01-05'),
      application_deadline: new Date('2024-03-05'),
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-05')
    }
  ]
};

// Inicializar Firebase Admin usando el archivo de credenciales
async function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      console.log('✅ Firebase Admin initialized for sample migration');
    }

    return getFirestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Función para migrar una colección específica
async function migrateCollection(db: FirebaseFirestore.Firestore, collectionName: string, documents: any[]) {
  try {
    console.log(`📝 Migrating ${documents.length} documents to ${collectionName}...`);

    for (const doc of documents) {
      await db.collection(collectionName).doc(doc.id).set(doc);
      console.log(`  ✅ Document ${doc.id} migrated to ${collectionName}`);
    }

    console.log(`✅ Successfully migrated ${documents.length} documents to ${collectionName}`);
    return { success: true, count: documents.length };
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error);
    throw error;
  }
}

// Función principal de migración
async function runSampleMigration() {
  const db = await initializeFirebaseAdmin();
  const results = [];

  try {
    console.log('🚀 Starting sample data migration for unified system...');

    // Migrar categorías del newsletter/blog
    const blogCategoriesResult = await migrateCollection(
      db,
      'blog_categories',
      SAMPLE_DATA.blog_categories
    );
    results.push({ collection: 'blog_categories', ...blogCategoriesResult });

    // Migrar artículos del newsletter/blog
    const blogArticlesResult = await migrateCollection(
      db,
      'blog_articles',
      SAMPLE_DATA.blog_articles
    );
    results.push({ collection: 'blog_articles', ...blogArticlesResult });

    // Migrar categorías del portfolio
    const portfolioCategoriesResult = await migrateCollection(
      db,
      'portfolio_categories',
      SAMPLE_DATA.portfolio_categories
    );
    results.push({ collection: 'portfolio_categories', ...portfolioCategoriesResult });

    // Migrar proyectos del portfolio
    const portfolioProjectsResult = await migrateCollection(
      db,
      'portfolio_projects',
      SAMPLE_DATA.portfolio_projects
    );
    results.push({ collection: 'portfolio_projects', ...portfolioProjectsResult });

    // Migrar departamentos de careers
    const careersDepartmentsResult = await migrateCollection(
      db,
      'careers_departments',
      SAMPLE_DATA.careers_departments
    );
    results.push({ collection: 'careers_departments', ...careersDepartmentsResult });

    // Migrar posiciones de careers
    const careersPositionsResult = await migrateCollection(
      db,
      'careers_positions',
      SAMPLE_DATA.careers_positions
    );
    results.push({ collection: 'careers_positions', ...careersPositionsResult });

    return results;
  } catch (error) {
    console.error('❌ Sample migration failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting unified sample data migration...');

    const results = await runSampleMigration();
    const totalDocuments = results.reduce((sum, result) => sum + result.count, 0);

    console.log(`🎉 Sample migration completed successfully! ${totalDocuments} documents migrated.`);

    return NextResponse.json({
      success: true,
      message: 'Sample migration completed successfully',
      results,
      totalDocuments,
      collections: results.map(r => r.collection),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sample migration API error:', error);

    return NextResponse.json({
      success: false,
      message: 'Sample migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Unified Sample Migration API endpoint',
    usage: 'Send a POST request to /api/migrate-sample to start the sample data migration',
    collections: [
      'blog_categories (3 documents)',
      'blog_articles (2 documents)',
      'portfolio_categories (3 documents)',
      'portfolio_projects (2 documents)',
      'careers_departments (3 documents)',
      'careers_positions (2 documents)'
    ],
    totalSampleDocuments: 15,
    description: 'Migrates sample data for Newsletter, Portfolio, and Careers systems to test the unified Phase 6 architecture'
  });
}